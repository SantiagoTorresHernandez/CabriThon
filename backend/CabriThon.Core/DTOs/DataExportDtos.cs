namespace CabriThon.Core.DTOs;

/// <summary>
/// Product data export for AI analysis
/// </summary>
public class ProductExportDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public decimal? SuggestedPrice { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int? BrandId { get; set; }
    public string? BrandName { get; set; }
    public string? Size { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Order data export for AI analysis
/// </summary>
public class OrderExportDto
{
    public long OrderId { get; set; }
    public long ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemExportDto> Items { get; set; } = new();
}

public class OrderItemExportDto
{
    public long OrderItemId { get; set; }
    public long ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

/// <summary>
/// Inventory data export for AI analysis
/// </summary>
public class InventoryExportDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? ClientId { get; set; }
    public string? ClientName { get; set; }
    public int Stock { get; set; }
    public string? WarehouseLocation { get; set; }
    public DateTime LastUpdated { get; set; }
    public bool IsDistributionCenter { get; set; }
}

/// <summary>
/// Client data export for AI analysis
/// </summary>
public class ClientExportDto
{
    public int ClientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalOrders { get; set; }
    public int TotalProducts { get; set; }
}

/// <summary>
/// Sales history export for AI analysis
/// </summary>
public class SalesHistoryExportDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public int QuantitySold { get; set; }
    public decimal SalesValue { get; set; }
    public string? ProductCategory { get; set; }
    public string? ProductBrand { get; set; }
}

/// <summary>
/// Request parameters for data export
/// </summary>
public class DataExportRequest
{
    public int? ClientId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? Limit { get; set; }
    public List<int>? ProductIds { get; set; }
    public List<int>? CategoryIds { get; set; }
    public bool IncludeInactive { get; set; } = false;
}

/// <summary>
/// Comprehensive data package for AI analysis
/// </summary>
public class ComprehensiveDataPackageDto
{
    public DateTime ExportedAt { get; set; }
    public int? ClientId { get; set; }
    public List<ProductExportDto> Products { get; set; } = new();
    public List<OrderExportDto> Orders { get; set; } = new();
    public List<InventoryExportDto> Inventory { get; set; } = new();
    public List<ClientExportDto> Clients { get; set; } = new();
    public List<SalesHistoryExportDto> SalesHistory { get; set; } = new();
    public ExportMetadataDto Metadata { get; set; } = new();
}

public class ExportMetadataDto
{
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public int TotalClients { get; set; }
    public int TotalInventoryRecords { get; set; }
    public int TotalSalesRecords { get; set; }
    public DateTime? DataRangeStart { get; set; }
    public DateTime? DataRangeEnd { get; set; }
}

