namespace CabriThon.Core.Models;

public class OrderItem
{
    public long OrderItemId { get; set; }
    public long OrderId { get; set; }
    public long ProductId { get; set; }
    public int Quantity { get; set; }
    
    // Navigation properties
    public Order? Order { get; set; }
    public Product? Product { get; set; }
}

