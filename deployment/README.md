# Deployment Guide

This directory contains deployment scripts and configuration for deploying the CabriThon application to production.

## Prerequisites

### For Backend (Google Cloud Run)
- Google Cloud SDK installed (`gcloud` CLI)
- Docker installed (optional, Cloud Run can build from source)
- GCP project with Cloud Run API enabled
- Service account with Cloud Run Admin permissions

### For Frontend (Firebase Hosting)
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Logged in to Firebase CLI (`firebase login`)

## Deployment Steps

### 1. Setup Database (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Run the SQL scripts from `database/` directory in Supabase SQL Editor:
   ```sql
   -- Run these in order:
   -- 1. database/01_schema.sql
   -- 2. database/02_rls_policies.sql
   ```
3. Note your Supabase URL and Service Role Key from Project Settings > API

### 2. Setup Firebase

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google sign-in
3. Setup Firebase Admin SDK:
   - Go to Project Settings > Service Accounts
   - Generate new private key (keep secure!)
4. Configure Custom Claims for roles (Admin, StoreOwner, Customer):
   ```javascript
   // Run this in Firebase Console or using Admin SDK
   admin.auth().setCustomUserClaims(uid, { role: 'Admin' });
   ```
5. Get your Firebase config from Project Settings > General
6. Setup Storage bucket `/product_images`

### 3. Deploy Backend

1. Update configuration in `backend/CabriThon.Api/appsettings.json` (do NOT commit this file):
   ```json
   {
     "Firebase": {
       "ProjectId": "your-firebase-project-id",
       "Issuer": "https://securetoken.google.com/your-firebase-project-id",
       "Audience": "your-firebase-project-id"
     },
     "Supabase": {
       "Url": "https://your-project.supabase.co",
       "ServiceRoleKey": "your-service-role-key"
     }
   }
   ```

2. Run deployment script:
   ```bash
   cd deployment
   chmod +x deploy-backend.sh
   ./deploy-backend.sh
   ```

3. Or deploy manually:
   ```bash
   cd backend
   gcloud run deploy cabrithon-api \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --project your-gcp-project-id
   ```

4. Set environment variables in Cloud Run:
   ```bash
   gcloud run services update cabrithon-api \
     --region us-central1 \
     --update-env-vars="Firebase__ProjectId=your-project-id,Firebase__Issuer=https://securetoken.google.com/your-project-id,Firebase__Audience=your-project-id,Supabase__Url=https://your-project.supabase.co,Supabase__ServiceRoleKey=your-key"
   ```

### 4. Deploy Frontend

1. Create `frontend/.env` with production values:
   ```env
   REACT_APP_API_URL=https://your-api-url.run.app/api
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

2. Initialize Firebase (first time only):
   ```bash
   cd frontend
   firebase init hosting
   # Select your Firebase project
   # Set public directory to: build
   # Configure as single-page app: Yes
   # Don't overwrite index.html
   ```

3. Run deployment script:
   ```bash
   cd deployment
   chmod +x deploy-frontend.sh
   ./deploy-frontend.sh
   ```

4. Or deploy manually:
   ```bash
   cd frontend
   npm install
   npm run build
   firebase deploy --only hosting
   ```

### 5. Update CORS Settings

After deploying, update the backend CORS settings in `backend/CabriThon.Api/Program.cs` to include your production frontend URL:

```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "https://your-app.web.app",
    "https://your-app.firebaseapp.com"
)
```

Then redeploy the backend.

## Post-Deployment

### Create Admin User

1. Sign up a user through your frontend
2. Get the Firebase UID from Firebase Console > Authentication
3. Run SQL in Supabase:
   ```sql
   INSERT INTO users (firebase_uid, email, role, full_name)
   VALUES ('firebase-uid-here', 'admin@example.com', 'Admin', 'Admin User');
   ```
4. Set custom claim in Firebase:
   ```javascript
   admin.auth().setCustomUserClaims('firebase-uid-here', { role: 'Admin' });
   ```

### Create Store Owner

1. First, create a store in Supabase:
   ```sql
   INSERT INTO stores (name, address, email)
   VALUES ('My Store', '123 Main St', 'store@example.com');
   ```
2. Get the store ID
3. Sign up user through frontend
4. Add user to database:
   ```sql
   INSERT INTO users (firebase_uid, email, role, store_id, full_name)
   VALUES ('firebase-uid', 'owner@example.com', 'StoreOwner', 'store-id-here', 'Store Owner');
   ```
5. Set custom claim:
   ```javascript
   admin.auth().setCustomUserClaims('firebase-uid', { role: 'StoreOwner' });
   ```

## Monitoring

### Backend (Cloud Run)
- View logs: `gcloud run services logs read cabrithon-api --region us-central1`
- View metrics: Google Cloud Console > Cloud Run > cabrithon-api > Metrics

### Frontend (Firebase Hosting)
- View usage: Firebase Console > Hosting
- Analytics: Firebase Console > Analytics

### Database (Supabase)
- Monitor in Supabase Dashboard > Database > Statistics

## Troubleshooting

### CORS Errors
- Ensure frontend URL is in backend CORS policy
- Check browser console for specific origin being blocked

### Authentication Errors
- Verify Firebase config matches in both frontend and backend
- Check that custom claims are set correctly
- Ensure token is being sent in Authorization header

### Database Connection Issues
- Verify Supabase credentials in backend configuration
- Check RLS policies are set correctly
- Ensure service role key has proper permissions

### API Not Responding
- Check Cloud Run logs for errors
- Verify environment variables are set
- Ensure service is not scaled to zero (set min-instances if needed)

## Rollback

### Backend
```bash
gcloud run services update-traffic cabrithon-api \
  --to-revisions=REVISION_NAME=100 \
  --region us-central1
```

### Frontend
```bash
firebase hosting:rollback
```

## Cost Optimization

### Cloud Run
- Set appropriate min/max instances
- Adjust CPU/memory allocations based on usage
- Enable CPU throttling when idle

### Firebase
- Optimize image sizes for Storage
- Use CDN caching effectively
- Monitor Hosting bandwidth usage

### Supabase
- Use connection pooling
- Index frequently queried columns
- Archive old data periodically

