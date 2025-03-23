import "react-native-get-random-values";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline, Callout } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { onAuthStateChanged } from "firebase/auth";
import * as Location from "expo-location"; // Ensure Location is imported correctly
import { db, auth } from "../firebaseConfig";
import ReportIncidentModal from "./ReportIncidentModal";
import IncidentDetailsModal from "./IncidentDetailsModal";
import SignUp from "./signup";
import Login from "./login";
import styles, { spacing } from "../styles";
import Constants from "expo-constants";
import RouteList from "./RouteList";
import { calculateRoute } from "../utils/utils";
import {
  handleIncidentSubmit as submitIncident,
  archiveOldIncidents,
  handleDownvoteReport,
  handleUpvoteReport,
  fetchIncidentMarkers,
} from "../firestoreOperations";
import profile1 from "../../assets/profile-pictures/profile1.png";
import profile2 from "../../assets/profile-pictures/profile2.png";
import profile3 from "../../assets/profile-pictures/profile3.png";
import profile4 from "../../assets/profile-pictures/profile4.png";
import profile5 from "../../assets/profile-pictures/profile5.png";
import profile6 from "../../assets/profile-pictures/profile6.png";
import profile7 from "../../assets/profile-pictures/profile7.png";
import placeholder from "../../assets/profile-pictures/placeholder.png";
import destinationMarkerImage from "../../assets/destination-marker.png";
import aggressionImage from "../../assets/incidents/agression.png";
import damagedRoadImage from "../../assets/incidents/damaged-road.png";
import pickpocketsImage from "../../assets/incidents/pickpockets.png";
import obstacleImage from "../../assets/incidents/obstacle.png";
import icySidewalkImage from "../../assets/incidents/icy-sidewalk.png";
import sexualAggressionImage from "../../assets/incidents/sexual-agression.png";
import streetfightImage from "../../assets/incidents/streetfight.png";
import wildAnimalsImage from "../../assets/incidents/wild-animals.png";
import poorLightingImage from "../../assets/incidents/poor-lighting.png";
import constructionWorksImage from "../../assets/incidents/construction-works.png";
import inundatedRoadImage from "../../assets/incidents/inundated-road.png";
import dangerousCrossingImage from "../../assets/incidents/dangerous-crossing.png";
import fadedCrosswalkImage from "../../assets/incidents/faded-crosswalk.png";
import catcallsImage from "../../assets/incidents/catcalls.png";
import strayDogsCatsImage from "../../assets/incidents/stray-dogs-cats.png";
import underBridgeCrossingImage from "../../assets/incidents/under-bridge-crossing.png";
import { useLocationPermission } from "../hooks/useLocationPermission";
import { useFitToCoordinates } from "../hooks/useMapRef";

