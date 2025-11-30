# Admin Authentication Setup

## Overview

The admin dashboard uses OTP-based authentication. All API calls automatically include the authentication token from localStorage.

## Components

### 1. **AuthContext** (`contexts/AuthContext.tsx`)
- Manages authentication state
- Provides `login`, `logout`, `requestOtp` functions
- Automatically checks authentication on mount
- Validates admin role (admin or super_admin)

### 2. **Login Page** (`app/login/page.tsx`)
- Two-step OTP flow:
  1. Enter email → Request OTP
  2. Enter OTP → Verify and login
- Includes resend OTP functionality with countdown
- Redirects to dashboard after successful login

### 3. **ProtectedRoute** (`components/ProtectedRoute.tsx`)
- Wraps pages that require authentication
- Redirects to `/login` if not authenticated or not admin
- Shows loading state during auth check

### 4. **API Client** (`api/index.js`)
- Automatically injects token from localStorage into all requests
- Token is added as `Authorization: Bearer <token>` header
- Handles errors consistently

## Usage

### Protecting a Page

```tsx
import ProtectedRoute from "../components/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <YourPageContent />
    </ProtectedRoute>
  );
}
```

### Using Auth in Components

```tsx
import { useAuth } from "../contexts/AuthContext";

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

All API calls automatically include the token:

```tsx
import { itineraryAPI } from "../api";

// Token is automatically added
const drafts = await itineraryAPI.getDrafts();
```

## Authentication Methods

### Password Login (Recommended for Admin)
- **Email**: admin@nomanion.com
- **Password**: Admin@123
- Direct login without OTP

### OTP Login
1. **User enters email** → OTP sent to email
2. **User enters OTP** → Token received and stored in localStorage

## Authentication Flow

1. **User visits protected page** → Redirected to `/login`
2. **User chooses login method** (Password or OTP)
3. **For Password**: Enter email and password → Token received
4. **For OTP**: Enter email → OTP sent → Enter OTP → Token received
5. **Token validated** → User role checked (must be admin or super_admin)
6. **Access granted** → User redirected to dashboard

## Token Management

- **Storage**: Token stored in `localStorage.getItem("token")`
- **Automatic Injection**: All axios requests include token via interceptor
- **Validation**: Token validated on app load via `/api/v1/user/me`
- **Logout**: Token removed from localStorage

## Admin Role Check

Only users with `role: "admin"` or `role: "super_admin"` can access the dashboard. Non-admin users are automatically logged out.

## API Endpoints Used

- `POST /api/v1/auth/login` - Password-based login
- `POST /api/v1/auth/request-otp` - Request OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP and get token
- `GET /api/v1/user/me` - Get current user (validates token)

## Default Admin Credentials

- **Email**: admin@nomanion.com
- **Password**: Admin@123
- **Role**: admin

To create/update admin user, run:
```bash
node scripts/createAdmin.js
```

## Environment Variables

Make sure `NEXT_PUBLIC_API_URL` is set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:7001
```

## Security Features

✅ **Token-based authentication** - JWT tokens stored securely
✅ **Role-based access control** - Only admins can access
✅ **Automatic token injection** - No manual token handling needed
✅ **Token validation** - Token checked on every app load
✅ **Automatic logout** - Invalid tokens trigger logout
✅ **Protected routes** - Pages wrapped with ProtectedRoute

