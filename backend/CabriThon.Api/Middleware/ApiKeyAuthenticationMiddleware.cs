using Microsoft.Extensions.Primitives;

namespace CabriThon.Api.Middleware;

/// <summary>
/// Middleware to authenticate API requests using API key
/// Used for AI Agent API (Repo 2) to access data endpoints
/// </summary>
public class ApiKeyAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ApiKeyAuthenticationMiddleware> _logger;
    private const string API_KEY_HEADER = "X-API-Key";
    private const string API_KEY_QUERY_PARAM = "apiKey";

    public ApiKeyAuthenticationMiddleware(
        RequestDelegate next, 
        IConfiguration configuration,
        ILogger<ApiKeyAuthenticationMiddleware> logger)
    {
        _next = next;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only check API key for /api/data-export/* endpoints
        if (!context.Request.Path.StartsWithSegments("/api/data-export"))
        {
            await _next(context);
            return;
        }

        // Try to get API key from header or query parameter
        if (!TryGetApiKey(context.Request, out var providedApiKey))
        {
            _logger.LogWarning("API key missing for data export request from {IP}", 
                context.Connection.RemoteIpAddress);
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { error = "API key is required" });
            return;
        }

        // Validate API key
        var validApiKeys = _configuration.GetSection("DataExportApiKeys").Get<string[]>();
        if (validApiKeys == null || !validApiKeys.Contains(providedApiKey))
        {
            _logger.LogWarning("Invalid API key provided for data export request from {IP}", 
                context.Connection.RemoteIpAddress);
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid API key" });
            return;
        }

        _logger.LogInformation("Valid API key provided for data export request");
        await _next(context);
    }

    private bool TryGetApiKey(HttpRequest request, out string? apiKey)
    {
        // Try header first
        if (request.Headers.TryGetValue(API_KEY_HEADER, out StringValues headerValue))
        {
            apiKey = headerValue.FirstOrDefault();
            return !string.IsNullOrEmpty(apiKey);
        }

        // Try query parameter
        if (request.Query.TryGetValue(API_KEY_QUERY_PARAM, out StringValues queryValue))
        {
            apiKey = queryValue.FirstOrDefault();
            return !string.IsNullOrEmpty(apiKey);
        }

        apiKey = null;
        return false;
    }
}

