namespace CabriThon.Core.DTOs;

/// <summary>
/// Sales prediction summary from AI
/// </summary>
public class PredictionSummaryDto
{
    public DateTime FechaGeneracion { get; set; }
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public int TotalProductosAnalizados { get; set; }
    public decimal TotalUnidadesPredichas { get; set; }
    public decimal ValorTotalPredichoMxn { get; set; }
    public int ProductosConAlertaStock { get; set; }
    public string ModeloUtilizado { get; set; } = string.Empty;
    public decimal? Mae { get; set; }
    public decimal? Rmse { get; set; }
    public decimal? R2Score { get; set; }
}

/// <summary>
/// Individual product prediction
/// </summary>
public class ProductPredictionDto
{
    public int ProductId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public int StockActual { get; set; }
    public DateTime FechaPrediccion { get; set; }
    public decimal UnidadesPredichas { get; set; }
    public decimal ValorPredichoMxn { get; set; }
    public string? EstadoInventario { get; set; }
}

/// <summary>
/// Inventory alert from AI
/// </summary>
public class InventoryAlertDto
{
    public long Id { get; set; }
    public DateTime FechaGeneracion { get; set; }
    public int ClienteId { get; set; }
    public int ProductId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string Prioridad { get; set; } = string.Empty;
    public int StockActual { get; set; }
    public decimal DemandaPredicha { get; set; }
    public decimal FaltanteEstimado { get; set; }
    public int RecomendacionReabastecimiento { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Notas { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// AI-generated promotion suggestion
/// </summary>
public class PromotionSuggestionDto
{
    public long? PromotionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? JustificationAi { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalPrice { get; set; }
    public decimal? ExpectedIncreasePercent { get; set; }
    public decimal? ProfitMarginPercent { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<PromotionProductDto> Products { get; set; } = new();
    public bool CreatedByAi { get; set; }
}

public class PromotionProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal IndividualPrice { get; set; }
    public decimal DiscountApplied { get; set; }
}

/// <summary>
/// Product performance analysis
/// </summary>
public class ProductAnalysisDto
{
    public int ProductId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string TipoProducto { get; set; } = string.Empty;
    public long TotalUnidadesVendidas { get; set; }
    public long NumeroOrdenes { get; set; }
    public decimal? VelocidadVentaSemanal { get; set; }
    public int StockTotal { get; set; }
    public decimal? DiasInventarioRestante { get; set; }
    public string? PerformanceVentas { get; set; }
    public string? EstadoStock { get; set; }
    public string? Recomendacion { get; set; }
    public bool EsCandidatoPromocion { get; set; }
    public bool EsTopSeller { get; set; }
    public bool RequiereReabastecimiento { get; set; }
}

/// <summary>
/// Client-specific product insights
/// </summary>
public class ClientProductInsightDto
{
    public int ClientId { get; set; }
    public int ProductId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public long UnidadesVendidas { get; set; }
    public decimal? VelocidadCompraSemanal { get; set; }
    public int StockActual { get; set; }
    public decimal? DiasStockDisponible { get; set; }
    public string? PerformanceTienda { get; set; }
    public string? EstadoInventarioTienda { get; set; }
    public string? RecomendacionAgente { get; set; }
    public string? TipoAccion { get; set; }
    public string? IdeaPromocion { get; set; }
    public bool EsProductoEstrellaTienda { get; set; }
    public bool NecesitaPromocion { get; set; }
    public bool EstaAgotado { get; set; }
    public bool PedirPronto { get; set; }
    public int? Prioridad { get; set; }
}

/// <summary>
/// Comprehensive client insights from AI
/// </summary>
public class ClientInsightsDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public PredictionSummaryDto? PredictionSummary { get; set; }
    public List<InventoryAlertDto> InventoryAlerts { get; set; } = new();
    public List<PromotionSuggestionDto> PromotionSuggestions { get; set; } = new();
    public List<ClientProductInsightDto> ProductInsights { get; set; } = new();
    public ClientMetricsDto? Metrics { get; set; }
    public DateTime GeneratedAt { get; set; }
}

public class ClientMetricsDto
{
    public int TotalProducts { get; set; }
    public int LowStockProducts { get; set; }
    public int CriticalStockProducts { get; set; }
    public int TopSellingProducts { get; set; }
    public int PromotionOpportunities { get; set; }
    public decimal TotalPredictedSales { get; set; }
    public decimal AverageStockDays { get; set; }
}

