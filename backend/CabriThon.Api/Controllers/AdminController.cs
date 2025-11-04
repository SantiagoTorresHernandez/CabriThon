using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Repositories;

namespace CabriThon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IStockRepository _stockRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;

    public AdminController(
        IStockRepository stockRepository,
        IOrderRepository orderRepository,
        IProductRepository productRepository)
    {
        _stockRepository = stockRepository;
        _orderRepository = orderRepository;
        _productRepository = productRepository;
    }

    /// <summary>
    /// Get distribution center inventory and global metrics
    /// </summary>
    [HttpGet("inventory/distribution")]
    public async Task<IActionResult> GetDistributionCenterInventory()
    {
        try
        {
            var dcStock = await _stockRepository.GetDistributionCenterStockAsync();
            var allClientStock = await _stockRepository.GetAllClientStockAsync();
            var allOrders = await _orderRepository.GetAllOrdersAsync(100);
            var allProducts = await _productRepository.GetAllProductsAsync();

            var dcStockList = dcStock.ToList();
            var clientStockList = allClientStock.ToList();
            var orderList = allOrders.ToList();
            var productList = allProducts.ToList();

            // Calculate client summaries
            var clientSummaries = clientStockList
                .GroupBy(s => new { s.ClientId, s.ClientName })
                .Select(g => new ClientInventorySummary
                {
                    ClientId = g.Key.ClientId,
                    ClientName = g.Key.ClientName,
                    TotalProducts = g.Count(),
                    TotalQuantity = g.Sum(s => s.Stock),
                    TotalValue = g.Sum(s => s.Stock * (productList.FirstOrDefault(p => p.ProductId == s.ProductId)?.Cost ?? 0))
                })
                .ToList();

            var result = new AdminInventoryDto
            {
                DistributionCenterStock = dcStockList,
                AllClientStock = clientStockList,
                ClientInventories = clientSummaries,
                GlobalMetrics = new GlobalMetricsDto
                {
                    TotalClients = clientSummaries.Count,
                    TotalProducts = productList.Count(),
                    TotalClientStockQuantity = clientStockList.Sum(s => s.Stock),
                    DistributionCenterQuantity = dcStockList.Sum(s => s.Stock),
                    TotalInventoryValue = clientSummaries.Sum(s => s.TotalValue),
                    TotalOrders = orderList.Count()
                }
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving distribution center inventory", error = ex.Message });
        }
    }

    /// <summary>
    /// Get comprehensive view of all client inventory
    /// </summary>
    [HttpGet("inventory/clients")]
    public async Task<IActionResult> GetAllClientInventory()
    {
        try
        {
            var allStock = await _stockRepository.GetAllClientStockAsync();
            return Ok(allStock);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving all client inventory", error = ex.Message });
        }
    }

    /// <summary>
    /// Get CEDI (distribution center) inventory
    /// </summary>
    [HttpGet("inventory/cedi")]
    public async Task<IActionResult> GetCediInventory()
    {
        try
        {
            var cediStock = await _stockRepository.GetDistributionCenterStockAsync();
            return Ok(cediStock);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving CEDI inventory", error = ex.Message });
        }
    }

    /// <summary>
    /// Get all orders across all clients
    /// </summary>
    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders([FromQuery] int limit = 100)
    {
        try
        {
            var orders = await _orderRepository.GetAllOrdersAsync(limit);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
        }
    }

    /// <summary>
    /// Update client stock (admin override)
    /// </summary>
    [HttpPost("inventory/client/update")]
    public async Task<IActionResult> UpdateClientStock([FromBody] UpdateStockRequest request, [FromQuery] int clientId)
    {
        try
        {
            if (request.Quantity < 0)
            {
                return BadRequest(new { message = "Quantity cannot be negative" });
            }

            var success = await _stockRepository.UpdateClientStockQuantityAsync(
                request.ProductId,
                clientId,
                request.Quantity
            );

            if (!success)
            {
                return StatusCode(500, new { message = "Failed to update client stock" });
            }

            return Ok(new { message = "Client stock updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating client stock", error = ex.Message });
        }
    }

    /// <summary>
    /// Update CEDI stock (admin override)
    /// </summary>
    [HttpPost("inventory/cedi/update")]
    public async Task<IActionResult> UpdateCediStock([FromBody] UpdateStockRequest request)
    {
        try
        {
            if (request.Quantity < 0)
            {
                return BadRequest(new { message = "Quantity cannot be negative" });
            }

            var success = await _stockRepository.UpdateCediStockQuantityAsync(
                request.ProductId,
                request.Quantity
            );

            if (!success)
            {
                return StatusCode(500, new { message = "Failed to update CEDI stock" });
            }

            return Ok(new { message = "CEDI stock updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating CEDI stock", error = ex.Message });
        }
    }
}

