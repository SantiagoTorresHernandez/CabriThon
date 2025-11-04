using CabriThon.Core.Models;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IOrderRepository
{
    Task<OrderDto?> CreateOrderAsync(CreateOrderRequest request, Guid? userId);
    Task<IEnumerable<OrderDto>> GetOrdersByStoreIdAsync(Guid storeId, int limit = 50);
    Task<IEnumerable<OrderDto>> GetAllOrdersAsync(int limit = 100);
    Task<OrderDto?> GetOrderByIdAsync(Guid orderId);
    Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(Guid userId);
}

public class OrderRepository : IOrderRepository
{
    private readonly SupabaseContext _context;
    private readonly IProductRepository _productRepository;

    public OrderRepository(SupabaseContext context, IProductRepository productRepository)
    {
        _context = context;
        _productRepository = productRepository;
    }

    public async Task<OrderDto?> CreateOrderAsync(CreateOrderRequest request, Guid? userId)
    {
        using var connection = _context.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Determine store (default to first non-DC store if not specified)
            Guid storeId;
            if (request.StoreId.HasValue)
            {
                storeId = request.StoreId.Value;
            }
            else
            {
                var defaultStoreQuery = "SELECT id FROM stores WHERE is_distribution_center = false LIMIT 1";
                storeId = await connection.QueryFirstAsync<Guid>(defaultStoreQuery, transaction: transaction);
            }

            // Calculate order total
            decimal totalAmount = 0;
            var orderItems = new List<(Guid ProductId, int Quantity, decimal UnitPrice, decimal Subtotal)>();

            foreach (var item in request.Items)
            {
                var product = await _productRepository.GetProductByIdAsync(item.ProductId);
                if (product == null)
                    throw new InvalidOperationException($"Product {item.ProductId} not found");

                var subtotal = product.Price * item.Quantity;
                totalAmount += subtotal;
                orderItems.Add((item.ProductId, item.Quantity, product.Price, subtotal));
            }

            // Generate order number
            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";

            // Insert order
            var orderQuery = @"
                INSERT INTO orders (order_number, user_id, store_id, status, total_amount, 
                                    shipping_address, customer_name, customer_email, customer_phone, notes)
                VALUES (@OrderNumber, @UserId, @StoreId, @Status, @TotalAmount, 
                        @ShippingAddress, @CustomerName, @CustomerEmail, @CustomerPhone, @Notes)
                RETURNING id";

            var orderId = await connection.QuerySingleAsync<Guid>(orderQuery, new
            {
                OrderNumber = orderNumber,
                UserId = userId,
                StoreId = storeId,
                Status = OrderStatus.Pending,
                TotalAmount = totalAmount,
                ShippingAddress = request.ShippingAddress,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                CustomerPhone = request.CustomerPhone,
                Notes = request.Notes
            }, transaction: transaction);

            // Insert order items
            var orderItemQuery = @"
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                VALUES (@OrderId, @ProductId, @Quantity, @UnitPrice, @Subtotal)";

            foreach (var item in orderItems)
            {
                await connection.ExecuteAsync(orderItemQuery, new
                {
                    OrderId = orderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Subtotal = item.Subtotal
                }, transaction: transaction);
            }

            transaction.Commit();

            // Return the created order
            return await GetOrderByIdAsync(orderId);
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<IEnumerable<OrderDto>> GetOrdersByStoreIdAsync(Guid storeId, int limit = 50)
    {
        using var connection = _context.CreateConnection();
        
        var orderQuery = @"
            SELECT o.id, o.order_number as OrderNumber, o.status, o.total_amount as TotalAmount,
                   o.customer_name as CustomerName, o.customer_email as CustomerEmail,
                   o.customer_phone as CustomerPhone, o.shipping_address as ShippingAddress,
                   o.notes, o.created_at as CreatedAt,
                   s.id as StoreId, s.name as StoreName, s.is_distribution_center as IsDistributionCenter
            FROM orders o
            INNER JOIN stores s ON o.store_id = s.id
            WHERE o.store_id = @StoreId
            ORDER BY o.created_at DESC
            LIMIT @Limit";

        var orders = await connection.QueryAsync<OrderDto, StoreInfoDto, OrderDto>(
            orderQuery,
            (order, store) =>
            {
                order.Store = store;
                return order;
            },
            new { StoreId = storeId, Limit = limit },
            splitOn: "StoreId"
        );

        // Load order items
        foreach (var order in orders)
        {
            order.Items = (await GetOrderItemsAsync(connection, order.Id)).ToList();
        }

        return orders;
    }

    public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync(int limit = 100)
    {
        using var connection = _context.CreateConnection();
        
        var orderQuery = @"
            SELECT o.id, o.order_number as OrderNumber, o.status, o.total_amount as TotalAmount,
                   o.customer_name as CustomerName, o.customer_email as CustomerEmail,
                   o.customer_phone as CustomerPhone, o.shipping_address as ShippingAddress,
                   o.notes, o.created_at as CreatedAt,
                   s.id as StoreId, s.name as StoreName, s.is_distribution_center as IsDistributionCenter
            FROM orders o
            INNER JOIN stores s ON o.store_id = s.id
            ORDER BY o.created_at DESC
            LIMIT @Limit";

        var orders = await connection.QueryAsync<OrderDto, StoreInfoDto, OrderDto>(
            orderQuery,
            (order, store) =>
            {
                order.Store = store;
                return order;
            },
            new { Limit = limit },
            splitOn: "StoreId"
        );

        // Load order items
        foreach (var order in orders)
        {
            order.Items = (await GetOrderItemsAsync(connection, order.Id)).ToList();
        }

        return orders;
    }

    public async Task<OrderDto?> GetOrderByIdAsync(Guid orderId)
    {
        using var connection = _context.CreateConnection();
        
        var orderQuery = @"
            SELECT o.id, o.order_number as OrderNumber, o.status, o.total_amount as TotalAmount,
                   o.customer_name as CustomerName, o.customer_email as CustomerEmail,
                   o.customer_phone as CustomerPhone, o.shipping_address as ShippingAddress,
                   o.notes, o.created_at as CreatedAt,
                   s.id as StoreId, s.name as StoreName, s.is_distribution_center as IsDistributionCenter
            FROM orders o
            INNER JOIN stores s ON o.store_id = s.id
            WHERE o.id = @OrderId";

        var orders = await connection.QueryAsync<OrderDto, StoreInfoDto, OrderDto>(
            orderQuery,
            (order, store) =>
            {
                order.Store = store;
                return order;
            },
            new { OrderId = orderId },
            splitOn: "StoreId"
        );

        var result = orders.FirstOrDefault();
        if (result != null)
        {
            result.Items = (await GetOrderItemsAsync(connection, result.Id)).ToList();
        }

        return result;
    }

    public async Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(Guid userId)
    {
        using var connection = _context.CreateConnection();
        
        var orderQuery = @"
            SELECT o.id, o.order_number as OrderNumber, o.status, o.total_amount as TotalAmount,
                   o.customer_name as CustomerName, o.customer_email as CustomerEmail,
                   o.customer_phone as CustomerPhone, o.shipping_address as ShippingAddress,
                   o.notes, o.created_at as CreatedAt,
                   s.id as StoreId, s.name as StoreName, s.is_distribution_center as IsDistributionCenter
            FROM orders o
            INNER JOIN stores s ON o.store_id = s.id
            WHERE o.user_id = @UserId
            ORDER BY o.created_at DESC";

        var orders = await connection.QueryAsync<OrderDto, StoreInfoDto, OrderDto>(
            orderQuery,
            (order, store) =>
            {
                order.Store = store;
                return order;
            },
            new { UserId = userId },
            splitOn: "StoreId"
        );

        // Load order items
        foreach (var order in orders)
        {
            order.Items = (await GetOrderItemsAsync(connection, order.Id)).ToList();
        }

        return orders;
    }

    private async Task<IEnumerable<OrderItemDto>> GetOrderItemsAsync(Npgsql.NpgsqlConnection connection, Guid orderId)
    {
        var query = @"
            SELECT oi.id, oi.product_id as ProductId, p.name as ProductName,
                   oi.quantity, oi.unit_price as UnitPrice, oi.subtotal
            FROM order_items oi
            INNER JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = @OrderId";

        return await connection.QueryAsync<OrderItemDto>(query, new { OrderId = orderId });
    }
}

