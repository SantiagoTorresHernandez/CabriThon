using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IDataExportRepository
{
    Task<List<ProductExportDto>> GetProductsForExportAsync(DataExportRequest request);
    Task<List<OrderExportDto>> GetOrdersForExportAsync(DataExportRequest request);
    Task<List<InventoryExportDto>> GetInventoryForExportAsync(DataExportRequest request);
    Task<List<ClientExportDto>> GetClientsForExportAsync();
    Task<List<SalesHistoryExportDto>> GetSalesHistoryForExportAsync(DataExportRequest request);
    Task<ComprehensiveDataPackageDto> GetComprehensiveDataPackageAsync(DataExportRequest request);
}

public class DataExportRepository : IDataExportRepository
{
    private readonly SupabaseContext _context;

    public DataExportRepository(SupabaseContext context)
    {
        _context = context;
    }

    public async Task<List<ProductExportDto>> GetProductsForExportAsync(DataExportRequest request)
    {
        using var connection = _context.CreateConnection();
        
        var query = @"
            SELECT 
                p.product_id as ProductId,
                p.name as Name,
                p.cost as Cost,
                p.suggested_price as SuggestedPrice,
                p.category_id as CategoryId,
                c.name as CategoryName,
                p.brand_id as BrandId,
                b.name as BrandName,
                p.size as Size,
                p.created_at as CreatedAt
            FROM product p
            LEFT JOIN category c ON p.category_id = c.category_id
            LEFT JOIN brand b ON p.brand_id = b.brand_id
            WHERE 1=1
                AND (@CategoryIds IS NULL OR p.category_id = ANY(@CategoryIds))
                AND (@ProductIds IS NULL OR p.product_id = ANY(@ProductIds))
            ORDER BY p.product_id
            LIMIT COALESCE(@Limit, 1000)";

        var result = await connection.QueryAsync<ProductExportDto>(query, new
        {
            CategoryIds = request.CategoryIds?.ToArray(),
            ProductIds = request.ProductIds?.ToArray(),
            Limit = request.Limit
        });

        return result.ToList();
    }

    public async Task<List<OrderExportDto>> GetOrdersForExportAsync(DataExportRequest request)
    {
        using var connection = _context.CreateConnection();
        
        var query = @"
            SELECT 
                o.order_id as OrderId,
                o.client_id as ClientId,
                c.name as ClientName,
                o.status as Status,
                o.is_active as IsActive,
                o.created_at as CreatedAt
            FROM orders o
            INNER JOIN client c ON o.client_id = c.client_id
            WHERE 1=1
                AND (@ClientId IS NULL OR o.client_id = @ClientId)
                AND (@StartDate IS NULL OR o.created_at >= @StartDate)
                AND (@EndDate IS NULL OR o.created_at <= @EndDate)
                AND (@IncludeInactive = true OR o.is_active = true)
            ORDER BY o.created_at DESC
            LIMIT COALESCE(@Limit, 1000)";

        var orders = await connection.QueryAsync<OrderExportDto>(query, new
        {
            ClientId = request.ClientId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IncludeInactive = request.IncludeInactive,
            Limit = request.Limit
        });

        var orderList = orders.ToList();

        // Get order items for each order
        if (orderList.Any())
        {
            var orderIds = orderList.Select(o => o.OrderId).ToArray();
            var itemQuery = @"
                SELECT 
                    oi.order_item_id as OrderItemId,
                    oi.order_id as OrderId,
                    oi.product_id as ProductId,
                    p.name as ProductName,
                    oi.quantity as Quantity,
                    p.cost as UnitPrice,
                    (oi.quantity * p.cost) as TotalPrice
                FROM order_item oi
                INNER JOIN product p ON oi.product_id = p.product_id
                WHERE oi.order_id = ANY(@OrderIds)";

            var items = await connection.QueryAsync<OrderItemQueryResult>(itemQuery, new { OrderIds = orderIds });
            var itemsGrouped = items.GroupBy(i => i.OrderId).ToDictionary(g => g.Key, g => g.Select(item => new OrderItemExportDto
            {
                OrderItemId = item.OrderItemId,
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice
            }).ToList());

            foreach (var order in orderList)
            {
                if (itemsGrouped.TryGetValue(order.OrderId, out var orderItems))
                {
                    order.Items = orderItems;
                }
            }
        }

        return orderList;
    }

