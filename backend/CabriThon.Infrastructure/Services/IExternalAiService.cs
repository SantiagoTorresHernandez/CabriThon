using CabriThon.Core.DTOs;

namespace CabriThon.Infrastructure.Services;

/// <summary>
/// Service for communicating with the AI Agents & Suggestions API (Repo 2)
/// </summary>
public interface IExternalAiService
{
    /// <summary>
    /// Get sales predictions for a client
    /// </summary>
    Task<PredictionSummaryDto?> GetSalesPredictionsAsync(int clientId, string userToken);
    
    /// <summary>
    /// Get inventory alerts for a client
    /// </summary>
    Task<List<InventoryAlertDto>> GetInventoryAlertsAsync(int clientId, string userToken);
    
    /// <summary>
    /// Get AI-generated promotions for a client
    /// </summary>
    Task<List<PromotionSuggestionDto>> GetPromotionSuggestionsAsync(int clientId, string userToken);
    
    /// <summary>
    /// Get product analysis for a client
    /// </summary>
    Task<List<ProductAnalysisDto>> GetProductAnalysisAsync(int clientId, string userToken);
    
    /// <summary>
    /// Get comprehensive client insights
    /// </summary>
    Task<ClientInsightsDto?> GetClientInsightsAsync(int clientId, string userToken);
}

