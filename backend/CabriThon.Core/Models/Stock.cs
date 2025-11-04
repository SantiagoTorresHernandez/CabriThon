namespace CabriThon.Core.Models;

// Distribution Center (CEDI) Inventory
public class InventoryCedi
{
    public int InventoryCediId { get; set; }
    public int ProductId { get; set; }
    public int Stock { get; set; } = 0;
    public string? WarehouseLocation { get; set; }
    public DateTime LastUpdated { get; set; }
    
    // Navigation properties
    public Product? Product { get; set; }
}

// Client Inventory
public class InventoryClient
{
    public int InventoryClientId { get; set; }
    public int ProductId { get; set; }
    public int ClientId { get; set; }
    public int Stock { get; set; } = 0;
    public string? WarehouseLocation { get; set; }
    public DateTime LastUpdated { get; set; }
    
    // Navigation properties
    public Product? Product { get; set; }
    public Client? Client { get; set; }
}

