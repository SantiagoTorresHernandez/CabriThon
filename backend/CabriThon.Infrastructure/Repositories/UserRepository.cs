using CabriThon.Core.Models;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IUserRepository
{
    Task<User?> GetUserByAuthUserIdAsync(Guid authUserId);
    Task<User?> GetUserByIdAsync(int id);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User?> CreateUserAsync(string username, string email, string passwordHash, int? roleId = null, int? clientId = null, Guid? authUserId = null);
}

public class UserRepository : IUserRepository
{
    private readonly SupabaseContext _context;

    public UserRepository(SupabaseContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByAuthUserIdAsync(Guid authUserId)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT u.user_id as UserId, u.username, u.email, u.password_hash as PasswordHash,
                   u.role_id as RoleId, u.client_id as ClientId, u.is_active as IsActive,
                   u.created_at as CreatedAt, u.last_login as LastLogin, u.auth_user_id as AuthUserId
            FROM app_user u
            WHERE u.auth_user_id = @AuthUserId";
        
        return await connection.QueryFirstOrDefaultAsync<User>(query, new { AuthUserId = authUserId });
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT u.user_id as UserId, u.username, u.email, u.password_hash as PasswordHash,
                   u.role_id as RoleId, u.client_id as ClientId, u.is_active as IsActive,
                   u.created_at as CreatedAt, u.last_login as LastLogin, u.auth_user_id as AuthUserId
            FROM app_user u
            WHERE u.user_id = @Id";
        
        return await connection.QueryFirstOrDefaultAsync<User>(query, new { Id = id });
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT u.user_id as UserId, u.username, u.email, u.password_hash as PasswordHash,
                   u.role_id as RoleId, u.client_id as ClientId, u.is_active as IsActive,
                   u.created_at as CreatedAt, u.last_login as LastLogin, u.auth_user_id as AuthUserId
            FROM app_user u
            WHERE u.username = @Username";
        
        return await connection.QueryFirstOrDefaultAsync<User>(query, new { Username = username });
    }

    public async Task<User?> CreateUserAsync(string username, string email, string passwordHash, int? roleId = null, int? clientId = null, Guid? authUserId = null)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            INSERT INTO app_user (username, email, password_hash, role_id, client_id, auth_user_id)
            VALUES (@Username, @Email, @PasswordHash, @RoleId, @ClientId, @AuthUserId)
            RETURNING user_id as UserId, username, email, password_hash as PasswordHash,
                      role_id as RoleId, client_id as ClientId, is_active as IsActive,
                      created_at as CreatedAt, last_login as LastLogin, auth_user_id as AuthUserId";
        
        return await connection.QueryFirstOrDefaultAsync<User>(query, 
            new { Username = username, Email = email, PasswordHash = passwordHash, RoleId = roleId, ClientId = clientId, AuthUserId = authUserId });
    }
}

