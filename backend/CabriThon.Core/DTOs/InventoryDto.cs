namespace CabriThon.Core.DTOs;

public class StockDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductSku { get; set; }
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public bool IsDistributionCenterStock { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateStockRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class InventoryDashboardDto
{
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public List<StockDto> Stock { get; set; } = new();
    public List<OrderDto> RecentOrders { get; set; } = new();
    public InventoryMetricsDto Metrics { get; set; } = new();
}

public class InventoryMetricsDto
{
    public int TotalProducts { get; set; }
    public int TotalQuantity { get; set; }
    public int LowStockCount { get; set; }
    public int PendingOrders { get; set; }
    public decimal TotalOrderValue { get; set; }
}

public class AdminInventoryDto
{
    public List<StockDto> AllStock { get; set; } = new();
    public List<StockDto> DistributionCenterStock { get; set; } = new();
    public List<StoreInventorySummary> StoreInventories { get; set; } = new();
    public GlobalMetricsDto GlobalMetrics { get; set; } = new();
}

public class StoreInventorySummary
{
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public int TotalProducts { get; set; }
    public int TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
}

public class GlobalMetricsDto
{
    public int TotalStores { get; set; }
    public int TotalProducts { get; set; }
    public int TotalStockQuantity { get; set; }
    public int DistributionCenterQuantity { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
}

