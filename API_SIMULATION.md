# API Simulation Setup

This document explains how the API simulation works and how to switch between mock and real API.

## 🎯 Overview

The app uses a simulation layer that mimics real API behavior but can be easily switched to real API calls when the backend is ready.

## 🔧 Configuration

### Switching Between Mock and Real API

Edit `src/config/apiConfig.ts`:

```typescript
export const API_CONFIG = {
  // Set to false to use real API endpoints
  USE_MOCK_API: true, // ← Change this to false for real API
};
```

## 📱 Mock API Features

### Test Credentials
- **Email**: `test@test.com`
- **Password**: `password`

### Simulated Delays
- **Login**: 1.5 seconds
- **Password Change**: 1.2 seconds
- **Driver Onboarding**: 2.5 seconds
- **Other operations**: Random delay between 500ms - 2.5s

### Mock Data
- **User**: John Doe (driver@grandline.com)
- **Tokens**: Mock access and refresh tokens
- **Dashboard Stats**: Sample ride data and earnings

## 🚀 How It Works

### 1. API Service Layer
The `apiService` automatically switches between mock and real API based on configuration:

```typescript
// In apiService.ts
if (API_CONFIG.USE_MOCK_API) {
  return await mockApi.auth.login(credentials);
} else {
  return await realAuthApi.login(credentials);
}
```

### 2. Redux Integration
All screens use Redux actions that call the API service:

```typescript
// In components
const dispatch = useAppDispatch();
await dispatch(loginUser(credentials));
```

### 3. Error Handling
Mock API simulates real error scenarios:
- Invalid credentials
- Network timeouts
- Validation errors

## 🔄 Switching to Real API

### Step 1: Update Configuration
```typescript
// src/config/apiConfig.ts
export const API_CONFIG = {
  USE_MOCK_API: false, // ← Change to false
};
```

### Step 2: Update API Endpoints
```typescript
// src/constants/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://your-real-api.com', // ← Update with real URL
};
```

### Step 3: Implement Missing Endpoints
Some endpoints in `apiService.ts` throw "not implemented" errors for real API. Update these when your backend is ready.

## 🧪 Testing

### Test the Complete Flow
1. **Login**: Use `test@test.com` / `password`
2. **Password Change**: Enter new password
3. **Driver Onboarding**: Upload license and profile picture
4. **Dashboard**: View user profile and stats

### Debug Mode
The app logs all API calls in development mode. Check the console for:
- Request/response data
- Network delays
- Error messages

## 📁 File Structure

```
src/
├── config/
│   └── apiConfig.ts          # Central configuration
├── services/
│   └── api/
│       ├── apiService.ts     # Main API service (switches between mock/real)
│       ├── mockApi.ts        # Mock API implementation
│       ├── authApi.ts        # Real API implementation
│       └── axiosConfig.ts    # Axios configuration
└── store/
    └── slices/
        └── authSlice.ts      # Redux auth actions
```

## 🎉 Benefits

1. **Easy Development**: No backend required for frontend development
2. **Realistic Testing**: Simulates real API behavior and delays
3. **Easy Migration**: Switch to real API with one config change
4. **Error Simulation**: Test error handling scenarios
5. **Type Safety**: Full TypeScript support throughout

## 🔧 Customization

### Add New Mock Endpoints
1. Add to `mockApi.ts`
2. Add to `apiService.ts`
3. Add Redux action if needed

### Modify Mock Data
Edit the mock data in `mockApi.ts`:
- User information
- Dashboard stats
- Error messages
- Response delays

### Add Real API Endpoints
1. Implement in `authApi.ts`
2. Update `apiService.ts` to call real API
3. Test with `USE_MOCK_API: false`
