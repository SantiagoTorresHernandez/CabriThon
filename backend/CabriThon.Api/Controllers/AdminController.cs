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
            var allStock = await _stockRepository.GetAllStockAsync();
            var allOrders = await _orderRepository.GetAllOrdersAsync(100);
            var allProducts = await _productRepository.GetAllActiveProductsAsync();

            var dcStockList = dcStock.ToList();
            var allStockList = allStock.ToList();
            var orderList = allOrders.ToList();
            var productList = allProducts.ToList();

            // Calculate store summaries
            var storeSummaries = allStockList
                .GroupBy(s => new { s.StoreId, s.StoreName })
                .Select(g => new StoreInventorySummary
                {
                    StoreId = g.Key.StoreId,
                    StoreName = g.Key.StoreName,
                    TotalProducts = g.Count(),
                    TotalQuantity = g.Sum(s => s.Quantity),
                    TotalValue = g.Sum(s => s.Quantity * (productList.FirstOrDefault(p => p.Id == s.ProductId)?.Price ?? 0))
                })
                .ToList();

            var result = new AdminInventoryDto
            {
                DistributionCenterStock = dcStockList,
                AllStock = allStockList,
                StoreInventories = storeSummaries,
                GlobalMetrics = new GlobalMetricsDto
                {
                    TotalStores = storeSummaries.Count,
                    TotalProducts = productList.Count,
                    TotalStockQuantity = allStockList.Sum(s => s.Quantity),
                    DistributionCenterQuantity = dcStockList.Sum(s => s.Quantity),
                    TotalInventoryValue = storeSummaries.Sum(s => s.TotalValue),
                    TotalOrders = orderList.Count,
                    TotalRevenue = orderList.Where(o => o.Status != "Cancelled").Sum(o => o.TotalAmount)
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
    /// Get comprehensive view of all inventory across all stores
    /// </summary>
    [HttpGet("inventory/all")]
    public async Task<IActionResult> GetAllInventory()
    {
        try
        {
            var allStock = await _stockRepository.GetAllStockAsync();
            return Ok(allStock);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving all inventory", error = ex.Message });
        }
    }

    /// <summary>
    /// Get all orders across all stores
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
    /// Update stock for any store (admin override)
    /// </summary>
    [HttpPost("inventory/update")]
    public async Task<IActionResult> UpdateStock([FromBody] UpdateStockRequest request, [FromQuery] Guid storeId)
    {
        try
        {
            if (request.Quantity < 0)
            {
                return BadRequest(new { message = "Quantity cannot be negative" });
            }

            var success = await _stockRepository.UpdateStockQuantityAsync(
                request.ProductId,
                storeId,
                request.Quantity,
                null // Admin update, no specific user
            );

            if (!success)
            {
                return StatusCode(500, new { message = "Failed to update stock" });
            }

            return Ok(new { message = "Stock updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating stock", error = ex.Message });
        }
    }
}

