namespace CabriThon.Core.Models;

public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int? RoleId { get; set; }
    public int? ClientId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
    public Guid? AuthUserId { get; set; } // Firebase Auth UID
    
    // Navigation properties
    public Role? Role { get; set; }
    public Client? Client { get; set; }
}

public class Role
{
    public int RoleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation properties
    public List<Permission> Permissions { get; set; } = new();
}

public class Permission
{
    public int PermissionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Module { get; set; }
    public string? Description { get; set; }
}