    public async Task<List<InventoryExportDto>> GetInventoryForExportAsync(DataExportRequest request)
    {
        using var connection = _context.CreateConnection();
        
        var query = @"
            SELECT 
                ic.product_id as ProductId,
                p.name as ProductName,
                ic.client_id as ClientId,
                c.name as ClientName,
                ic.stock as Stock,
                ic.warehouse_location as WarehouseLocation,
                ic.last_updated as LastUpdated,
                false as IsDistributionCenter
            FROM inventory_client ic
            INNER JOIN product p ON ic.product_id = p.product_id
            INNER JOIN client c ON ic.client_id = c.client_id
            WHERE 1=1
                AND (@ClientId IS NULL OR ic.client_id = @ClientId)
                AND (@ProductIds IS NULL OR ic.product_id = ANY(@ProductIds))
            
            UNION ALL
            
            SELECT 
                ice.product_id as ProductId,
                p.name as ProductName,
                NULL as ClientId,
                'CEDI' as ClientName,
                ice.stock as Stock,
                ice.warehouse_location as WarehouseLocation,
                ice.last_updated as LastUpdated,
                true as IsDistributionCenter
            FROM inventory_cedi ice
            INNER JOIN product p ON ice.product_id = p.product_id
            WHERE @ClientId IS NULL
                AND (@ProductIds IS NULL OR ice.product_id = ANY(@ProductIds))
            
            ORDER BY ProductId, ClientId NULLS LAST
            LIMIT COALESCE(@Limit, 5000)";

        var result = await connection.QueryAsync<InventoryExportDto>(query, new
        {
            ClientId = request.ClientId,
            ProductIds = request.ProductIds?.ToArray(),
            Limit = request.Limit
        });

        return result.ToList();
    }

    public async Task<List<ClientExportDto>> GetClientsForExportAsync()
    {
        using var connection = _context.CreateConnection();
        
        var query = @"
            SELECT 
                c.client_id as ClientId,
                c.name as Name,
                c.email as Email,
                c.phone as Phone,
                c.address as Address,
                c.created_at as CreatedAt,
                COUNT(DISTINCT o.order_id) as TotalOrders,
                COUNT(DISTINCT ic.product_id) as TotalProducts
            FROM client c
            LEFT JOIN orders o ON c.client_id = o.client_id
            LEFT JOIN inventory_client ic ON c.client_id = ic.client_id
            GROUP BY c.client_id, c.name, c.email, c.phone, c.address, c.created_at
            ORDER BY c.client_id";

        var result = await connection.QueryAsync<ClientExportDto>(query);
        return result.ToList();
    }

    public async Task<List<SalesHistoryExportDto>> GetSalesHistoryForExportAsync(DataExportRequest request)
    {
        using var connection = _context.CreateConnection();
        
        var query = @"
            SELECT 
                o.client_id as ClientId,
                c.name as ClientName,
                oi.product_id as ProductId,
                p.name as ProductName,
                o.created_at as OrderDate,
                oi.quantity as QuantitySold,
                (oi.quantity * p.cost) as SalesValue,
                cat.name as ProductCategory,
                b.name as ProductBrand
            FROM orders o
            INNER JOIN order_item oi ON o.order_id = oi.order_id
            INNER JOIN product p ON oi.product_id = p.product_id
            INNER JOIN client c ON o.client_id = c.client_id
            LEFT JOIN category cat ON p.category_id = cat.category_id
            LEFT JOIN brand b ON p.brand_id = b.brand_id
            WHERE 1=1
                AND (@ClientId IS NULL OR o.client_id = @ClientId)
                AND (@StartDate IS NULL OR o.created_at >= @StartDate)
                AND (@EndDate IS NULL OR o.created_at <= @EndDate)
                AND (@IncludeInactive = true OR o.is_active = true)
                AND (@ProductIds IS NULL OR oi.product_id = ANY(@ProductIds))
            ORDER BY o.created_at DESC
            LIMIT COALESCE(@Limit, 10000)";

        var result = await connection.QueryAsync<SalesHistoryExportDto>(query, new
        {
            ClientId = request.ClientId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IncludeInactive = request.IncludeInactive,
            ProductIds = request.ProductIds?.ToArray(),
            Limit = request.Limit
        });

        return result.ToList();
    }

    public async Task<ComprehensiveDataPackageDto> GetComprehensiveDataPackageAsync(DataExportRequest request)
    {
        var package = new ComprehensiveDataPackageDto
        {
            ExportedAt = DateTime.UtcNow,
            ClientId = request.ClientId
        };

        // Fetch all data in parallel
        var productsTask = GetProductsForExportAsync(request);
        var ordersTask = GetOrdersForExportAsync(request);
        var inventoryTask = GetInventoryForExportAsync(request);
        var clientsTask = request.ClientId == null ? GetClientsForExportAsync() : Task.FromResult(new List<ClientExportDto>());
        var salesTask = GetSalesHistoryForExportAsync(request);

        await Task.WhenAll(productsTask, ordersTask, inventoryTask, clientsTask, salesTask);

        package.Products = await productsTask;
        package.Orders = await ordersTask;
        package.Inventory = await inventoryTask;
        package.Clients = await clientsTask;
        package.SalesHistory = await salesTask;

        // Calculate metadata
        package.Metadata = new ExportMetadataDto
        {
            TotalProducts = package.Products.Count,
            TotalOrders = package.Orders.Count,
            TotalClients = package.Clients.Count,
            TotalInventoryRecords = package.Inventory.Count,
            TotalSalesRecords = package.SalesHistory.Count,
            DataRangeStart = request.StartDate,
            DataRangeEnd = request.EndDate
        };

        return package;
    }
}

// Helper class for order item query results (includes OrderId for grouping)
public class OrderItemQueryResult
{
    public long OrderItemId { get; set; }
    public long OrderId { get; set; }
    public long ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

