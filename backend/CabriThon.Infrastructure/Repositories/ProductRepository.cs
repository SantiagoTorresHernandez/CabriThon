using CabriThon.Core.Models;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllActiveProductsAsync();
    Task<Product?> GetProductByIdAsync(Guid id);
    Task<Product?> GetProductBySkuAsync(string sku);
}

public class ProductRepository : IProductRepository
{
    private readonly SupabaseContext _context;

    public ProductRepository(SupabaseContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllActiveProductsAsync()
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT id, name, description, sku, category, price, image_url as ImageUrl, 
                   is_active as IsActive, created_at as CreatedAt, updated_at as UpdatedAt
            FROM products 
            WHERE is_active = true
            ORDER BY name";
        
        return await connection.QueryAsync<Product>(query);
    }

    public async Task<Product?> GetProductByIdAsync(Guid id)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT id, name, description, sku, category, price, image_url as ImageUrl, 
                   is_active as IsActive, created_at as CreatedAt, updated_at as UpdatedAt
            FROM products 
            WHERE id = @Id";
        
        return await connection.QueryFirstOrDefaultAsync<Product>(query, new { Id = id });
    }

    public async Task<Product?> GetProductBySkuAsync(string sku)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT id, name, description, sku, category, price, image_url as ImageUrl, 
                   is_active as IsActive, created_at as CreatedAt, updated_at as UpdatedAt
            FROM products 
            WHERE sku = @Sku";
        
        return await connection.QueryFirstOrDefaultAsync<Product>(query, new { Sku = sku });
    }
}

