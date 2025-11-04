# 🚀 Authentication Migration Quick Start Checklist

## ✅ Good News: Your Database is Already Compatible!

After reviewing your database schema, **no database migration is needed**! Your `app_user` table already has the `auth_user_id` column that Supabase needs.

---

## ⚡ Immediate Actions Required (Before Testing)

### 1. ⚠️ **CRITICAL: Update Backend JWT Secret**

The backend currently has a placeholder JWT secret. You **MUST** update it with the real JWT secret from Supabase:

```bash
# Steps:
1. Go to: https://app.supabase.com/project/dkhluiutbrzzbwfrkveo/settings/api
2. Scroll to "JWT Settings" section
3. Copy the "JWT Secret" value
4. Open: backend/CabriThon.Api/appsettings.json
5. Replace the value in "JwtSettings" → "SecretKey" with the JWT secret
6. Save the file
```

**Current appsettings.json JwtSettings section:**
```json
"JwtSettings": {
  "SecretKey": "NEEDS_TO_BE_UPDATED_WITH_REAL_JWT_SECRET",
  "Issuer": "https://dkhluiutbrzzbwfrkveo.supabase.co/auth/v1",
  "Audience": "authenticated",
  "ExpirationMinutes": 60
}
```

---

### 2. 📝 **Create Frontend .env File**

Create `frontend/.env` with:

```bash
REACT_APP_SUPABASE_URL=https://dkhluiutbrzzbwfrkveo.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraGx1aXV0YnJ6emJ3ZnJrdmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjIwMDcsImV4cCI6MjA3NzgzODAwN30.sESgC2Fy8YjB4SF8EuESLgJofh67dyI_gtaT4_sWxIM
REACT_APP_API_URL=http://localhost:5001/api
```

---

### 3. 👤 **Create Test User (Two-Step Process)**

#### **Step 1: Create Auth User in Supabase**

1. Go to: [Supabase Authentication → Users](https://app.supabase.com/project/dkhluiutbrzzbwfrkveo/auth/users)
2. Click **"Add user"** → **"Create new user"**
3. Enter email: `admin@cabrithon.com`
4. Enter password: (your choice, e.g., `Admin123!@#`)
5. Click **"Create user"**
6. **⚠️ IMPORTANT: Copy the user's UUID** (you'll see it in the user list)

#### **Step 2: Add User Profile to Your Database**

