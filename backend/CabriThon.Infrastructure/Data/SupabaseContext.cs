using Npgsql;
using Microsoft.Extensions.Configuration;

namespace CabriThon.Infrastructure.Data;

public class SupabaseContext
{
    private readonly string _connectionString;

    public SupabaseContext(IConfiguration configuration)
    {
        var supabaseUrl = configuration["Supabase:Url"] 
            ?? throw new InvalidOperationException("Supabase URL is not configured");
        var serviceRoleKey = configuration["Supabase:ServiceRoleKey"] 
            ?? throw new InvalidOperationException("Supabase Service Role Key is not configured");
        
        // Extract project reference from URL
        var uri = new Uri(supabaseUrl);
        var projectRef = uri.Host.Split('.')[0];
        
        // Construct connection string
        _connectionString = $"Host=db.{uri.Host};Database=postgres;Username=postgres;Password={serviceRoleKey};SSL Mode=Require;Trust Server Certificate=true";
    }

    public NpgsqlConnection CreateConnection()
    {
        return new NpgsqlConnection(_connectionString);
    }
}

