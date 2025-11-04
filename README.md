# E-Commerce & Multi-Tenant Inventory Management System

A comprehensive full-stack application with .NET 9 Web API backend and React.js frontend, featuring Firebase Authentication and Supabase database.

## 🏗️ Architecture Overview

### Three User Experiences:
1. **E-commerce Store (Public)** - Customer shopping experience
2. **Store Owner Dashboard** - Single-store inventory and order management
3. **Distribution Center Dashboard** - Global admin oversight

### Tech Stack
- **Backend:** .NET 9 Web API (C#)
- **Frontend:** React.js with TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Firebase Auth (Google/Email)
- **Storage:** Firebase Storage (product images)

## 📁 Project Structure

```
/
├── backend/              # .NET 9 Web API
│   ├── CabriThon.Api/   # Main API project
│   ├── CabriThon.Core/  # Domain models & interfaces
│   └── CabriThon.Infrastructure/ # Data access & external services
├── frontend/            # React.js application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── modules/     # Feature modules (store, owner, admin)
│   │   ├── services/    # API & Firebase services
│   │   └── contexts/    # Auth & global state
└── database/            # Supabase SQL schema & migrations
```

## 🚀 Getting Started

### Prerequisites
- .NET 9 SDK
- Node.js 18+ & npm
- Supabase account
- Firebase project

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend/CabriThon.Api
```

2. Create `appsettings.json` (see Configuration section below)

3. Run the API:
```bash
dotnet run
```

The API will start at `https://localhost:5001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (see Configuration section below)

4. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## ⚙️ Configuration

### Backend Configuration (`backend/CabriThon.Api/appsettings.json`)

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

### Frontend Configuration (`frontend/.env`)

```env
REACT_APP_API_URL=https://localhost:5001/api
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 🗄️ Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the scripts in `database/` directory in order:
   - `01_schema.sql` - Creates tables
   - `02_rls_policies.sql` - Sets up Row-Level Security

## 🔐 Security Features

- **JWT Bearer Authentication** validates Firebase tokens
- **Role-based Authorization** (Customer, StoreOwner, Admin)
- **Row-Level Security (RLS)** in Supabase ensures data isolation
- **HTTPS-only** in production
- **CORS** properly configured

## 📱 API Endpoints

### Public Endpoints
- `GET /api/public/products` - Product catalog
- `POST /api/public/orders` - Place order

### Store Owner Endpoints (Auth Required)
- `GET /api/store/inventory` - View store's inventory
- `POST /api/store/inventory/update` - Update stock quantity

### Admin Endpoints (Auth Required)
- `GET /api/admin/inventory/distribution` - Distribution center data
- `GET /api/admin/inventory/all` - Global inventory view

## 🚢 Deployment

### Deploy Frontend to Firebase Hosting

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Deploy Backend to Cloud Run

```bash
cd backend/CabriThon.Api
gcloud run deploy cabrithon-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📊 User Roles

| Role | Access Level | Features |
|------|-------------|----------|
| Customer | Public + Own Orders | Browse products, checkout, view own orders |
| StoreOwner | Store-specific data | Manage inventory for their store, view store orders |
| Admin | Global access | View all inventory, distribution center management, analytics |

## 🎨 Frontend Features

- **Accessibility:** WCAG 2.1 AA compliant
- **Responsive:** Mobile-first design
- **User-friendly:** Large buttons, clear text, minimal jargon
- **Modern UI:** Clean, professional interface

## 📄 License

MIT License
