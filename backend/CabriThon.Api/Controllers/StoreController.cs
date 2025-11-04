using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Repositories;
using System.Security.Claims;

namespace CabriThon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ClientOwner")]
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
    /// Get inventory dashboard for the authenticated client owner
    /// </summary>
    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventory()
    {
        try
        {
            // Supabase JWT uses "sub" claim for user ID
            var authUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(authUserId) || !Guid.TryParse(authUserId, out var authUserGuid))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userRepository.GetUserByAuthUserIdAsync(authUserGuid);
            if (user == null || user.ClientId == null)
            {
                return BadRequest(new { message = "User is not associated with a client" });
            }

            var stock = await _stockRepository.GetStockByClientIdAsync(user.ClientId.Value);
            var orders = await _orderRepository.GetOrdersByClientIdAsync(user.ClientId.Value, 20);

            var stockList = stock.ToList();
            var orderList = orders.ToList();

            var dashboard = new ClientInventoryDashboardDto
            {
                ClientId = user.ClientId.Value,
                ClientName = user.Client?.Name ?? "Unknown Client",
                Stock = stockList,
                RecentOrders = orderList,
                Metrics = new InventoryMetricsDto
                {
                    TotalProducts = stockList.Count,
                    TotalQuantity = stockList.Sum(s => s.Stock),
                    LowStockCount = stockList.Count(s => s.Stock < 10),
                    PendingOrders = orderList.Count(o => o.Status == "Pending")
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
    /// Update stock quantity for a product in the client's inventory
    /// </summary>
    [HttpPost("inventory/update")]
    public async Task<IActionResult> UpdateStock([FromBody] UpdateStockRequest request)
    {
        try
        {
            // Supabase JWT uses "sub" claim for user ID
            var authUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(authUserId) || !Guid.TryParse(authUserId, out var authUserGuid))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userRepository.GetUserByAuthUserIdAsync(authUserGuid);
            if (user == null || user.ClientId == null)
            {
                return BadRequest(new { message = "User is not associated with a client" });
            }

            if (request.Quantity < 0)
            {
                return BadRequest(new { message = "Quantity cannot be negative" });
            }

            var success = await _stockRepository.UpdateClientStockQuantityAsync(
                request.ProductId,
                user.ClientId.Value,
                request.Quantity
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
    /// Get recent orders for the client
    /// </summary>
    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromQuery] int limit = 50)
    {
        try
        {
            // Supabase JWT uses "sub" claim for user ID
            var authUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(authUserId) || !Guid.TryParse(authUserId, out var authUserGuid))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userRepository.GetUserByAuthUserIdAsync(authUserGuid);
            if (user == null || user.ClientId == null)
            {
                return BadRequest(new { message = "User is not associated with a client" });
            }

            var orders = await _orderRepository.GetOrdersByClientIdAsync(user.ClientId.Value, limit);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
        }
    }
}

