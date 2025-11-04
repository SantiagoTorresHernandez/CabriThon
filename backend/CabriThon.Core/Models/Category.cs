namespace CabriThon.Core.Models;

public class Category
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation properties
    public List<Subcategory> Subcategories { get; set; } = new();
}

public class Subcategory
{
    public int SubcategoryId { get; set; }
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    
    // Navigation properties
    public Category? Category { get; set; }
}

