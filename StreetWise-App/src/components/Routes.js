import { Alert } from "react-native";
import axios from "axios";
import Constants from "expo-constants";

// Google Maps API key
const mapsApiKey = Constants.expoConfig.extra.googleMapsApiKey;

// Function to fetch directions data from Google Maps API
export const getDirections = async (origin, destination) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          mode: "walking",
          key: mapsApiKey,
          alternatives: true,
        },
      }
    );
    return response.data.routes;
  } catch (error) {
    console.error("Error fetching directions:", error);
    Alert.alert("Error", "Failed to fetch directions.");
    return [];
  }
};

// Function to geocode an address to coordinates
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address,
          key: mapsApiKey,
        },
      }
    );
    const { results } = response.data;
    if (results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    Alert.alert("Error", "Failed to geocode address.");
    return null;
  }
};
