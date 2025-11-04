using CabriThon.Core.Models;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IOrderRepository
{
    Task<OrderDto?> CreateOrderAsync(CreateOrderRequest request);
    Task<IEnumerable<OrderDto>> GetOrdersByClientIdAsync(int clientId, int limit = 50);
    Task<IEnumerable<OrderDto>> GetAllOrdersAsync(int limit = 100);
    Task<OrderDto?> GetOrderByIdAsync(long orderId);
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

    public async Task<OrderDto?> CreateOrderAsync(CreateOrderRequest request)
    {
        using var connection = _context.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Insert order
            var orderQuery = @"
                INSERT INTO orders (client_id, status, is_active)
                VALUES (@ClientId, @Status, @IsActive)
                RETURNING order_id";

            var orderId = await connection.QuerySingleAsync<long>(orderQuery, new
            {
                ClientId = request.ClientId,
                Status = "Pending",
                IsActive = true
            }, transaction: transaction);

            // Insert order items
            var orderItemQuery = @"
                INSERT INTO order_item (order_id, product_id, quantity)
                VALUES (@OrderId, @ProductId, @Quantity)";

            foreach (var item in request.Items)
            {
                await connection.ExecuteAsync(orderItemQuery, new
                {
                    OrderId = orderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity
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

    public async Task<IEnumerable<OrderDto>> GetOrdersByClientIdAsync(int clientId, int limit = 50)
    {
        using var connection = _context.CreateConnection();
        
        var orderQuery = @"
            SELECT o.order_id as OrderId, o.client_id as ClientId, c.name as ClientName,
                   o.status, o.is_active as IsActive, o.created_at as CreatedAt
            FROM orders o
            INNER JOIN client c ON o.client_id = c.client_id
            WHERE o.client_id = @ClientId
            ORDER BY o.created_at DESC
            LIMIT @Limit";

        var orders = await connection.QueryAsync<OrderDto>(orderQuery, new { ClientId = clientId, Limit = limit });

        // Load order items and calculate total
        foreach (var order in orders.ToList())
        {
            order.Items = (await GetOrderItemsAsync(connection, order.OrderId)).ToList();
            order.TotalAmount = order.Items.Sum(i => i.UnitPrice * i.Quantity);
        }

        return orders;
    }

    public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync(int limit = 100)
    {
        using var connection = _context.CreateConnection();
        
        var orderQuery = @"
            SELECT o.order_id as OrderId, o.client_id as ClientId, c.name as ClientName,
                   o.status, o.is_active as IsActive, o.created_at as CreatedAt
            FROM orders o
            INNER JOIN client c ON o.client_id = c.client_id
            ORDER BY o.created_at DESC
            LIMIT @Limit";

        var orders = await connection.QueryAsync<OrderDto>(orderQuery, new { Limit = limit });

        // Load order items and calculate total
        foreach (var order in orders.ToList())
        {
            order.Items = (await GetOrderItemsAsync(connection, order.OrderId)).ToList();
            order.TotalAmount = order.Items.Sum(i => i.UnitPrice * i.Quantity);
        }

        return orders;
    }

    public async Task<OrderDto?> GetOrderByIdAsync(long orderId)
    {
        using var connection = _context.CreateConnection();
        
        var orderQuery = @"
            SELECT o.order_id as OrderId, o.client_id as ClientId, c.name as ClientName,
                   o.status, o.is_active as IsActive, o.created_at as CreatedAt
            FROM orders o
            INNER JOIN client c ON o.client_id = c.client_id
            WHERE o.order_id = @OrderId";

        var result = await connection.QueryFirstOrDefaultAsync<OrderDto>(orderQuery, new { OrderId = orderId });
        
        if (result != null)
        {
            result.Items = (await GetOrderItemsAsync(connection, result.OrderId)).ToList();
            result.TotalAmount = result.Items.Sum(i => i.UnitPrice * i.Quantity);
        }

        return result;
    }

    private async Task<IEnumerable<OrderItemDto>> GetOrderItemsAsync(Npgsql.NpgsqlConnection connection, long orderId)
    {
        var query = @"
            SELECT oi.order_item_id as OrderItemId, oi.product_id as ProductId, p.name as ProductName,
                   oi.quantity, COALESCE(p.suggested_price, p.cost) as UnitPrice
            FROM order_item oi
            INNER JOIN product p ON oi.product_id = p.product_id
            WHERE oi.order_id = @OrderId";

        return await connection.QueryAsync<OrderItemDto>(query, new { OrderId = orderId });
    }
}

