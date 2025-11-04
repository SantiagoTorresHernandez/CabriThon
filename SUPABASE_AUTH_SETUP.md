# Supabase Authentication Setup Guide

This guide explains how authentication works in CabriThon after migrating from Firebase to Supabase.

## 🔐 Authentication Flow

### Overview
1. **Frontend**: User authenticates with Supabase Auth (email/password or Google OAuth)
2. **Frontend**: Receives JWT access token from Supabase
3. **Frontend**: Sends API requests with `Authorization: Bearer <access_token>` header
4. **Backend**: Validates JWT token using Supabase JWT secret
5. **Backend**: Extracts user ID from token's `sub` claim
6. **Backend**: Queries `users` table to get user profile and role
7. **Backend**: Authorizes request based on user's role

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │────────▶│  Supabase    │────────▶│  Backend    │
│  (React)    │  Auth   │  Auth API    │  Token  │  API (.NET) │
└─────────────┘         └──────────────┘         └─────────────┘
                                                          │
                                                          ▼
                                                  ┌─────────────┐
                                                  │  Supabase   │
                                                  │  PostgreSQL │
                                                  └─────────────┘
```

---

## 📋 Frontend Configuration

### Environment Variables (`.env`)

Create a `.env` file in the `frontend/` directory:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
REACT_APP_API_URL=http://localhost:5001/api
```

### How to Get Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon/public key** → `REACT_APP_SUPABASE_ANON_KEY`

---

## 🔧 Backend Configuration

### Environment Variables (`appsettings.json`)

Update `backend/CabriThon.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.your-project-ref.supabase.co;Database=postgres;Username=postgres;Password=your-db-password;SSL Mode=Require;Trust Server Certificate=true"
  },
  "JwtSettings": {
    "SecretKey": "your-jwt-secret-base64",
    "Issuer": "https://your-project-ref.supabase.co/auth/v1",
    "Audience": "authenticated",
    "ExpirationMinutes": 60
  },
  "Supabase": {
    "Url": "https://your-project-ref.supabase.co",
    "AnonKey": "your-supabase-anon-key",
    "ServiceRoleKey": "your-supabase-service-role-key"
  }
}
```

### How to Get Backend Keys

1. **JWT Secret** (CRITICAL for token validation):
   - Go to **Settings** → **API** in Supabase Dashboard
   - Copy **JWT Secret** → `JwtSettings:SecretKey`
   - **⚠️ This is different from the anon key!**

2. **Database Password**:
   - Go to **Settings** → **Database**
   - Copy your database password
   - Use it in `ConnectionStrings:DefaultConnection`

3. **Service Role Key** (for admin operations):
   - Go to **Settings** → **API**
   - Copy **service_role key** → `Supabase:ServiceRoleKey`
   - **⚠️ Keep this secret! Never expose it in frontend code**

---

## 👥 User Roles and Authorization

### Available Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `Customer` | Regular customer | Can view products, create orders |
| `StoreOwner` | Store manager | Can manage store inventory and orders |
| `Admin` | System administrator | Full access to all resources |

### Backend Authorization Policies

- **ClientOwner Policy**: Requires `StoreOwner` or `Admin` role
- **Admin Policy**: Requires `Admin` role

### Setting User Roles

Roles are stored in the `users.role` column in the database. To set a user's role:

```sql
-- Update user role
UPDATE users 
SET role = 'Admin' 
WHERE auth_user_id = 'user-uuid-from-supabase-auth';
```

Or set it in Supabase Auth dashboard:
1. Go to **Authentication** → **Users**
2. Click on a user
3. Edit **User Metadata** or **App Metadata**:
   ```json
   {
     "role": "Admin"
   }
   ```

---

## 🗄️ Database Setup

### Required Tables

The database schema uses a `users` table to store user profiles:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,  -- References auth.users.id
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Customer', 'StoreOwner', 'Admin')),
    store_id UUID REFERENCES stores(id),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Migration from Firebase

