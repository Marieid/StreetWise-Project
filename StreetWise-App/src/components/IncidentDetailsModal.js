import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import styles from "../styles";

const IncidentDetailsModal = ({
  visible,
  onClose,
  marker,
  handleUpvote,
  handleDownvote,
  user,
}) => {
  if (!marker) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.incidentTitle}>{marker.type}</Text>
          {marker.timestamp && marker.timestamp.toDate && (
            <>
              <Text style={styles.incidentLabel}>Date:</Text>
              <Text style={styles.incidentText}>
                {marker.timestamp.toDate().toLocaleString()}
              </Text>
            </>
          )}
          {marker.comment && (
            <>
              <Text style={styles.incidentLabel}>Comment:</Text>
              <Text style={styles.incidentText}>{marker.comment}</Text>
            </>
          )}
          <View style={styles.incidentButtonContainer}>
            <TouchableOpacity
              style={styles.upvoteButton}
              onPress={() => handleUpvote(marker.id, user.uid)}
            >
              <Text style={styles.upvoteButtonText}>Upvote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.downvoteButton}
              onPress={() => handleDownvote(marker.id, user.uid)}
            >
              <Text style={styles.downvoteButtonText}>Downvote</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default IncidentDetailsModal;
