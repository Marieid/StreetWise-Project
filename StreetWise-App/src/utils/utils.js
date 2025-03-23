import { getDocs, query, collection, where } from "firebase/firestore";
import PolylineConverter from "@mapbox/polyline";
import { db } from "../firebaseConfig";
import { getDirections, geocodeAddress } from "../components/Routes";
import { Alert } from "react-native";

// Function to calculate the distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Function to convert degrees to radians
export const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Function to calculate walking time based on distance
export const calculateWalkingTime = (distance) => {
  const walkingSpeed = 5; // Average walking speed in km/h
  const timeInHours = distance / walkingSpeed;
  const timeInMinutes = timeInHours * 60;
  return timeInMinutes;
};

// Function to format walking time into hours and minutes
export const formatWalkingTime = (timeInMinutes) => {
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = Math.round(timeInMinutes % 60);
  return `${hours}h ${minutes < 10 ? "0" : ""}${minutes}m`;
};

// Function to analyze the safety of a route based on nearby incidents
export const analyzeRouteSafety = async (route) => {
  const safetyScores = [];
  const timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  // Fetch incidents from Firestore within the last 7 days
  const incidentsSnapshot = await getDocs(
    query(
      collection(db, "incidents"),
      where("timestamp", ">=", timeFilter),
      where("timestamp", "<=", new Date())
    )
  );

  const incidents = [];
  incidentsSnapshot.forEach((doc) => {
    const incident = doc.data();
    if (
      incident.location &&
      incident.location.latitude &&
      incident.location.longitude
    ) {
      incidents.push(incident);
    }
  });

  let totalDistance = 0;

  // Analyze each segment of the route
  for (let i = 0; i < route.path.length - 1; i++) {
    const startPoint = route.path[i];
    const endPoint = route.path[i + 1];
    const segmentCenter = {
      latitude: (startPoint.latitude + endPoint.latitude) / 2,
      longitude: (startPoint.longitude + endPoint.longitude) / 2,
    };

    let segmentScore = 0;

    const segmentDistance = calculateDistance(
      startPoint.latitude,
      startPoint.longitude,
      endPoint.latitude,
      endPoint.longitude
    );
    totalDistance += segmentDistance;

    // Find nearby incidents within a 50-meter radius
    const nearbyIncidents = incidents.filter((incident) => {
      const distance = calculateDistance(
        segmentCenter.latitude,
        segmentCenter.longitude,
        incident.location.latitude,
        incident.location.longitude
      );
      return distance <= 0.05; // 50-meter radius
    });

    // Calculate segment score based on incident types
    nearbyIncidents.forEach((incident) => {
      switch (incident.type) {
        case "Aggression":
        case "Sexual aggression":
        case "Streetfight":
        case "Pickpockets":
          segmentScore += 3;
          break;
        case "Poor lighting":
        case "Obstacle":
        case "icy sidewalk":
        case "Construction works":
        case "Damaged road":
        case "Inundated road":
        case "Dangerous crossing":
        case "Faded crosswalk":
        case "Catcalls":
          segmentScore += 2;
          break;
        case "Wild animals":
        case "Stray dogs/cats":
        case "Under a bridge crossing":
          segmentScore += 1;
          break;
        default:
          segmentScore += 1;
      }
    });

    safetyScores.push(segmentScore);
  }

  // Calculate total score and determine route color
  const totalScore = safetyScores.reduce((sum, score) => sum + score, 0);
  let routeColor;
  if (totalScore >= 5) {
    routeColor = "rgba(128, 0, 0, 0.7)"; // High (Red)
  } else if (totalScore >= 2) {
    routeColor = "rgba(179, 179, 0, 0.7)"; // Medium (Yellow)
  } else {
    routeColor = "rgba(0, 102, 0, 0.7)"; // Low (Green)
  }
  return { ...route, color: routeColor, distance: totalDistance };
};

// Function to calculate a route and analyze its safety
export const calculateRoute = async (
  location,
  destination,
  setDestinationMarker,
  setRoutes,
  setIsLoading
) => {
  setIsLoading(true);

  try {
    // Geocode the destination if necessary
    const finalDestinationCoords = destination?.latitude
      ? destination
      : await geocodeAddress(destination);
    if (!finalDestinationCoords) {
      throw new Error("Destination coordinates are invalid.");
    }
    setDestinationMarker({
      coordinate: finalDestinationCoords,
      title: "Destination",
    });

    if (!location || !location.coords) {
      throw new Error("User location not available.");
    }

    // Get directions from the user's location to the destination
    const directionsData = await getDirections(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      finalDestinationCoords
    );

    if (!directionsData || directionsData.length === 0) {
      throw new Error("No routes found or invalid data.");
    }

    // Analyze each route for safety
    const analyzedRoutes = await Promise.all(
      directionsData.map(async (routeData) => {
        const path = PolylineConverter.decode(
          routeData.overview_polyline.points
        ).map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        try {
          const analyzedRoute = await analyzeRouteSafety({ path });
          const walkingTime = calculateWalkingTime(analyzedRoute.distance);
          return {
            ...analyzedRoute,
            distance: analyzedRoute.distance,
            walkingTime: formatWalkingTime(walkingTime),
          };
        } catch (error) {
          console.error("Error in analyzeRouteSafety:", error);
          const estimatedDistance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            finalDestinationCoords.latitude,
            finalDestinationCoords.longitude
          );
          return {
            path,
            color: "rgba(15, 39, 117, 0.7)", // Default to blue if error occurs
            distance: estimatedDistance,
            walkingTime: formatWalkingTime(
              calculateWalkingTime(estimatedDistance)
            ),
          };
        }
      })
    );

    setRoutes(analyzedRoutes);
  } catch (error) {
    console.error("Error calculating route:", error);
    Alert.alert(
      "Error",
      error.message || "Failed to calculate route. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};
