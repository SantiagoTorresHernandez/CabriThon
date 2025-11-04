namespace CabriThon.Core.Models;

public class User
{
    public Guid Id { get; set; }
    public string FirebaseUid { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Customer, StoreOwner, Admin
    public Guid? StoreId { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public Store? Store { get; set; }
}

public static class UserRoles
{
    public const string Customer = "Customer";
    public const string StoreOwner = "StoreOwner";
    public const string Admin = "Admin";
}

