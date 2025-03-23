import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";

// Custom hook to request location permissions and fetch the current location
export const useLocationPermission = (setLocation) => {
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let locationSubscription;

    const requestPermissions = async () => {
      // Request foreground location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert(
          "Location Permission Required",
          "Enable location services in settings."
        );
        return;
      }

      try {
        // Watch the user's location
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 5, // Update every 5 meters
          },
          (location) => {
            setLocation(location);
          }
        );
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Failed to fetch location.");
      }
    };

    requestPermissions();

    // Cleanup the location subscription on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [setLocation]);

  return errorMsg;
};
