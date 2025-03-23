import 'dotenv/config';

export default {
  expo: {
    name: "StreetWise",
    slug: "StreetWise",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/StreetWiseLogo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/route-marker.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.marieid.streetwise"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/StreetWiseLogo.png",
        backgroundColor: "#ffffff"
      },
      package: "com.marieid.streetwise",
      compileSdkVersion: 34,
      minSdkVersion: 23,
      targetSdkVersion: 34,
      config: {
        googleMaps: {
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.ico"
    },
    extra: {
      eas: {
        projectId: "67317e16-f399-4c70-a7d3-1bd89d127384"
      },
      googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      firebaseApiKey: process.env.FIREBASE_API_KEY,
    }
  }
};
