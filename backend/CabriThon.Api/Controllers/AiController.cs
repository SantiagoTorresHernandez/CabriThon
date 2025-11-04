using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CabriThon.Infrastructure.Services;
using CabriThon.Infrastructure.Repositories;
using System.Security.Claims;

namespace CabriThon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IExternalAiService _aiService;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AiController> _logger;

    public AiController(
        IExternalAiService aiService,
        IUserRepository userRepository,
        ILogger<AiController> logger)
    {
        _aiService = aiService;
        _userRepository = userRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get sales predictions for the authenticated user's client
    /// </summary>
    [HttpGet("predictions")]
    [Authorize(Policy = "ClientOwner")]
    public async Task<IActionResult> GetPredictions()
    {
        try
        {
            var (authUserGuid, user, token) = await GetAuthenticatedUserAndTokenAsync();
            if (user == null || user.ClientId == null)
            {
                return BadRequest(new { message = "User is not associated with a client" });
            }

            var predictions = await _aiService.GetSalesPredictionsAsync(user.ClientId.Value, token);
            
            if (predictions == null)
            {
                return NotFound(new { message = "No predictions available" });
            }

            return Ok(predictions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving predictions");
            return StatusCode(500, new { message = "Error retrieving predictions", error = ex.Message });
        }
    }

    /// <summary>
    /// Get inventory alerts for the authenticated user's client
    /// </summary>
    [HttpGet("alerts")]
    [Authorize(Policy = "ClientOwner")]
    public async Task<IActionResult> GetInventoryAlerts()
    {
        try
        {
            var (authUserGuid, user, token) = await GetAuthenticatedUserAndTokenAsync();
            if (user == null || user.ClientId == null)
            {
                return BadRequest(new { message = "User is not associated with a client" });
            }

            var alerts = await _aiService.GetInventoryAlertsAsync(user.ClientId.Value, token);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving inventory alerts");
            return StatusCode(500, new { message = "Error retrieving alerts", error = ex.Message });
        }
    }

    /// <summary>
    /// Get AI-generated promotion suggestions for the authenticated user's client
    /// </summary>
    [HttpGet("promotions")]
    [Authorize(Policy = "ClientOwner")]
    public async Task<IActionResult> GetPromotionSuggestions()
    {
        try
        {
            var (authUserGuid, user, token) = await GetAuthenticatedUserAndTokenAsync();
            if (user == null || user.ClientId == null)
            {
                return BadRequest(new { message = "User is not associated with a client" });
            }

            var promotions = await _aiService.GetPromotionSuggestionsAsync(user.ClientId.Value, token);
            return Ok(promotions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving promotion suggestions");
            return StatusCode(500, new { message = "Error retrieving promotions", error = ex.Message });
        }
    }

    /// <summary>
    /// Get product performance analysis for the authenticated user's client
    /// </summary>
    [HttpGet("analysis")]
    [Authorize(Policy = "ClientOwner")]
    public async Task<IActionResult> GetProductAnalysis()
    {
        try
        {
            var (authUserGuid, user, token) = await GetAuthenticatedUserAndTokenAsync();
            if (user == null || user.ClientId == null)
            {
                return BadRequest(new { message = "User is not associated with a client" });
            }

            var analysis = await _aiService.GetProductAnalysisAsync(user.ClientId.Value, token);
            return Ok(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving product analysis");
            return StatusCode(500, new { message = "Error retrieving analysis", error = ex.Message });
        }
    }

    /// <summary>
    /// Get comprehensive AI insights for the authenticated user's client
    /// </summary>
    [HttpGet("insights")]
    [Authorize(Policy = "ClientOwner")]
    public async Task<IActionResult> GetClientInsights()
    {
        try
        {
            var (authUserGuid, user, token) = await GetAuthenticatedUserAndTokenAsync();
            if (user == null || user.ClientId == null)
            {
                return BadRequest(new { message = "User is not associated with a client" });
            }

            var insights = await _aiService.GetClientInsightsAsync(user.ClientId.Value, token);
            
            if (insights == null)
            {
                return NotFound(new { message = "No insights available" });
            }

            return Ok(insights);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving client insights");
            return StatusCode(500, new { message = "Error retrieving insights", error = ex.Message });
        }
    }

    /// <summary>
    /// Admin endpoint: Get predictions for any client
    /// </summary>
    [HttpGet("predictions/{clientId}")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> GetPredictionsByClient(int clientId)
    {
        try
        {
            var token = GetBearerToken();
            var predictions = await _aiService.GetSalesPredictionsAsync(clientId, token);
            
            if (predictions == null)
            {
                return NotFound(new { message = "No predictions available" });
            }

            return Ok(predictions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving predictions for client {ClientId}", clientId);
            return StatusCode(500, new { message = "Error retrieving predictions", error = ex.Message });
        }
    }

    /// <summary>
    /// Admin endpoint: Get alerts for any client
    /// </summary>
    [HttpGet("alerts/{clientId}")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> GetAlertsByClient(int clientId)
    {
        try
        {
            var token = GetBearerToken();
            var alerts = await _aiService.GetInventoryAlertsAsync(clientId, token);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts for client {ClientId}", clientId);
            return StatusCode(500, new { message = "Error retrieving alerts", error = ex.Message });
        }
    }

    private async Task<(Guid authUserGuid, Core.Models.User? user, string token)> GetAuthenticatedUserAndTokenAsync()
    {
        // Extract user ID from Supabase JWT
        var authUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(authUserId) || !Guid.TryParse(authUserId, out var authUserGuid))
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }

        // Get user from database
        var user = await _userRepository.GetUserByAuthUserIdAsync(authUserGuid);
        
        // Get bearer token to forward to AI API
        var token = GetBearerToken();

        return (authUserGuid, user, token);
    }

    private string GetBearerToken()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            throw new UnauthorizedAccessException("No bearer token provided");
        }
        
        return authHeader.Substring("Bearer ".Length);
    }
}

