using CabriThon.Core.Models;
using CabriThon.Infrastructure.Data;
using Dapper;

namespace CabriThon.Infrastructure.Repositories;

public interface IUserRepository
{
    Task<User?> GetUserByFirebaseUidAsync(string firebaseUid);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User?> CreateUserAsync(string firebaseUid, string email, string role, Guid? storeId = null);
}

public class UserRepository : IUserRepository
{
    private readonly SupabaseContext _context;

    public UserRepository(SupabaseContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByFirebaseUidAsync(string firebaseUid)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT u.id, u.firebase_uid as FirebaseUid, u.email, u.role, u.store_id as StoreId,
                   u.full_name as FullName, u.phone, u.created_at as CreatedAt, u.updated_at as UpdatedAt
            FROM users u
            WHERE u.firebase_uid = @FirebaseUid";
        
        return await connection.QueryFirstOrDefaultAsync<User>(query, new { FirebaseUid = firebaseUid });
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            SELECT u.id, u.firebase_uid as FirebaseUid, u.email, u.role, u.store_id as StoreId,
                   u.full_name as FullName, u.phone, u.created_at as CreatedAt, u.updated_at as UpdatedAt
            FROM users u
            WHERE u.id = @Id";
        
        return await connection.QueryFirstOrDefaultAsync<User>(query, new { Id = id });
    }

    public async Task<User?> CreateUserAsync(string firebaseUid, string email, string role, Guid? storeId = null)
    {
        using var connection = _context.CreateConnection();
        var query = @"
            INSERT INTO users (firebase_uid, email, role, store_id)
            VALUES (@FirebaseUid, @Email, @Role, @StoreId)
            RETURNING id, firebase_uid as FirebaseUid, email, role, store_id as StoreId,
                      full_name as FullName, phone, created_at as CreatedAt, updated_at as UpdatedAt";
        
        return await connection.QueryFirstOrDefaultAsync<User>(query, 
            new { FirebaseUid = firebaseUid, Email = email, Role = role, StoreId = storeId });
    }
}

