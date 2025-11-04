using CabriThon.Core.Models;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IStockRepository
{
    Task<IEnumerable<InventoryClientDto>> GetStockByClientIdAsync(int clientId);
    Task<IEnumerable<InventoryClientDto>> GetAllClientStockAsync();
    Task<IEnumerable<InventoryCediDto>> GetDistributionCenterStockAsync();
    Task<InventoryClient?> GetClientStockByProductAndClientAsync(int productId, int clientId);
    Task<InventoryCedi?> GetCediStockByProductAsync(int productId);
    Task<bool> UpdateClientStockQuantityAsync(int productId, int clientId, int quantity);
    Task<bool> UpdateCediStockQuantityAsync(int productId, int quantity);
    Task<int> GetAvailableStockForProductAsync(int productId, int? clientId = null);
}

public class StockRepository : IStockRepository
{
    private readonly SupabaseContext _context;

    public StockRepository(SupabaseContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryClientDto>> GetStockByClientIdAsync(int clientId)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT ic.inventory_client_id as InventoryClientId, 
                   ic.product_id as ProductId, p.name as ProductName,
                   ic.client_id as ClientId, c.name as ClientName,
                   ic.stock, ic.warehouse_location as WarehouseLocation,
                   ic.last_updated as LastUpdated
            FROM inventory_client ic
            INNER JOIN product p ON ic.product_id = p.product_id
            INNER JOIN client c ON ic.client_id = c.client_id
            WHERE ic.client_id = @ClientId
            ORDER BY p.name";
        
        return await connection.QueryAsync<InventoryClientDto>(query, new { ClientId = clientId });
    }

    public async Task<IEnumerable<InventoryClientDto>> GetAllClientStockAsync()
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT ic.inventory_client_id as InventoryClientId, 
                   ic.product_id as ProductId, p.name as ProductName,
                   ic.client_id as ClientId, c.name as ClientName,
                   ic.stock, ic.warehouse_location as WarehouseLocation,
                   ic.last_updated as LastUpdated
            FROM inventory_client ic
            INNER JOIN product p ON ic.product_id = p.product_id
            INNER JOIN client c ON ic.client_id = c.client_id
            ORDER BY c.name, p.name";
        
        return await connection.QueryAsync<InventoryClientDto>(query);
    }

    public async Task<IEnumerable<InventoryCediDto>> GetDistributionCenterStockAsync()
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT ic.inventory_cedi_id as InventoryCediId, 
                   ic.product_id as ProductId, p.name as ProductName,
                   ic.stock, ic.warehouse_location as WarehouseLocation,
                   ic.last_updated as LastUpdated
            FROM inventory_cedi ic
            INNER JOIN product p ON ic.product_id = p.product_id
            ORDER BY p.name";
        
        return await connection.QueryAsync<InventoryCediDto>(query);
    }

    public async Task<InventoryClient?> GetClientStockByProductAndClientAsync(int productId, int clientId)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT inventory_client_id as InventoryClientId, product_id as ProductId,
                   client_id as ClientId, stock, warehouse_location as WarehouseLocation,
                   last_updated as LastUpdated
            FROM inventory_client
            WHERE product_id = @ProductId AND client_id = @ClientId";
        
        return await connection.QueryFirstOrDefaultAsync<InventoryClient>(query, 
            new { ProductId = productId, ClientId = clientId });
    }

    public async Task<InventoryCedi?> GetCediStockByProductAsync(int productId)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT inventory_cedi_id as InventoryCediId, product_id as ProductId,
                   stock, warehouse_location as WarehouseLocation,
                   last_updated as LastUpdated
            FROM inventory_cedi
            WHERE product_id = @ProductId";
        
        return await connection.QueryFirstOrDefaultAsync<InventoryCedi>(query, new { ProductId = productId });
    }

    public async Task<bool> UpdateClientStockQuantityAsync(int productId, int clientId, int quantity)
    {
        using var connection = _context.CreateConnection();
        
        // Check if stock record exists
        var existingStock = await GetClientStockByProductAndClientAsync(productId, clientId);
        
        if (existingStock != null)
        {
            // Update existing stock
            var updateQuery = @"
                UPDATE inventory_client 
                SET stock = @Quantity, 
                    last_updated = NOW()
                WHERE product_id = @ProductId AND client_id = @ClientId";
            
            var rowsAffected = await connection.ExecuteAsync(updateQuery, 
                new { ProductId = productId, ClientId = clientId, Quantity = quantity });
            
            return rowsAffected > 0;
        }
        else
        {
            // Insert new stock record
            var insertQuery = @"
                INSERT INTO inventory_client (product_id, client_id, stock, last_updated)
                VALUES (@ProductId, @ClientId, @Quantity, NOW())";
            
            var rowsAffected = await connection.ExecuteAsync(insertQuery, 
                new { ProductId = productId, ClientId = clientId, Quantity = quantity });
            
            return rowsAffected > 0;
        }
    }

    public async Task<bool> UpdateCediStockQuantityAsync(int productId, int quantity)
    {
        using var connection = _context.CreateConnection();
        
        var existingStock = await GetCediStockByProductAsync(productId);
        
        if (existingStock != null)
        {
            var updateQuery = @"
                UPDATE inventory_cedi 
                SET stock = @Quantity, 
                    last_updated = NOW()
                WHERE product_id = @ProductId";
            
            var rowsAffected = await connection.ExecuteAsync(updateQuery, 
                new { ProductId = productId, Quantity = quantity });
            
            return rowsAffected > 0;
        }
        else
        {
            var insertQuery = @"
                INSERT INTO inventory_cedi (product_id, stock, last_updated)
                VALUES (@ProductId, @Quantity, NOW())";
            
            var rowsAffected = await connection.ExecuteAsync(insertQuery, 
                new { ProductId = productId, Quantity = quantity });
            
            return rowsAffected > 0;
        }
    }

    public async Task<int> GetAvailableStockForProductAsync(int productId, int? clientId = null)
    {
        using var connection = _context.CreateConnection();
        
        string query;
        object parameters;
        
        if (clientId.HasValue)
        {
            query = @"
                SELECT COALESCE(stock, 0)
                FROM inventory_client
                WHERE product_id = @ProductId AND client_id = @ClientId";
            parameters = new { ProductId = productId, ClientId = clientId.Value };
        }
        else
        {
            // Return total stock across all clients + CEDI
            query = @"
                SELECT COALESCE(SUM(stock), 0)
                FROM (
                    SELECT stock FROM inventory_client WHERE product_id = @ProductId
                    UNION ALL
                    SELECT stock FROM inventory_cedi WHERE product_id = @ProductId
                ) as total_stock";
            parameters = new { ProductId = productId };
        }
        
        return await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
    }
}

