namespace CabriThon.Core.DTOs;

public class ProductDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public decimal? SuggestedPrice { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int? SubcategoryId { get; set; }
    public string? SubcategoryName { get; set; }
    public string? Size { get; set; }
    public int? BrandId { get; set; }
    public string? BrandName { get; set; }
    public int? SubbrandId { get; set; }
    public string? SubbrandName { get; set; }
    public int? AvailableStock { get; set; } // Optional: for public view
}

public class ProductWithStockDto : ProductDto
{
    public int? CediStock { get; set; }
    public List<StockByClientDto> StockByClient { get; set; } = new();
}

public class StockByClientDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int Quantity { get; set; }
}

