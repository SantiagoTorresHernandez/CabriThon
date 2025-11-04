namespace CabriThon.Core.DTOs;

public class InventoryCediDto
{
    public int InventoryCediId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Stock { get; set; }
    public string? WarehouseLocation { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class InventoryClientDto
{
    public int InventoryClientId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int Stock { get; set; }
    public string? WarehouseLocation { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class UpdateStockRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class ClientInventoryDashboardDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public List<InventoryClientDto> Stock { get; set; } = new();
    public List<OrderDto> RecentOrders { get; set; } = new();
    public InventoryMetricsDto Metrics { get; set; } = new();
}

public class InventoryMetricsDto
{
    public int TotalProducts { get; set; }
    public int TotalQuantity { get; set; }
    public int LowStockCount { get; set; }
    public int PendingOrders { get; set; }
}

public class AdminInventoryDto
{
    public List<InventoryClientDto> AllClientStock { get; set; } = new();
    public List<InventoryCediDto> DistributionCenterStock { get; set; } = new();
    public List<ClientInventorySummary> ClientInventories { get; set; } = new();
    public GlobalMetricsDto GlobalMetrics { get; set; } = new();
}

public class ClientInventorySummary
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int TotalProducts { get; set; }
    public int TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
}

public class GlobalMetricsDto
{
    public int TotalClients { get; set; }
    public int TotalProducts { get; set; }
    public int TotalClientStockQuantity { get; set; }
    public int DistributionCenterQuantity { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int TotalOrders { get; set; }
}

