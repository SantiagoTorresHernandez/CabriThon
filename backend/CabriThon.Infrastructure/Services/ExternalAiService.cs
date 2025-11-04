using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using CabriThon.Core.DTOs;

namespace CabriThon.Infrastructure.Services;

public class ExternalAiService : IExternalAiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExternalAiService> _logger;
    private readonly string _aiApiBaseUrl;
    private readonly string _apiKey;

    public ExternalAiService(
        HttpClient httpClient, 
        IConfiguration configuration,
        ILogger<ExternalAiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        _aiApiBaseUrl = configuration["ExternalAPI:BaseUrl"] 
            ?? throw new InvalidOperationException("AI API Base URL is not configured");
        _apiKey = configuration["ExternalAPI:ApiKey"] 
            ?? throw new InvalidOperationException("AI API Key is not configured");
        
        _httpClient.BaseAddress = new Uri(_aiApiBaseUrl);
        _httpClient.DefaultRequestHeaders.Add("X-API-Key", _apiKey);
    }

    public async Task<PredictionSummaryDto?> GetSalesPredictionsAsync(int clientId, string userToken)
    {
        try
        {
            _logger.LogInformation("Fetching sales predictions for client {ClientId}", clientId);
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/predictions/summary/{clientId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI API returned {StatusCode} for client {ClientId}", 
                    response.StatusCode, clientId);
                return null;
            }
            
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<PredictionSummaryDto>(content, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching sales predictions for client {ClientId}", clientId);
            return null;
        }
    }

    public async Task<List<InventoryAlertDto>> GetInventoryAlertsAsync(int clientId, string userToken)
    {
        try
        {
            _logger.LogInformation("Fetching inventory alerts for client {ClientId}", clientId);
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/alerts/client/{clientId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI API returned {StatusCode} for client {ClientId}", 
                    response.StatusCode, clientId);
                return new List<InventoryAlertDto>();
            }
            
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<List<InventoryAlertDto>>(content, options) 
                ?? new List<InventoryAlertDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching inventory alerts for client {ClientId}", clientId);
            return new List<InventoryAlertDto>();
        }
    }

    public async Task<List<PromotionSuggestionDto>> GetPromotionSuggestionsAsync(int clientId, string userToken)
    {
        try
        {
            _logger.LogInformation("Fetching promotion suggestions for client {ClientId}", clientId);
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/promotions/suggestions/{clientId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI API returned {StatusCode} for client {ClientId}", 
                    response.StatusCode, clientId);
                return new List<PromotionSuggestionDto>();
            }
            
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<List<PromotionSuggestionDto>>(content, options) 
                ?? new List<PromotionSuggestionDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching promotion suggestions for client {ClientId}", clientId);
            return new List<PromotionSuggestionDto>();
        }
    }

    public async Task<List<ProductAnalysisDto>> GetProductAnalysisAsync(int clientId, string userToken)
    {
        try
        {
            _logger.LogInformation("Fetching product analysis for client {ClientId}", clientId);
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/analysis/client/{clientId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI API returned {StatusCode} for client {ClientId}", 
                    response.StatusCode, clientId);
                return new List<ProductAnalysisDto>();
            }
            
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<List<ProductAnalysisDto>>(content, options) 
                ?? new List<ProductAnalysisDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching product analysis for client {ClientId}", clientId);
            return new List<ProductAnalysisDto>();
        }
    }

    public async Task<ClientInsightsDto?> GetClientInsightsAsync(int clientId, string userToken)
    {
        try
        {
            _logger.LogInformation("Fetching comprehensive insights for client {ClientId}", clientId);
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/insights/client/{clientId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI API returned {StatusCode} for client {ClientId}", 
                    response.StatusCode, clientId);
                return null;
            }
            
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<ClientInsightsDto>(content, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching client insights for client {ClientId}", clientId);
            return null;
        }
    }
}

