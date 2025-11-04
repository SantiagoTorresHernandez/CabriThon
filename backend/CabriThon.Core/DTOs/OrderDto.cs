namespace CabriThon.Core.DTOs;

public class CreateOrderRequest
{
    public int ClientId { get; set; }
    public List<OrderItemRequest> Items { get; set; } = new();
}

public class OrderItemRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class OrderDto
{
    public long OrderId { get; set; }
    public long ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; } // Calculated from items
}

public class OrderItemDto
{
    public long OrderItemId { get; set; }
    public long ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; } // Calculated from product cost/price
}

public class ClientInfoDto
{
    public int ClientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

