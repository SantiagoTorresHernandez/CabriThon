namespace CabriThon.Core.Models;

public class Product
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public decimal? SuggestedPrice { get; set; }
    public int? CategoryId { get; set; }
    public int? SubcategoryId { get; set; }
    public string? Size { get; set; }
    public int? BrandId { get; set; }
    public int? SubbrandId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public Category? Category { get; set; }
    public Subcategory? Subcategory { get; set; }
    public Brand? Brand { get; set; }
    public Subbrand? Subbrand { get; set; }
}

