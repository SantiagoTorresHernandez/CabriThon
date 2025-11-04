# Setup Guide - CabriThon E-Commerce & Inventory Management

This guide will walk you through setting up the complete application from scratch.

## Prerequisites

### Required Software
- **.NET 9 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 18+** and npm - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Visual Studio Code** or **Visual Studio 2022** (optional)

### Required Services
- **Supabase Account** - [Sign up](https://supabase.com)
- **Firebase Project** - [Create project](https://console.firebase.google.com)
- **Google Cloud Account** (for Cloud Run deployment) - [Sign up](https://cloud.google.com)

## Step 1: Clone and Setup Repository

```bash
git clone <your-repo-url>
cd CabriThon
```

## Step 2: Database Setup (Supabase)

### 2.1 Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for the project to be provisioned (takes ~2 minutes)
3. Note your project URL and keys from **Settings > API**

### 2.2 Run Database Migrations

1. Open Supabase Dashboard > **SQL Editor**
2. Create a new query and paste the contents of `database/01_schema.sql`
3. Click **Run** to create all tables
4. Create another query with `database/02_rls_policies.sql`
5. Click **Run** to setup Row-Level Security

### 2.3 Verify Database

Check that these tables exist in **Table Editor**:
- `stores`
- `users`
- `products`
- `stock`
- `orders`
- `order_items`
- `stock_history`

## Step 3: Firebase Setup

### 3.1 Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add Project**
3. Enter project name: `cabrithon` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click **Create Project**

### 3.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method
5. Add your domain to authorized domains (for production)

### 3.3 Setup Storage

1. Go to **Storage** in Firebase Console
2. Click **Get Started**
3. Start in **production mode** (we have custom rules)
4. Choose your storage location
5. Create a folder called `product_images`
6. Go to **Rules** tab and paste contents from `frontend/storage.rules`

### 3.4 Get Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to **Your apps** section
3. Click **Web** app icon (</>)
4. Register app with nickname "CabriThon Web"
5. Copy the `firebaseConfig` object - you'll need this later

### 3.5 Generate Service Account Key

1. Go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file securely (DO NOT commit to git)

## Step 4: Backend Configuration

### 4.1 Create Configuration File

```bash
cd backend/CabriThon.Api
cp appsettings.Example.json appsettings.json
```

### 4.2 Update Configuration

Edit `backend/CabriThon.Api/appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Firebase": {
    "ProjectId": "your-firebase-project-id",
    "Issuer": "https://securetoken.google.com/your-firebase-project-id",
    "Audience": "your-firebase-project-id"
  },
  "Supabase": {
    "Url": "https://xxxxxxxxxxxxx.supabase.co",
    "ServiceRoleKey": "your-supabase-service-role-key"
  }
}
```

Replace:
- `your-firebase-project-id` with your Firebase project ID
- `https://xxxxxxxxxxxxx.supabase.co` with your Supabase project URL
- `your-supabase-service-role-key` with your Supabase service role key

### 4.3 Install Dependencies and Run

```bash
cd backend/CabriThon.Api
dotnet restore
dotnet run
```

The API should start at `https://localhost:5001`

Test the API by visiting: https://localhost:5001/api/public/products

## Step 5: Frontend Configuration

### 5.1 Install Dependencies

```bash
cd frontend
npm install
```

### 5.2 Create Environment File

```bash
cp .env.example .env
```

### 5.3 Update Environment Variables

Edit `frontend/.env`:

```env
REACT_APP_API_URL=https://localhost:5001/api
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

Replace all values with your Firebase configuration from Step 3.4.

### 5.4 Run Frontend

```bash
npm start
```

The app should open at `http://localhost:3000`

## Step 6: Create Users

### 6.1 Sign Up Your First User

1. Open `http://localhost:3000` in your browser
2. Click **Login**
3. Click **Sign in with Google** or use email/password
4. Complete the sign-up process

### 6.2 Make User an Admin

1. Go to Firebase Console > **Authentication**
2. Find your user and copy the **UID**
3. Go to Supabase Dashboard > **SQL Editor**
4. Run this query (replace the UID and email):

```sql
INSERT INTO users (firebase_uid, email, role, full_name)
VALUES ('your-firebase-uid-here', 'admin@example.com', 'Admin', 'Admin User')
ON CONFLICT (firebase_uid) DO UPDATE SET role = 'Admin';
```

5. **Set Custom Claims in Firebase** (requires Firebase Admin SDK or Cloud Functions):

Create a script `set-admin-claim.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'your-firebase-uid-here';

admin.auth().setCustomUserClaims(uid, { role: 'Admin' })
  .then(() => {
    console.log('Custom claims set successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  });
```

Run it:
```bash
npm install firebase-admin
node set-admin-claim.js
```

6. **Log out and log back in** to refresh the token with new claims

### 6.3 Create Store Owner

1. Create a store first:

```sql
INSERT INTO stores (name, address, phone, email, is_distribution_center)
VALUES ('Downtown Store', '123 Main St, City, State 12345', '555-0101', 'downtown@example.com', false)
RETURNING id;
```

2. Copy the returned store ID
3. Sign up another user through the app
4. Add them to the database as a store owner:

```sql
INSERT INTO users (firebase_uid, email, role, store_id, full_name)
VALUES ('firebase-uid-2', 'owner@example.com', 'StoreOwner', 'store-id-from-step-1', 'Store Owner')
ON CONFLICT (firebase_uid) DO UPDATE SET role = 'StoreOwner', store_id = 'store-id-from-step-1';
```

5. Set custom claims (same as admin, but with role: 'StoreOwner')

## Step 7: Test the Application

### Test E-Commerce Store (Public)
1. Visit `http://localhost:3000`
2. Browse products
3. Add items to cart
4. Complete checkout

### Test Store Owner Dashboard
1. Log in with Store Owner credentials
2. Visit `http://localhost:3000/owner`
3. View inventory
4. Update stock quantities
5. View recent orders

### Test Admin Dashboard
1. Log in with Admin credentials
2. Visit `http://localhost:3000/admin`
3. View global metrics
4. Check distribution center inventory
5. Analyze store performance

## Troubleshooting

### Backend Issues

**Error: "Unable to connect to database"**
- Check Supabase URL and service role key in `appsettings.json`
- Verify Supabase project is active

**Error: "Unauthorized" when calling protected endpoints**
- Ensure Firebase configuration is correct
- Check that custom claims are set for the user
- Verify token is being sent in Authorization header

### Frontend Issues

**Error: "Firebase: Error (auth/...")**
- Check Firebase configuration in `.env`
- Verify Firebase project has authentication enabled

**Error: "Network Error" or "CORS Error"**
- Ensure backend is running on `https://localhost:5001`
- Check CORS configuration in `backend/CabriThon.Api/Program.cs`
- Try clearing browser cache and restarting both frontend and backend

**Error: Products not loading**
- Check that sample data was inserted in database
- Verify API is accessible at `https://localhost:5001/api/public/products`
- Check browser console for specific errors

### Database Issues

**RLS policies blocking queries**
- Remember: Service role key bypasses RLS
- Check that the backend is using the service role key, not anon key
- Verify policies are correctly set up in `database/02_rls_policies.sql`

## Next Steps

- Add more products through database
- Create additional stores
- Test multi-tenant features
- Setup Firebase Storage and upload product images
- Configure Firebase Cloud Functions for automated tasks
- Deploy to production (see `deployment/README.md`)

## Support

For issues or questions:
1. Check the main `README.md`
2. Review `deployment/README.md` for deployment-specific issues
3. Check application logs:
   - Backend: Terminal running `dotnet run`
   - Frontend: Browser Developer Console

## Security Notes

⚠️ **IMPORTANT**: Never commit these files to version control:
- `backend/CabriThon.Api/appsettings.json`
- `frontend/.env`
- Firebase service account JSON files
- Any file containing API keys or secrets

These are already in `.gitignore`, but always double-check before committing!

