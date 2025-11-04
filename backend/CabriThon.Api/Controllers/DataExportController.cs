using Microsoft.AspNetCore.Mvc;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Repositories;

namespace CabriThon.Api.Controllers;

/// <summary>
/// Data export endpoints for AI Agent API (Repo 2)
/// Protected by API key authentication via middleware
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DataExportController : ControllerBase
{
    private readonly IDataExportRepository _exportRepository;
    private readonly ILogger<DataExportController> _logger;

    public DataExportController(
        IDataExportRepository exportRepository,
        ILogger<DataExportController> logger)
    {
        _exportRepository = exportRepository;
        _logger = logger;
    }

    /// <summary>
    /// Export product catalog data
    /// </summary>
    [HttpGet("products")]
    public async Task<IActionResult> ExportProducts([FromQuery] DataExportRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting products data for client {ClientId}", request.ClientId);
            var products = await _exportRepository.GetProductsForExportAsync(request);
            
            return Ok(new
            {
                success = true,
                count = products.Count,
                data = products,
                exportedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting products");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Export order history data
    /// </summary>
    [HttpGet("orders")]
    public async Task<IActionResult> ExportOrders([FromQuery] DataExportRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting orders data for client {ClientId} from {StartDate} to {EndDate}", 
                request.ClientId, request.StartDate, request.EndDate);
            
            var orders = await _exportRepository.GetOrdersForExportAsync(request);
            
            return Ok(new
            {
                success = true,
                count = orders.Count,
                data = orders,
                exportedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting orders");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Export inventory data (both client and CEDI)
    /// </summary>
    [HttpGet("inventory")]
    public async Task<IActionResult> ExportInventory([FromQuery] DataExportRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting inventory data for client {ClientId}", request.ClientId);
            var inventory = await _exportRepository.GetInventoryForExportAsync(request);
            
            return Ok(new
            {
                success = true,
                count = inventory.Count,
                data = inventory,
                exportedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting inventory");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Export client list with basic metrics
    /// </summary>
    [HttpGet("clients")]
    public async Task<IActionResult> ExportClients()
    {
        try
        {
            _logger.LogInformation("Exporting clients data");
            var clients = await _exportRepository.GetClientsForExportAsync();
            
            return Ok(new
            {
                success = true,
                count = clients.Count,
                data = clients,
                exportedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting clients");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Export sales history for analysis
    /// </summary>
    [HttpGet("sales-history")]
    public async Task<IActionResult> ExportSalesHistory([FromQuery] DataExportRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting sales history for client {ClientId} from {StartDate} to {EndDate}", 
                request.ClientId, request.StartDate, request.EndDate);
            
            var salesHistory = await _exportRepository.GetSalesHistoryForExportAsync(request);
            
            return Ok(new
            {
                success = true,
                count = salesHistory.Count,
                data = salesHistory,
                exportedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting sales history");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Export comprehensive data package (all data types)
    /// </summary>
    [HttpPost("comprehensive")]
    public async Task<IActionResult> ExportComprehensivePackage([FromBody] DataExportRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting comprehensive data package for client {ClientId}", request.ClientId);
            var package = await _exportRepository.GetComprehensiveDataPackageAsync(request);
            
            return Ok(new
            {
                success = true,
                data = package
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting comprehensive package");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Health check endpoint for AI Agent API
    /// </summary>
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new
        {
            success = true,
            service = "CabriThon Data Export API",
            timestamp = DateTime.UtcNow,
            version = "1.0.0"
        });
    }

    /// <summary>
    /// Get data export statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetExportStats([FromQuery] int? clientId)
    {
        try
        {
            var request = new DataExportRequest { ClientId = clientId, Limit = 1 };
            
            // Get counts without fetching full data
            var productsTask = _exportRepository.GetProductsForExportAsync(request);
            var ordersTask = _exportRepository.GetOrdersForExportAsync(request);
            var inventoryTask = _exportRepository.GetInventoryForExportAsync(request);
            
            await Task.WhenAll(productsTask, ordersTask, inventoryTask);
            
            return Ok(new
            {
                success = true,
                stats = new
                {
                    clientId,
                    availableDataTypes = new[] { "products", "orders", "inventory", "clients", "sales-history" },
                    timestamp = DateTime.UtcNow
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting export stats");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}

