import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import styles from "../styles";

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle user sign up
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create a user document in Firestore with the credibility score
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: "",
        photoURL: null, // Or a placeholder URL
        createdAt: new Date(),
        credibilityScore: 100, // Initialize credibility score
      });

      // Go to the main screen
      navigation.navigate("Streetwise");

      Alert.alert("Success", "Account created successfully.");
    } catch (error) {
      console.error("Error signing up:", error);
      let errorMessage = "Failed to create account. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "The email address is already in use by another account.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "The password is too weak.";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.logsigntextInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email"
      />
      <TextInput
        style={styles.logsigntextInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessibilityLabel="Password"
      />
      <TextInput
        style={styles.logsigntextInput}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        accessibilityLabel="Confirm Password"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        accessible={true}
        accessibilityLabel="Sign Up"
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.switchText}>
        Already have an account?{" "}
        <Text
          style={styles.switchLink}
          onPress={() => navigation.navigate("Login")}
          accessible={true}
          accessibilityLabel="Login"
        >
          Login
        </Text>
      </Text>
    </View>
  );
};

export default SignUp;
