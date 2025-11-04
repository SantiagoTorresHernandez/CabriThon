using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Repositories;
using System.Security.Claims;

namespace CabriThon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "StoreOwner")]
public class StoreController : ControllerBase
{
    private readonly IStockRepository _stockRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IUserRepository _userRepository;

    public StoreController(
        IStockRepository stockRepository,
        IOrderRepository orderRepository,
        IUserRepository userRepository)
    {
        _stockRepository = stockRepository;
        _orderRepository = orderRepository;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Get inventory dashboard for the authenticated store owner's store
    /// </summary>
    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventory()
    {
        try
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userRepository.GetUserByFirebaseUidAsync(firebaseUid);
            if (user == null || user.StoreId == null)
            {
                return BadRequest(new { message = "User is not associated with a store" });
            }

            var stock = await _stockRepository.GetStockByStoreIdAsync(user.StoreId.Value);
            var orders = await _orderRepository.GetOrdersByStoreIdAsync(user.StoreId.Value, 20);

            var stockList = stock.ToList();
            var orderList = orders.ToList();

            var dashboard = new InventoryDashboardDto
            {
                StoreId = user.StoreId.Value,
                StoreName = user.Store?.Name ?? "Unknown Store",
                Stock = stockList,
                RecentOrders = orderList,
                Metrics = new InventoryMetricsDto
                {
                    TotalProducts = stockList.Count,
                    TotalQuantity = stockList.Sum(s => s.Quantity),
                    LowStockCount = stockList.Count(s => s.Quantity < 10),
                    PendingOrders = orderList.Count(o => o.Status == "Pending"),
                    TotalOrderValue = orderList.Where(o => o.Status != "Cancelled").Sum(o => o.TotalAmount)
                }
            };

            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving inventory", error = ex.Message });
        }
    }

    /// <summary>
    /// Update stock quantity for a product in the store owner's store
    /// </summary>
    [HttpPost("inventory/update")]
    public async Task<IActionResult> UpdateStock([FromBody] UpdateStockRequest request)
    {
        try
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userRepository.GetUserByFirebaseUidAsync(firebaseUid);
            if (user == null || user.StoreId == null)
            {
                return BadRequest(new { message = "User is not associated with a store" });
            }

            if (request.Quantity < 0)
            {
                return BadRequest(new { message = "Quantity cannot be negative" });
            }

            var success = await _stockRepository.UpdateStockQuantityAsync(
                request.ProductId,
                user.StoreId.Value,
                request.Quantity,
                user.Id
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

    /// <summary>
    /// Get recent orders for the store owner's store
    /// </summary>
    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromQuery] int limit = 50)
    {
        try
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userRepository.GetUserByFirebaseUidAsync(firebaseUid);
            if (user == null || user.StoreId == null)
            {
                return BadRequest(new { message = "User is not associated with a store" });
            }

            var orders = await _orderRepository.GetOrdersByStoreIdAsync(user.StoreId.Value, limit);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
        }
    }
}

