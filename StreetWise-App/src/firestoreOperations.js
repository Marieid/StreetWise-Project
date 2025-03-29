import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  writeBatch,
  updateDoc,
  getDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { Alert } from "react-native";

// Reference to the vote document for a specific incident and user
const voteRef = (incidentId, userId) =>
  doc(db, `incident_votes/${incidentId}/votes`, userId);

// Function to handle incident submission
export const handleIncidentSubmit = async (report) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    const userId = user.uid;
    const incidentLocation = report.location || {
      latitude: 0,
      longitude: 0,
    };

    console.log("Submitting incident report:", {
      type: report.type,
      location: incidentLocation,
      comment: report.comment,
      userId: userId,
    });

    // Add incident report to Firestore
    const docRef = await addDoc(collection(db, "incidents"), {
      type: report.type,
      location: incidentLocation,
      comment: report.comment,
      timestamp: new Date(),
      userId: userId,
      upvotes: 0,
      downvotes: 0,
      reporterId: userId, // Store the userId of the reporter as reporterId in the incident document.
    });
    console.log("Incident report saved with ID:", docRef.id);

    // Update user's credibility score
    const userRef = doc(db, "users", userId);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "User does not exist!";
      }
      const newCredibility = (userDoc.data().credibilityScore || 100) + 10;
      transaction.update(userRef, { credibilityScore: newCredibility });
    });

    Alert.alert("Success", "Incident reported successfully.");
  } catch (error) {
    console.error("Error saving incident report:", error);
    Alert.alert("Error", "Failed to report incident. Please try again.");
  }
};

// Function to handle downvote report
export const handleDownvoteReport = async (incidentId, userId) => {
  try {
    if (!auth.currentUser) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    const incidentDocRef = doc(db, "incidents", incidentId);
    const voteDocRef = voteRef(incidentId, userId);

    await runTransaction(db, async (transaction) => {
      // Perform all reads first
      const incidentSnap = await transaction.get(incidentDocRef);
      const existingVoteSnap = await transaction.get(voteDocRef);

      if (!incidentSnap.exists()) throw new Error("Incident not found");
      if (existingVoteSnap.exists()) throw new Error("Already voted");

      const reporterId = incidentSnap.data().userId;
      if (reporterId === userId)
        throw new Error("Cannot vote on your own report");

      const reporterRef = doc(db, "users", reporterId);
      const reporterSnap = await transaction.get(reporterRef);

      // Perform all writes after reads
      const newDownvotes = (incidentSnap.data().downvotes || 0) + 1;
      transaction.update(incidentDocRef, { downvotes: newDownvotes });

      if (reporterSnap.exists()) {
        const newCred = Math.max(
          0,
          (reporterSnap.data().credibilityScore || 100) - 5
        );
        transaction.update(reporterRef, { credibilityScore: newCred });
      }

      transaction.set(voteDocRef, {
        type: "downvote",
        timestamp: new Date(),
      });
    });

    Alert.alert("Success", "Report downvoted.");
  } catch (err) {
    console.error("Downvote error:", err);
    Alert.alert("Error", err.message || "Failed to downvote. Try again.");
  }
};

// Function to handle upvote report
export const handleUpvoteReport = async (incidentId, userId) => {
  try {
    if (!auth.currentUser) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    const incidentDocRef = doc(db, "incidents", incidentId);
    const voteDocRef = voteRef(incidentId, userId);

    await runTransaction(db, async (transaction) => {
      // Perform all reads first
      const incidentSnap = await transaction.get(incidentDocRef);
      const existingVoteSnap = await transaction.get(voteDocRef);

      if (!incidentSnap.exists()) throw new Error("Incident not found");
      if (existingVoteSnap.exists()) throw new Error("Already voted");

      const reporterId = incidentSnap.data().userId;
      if (reporterId === userId) throw new Error("Cannot vote on own report");

      const reporterRef = doc(db, "users", reporterId);
      const reporterSnap = await transaction.get(reporterRef);

      // Perform all writes after reads
      const newUpvotes = (incidentSnap.data().upvotes || 0) + 1;
      transaction.update(incidentDocRef, { upvotes: newUpvotes });

      if (reporterSnap.exists()) {
        const newCred = (reporterSnap.data().credibilityScore || 100) + 5;
        transaction.update(reporterRef, { credibilityScore: newCred });
      }

      transaction.set(voteDocRef, {
        type: "upvote",
        timestamp: new Date(),
      });
    });

    Alert.alert("Success", "Report upvoted.");
  } catch (err) {
    console.error("Upvote error:", err);
    Alert.alert("Error", err.message || "Failed to upvote. Try again.");
  }
};

// Function to archive old incidents
export const archiveOldIncidents = async () => {
  const timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const q = query(
    collection(db, "incidents"),
    where("timestamp", "<=", timeFilter)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("No old incidents to archive.");
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((document) => {
      const incident = document.data();
      const docRef = document.ref;

      // Add the incident to the "archived" collection
      const archivedDocRef = doc(collection(db, "archived"), docRef.id);
      batch.set(archivedDocRef, incident);

      // Delete the incident from the "incidents" collection
      batch.delete(docRef);
    });

    await batch.commit();
    console.log(`Archived ${querySnapshot.size} old incidents successfully.`);
  } catch (error) {
    console.error("Error archiving old incidents:", error);
    Alert.alert("Error", "Failed to archive old incidents. Please try again.");
  }
};

// Function to fetch incident markers
export const fetchIncidentMarkers = async (region, setIncidentMarkers) => {
  try {
    const q = query(collection(db, "incidents"));

    const querySnapshot = await getDocs(q);

    const markers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setIncidentMarkers(markers);
  } catch (error) {
    console.error("Error fetching incident markers:", error);
  }
};
