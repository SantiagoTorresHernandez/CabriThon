namespace CabriThon.Core.Models;

public class Order
{
    public long OrderId { get; set; }
    public long ClientId { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public Client? Client { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

