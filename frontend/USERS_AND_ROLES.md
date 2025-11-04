# Users and Roles System

## Test Users

### Regular Customer
- **Email:** `test@gmail.com`
- **Password:** `12345`
- **Role:** Customer
- **Access:** 
  - Store page with products
  - Shopping cart and checkout
  - Own profile

### Administrator
- **Email:** `admin@gmail.com`
- **Password:** `12345`
- **Role:** Admin
- **Access:**
  - Store page with products
  - **Admin Panel** button in header (unique to admins)
  - Access to Distribution Center Dashboard
  - Full inventory management

## How It Works

### Authentication Flow
1. User enters credentials on login page
2. System checks against hardcoded test users in `AuthContext.tsx`
3. If credentials match, user is logged in with their role
4. Role is stored in localStorage for persistence
5. Header renders role-specific navigation

### Role-Based Navigation
- **Header is hidden on login page** - clean UX until authenticated
- **After login, header appears** with user info and navigation
- **Admins see "Admin Panel" button** - regular users see "Store" link only
- **Logout** button available for all logged-in users

### User Persistence
- User data and role stored in localStorage
- Session persists across page refreshes
- Clearing localStorage will logout the user

## Adding New Users

To add more users, edit `frontend/src/contexts/AuthContext.tsx` and add to `TEST_USERS` array:

```typescript
const TEST_USERS = [
  {
    email: 'email@example.com',
    password: 'password123',
    role: 'Admin', // or 'Customer', 'StoreOwner'
    displayName: 'Display Name',
  },
];
```

## Roles Available

- **Customer** - Standard user, can browse and purchase
- **Admin** - Administrator with access to admin panel
- **StoreOwner** - Store owner (set up for future use)

## File Locations

- **Authentication Context:** `src/contexts/AuthContext.tsx`
- **Login Component:** `src/components/Login.tsx`
- **Header Component:** `src/components/Header.tsx`
- **Admin Dashboard:** `src/modules/admin/AdminDashboard.tsx`