using Microsoft.AspNetCore.Mvc;
using CabriThon.Core.DTOs;
using CabriThon.Infrastructure.Repositories;

namespace CabriThon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IStockRepository _stockRepository;

    public PublicController(
        IProductRepository productRepository,
        IOrderRepository orderRepository,
        IStockRepository stockRepository)
    {
        _productRepository = productRepository;
        _orderRepository = orderRepository;
        _stockRepository = stockRepository;
    }

    /// <summary>
    /// Get all active products with availability information
    /// </summary>
    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        try
        {
            var products = await _productRepository.GetAllActiveProductsAsync();
            var productDtos = new List<ProductDto>();

            foreach (var product in products)
            {
                var availableStock = await _stockRepository.GetAvailableStockForProductAsync(product.Id);
                
                productDtos.Add(new ProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Sku = product.Sku,
                    Category = product.Category,
                    Price = product.Price,
                    ImageUrl = product.ImageUrl,
                    AvailableStock = availableStock
                });
            }

            return Ok(productDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving products", error = ex.Message });
        }
    }

    /// <summary>
    /// Place a new order (public checkout)
    /// </summary>
    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate that all products exist and are active
            foreach (var item in request.Items)
            {
                var product = await _productRepository.GetProductByIdAsync(item.ProductId);
                if (product == null || !product.IsActive)
                {
                    return BadRequest(new { message = $"Product {item.ProductId} is not available" });
                }

                // Check stock availability
                var availableStock = await _stockRepository.GetAvailableStockForProductAsync(item.ProductId);
                if (availableStock < item.Quantity)
                {
                    return BadRequest(new { message = $"Insufficient stock for {product.Name}. Available: {availableStock}, Requested: {item.Quantity}" });
                }
            }

            var order = await _orderRepository.CreateOrderAsync(request, null);
            
            if (order == null)
            {
                return StatusCode(500, new { message = "Failed to create order" });
            }

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating order", error = ex.Message });
        }
    }

    /// <summary>
    /// Get order by ID
    /// </summary>
    [HttpGet("orders/{id}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        try
        {
            var order = await _orderRepository.GetOrderByIdAsync(id);
            
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            return Ok(order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving order", error = ex.Message });
        }
    }
}

