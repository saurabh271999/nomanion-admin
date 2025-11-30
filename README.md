# Nomanion Admin Dashboard

Admin dashboard for managing Nomanion platform.

## Features

- ✅ Sidebar navigation with Dashboard, Itineraries, Nomads, Explorer, Subscription, Wallet, Pages
- ✅ Itineraries management with Published/Draft tabs
- ✅ Publish, Edit, Delete itinerary actions
- ✅ Shows nomad name and user ID
- ✅ Responsive design (mobile-friendly)
- ✅ Admin-only draft viewing

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:7001
   ```
   Or for production:
   ```env
   NEXT_PUBLIC_API_URL=https://nomanion-backend.onrender.com
   ```

3. **Set up authentication:**
   - The app uses JWT tokens stored in `localStorage`
   - Make sure you're logged in as admin/super_admin
   - Token should be stored as `token` in localStorage

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Pages

### Dashboard (`/`)
- Overview statistics
- Quick access to main features

### Itineraries (`/itineraries`)
- **Drafts Tab**: View all draft itineraries
- **Published Tab**: View all published itineraries
- Actions:
  - **Publish**: Publish draft itineraries (admin only)
  - **Edit**: Edit itinerary (coming soon)
  - **Delete**: Delete itinerary
- Shows:
  - Title and description
  - Location (city, state, country)
  - Nomad name and email
  - User ID
  - Created date

### Other Pages
- Nomads (`/nomads`) - Coming soon
- Explorer (`/explorer`) - Coming soon
- Subscription (`/subscription`) - Coming soon
- Wallet (`/wallet`) - Coming soon
- Pages (`/pages`) - Coming soon

## API Structure

All API calls are centralized in `api/index.js` using axios:

```javascript
import { itineraryAPI, userAPI, authAPI } from '../api';

// Example usage
const drafts = await itineraryAPI.getDrafts({ page: 1, limit: 20 });
await itineraryAPI.publish(itineraryId);
```

### Available API Modules:

- `authAPI` - Authentication (OTP, Google SSO)
- `userAPI` - User management
- `itineraryAPI` - Itinerary CRUD operations
- `uploadAPI` - File uploads
- `subscriptionAPI` - Subscription management
- `reviewAPI` - Review management

### API Endpoints Used

- `GET /api/v1/itinerary` - Get published itineraries
- `GET /api/v1/itinerary/admin/drafts` - Get draft itineraries (admin only)
- `PATCH /api/v1/itinerary/:id/publish` - Publish itinerary
- `PUT /api/v1/itinerary/:id` - Update itinerary
- `DELETE /api/v1/itinerary/:id` - Delete itinerary

## Authentication

The dashboard requires admin or super_admin role. Make sure:
1. You're logged in with admin credentials
2. JWT token is stored in localStorage as `token`
3. Token includes admin role in user data

## Responsive Design

- **Desktop**: Full sidebar + table view
- **Mobile**: Collapsible sidebar + card view
- **Tablet**: Adaptive layout

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