If you're migrating from Firebase, run the migration script:

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f database/03_migration_firebase_to_supabase.sql
```

This will:
- Rename `firebase_uid` to `auth_user_id`
- Update RLS policies
- Update helper functions

---

## 🔑 JWT Token Claims

### Supabase JWT Structure

When a user authenticates, Supabase issues a JWT with these claims:

```json
{
  "sub": "user-uuid",           // User ID (used in backend)
  "email": "user@example.com",
  "role": "authenticated",       // Supabase role (not app role)
  "aud": "authenticated",
  "iss": "https://your-project.supabase.co/auth/v1",
  "exp": 1234567890,
  "user_metadata": {
    "role": "Admin"              // Custom app role (if set)
  },
  "app_metadata": {
    "provider": "email"
  }
}
```

### Backend Token Validation

The backend validates tokens by:
1. Verifying the JWT signature using the JWT secret
2. Checking issuer matches Supabase URL
3. Checking audience is "authenticated"
4. Verifying token hasn't expired
5. Extracting user ID from `sub` claim

---

## 🚀 Testing Authentication

### Test User Login

1. **Create a test user** in Supabase:
   ```bash
   curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
     -H 'apikey: your-anon-key' \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "test@example.com",
       "password": "securepassword123"
     }'
   ```

2. **Add user profile** to database:
   ```sql
   INSERT INTO users (auth_user_id, email, role, full_name)
   VALUES ('auth-user-id-from-supabase', 'test@example.com', 'Customer', 'Test User');
   ```

3. **Login via frontend** and verify:
   - Token is stored in localStorage
   - API requests include Authorization header
   - User can access protected routes

### Test API Authentication

```bash
# Login and get token
TOKEN=$(curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }' | jq -r '.access_token')

# Make authenticated API request
curl -X GET 'http://localhost:5001/api/store/inventory' \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔒 Security Best Practices

### Do's ✅

- ✅ Use the **anon key** in frontend code
- ✅ Use the **service role key** in backend only
- ✅ Store JWT secret securely (environment variables, secrets manager)
- ✅ Enable Row Level Security (RLS) on all tables
- ✅ Validate tokens on every protected endpoint
- ✅ Use HTTPS in production
- ✅ Set appropriate CORS policies

### Don'ts ❌

- ❌ Never expose service role key in frontend
- ❌ Don't store JWT secret in source code
- ❌ Don't disable token expiration
- ❌ Don't trust client-side role claims without validation
- ❌ Don't use HTTP in production

---

## 🐛 Troubleshooting

### "Invalid JWT" Error

**Cause**: JWT secret mismatch or expired token

**Solution**:
1. Verify JWT secret in `appsettings.json` matches Supabase dashboard
2. Ensure secret is base64 encoded
3. Check token hasn't expired
4. Verify issuer URL is correct

### "User not authenticated" Error

**Cause**: Token not being sent or user not in database

**Solution**:
1. Check browser developer tools → Network → Request Headers for `Authorization: Bearer ...`
2. Verify user exists in `users` table with correct `auth_user_id`
3. Check user session in Supabase dashboard

### "User not associated with a store" Error

**Cause**: StoreOwner user doesn't have `store_id` set

**Solution**:
```sql
UPDATE users SET store_id = 'store-uuid' WHERE auth_user_id = 'user-uuid';
```

### CORS Errors

**Cause**: Frontend URL not in CORS policy

**Solution**: Update `Program.cs`:
```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "https://your-frontend-domain.com"
)
```

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JWT Documentation](https://supabase.com/docs/guides/auth/jwt)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [ASP.NET JWT Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)

---

## 📝 Quick Reference

### Frontend Auth Methods

```typescript
// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign in with Google
await supabase.auth.signInWithOAuth({ provider: 'google' });

// Sign out
await supabase.auth.signOut();

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Get access token
const token = session?.access_token;
```

### Backend User Extraction

```csharp
// Get user ID from JWT
var userId = User.FindFirst("sub")?.Value;
var userGuid = Guid.Parse(userId);

// Get user from database
var user = await _userRepository.GetUserByAuthUserIdAsync(userGuid);

// Check role
var role = user.Role; // "Customer", "StoreOwner", "Admin"
```

---

**Last Updated**: 2025-01-04  
**Migration Status**: ✅ Complete

