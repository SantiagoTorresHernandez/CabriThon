# Frontend Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://dkhluiutbrzzbwfrkveo.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraGx1aXV0YnJ6emJ3ZnJrdmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjIwMDcsImV4cCI6MjA3NzgzODAwN30.sESgC2Fy8YjB4SF8EuESLgJofh67dyI_gtaT4_sWxIM

# Backend API URL
REACT_APP_API_URL=http://localhost:5001/api
```

## Quick Setup

```bash
# Navigate to frontend directory
cd frontend

# Create .env file with the content above
# (Copy the template above and paste into a new file named .env)

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

## Environment Variable Descriptions

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Public anonymous key for client-side use | Supabase Dashboard → Settings → API → Project API keys → anon/public |
| `REACT_APP_API_URL` | Backend API endpoint | `http://localhost:5001/api` for local development |

## Production Configuration

For production deployment, update the values:

```bash
# Supabase Configuration (same as development)
REACT_APP_SUPABASE_URL=https://dkhluiutbrzzbwfrkveo.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Production Backend API URL
REACT_APP_API_URL=https://your-production-api.com/api
```

## Security Notes

- ✅ The `anon` key is safe to expose in frontend code
- ✅ It's designed to be public and is protected by Row Level Security (RLS)
- ❌ Never use the `service_role` key in frontend code
- ❌ Never commit `.env` file to version control (it's in `.gitignore`)

## Troubleshooting

### Issue: Changes to .env not reflected
**Solution**: Restart the development server (`npm start`)

### Issue: "Missing Supabase environment variables" error
**Solution**: Ensure `.env` file exists in `frontend/` directory and contains all required variables

### Issue: CORS errors when calling API
**Solution**: Verify `REACT_APP_API_URL` matches the backend URL and CORS is configured in backend

## Verification

After setting up, you can verify the configuration:

1. Start the frontend: `npm start`
2. Open browser console (F12)
3. You should NOT see any errors about missing Supabase configuration
4. Navigate to login page and try to authenticate

## Related Documentation

- See `../SUPABASE_AUTH_SETUP.md` for complete authentication setup
- See `../MIGRATION_SUMMARY.md` for migration details

