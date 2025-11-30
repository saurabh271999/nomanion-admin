# API Usage Guide

All API calls are centralized in `api/index.js` using axios.

## Setup

1. **Install axios** (already done):
   ```bash
   npm install axios
   ```

2. **Configure API URL** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:7001
   ```

## Usage

### Import APIs

```javascript
import { itineraryAPI, userAPI, authAPI } from '../api';
// or
import { itineraryAPI } from '../../api';
```

### Example: Get Draft Itineraries

```javascript
import { itineraryAPI } from '../api';

const fetchDrafts = async () => {
  try {
    const response = await itineraryAPI.getDrafts({
      page: 1,
      limit: 20,
      search: 'nainital',
    });
    
    console.log('Drafts:', response.data);
    console.log('Total:', response.pagination.total);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Example: Publish Itinerary

```javascript
import { itineraryAPI } from '../api';

const publishItinerary = async (id) => {
  try {
    const response = await itineraryAPI.publish(id);
    console.log('Published:', response.message);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Example: Delete Itinerary

```javascript
import { itineraryAPI } from '../api';

const deleteItinerary = async (id) => {
  try {
    await itineraryAPI.delete(id);
    console.log('Deleted successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

## Available API Modules

### `itineraryAPI`
- `getPublished(params)` - Get published itineraries
- `getDrafts(params)` - Get draft itineraries (admin)
- `getById(id)` - Get single itinerary
- `getMyItineraries(params)` - Get user's itineraries
- `create(data)` - Create itinerary
- `update(id, data)` - Update itinerary
- `delete(id)` - Delete itinerary
- `publish(id)` - Publish itinerary
- `disable(id, reason)` - Disable itinerary
- `like(id)` - Like/unlike itinerary
- `summarize(description, minWords, maxWords)` - Summarize description

### `userAPI`
- `getMe()` - Get current user
- `updateUser(data)` - Update user profile
- `updateProfile(data)` - Update basic profile
- `toggleFollow(userId)` - Follow/unfollow user

### `authAPI`
- `requestOtp(email)` - Request OTP
- `verifyOtp(email, otp)` - Verify OTP
- `googleAuth(idToken)` - Google SSO login

### `uploadAPI`
- `uploadSingle(file)` - Upload single file
- `uploadMultiple(files)` - Upload multiple files

### `subscriptionAPI`
- `getStatus()` - Get subscription status
- `getAll()` - Get all subscriptions (admin)

### `reviewAPI`
- `getItineraryReviews(itineraryId)` - Get reviews
- `create(itineraryId, data)` - Create review
- `approve(itineraryId, reviewId)` - Approve review (admin)
- `reject(itineraryId, reviewId, reason)` - Reject review (admin)
- `getPending()` - Get pending reviews (admin)

## Features

✅ **Automatic Token Injection** - Token from localStorage is automatically added to requests
✅ **Error Handling** - Centralized error handling with meaningful messages
✅ **TypeScript Support** - Works with TypeScript projects
✅ **Response Interceptor** - Automatically extracts `response.data`
✅ **Request Interceptor** - Automatically adds Authorization header

## Error Handling

All API calls return promises. Use try-catch:

```javascript
try {
  const data = await itineraryAPI.getDrafts();
  // Success
} catch (error) {
  // Error message is in error.message
  console.error(error.message);
}
```

## Authentication

The API automatically uses the token from `localStorage.getItem('token')`. Make sure:
1. User is logged in
2. Token is stored in localStorage as `token`
3. Token is valid and not expired

