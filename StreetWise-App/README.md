# StreetWise Mobile App

The **StreetWise Mobile App** is a React Native + Expo-based application for reporting, visualizing, and navigating around safety incidents in urban environments.

## Features!


- Map with real-time incident markers
- Custom icons for each type of incident
- Report form with location, comment, and incident type
- Upvote / Downvote reports
- Credibility system for reporters
- Route calculation with safety-based analysis
- Search destinations with Google Places Autocomplete
- Firebase Auth integration
- Feedback submission

## Folder Structure

```
/mobile-app
├── assets                # App icons, incident images
├── components            # UI components (modals, forms, etc.)
├── hooks                 # Custom React hooks
├── utils                 # Helper functions (route safety, etc.)
├── firestoreOperations.js# Firebase logic (votes, reports, archive)
├── AppContent.js         # Main app logic
├── app.config.js         # Expo config with Google Maps key
└── ...
```

## Setup Instructions

```bash
cd mobile-app
npm install
npx expo start
```

### Environment Variables

Create a `.env` file:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
FIREBASE_API_KEY=your_firebase_key
```

Make sure this key is also available in `app.config.js` under `extra.googleMapsApiKey`.

## Testing Locally

To test on device:
- Install [Expo Go](https://expo.dev/client) on your Android/iOS phone.
- Scan the QR code from terminal or browser.

To build an APK:
```bash
eas build -p android --profile preview2
```

> Note: Ensure `AndroidManifest.xml` includes the `com.google.android.geo.API_KEY` for Google Maps.

## Tech Stack

- React Native (Expo SDK 50)
- Firebase Firestore + Auth
- Google Maps SDK
- Expo Location, Modals, Permissions

## Screenshots
<div style="display: flex; gap: 10px;"> <img src="https://github.com/user-attachments/assets/f50a29ed-bd94-422d-9842-94636c32487b" width="250" /> <img src="https://github.com/user-attachments/assets/1c994880-7f5b-4f77-a196-4aa802fc90db" width="250" /> <img src="https://github.com/user-attachments/assets/e8266203-58da-487f-97e9-876e875bbbe7" width="250" /> <img src="https://github.com/user-attachments/assets/9172972e-1129-4c6f-bd23-8052d64b0912" width="250" /> <img src="https://github.com/user-attachments/assets/2bff6baf-e1be-4a9e-b787-3d2de4bd75a6" width="250" /> </div>

## Developed By

Part of the University of London BSc Computer Science Final project — CM3070 **StreetWise** 
