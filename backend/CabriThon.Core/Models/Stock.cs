namespace CabriThon.Core.Models;

public class Stock
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid StoreId { get; set; }
    public int Quantity { get; set; }
    public bool IsDistributionCenterStock { get; set; }
    public Guid? LastUpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public Product? Product { get; set; }
    public Store? Store { get; set; }
}