// Initial region for the map
const initialRegion = {
  latitude: 50.8503,
  longitude: 4.3517,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Profile pictures array
const profilePictures = [
  profile1,
  profile2,
  profile3,
  profile4,
  profile5,
  profile6,
  profile7,
];

// Mapping of incident types to images
const incidentTypeImages = {
  aggression: aggressionImage,
  damaged_road: damagedRoadImage,
  pickpockets: pickpocketsImage,
  obstacle: obstacleImage,
  icy_sidewalk: icySidewalkImage,
  sexual_aggression: sexualAggressionImage,
  streetfight: streetfightImage,
  wild_animals: wildAnimalsImage,
  poor_lighting: poorLightingImage,
  construction_works: constructionWorksImage,
  inundated_road: inundatedRoadImage,
  dangerous_crossing: dangerousCrossingImage,
  faded_crosswalk: fadedCrosswalkImage,
  catcalls: catcallsImage,
  stray_dogs_cats: strayDogsCatsImage,
  under_bridge_crossing: underBridgeCrossingImage,
};

// Google Maps API key
const mapsApiKey = Constants.expoConfig.extra.googleMapsApiKey;

export default function AppContent({ navigation, route }) {
  // State variables
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [incidentMarkers, setIncidentMarkers] = useState([]);
  const [destination, setDestination] = useState("");
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [showRouteList, setShowRouteList] = useState(true);
  const pressedLocation = useRef(null);
  const mapRef = useRef(null);
  const [user, setUser] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const calculateRouteTimeout = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [destinationMarkerKey, setDestinationMarkerKey] = useState(Date.now());
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);

  // Memoized profile picture source
  const profilePictureSource = useMemo(() => {
    return user?.photoURL
      ? profilePictures[parseInt(user.photoURL)]
      : placeholder;
  }, [user]);

  // Custom hooks for location permission and fitting map to coordinates
  useLocationPermission(setLocation);
  useFitToCoordinates(mapRef, routes);

  // Effect to handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Refresh user info
        await currentUser.reload();
        setUser(auth.currentUser);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // Effect to handle updated user from route params
  useEffect(() => {
    if (route.params?.updatedUser) {
      setUser(route.params.updatedUser);
    }
  }, [route.params?.updatedUser]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setDestinationMarker(null);
      setRoutes([]);
      setDestination("");
      setShowInput(true);
      if (calculateRouteTimeout.current) {
        clearTimeout(calculateRouteTimeout.current);
      }
    };
  }, []);

  // Effect to fetch incident markers
  useEffect(() => {
    const unsubscribe = fetchIncidentMarkers(initialRegion, setIncidentMarkers);
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Effect to archive old incidents periodically
  useEffect(() => {
    const interval = setInterval(() => {
      archiveOldIncidents();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
    return () => clearInterval(interval);
  }, []);

  // Handle map press to set pressed location and show modal
  const handleMapPress = useCallback((event) => {
    pressedLocation.current = event.nativeEvent.coordinate;
    setModalVisible(true);
  }, []);

  // Handle destination selection from Google Places Autocomplete
  const handleDestinationSelection = useCallback(
    async (data, details) => {
      if (details && details.geometry) {
        const { geometry } = details;
        const newDestinationCoords = {
          latitude: geometry.location.lat,
          longitude: geometry.location.lng,
        };

        setDestinationCoords(newDestinationCoords);
        setDestinationMarker({
          coordinate: newDestinationCoords,
          title: "Destination",
        });
        setDestination(data.description);
        setShowInput(false);
        setSelectedRouteIndex(null);

        // Debounce the calculateRoute call
        if (calculateRouteTimeout.current) {
          clearTimeout(calculateRouteTimeout.current); // Clear any existing timeout
        }

        calculateRouteTimeout.current = setTimeout(async () => {
          if (location && location.coords) {
            await calculateRoute(
              location,
              newDestinationCoords,
              setDestinationMarker,
              setRoutes,
              setIsLoading
            );
          } else {
            Alert.alert("Error", "User location not available.");
          }
        }, 500); // Adjusted debounce delay
      } else {
        console.error("Invalid details object:", details);
        Alert.alert("Error", "Invalid destination selected.");
      }
    },
    [location]
  );

  // Return to current location on the map
  const returnToCurrentLocation = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } else {
      Alert.alert("Error", "User location not available.");
    }
  }, [location]);

  // Handle route press to set selected route index
  const handleRoutePress = useCallback((index) => {
    setSelectedRouteIndex(index);
  }, []);

  // Effect to watch position changes when a route is selected
  useEffect(() => {
    let locationSubscription;
    if (selectedRouteIndex !== null && routes[selectedRouteIndex]) {
      locationSubscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update location every 5 seconds
          distanceInterval: 5, // Update location every 5 meters
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );
    }
    return () => {
      if (locationSubscription && locationSubscription.remove) {
        locationSubscription.remove();
      }
    };
  }, [selectedRouteIndex, routes]);

  // Handle incident submission
  const handleIncidentSubmit = useCallback(async (incidentData) => {
    try {
      await submitIncident(incidentData);
      fetchIncidentMarkers(initialRegion, setIncidentMarkers);
    } catch (error) {
      console.error("Error submitting incident:", error);
      Alert.alert("Error", "Failed to submit incident. Please try again.");
    }
  }, []);

  // Handle downvote of an incident
  const handleDownvote = useCallback(
    async (incidentId, userId) => {
      try {
        if (userId) {
          await handleDownvoteReport(incidentId, userId);
          fetchIncidentMarkers(initialRegion, setIncidentMarkers);
        } else {
          Alert.alert("Error", "Please log in to downvote.");
        }
      } catch (error) {
        console.error("Error downvoting incident:", error);
        Alert.alert("Error", "Failed to downvote incident. Please try again.");
      }
    },
    [user]
  );

  // Handle upvote of an incident
  const handleUpvote = useCallback(
    async (incidentId, userId) => {
      try {
        if (userId) {
          await handleUpvoteReport(incidentId, userId);
          fetchIncidentMarkers(initialRegion, setIncidentMarkers);
        } else {
          Alert.alert("Error", "Please log in to upvote.");
        }
      } catch (error) {
        console.error("Error upvoting incident:", error);
        Alert.alert("Error", "Failed to upvote incident. Please try again.");
      }
    },
    [user]
  );

  // Handle marker press to show incident details modal
  const handleMarkerPress = useCallback((marker) => {
    setSelectedMarker(marker);
    setIncidentModalVisible(true);
  }, []);

  // Close the report incident modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedMarker(null);
  }, []);

  // Close the incident details modal
  const closeIncidentModal = useCallback(() => {
    setIncidentModalVisible(false);
    setSelectedMarker(null);
  }, []);

  // Toggle the visibility of the input field for destination
  const toggleShowInput = useCallback(() => {
    setShowInput((prevShowInput) => !prevShowInput);
  }, []);

  // Toggle the visibility of the route list
  const toggleShowRouteList = useCallback(() => {
    setShowRouteList((prevShowRouteList) => !prevShowRouteList);
  }, []);

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={initialRegion}
              provider="google"
              onPress={handleMapPress}
            >
              {location && location.coords && (
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="My Location"
                >
                  <Image
                    source={profilePictureSource}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                </Marker>
              )}
              {incidentMarkers.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinate={marker.location}
                  onPress={() => handleMarkerPress(marker)}
                >
                  <Image
                    source={
                      incidentTypeImages[
                        marker.type?.toLowerCase().replace(/[\s/]/g, "_")
                      ] || placeholder
                    }
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                </Marker>
              ))}

              {routes.map((route, index) => (
                <Polyline
                  key={index}
                  coordinates={route.path}
                  strokeColor={route.color}
                  opacity={selectedRouteIndex === index ? 1 : 0.5}
                  strokeWidth={selectedRouteIndex === index ? 8 : 4}
                  tappable={true}
                  onPress={() => handleRoutePress(index)}
                />
              ))}

              {selectedRouteIndex !== null && routes[selectedRouteIndex] && (
                <Polyline
                  coordinates={routes[selectedRouteIndex].path}
                  strokeColor={routes[selectedRouteIndex].color || "blue"}
                  strokeWidth={8}
                />
              )}

              {destinationMarker && (
                <Marker
                  key={destinationMarkerKey}
                  coordinate={destinationMarker.coordinate}
                  title={destinationMarker.title}
                >
                  <Image
                    source={destinationMarkerImage}
                    style={{ width: 40, height: 40 }}
                  />
                </Marker>
              )}
            </MapView>
            {selectedMarker && (
              <IncidentDetailsModal
                visible={incidentModalVisible}
                onClose={closeIncidentModal}
                marker={selectedMarker}
                handleUpvote={handleUpvote}
                handleDownvote={handleDownvote}
                user={user}
              />
            )}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
          </View>

          <ReportIncidentModal
            visible={modalVisible}
            onClose={closeModal}
            onSubmit={handleIncidentSubmit}
            location={pressedLocation.current || { latitude: 0, longitude: 0 }}
          />

          <View style={styles.controlBoard}>
            <View style={styles.inputContainer}>
              {showInput && (
                <GooglePlacesAutocomplete
                  placeholder="Enter destination"
                  query={{ key: mapsApiKey, language: "en" }}
                  onPress={handleDestinationSelection}
                  onFail={(error) =>
                    console.error("Google Places Autocomplete error:", error)
                  }
                  fetchDetails={true}
                  styles={{ textInput: styles.textInput }}
                  onInputChangeText={setDestination}
                />
              )}
              <Button
                title={showInput ? " close " : " New destination "}
                onPress={toggleShowInput}
              />
            </View>
            {showInput && (
              <View style={styles.viewCalRoute}>
                <Button
                  style={styles.buttonCalRoute}
                  title="Directions"
                  onPress={() => {
                    if (location && location.coords) {
                      calculateRoute(
                        location,
                        destinationCoords,
                        setDestinationMarker,
                        setRoutes,
                        setIsLoading
                      );
                    } else {
                      Alert.alert("Error", "User location not available.");
                    }
                  }}
                  accessibilityLabel="Calculate route to destination"
                />
              </View>
            )}
            <Button
              title={showRouteList ? "Hide Route List" : "Show Route List"}
              onPress={toggleShowRouteList}
            />
            {showRouteList && (
              <ScrollView style={styles.routeList}>
                <RouteList
                  routes={routes}
                  selectedRouteIndex={selectedRouteIndex}
                  onSelectRoute={handleRoutePress}
                />
              </ScrollView>
            )}
          </View>

          <TouchableOpacity
            style={styles.localizationButton}
            onPress={returnToCurrentLocation}
          >
            <Text style={styles.locatemeText}>Locate Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => {
              if (location && location.coords) {
                pressedLocation.current = location.coords;
                setModalVisible(true);
              } else {
                Alert.alert("Error", "User location not available.");
              }
            }}
          >
            <Text style={styles.reportButtonText}>Report an incident</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button
              title="View Profile"
              onPress={() => navigation.navigate("UserProfile")}
              style={styles.button}
            />
            <Button
              title="Submit Feedback"
              onPress={() => navigation.navigate("Feedback")}
              style={styles.button}
            />
          </View>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </>
      ) : (
        <>
          <SignUp />
          <Login />
        </>
      )}
    </View>
  );
}
