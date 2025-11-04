using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using CabriThon.Infrastructure.Data;
using CabriThon.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://localhost:3000",
            "http://localhost:5173",
            "https://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// Register Supabase context
builder.Services.AddSingleton<SupabaseContext>();

// Register repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Configure Supabase JWT Authentication
var jwtSecretKey = builder.Configuration["JwtSettings:SecretKey"];
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
var jwtAudience = builder.Configuration["JwtSettings:Audience"];

if (string.IsNullOrEmpty(jwtSecretKey))
{
    throw new InvalidOperationException("JWT Secret Key is not configured");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                System.Convert.FromBase64String(jwtSecretKey)
            ),
            ClockSkew = TimeSpan.Zero
        };
    });

// Configure Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ClientOwner", policy =>
        policy.RequireAuthenticatedUser()
              .RequireAssertion(context =>
              {
                  // Check for role in user_metadata or app_metadata
                  var role = context.User.FindFirst("role")?.Value 
                          ?? context.User.FindFirst("user_role")?.Value
                          ?? context.User.FindFirst("app_role")?.Value;
                  return role == "StoreOwner" || role == "ClientOwner" || role == "Admin";
              }));
    
    options.AddPolicy("Admin", policy =>
        policy.RequireAuthenticatedUser()
              .RequireAssertion(context =>
              {
                  var role = context.User.FindFirst("role")?.Value 
                          ?? context.User.FindFirst("user_role")?.Value
                          ?? context.User.FindFirst("app_role")?.Value;
                  return role == "Admin";
              }));
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

