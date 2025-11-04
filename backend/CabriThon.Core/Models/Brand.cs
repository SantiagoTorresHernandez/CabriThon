namespace CabriThon.Core.Models;

public class Brand
{
    public int BrandId { get; set; }
    public string Name { get; set; } = string.Empty;
    
    // Navigation properties
    public List<Subbrand> Subbrands { get; set; } = new();
}

public class Subbrand
{
    public int SubbrandId { get; set; }
    public int BrandId { get; set; }
    public string Name { get; set; } = string.Empty;
    
    // Navigation properties
    public Brand? Brand { get; set; }
}

