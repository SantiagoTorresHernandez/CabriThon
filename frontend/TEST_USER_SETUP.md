# Test User Setup

## Quick Start - Test User Credentials

**Email:** `test@gmail.com`  
**Password:** `1234567890` (10 characters minimum required)

> Note: Password must be at least 10 characters due to form validation requirements.

## Creating the Test User

### Option 1: Using the Node Script (Recommended)

1. Install Firebase Admin SDK dependency:
```bash
cd frontend
npm install firebase-admin
```

2. Place your Firebase service account key at:
```
backend/CabriThon.Api/service-account-key.json
```

3. Run the setup script:
```bash
node create-test-user.js
```

### Option 2: Manual Setup via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Create user**
5. Enter:
   - Email: `test@gmail.com`
   - Password: `1234567890` (exactly as shown - 10 characters)
6. Click **Create**

### Option 3: Using React Frontend Sign-Up

1. Modify the Login component temporarily to allow sign-up
2. Or create a separate sign-up endpoint

## Login

Once the user is created:

1. Visit `http://localhost:3000`
2. You'll be redirected to the login page
3. Enter:
   - Email: `test@gmail.com`
   - Password: `1234567890`
4. Click **Iniciar Sesión** (Sign In in Spanish)

## Password Requirements

- Minimum 10 characters
- Email must contain `@`
- Form validation provides helpful error messages in both English and Spanish

## Language Switching

Click the **EN** or **ES** button in the top-right of the login page to switch between English and Spanish.

## After Login

- The CabriThon header with navigation will appear
- The header is hidden on the login page for a cleaner UX
- Click **Logout** to return to the login page
