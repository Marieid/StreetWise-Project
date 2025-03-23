import { query, where, onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Fetch incidents from Firestore within the current map view and set markers on the map
const fetchIncidents = (mapRegion, setIncidentMarkers) => {
  try {
    const q = query(collection(db, "incidents"));

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const markers = [];
      querySnapshot.forEach((doc) => {
        const incident = doc.data();
        if (
          incident.location &&
          incident.location.latitude &&
          incident.location.longitude
        ) {
          markers.push({
            coordinate: incident.location,
            title: incident.type,
          });
        } else {
          console.error("Invalid incident data:", incident);
        }
      });
      setIncidentMarkers(markers); // Update markers state
    });

    // Return unsubscribe function to stop listening when component unmounts
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return () => {}; // Return a no-op function in case of error
  }
};

export default fetchIncidents;
