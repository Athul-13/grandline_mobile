# GrandLine Driver Mobile App

> A cross-platform mobile application for GrandLine drivers, built with Expo and React Native.

[![Expo](https://img.shields.io/badge/Expo-54.0-black.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Deep Linking](#deep-linking)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## Overview

GrandLine Driver is a mobile application designed specifically for drivers using the GrandLine bus rental platform. The app enables drivers to manage their profile, complete onboarding, view dashboard statistics, and receive notifications about their assignments.

### Key Capabilities

- **Driver Onboarding**: Complete profile setup with photo and license card upload
- **Dashboard**: View statistics and recent activity
- **Profile Management**: Update profile information and change password
- **Notifications**: Receive real-time notifications about assignments
- **Authentication**: Secure login with password reset functionality
- **Deep Linking**: Support for password reset and other deep links

## Features

### Core Features

- ✅ Driver authentication (login, password reset)
- ✅ Driver onboarding flow
- ✅ Profile picture upload (camera or gallery)
- ✅ License card photo upload
- ✅ Dashboard with statistics
- ✅ Recent activity feed
- ✅ Profile management
- ✅ Password change
- ✅ Notifications
- ✅ Deep linking support
- ✅ Cross-platform (iOS, Android, Web)

### Driver Onboarding

The onboarding process guides new drivers through:

1. **Initial Login**: Login with credentials provided by admin
2. **Password Setup**: Set up a secure password
3. **Profile Picture**: Upload profile picture (camera or gallery)
4. **License Card**: Upload driver's license card photo
5. **Completion**: Submit onboarding information

### Dashboard

Drivers can view:
- **Statistics**: Key metrics and performance data
- **Recent Activity**: Latest assignments and updates
- **Quick Actions**: Access to common tasks

## Tech Stack

### Core Technologies

- **Framework**: Expo 54.0
- **Runtime**: React Native 0.81
- **Language**: TypeScript 5.9
- **Navigation**: Expo Router 6.0 (file-based routing)

### State Management

- **Global State**: Redux Toolkit 2.9
- **Server State**: TanStack React Query 5.90

### UI & Styling

- **Icons**: Expo Vector Icons 15.0
- **Images**: Expo Image 3.0
- **Status Bar**: Expo Status Bar 3.0
- **System UI**: Expo System UI 6.0

### Native Features

- **Camera**: Expo Camera 17.0
- **Image Picker**: Expo Image Picker 17.0
- **Location**: Expo Location 19.0
- **Maps**: React Native Maps 1.20
- **Haptics**: Expo Haptics 15.0
- **Linking**: Expo Linking 8.0
- **Web Browser**: Expo Web Browser 15.0

### Additional Libraries

- **HTTP Client**: Axios 1.12
- **Navigation**: React Navigation 7.1
- **Animations**: React Native Reanimated 4.1
- **Gestures**: React Native Gesture Handler 2.28

## Project Structure

```
grandline_mobile/
├── app/                      # Expo Router pages (file-based routing)
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── password-change.tsx
│   │   └── onboarding.tsx
│   │
│   ├── (main)/              # Main app routes
│   │   ├── (dashboard)/
│   │   │   └── index.tsx
│   │   ├── (map)/
│   │   │   └── index.tsx
│   │   └── (settings)/
│   │       ├── index.tsx
│   │       ├── profile.tsx
│   │       ├── notifications.tsx
│   │       ├── change-password.tsx
│   │       └── report-issue.tsx
│   │
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
│
├── src/
│   ├── components/          # Reusable components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Shared components (Button, Input, etc.)
│   │   └── ui/             # UI components
│   │
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   └── main/           # Main app screens
│   │
│   ├── services/           # API services
│   │   ├── api/           # API client and services
│   │   │   ├── axios_client.ts
│   │   │   ├── auth_service.ts
│   │   │   ├── driver_service.ts
│   │   │   ├── user_service.ts
│   │   │   └── dashboard_service.ts
│   │   └── interceptors/  # Axios interceptors
│   │
│   ├── store/              # Redux store
│   │   ├── slices/        # Redux slices
│   │   │   └── auth_slice.ts
│   │   ├── store.ts       # Store configuration
│   │   └── hooks.ts       # Typed hooks
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── auth/          # Authentication hooks
│   │   ├── dashboard/     # Dashboard hooks
│   │   ├── driver/        # Driver-related hooks
│   │   └── profile/       # Profile hooks
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── driver/
│   │
│   ├── constants/          # Application constants
│   │   ├── api.ts         # API endpoints
│   │   └── theme.ts       # Theme configuration
│   │
│   ├── config/             # Configuration files
│   │   └── query_client.ts # React Query configuration
│   │
│   ├── utils/              # Utility functions
│   │   ├── cloudinary_uploader.ts
│   │   ├── validation.ts
│   │   └── response_unwrapper.ts
│   │
│   └── assets/             # Static assets
│       └── images/         # Images and icons
│
├── scripts/                # Utility scripts
│   └── reset-project.js
│
├── app.json                # Expo configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (installed globally or via npx)
- **GrandLine Server API** running (see [server README](../server/README.md))

### For iOS Development

- **Xcode** (macOS only)
- **iOS Simulator** (comes with Xcode)
- **CocoaPods** (for iOS dependencies)

### For Android Development

- **Android Studio**
- **Android SDK**
- **Android Emulator** or physical device

## Installation

1. **Navigate to the mobile directory**:
   ```bash
   cd grandline_mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **For iOS** (macOS only):
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables) section)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1

