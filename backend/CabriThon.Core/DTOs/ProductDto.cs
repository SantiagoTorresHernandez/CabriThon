namespace CabriThon.Core.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string? Category { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int? AvailableStock { get; set; } // Optional: for public view
}

public class ProductWithStockDto : ProductDto
{
    public List<StockByStoreDto> StockByStore { get; set; } = new();
}

public class StockByStoreDto
{
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public bool IsDistributionCenter { get; set; }
}

