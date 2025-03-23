import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import styles from "../styles";

const Feedback = ({ navigation }) => {
  const [comment, setComment] = useState("");

  // Handle feedback submission
  const handleFeedbackSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to submit feedback.");
      return;
    }

    try {
      // Add feedback to Firestore
      await addDoc(collection(db, "userfeedback"), {
        userId: user.uid,
        comment: comment,
        timestamp: new Date(),
      });
      Alert.alert("Thank you!", "Your feedback has been submitted.");
      setComment("");
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>Feedback</Text>
      <TextInput
        style={styles.feedbackInput}
        placeholder="Enter your feedback"
        value={comment}
        onChangeText={setComment}
        multiline
        accessibilityLabel="Feedback Comment"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleFeedbackSubmit}
        accessible={true}
        accessibilityLabel="Submit Feedback"
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Feedback;
