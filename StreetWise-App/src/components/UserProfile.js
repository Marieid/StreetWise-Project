import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Switch,
  Alert,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import styles from "../styles";

// Array of profile pictures
const profilePictures = [
  require("../../assets/profile-pictures/profile1.png"),
  require("../../assets/profile-pictures/profile2.png"),
  require("../../assets/profile-pictures/profile3.png"),
  require("../../assets/profile-pictures/profile4.png"),
  require("../../assets/profile-pictures/profile5.png"),
  require("../../assets/profile-pictures/profile6.png"),
  require("../../assets/profile-pictures/profile7.png"),
];

const UserProfile = ({ navigation }) => {
  const [user, setUser] = useState(auth.currentUser);
  const [reports, setReports] = useState([]);
  const [username, setUsername] = useState(user?.displayName || "");
  const [selectedProfilePictureIndex, setSelectedProfilePictureIndex] =
    useState(user?.photoURL ? parseInt(user.photoURL) : 0);
  const [credibilityScore, setCredibilityScore] = useState(0);

  // User Preferences State
  const [preferences, setPreferences] = useState({
    prefers_well_lit_routes: true,
    avoid_high_crime_areas: false,
    receive_notifications: true,
  });

  // Fetch user data and preferences on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCredibilityScore(userDoc.data().credibilityScore);
        }

        // Fetch User Preferences
        const prefsDoc = await getDoc(doc(db, "user_preferences", user.uid));
        if (prefsDoc.exists()) {
          setPreferences(prefsDoc.data());
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Handle saving profile changes
  const handleSaveProfile = async () => {
    try {
      if (!user) throw new Error("User is not authenticated");

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: username,
        photoURL: selectedProfilePictureIndex.toString(),
      });

      await updateProfile(auth.currentUser, {
        displayName: username,
        photoURL: selectedProfilePictureIndex.toString(),
      });

      // This forces refresh in AppContent for the updated user
      navigation.navigate("Streetwise", {
        updatedUser: {
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
        },
      });

      Alert.alert("Profile updated successfully");
    } catch (error) {
      Alert.alert("Error updating profile", error.message);
    }
  };

  // Handle saving user preferences
  const handleSavePreferences = async () => {
    try {
      if (!user) throw new Error("User is not authenticated");

      const prefsDocRef = doc(db, "user_preferences", user.uid);
      await setDoc(prefsDocRef, preferences, { merge: true });

      Alert.alert("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    }
  };

  // Render profile picture option
  const renderProfilePictureOption = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => setSelectedProfilePictureIndex(index)}
      style={[
        styles.profilePictureOption,
        selectedProfilePictureIndex === index &&
          styles.selectedProfilePictureOption,
      ]}
    >
      <Image source={item} style={styles.profilePictureOption} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <Image
          source={profilePictures[selectedProfilePictureIndex]}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <Text style={styles.profileCredibility}>
          Credibility Score: {credibilityScore}
        </Text>
      </View>

      <View style={styles.profileOptions}>
        <Text style={styles.chooseProfilePictureText}>
          Choose a profile picture
        </Text>
        <FlatList
          data={profilePictures}
          renderItem={renderProfilePictureOption}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          style={styles.profilePictureList}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>

      <View style={styles.preferencesContainer}>
        <Text style={styles.preferenceHeader}>User Preferences</Text>

        <View style={styles.preferenceItem}>
          <Text>Prefer Well-Lit Routes</Text>
          <Switch
            value={preferences.prefers_well_lit_routes}
            onValueChange={(value) =>
              setPreferences({ ...preferences, prefers_well_lit_routes: value })
            }
          />
        </View>

        <View style={styles.preferenceItem}>
          <Text>Avoid High-Crime Areas</Text>
          <Switch
            value={preferences.avoid_high_crime_areas}
            onValueChange={(value) =>
              setPreferences({ ...preferences, avoid_high_crime_areas: value })
            }
          />
        </View>

        <View style={styles.preferenceItem}>
          <Text>Receive Safety Notifications</Text>
          <Switch
            value={preferences.receive_notifications}
            onValueChange={(value) =>
              setPreferences({ ...preferences, receive_notifications: value })
            }
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSavePreferences}
        >
          <Text style={styles.buttonText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainerProfile}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveProfile}
        >
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signOutButton]}
          onPress={() =>
            auth.signOut().then(() => navigation.navigate("Login"))
          }
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.myReportsButton}
        onPress={() => navigation.navigate("MyReports")}
      >
        <Text style={styles.buttonText}>My Reports</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserProfile;