In Supabase SQL Editor ([click here](https://app.supabase.com/project/dkhluiutbrzzbwfrkveo/sql/new)):

```sql
-- First, check if you have roles set up
SELECT * FROM role;

-- If you have roles, use the appropriate role_id (e.g., 1 for Admin)
-- If not, you can set role_id to NULL for now

INSERT INTO app_user (
    auth_user_id, 
    username, 
    email, 
    password_hash,
    role_id, 
    client_id, 
    is_active
)
VALUES (
    'PASTE_USER_UUID_HERE'::uuid,  -- UUID from Step 1
    'Admin User',                    -- Username
    'admin@cabrithon.com',          -- Email (same as auth user)
    'supabase_managed',             -- Password managed by Supabase Auth
    1,                              -- role_id (adjust based on your roles)
    NULL,                           -- client_id (set later if needed)
    true                            -- is_active
);
```

**To link user with a client/store** (optional for testing store endpoints):
```sql
-- Get a client ID
SELECT client_id, name FROM client LIMIT 5;

-- Update user with client_id
UPDATE app_user 
SET client_id = YOUR_CLIENT_ID 
WHERE auth_user_id = 'USER_UUID_FROM_STEP_1'::uuid;
```

---

## ✅ Testing Steps

### Test 1: Frontend Startup
```bash
cd frontend
npm start
```
- ✅ Should start without errors
- ✅ No Firebase-related console errors
- ✅ No "Missing Supabase configuration" errors

### Test 2: Backend Startup
```bash
cd backend/CabriThon.Api
dotnet run
```
- ✅ Should start without JWT configuration errors
- ✅ Should bind to ports successfully

### Test 3: Login Flow
1. Open browser to `http://localhost:3000`
2. Navigate to login page
3. Enter: `admin@cabrithon.com` and your password
4. Click "Sign In"
5. ✅ Should redirect to dashboard
6. ✅ Check browser console - no authentication errors
7. ✅ Check DevTools → Application → Local Storage for session

### Test 4: API Authentication
```bash
# After logging in via frontend:
# 1. Open browser DevTools → Console
# 2. Run: localStorage.getItem('sb-dkhluiutbrzzbwfrkveo-auth-token')
# 3. Copy the access_token value from the JSON
# 4. Test API call:

curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:5001/api/store/inventory
```

- ✅ Should return 200 OK (or 400 if user not associated with client)
- ❌ Should NOT return 401 Unauthorized

---

## 📋 Verification Checklist

### Code Changes
- [x] ✅ Supabase package installed in frontend
- [x] ✅ Firebase package removed from frontend
- [x] ✅ Frontend AuthContext updated to use Supabase
- [x] ✅ Frontend API service updated to send Supabase tokens
- [x] ✅ Backend JWT validation updated for Supabase
- [x] ✅ Backend User model matches your database schema
- [x] ✅ Backend UserRepository queries `app_user` table correctly
- [x] ✅ Backend controllers updated to extract user ID from Supabase JWT

### Configuration
- [ ] ⏳ Backend JWT secret updated with real value
- [ ] ⏳ Frontend .env file created
- [ ] ⏳ Test user created in Supabase Auth
- [ ] ⏳ Test user added to app_user table

### Testing
- [ ] ⏳ Frontend starts without errors
- [ ] ⏳ Backend starts without errors
- [ ] ⏳ User can login successfully
- [ ] ⏳ API authentication works
- [ ] ⏳ Protected routes accessible
- [ ] ⏳ Logout works correctly

---

## 📊 Your Database Schema Compatibility

Your database is **already set up correctly** for Supabase authentication:

| Required | Your Database | Status |
|----------|---------------|--------|
| User table | ✅ `app_user` | Perfect |
| Auth user ID column | ✅ `auth_user_id uuid` | Perfect |
| User roles | ✅ `role_id` + `role` table | Perfect |
| Client/Store association | ✅ `client_id` + `client` table | Perfect |
| User permissions | ✅ `permission` + `role_permission` tables | Perfect |

**No migration needed!** 🎉

---

## 🔄 How Authentication Works Now

```
1. User enters credentials in frontend
           ↓
2. Frontend → Supabase Auth API
           ↓
3. Supabase returns JWT token with user UUID
           ↓
4. Frontend stores token and sends to your backend
           ↓
5. Backend validates JWT with Supabase secret
           ↓
6. Backend extracts UUID from token's "sub" claim
           ↓
7. Backend queries: SELECT * FROM app_user WHERE auth_user_id = UUID
           ↓
8. Backend gets user's role_id and client_id
           ↓
9. Request authorized based on role ✅
```

---

## 🆘 If Something Goes Wrong

### Issue: Backend won't start - "JWT Secret Key is not configured"
**Fix**: Update JWT secret in `appsettings.json` (see step 1 above)

### Issue: Login button does nothing / Console errors
**Fix**: 
1. Check frontend .env file exists with correct values
2. Check browser console for specific error
3. Verify Supabase URL and anon key are correct

### Issue: "User not authenticated" after login
**Fix**: 
1. Verify JWT secret matches Supabase dashboard exactly
2. Check user exists in `app_user` table with correct `auth_user_id`
3. Verify token is being sent in Authorization header (check Network tab)

### Issue: Can login but API returns 401
**Fix**: 
```sql
-- Verify user exists and has the correct auth_user_id
SELECT user_id, username, email, auth_user_id, role_id, client_id 
FROM app_user 
WHERE email = 'admin@cabrithon.com';

-- If auth_user_id is NULL or wrong, update it:
UPDATE app_user 
SET auth_user_id = 'CORRECT_UUID_FROM_SUPABASE'::uuid
WHERE email = 'admin@cabrithon.com';
```

### Issue: "User not associated with a client"
**Fix**: This is expected if the user doesn't have a `client_id`. To test store endpoints:
```sql
-- Link user to a client
UPDATE app_user 
SET client_id = (SELECT client_id FROM client LIMIT 1)
WHERE email = 'admin@cabrithon.com';
```

---

## 🎯 Summary

### What Changed:
✅ Frontend now uses Supabase Auth SDK  
✅ Backend validates Supabase JWT tokens  
✅ Backend queries your existing `app_user` table  
✅ No database schema changes needed  

### What You Need to Do:
1. Update JWT secret in backend config (5 minutes)
2. Create frontend .env file (2 minutes)
3. Create test user in Supabase + add to database (5 minutes)
4. Test login and API calls (10 minutes)

**Total Time**: ~20 minutes

---

## 📚 Additional Resources

- `SUPABASE_AUTH_SETUP.md` - Complete authentication guide
- `MIGRATION_SUMMARY.md` - Detailed list of all changes made

---

**Status**: 🔄 Migration Complete - Configuration Required  
**Priority Actions**: 
1. ⚠️ Update JWT Secret (CRITICAL)
2. Create .env file
3. Create test user

**Estimated Time**: 20 minutes
