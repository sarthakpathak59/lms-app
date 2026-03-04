# Mini LMS App (React Native Expo)

A production-style Mini LMS mobile app built with React Native Expo + TypeScript.

## Tech Stack
- Expo SDK 54 + React Native 0.81
- TypeScript (`strict: true`)
- Expo Router
- Axios (interceptors, retry, timeout, token refresh)
- Secure storage: `expo-secure-store`
- App storage: `AsyncStorage` (if installed) with safe fallback
- Notifications: `expo-notifications` (optional runtime dependency)
- Web content: `react-native-webview` (optional runtime dependency)

## Implemented Features

### 1) Authentication & Session Management
- Register + login using `/users/register` and `/users/login`
- Access/refresh token handling
- Auto-login on app restart
- Session invalidation on refresh failure or auth expiry
- Logout with secure token cleanup

### 2) Profile
- User profile information (username/email/role)
- Profile picture URL update with local persistence
- User stats (enrolled count, bookmarks, progress)

### 3) Course Catalog
- Fetches:
  - `/public/randomusers` (instructors)
  - `/public/randomproducts` (courses)
- Search by title/description/instructor
- Bookmark toggle + persistent bookmarks
- Pull-to-refresh
- Course details page with enroll/bookmark actions

### 4) WebView Integration
- Embedded course content screen
- Local HTML template rendering
- Native-to-WebView communication via request headers
- WebView load/error handling

### 5) Native Features
- Notification permission request on bootstrap
- Notification when 5+ bookmarks reached
- Reminder notification when app inactive for 24h+

### 6) State, Performance, and Resilience
- Global auth and course contexts
- Memoized course cards
- Optimized list wrapper (`LegendList` over `FlatList`)
- API retry with backoff for transient failures
- Request timeout handling
- Offline mode banner + cached course fallback

## Project Structure
- `app/` : Expo Router screens
- `src/context/` : Auth and Course state
- `src/services/` : API, auth, course, notifications
- `src/components/` : Reusable UI components
- `src/utils/` : Storage and error helpers

## Setup
1. Install deps
```bash
npm install
```

2. Configure env
Create `.env`:
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.freeapi.app/api/v1
```

3. Run app
```bash
npm run start
```

## Optional Packages For Full Feature Runtime
These are loaded dynamically in code and should be installed in normal dev environments:
```bash
npm install @react-native-async-storage/async-storage react-native-webview expo-notifications
```

## Build (APK)
Use EAS development build:
```bash
npx eas build -p android --profile development
```

## Key Architecture Decisions
- Tokens and user session data are kept in SecureStore.
- Non-sensitive app state (bookmarks/enrollments/preferences/cached courses) uses app storage abstraction.
- API errors are normalized to present user-friendly messages.
- Session expiration is coordinated between API layer and auth context via a callback.

## Known Limitations
- NativeWind is not yet integrated in this snapshot (current UI uses `StyleSheet`).
- In this environment, network-restricted package install prevented adding optional dependencies automatically.

## Screens To Capture For Submission
- Login / Register
- Course list (search + bookmark filter)
- Course details (enroll + bookmark)
- WebView content screen
- Profile screen with stats
- Offline banner state

## Demo Video Checklist (3-5 min)
- Login flow
- Course discovery + search + refresh
- Bookmark threshold notification trigger
- Course enroll + details
- WebView content open
- Offline/error behavior