# Cloudinary (for image uploads)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
EXPO_PUBLIC_CLOUDINARY_API_KEY=your-api-key
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

> **Note**: In Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

## Running the Application

### Development Mode

Start the Expo development server:

```bash
npm start
```

This will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Display a QR code for testing on physical devices

### Running on Specific Platforms

#### iOS Simulator (macOS only)

```bash
npm run ios
```

#### Android Emulator

```bash
npm run android
```

#### Web Browser

```bash
npm run web
```

### Using Expo Go App

1. Install **Expo Go** on your iOS or Android device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code displayed in the terminal or browser

3. The app will load on your device

> **Note**: Some native features may not work in Expo Go. For full functionality, use a development build.

### Other Scripts

- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset to a blank project (removes example code)

## Building for Production

### Development Build

Create a development build for testing native features:

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build

Build for app stores:

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

> **Note**: You'll need to set up [Expo Application Services (EAS)](https://docs.expo.dev/build/introduction/) for building.

### Local Build (Advanced)

For local builds, you'll need to configure native projects:

```bash
# Generate native projects
npx expo prebuild

# iOS (macOS only)
cd ios
pod install
cd ..
npx expo run:ios

# Android
npx expo run:android
```

## Deep Linking

The app supports deep linking for various features:

### Password Reset

The app handles password reset deep links:

```
grandlinemobile://reset-password?token=<reset-token>
```

When a user clicks a password reset link in their email, the app will:
1. Open automatically (if installed)
2. Navigate to the reset password screen
3. Pre-fill the reset token

### Configuration

Deep linking is configured in `app.json`:

```json
{
  "expo": {
    "scheme": "grandlinemobile"
  }
}
```

### Testing Deep Links

#### iOS Simulator

```bash
xcrun simctl openurl booted "grandlinemobile://reset-password?token=test-token"
```

#### Android Emulator

```bash
adb shell am start -W -a android.intent.action.VIEW -d "grandlinemobile://reset-password?token=test-token" host.exp.exponent
```

## Screenshots

> **Note**: Add screenshots of the app here

### Authentication

- [ ] Login screen
- [ ] Forgot password screen
- [ ] Reset password screen
- [ ] Onboarding flow

### Main App

- [ ] Dashboard screen
- [ ] Map screen
- [ ] Profile screen
- [ ] Settings screen
- [ ] Notifications screen

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Follow React Native best practices** - Use functional components and hooks
2. **TypeScript** - Use proper types, avoid `any`
3. **Expo Router** - Use file-based routing conventions
4. **Component structure** - Keep components small and focused
5. **Native features** - Test on both iOS and Android when using native APIs
6. **State management** - Use Redux for global state, React Query for server state

### Code Style

- Use **functional components** with hooks
- Use **TypeScript** for all files
- Follow **naming conventions**: PascalCase for components, camelCase for functions
- Use **snake_case** for file names
- Keep components **small and focused**
- Use **custom hooks** for reusable logic
- Test on **both iOS and Android**

### Development Tips

- Use **Expo DevTools** for debugging
- Use **React Native Debugger** for advanced debugging
- Test on **physical devices** for accurate performance testing
- Use **Fast Refresh** for quick development iteration

## License

ISC

---

**Built with ❤️ using Expo and React Native**
