using CabriThon.Core.Models;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IStockRepository
{
    Task<IEnumerable<StockDto>> GetStockByStoreIdAsync(Guid storeId);
    Task<IEnumerable<StockDto>> GetAllStockAsync();
    Task<IEnumerable<StockDto>> GetDistributionCenterStockAsync();
    Task<Stock?> GetStockByProductAndStoreAsync(Guid productId, Guid storeId);
    Task<bool> UpdateStockQuantityAsync(Guid productId, Guid storeId, int quantity, Guid? updatedBy);
    Task<int> GetAvailableStockForProductAsync(Guid productId, Guid? storeId = null);
}

public class StockRepository : IStockRepository
{
    private readonly SupabaseContext _context;

    public StockRepository(SupabaseContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StockDto>> GetStockByStoreIdAsync(Guid storeId)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT s.id, s.product_id as ProductId, p.name as ProductName, p.sku as ProductSku,
                   s.store_id as StoreId, st.name as StoreName, s.quantity,
                   s.is_distribution_center_stock as IsDistributionCenterStock,
                   s.updated_at as UpdatedAt
            FROM stock s
            INNER JOIN products p ON s.product_id = p.id
            INNER JOIN stores st ON s.store_id = st.id
            WHERE s.store_id = @StoreId
            ORDER BY p.name";
        
        return await connection.QueryAsync<StockDto>(query, new { StoreId = storeId });
    }

    public async Task<IEnumerable<StockDto>> GetAllStockAsync()
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT s.id, s.product_id as ProductId, p.name as ProductName, p.sku as ProductSku,
                   s.store_id as StoreId, st.name as StoreName, s.quantity,
                   s.is_distribution_center_stock as IsDistributionCenterStock,
                   s.updated_at as UpdatedAt
            FROM stock s
            INNER JOIN products p ON s.product_id = p.id
            INNER JOIN stores st ON s.store_id = st.id
            ORDER BY st.name, p.name";
        
        return await connection.QueryAsync<StockDto>(query);
    }

    public async Task<IEnumerable<StockDto>> GetDistributionCenterStockAsync()
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT s.id, s.product_id as ProductId, p.name as ProductName, p.sku as ProductSku,
                   s.store_id as StoreId, st.name as StoreName, s.quantity,
                   s.is_distribution_center_stock as IsDistributionCenterStock,
                   s.updated_at as UpdatedAt
            FROM stock s
            INNER JOIN products p ON s.product_id = p.id
            INNER JOIN stores st ON s.store_id = st.id
            WHERE s.is_distribution_center_stock = true
            ORDER BY p.name";
        
        return await connection.QueryAsync<StockDto>(query);
    }

    public async Task<Stock?> GetStockByProductAndStoreAsync(Guid productId, Guid storeId)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT id, product_id as ProductId, store_id as StoreId, quantity,
                   is_distribution_center_stock as IsDistributionCenterStock,
                   last_updated_by as LastUpdatedBy, created_at as CreatedAt, 
                   updated_at as UpdatedAt
            FROM stock
            WHERE product_id = @ProductId AND store_id = @StoreId";
        
        return await connection.QueryFirstOrDefaultAsync<Stock>(query, 
            new { ProductId = productId, StoreId = storeId });
    }

    public async Task<bool> UpdateStockQuantityAsync(Guid productId, Guid storeId, int quantity, Guid? updatedBy)
    {
        using var connection = _context.CreateConnection();
        
        // Check if stock record exists
        var existingStock = await GetStockByProductAndStoreAsync(productId, storeId);
        
        if (existingStock != null)
        {
            // Update existing stock
            var updateQuery = @"
                UPDATE stock 
                SET quantity = @Quantity, 
                    last_updated_by = @UpdatedBy,
                    updated_at = NOW()
                WHERE product_id = @ProductId AND store_id = @StoreId";
            
            var rowsAffected = await connection.ExecuteAsync(updateQuery, 
                new { ProductId = productId, StoreId = storeId, Quantity = quantity, UpdatedBy = updatedBy });
            
            return rowsAffected > 0;
        }
        else
        {
            // Insert new stock record
            var insertQuery = @"
                INSERT INTO stock (product_id, store_id, quantity, last_updated_by, is_distribution_center_stock)
                SELECT @ProductId, @StoreId, @Quantity, @UpdatedBy, st.is_distribution_center
                FROM stores st
                WHERE st.id = @StoreId";
            
            var rowsAffected = await connection.ExecuteAsync(insertQuery, 
                new { ProductId = productId, StoreId = storeId, Quantity = quantity, UpdatedBy = updatedBy });
            
            return rowsAffected > 0;
        }
    }

    public async Task<int> GetAvailableStockForProductAsync(Guid productId, Guid? storeId = null)
    {
        using var connection = _context.CreateConnection();
        
        string query;
        object parameters;
        
        if (storeId.HasValue)
        {
            query = @"
                SELECT COALESCE(SUM(quantity), 0)
                FROM stock
                WHERE product_id = @ProductId AND store_id = @StoreId";
            parameters = new { ProductId = productId, StoreId = storeId.Value };
        }
        else
        {
            query = @"
                SELECT COALESCE(SUM(quantity), 0)
                FROM stock
                WHERE product_id = @ProductId";
            parameters = new { ProductId = productId };
        }
        
        return await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
    }
}

