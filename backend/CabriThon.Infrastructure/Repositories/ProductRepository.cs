using CabriThon.Core.Models;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<Product?> GetProductByIdAsync(int id);
    Task<ProductDto?> GetProductDtoByIdAsync(int id);
}

public class ProductRepository : IProductRepository
{
    private readonly SupabaseContext _context;

    public ProductRepository(SupabaseContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT p.product_id as ProductId, p.name, p.cost, p.suggested_price as SuggestedPrice,
                   p.category_id as CategoryId, c.name as CategoryName,
                   p.subcategory_id as SubcategoryId, sc.name as SubcategoryName,
                   p.size, p.brand_id as BrandId, b.name as BrandName,
                   p.subbrand_id as SubbrandId, sb.name as SubbrandName
            FROM product p
            LEFT JOIN category c ON p.category_id = c.category_id
            LEFT JOIN subcategory sc ON p.subcategory_id = sc.subcategory_id
            LEFT JOIN brand b ON p.brand_id = b.brand_id
            LEFT JOIN subbrand sb ON p.subbrand_id = sb.subbrand_id
            ORDER BY p.name";
        
        return await connection.QueryAsync<ProductDto>(query);
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT product_id as ProductId, name, cost, suggested_price as SuggestedPrice,
                   category_id as CategoryId, subcategory_id as SubcategoryId, size,
                   brand_id as BrandId, subbrand_id as SubbrandId,
                   created_at as CreatedAt, updated_at as UpdatedAt
            FROM product 
            WHERE product_id = @Id";
        
        return await connection.QueryFirstOrDefaultAsync<Product>(query, new { Id = id });
    }

    public async Task<ProductDto?> GetProductDtoByIdAsync(int id)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT p.product_id as ProductId, p.name, p.cost, p.suggested_price as SuggestedPrice,
                   p.category_id as CategoryId, c.name as CategoryName,
                   p.subcategory_id as SubcategoryId, sc.name as SubcategoryName,
                   p.size, p.brand_id as BrandId, b.name as BrandName,
                   p.subbrand_id as SubbrandId, sb.name as SubbrandName
            FROM product p
            LEFT JOIN category c ON p.category_id = c.category_id
            LEFT JOIN subcategory sc ON p.subcategory_id = sc.subcategory_id
            LEFT JOIN brand b ON p.brand_id = b.brand_id
            LEFT JOIN subbrand sb ON p.subbrand_id = sb.subbrand_id
            WHERE p.product_id = @Id";
        
        return await connection.QueryFirstOrDefaultAsync<ProductDto>(query, new { Id = id });
    }
}

