import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Text,
  FlatList,
  Image,
  Alert,
} from "react-native";
import PropTypes from "prop-types";
import styles, { colors } from "../styles";

// Incident type + icons
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

const incidentOptions = [
  { label: "Poor lighting", image: poorLightingImage },
  { label: "Obstacle", image: obstacleImage },
  { label: "Aggression", image: aggressionImage },
  { label: "Sexual aggression", image: sexualAggressionImage },
  { label: "Icy sidewalk", image: icySidewalkImage },
  { label: "Construction works", image: constructionWorksImage },
  { label: "Damaged road", image: damagedRoadImage },
  { label: "Inundated road", image: inundatedRoadImage },
  { label: "Dangerous crossing", image: dangerousCrossingImage },
  { label: "Faded crosswalk", image: fadedCrosswalkImage },
  { label: "Catcalls", image: catcallsImage },
  { label: "Streetfight", image: streetfightImage },
  { label: "Pickpockets", image: pickpocketsImage },
  { label: "Wild animals", image: wildAnimalsImage },
  { label: "Stray dogs/cats", image: strayDogsCatsImage },
  { label: "Under a bridge crossing", image: underBridgeCrossingImage },
];

const ReportIncidentModal = ({ visible, onClose, onSubmit, location }) => {
  const [selectedIncident, setSelectedIncident] = useState(incidentOptions[0]);
  const [comment, setComment] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    const userId = user ? user.uid : null;

    if (!location?.latitude || !location?.longitude) {
      Alert.alert("Error", "Invalid location. Please select on map.");
      return;
    }

    try {
      await onSubmit({
        type: selectedIncident.label,
        location,
        comment,
        userId,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Try again.");
    }
  };

  const renderPickerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setSelectedIncident(item);
        setPickerVisible(false);
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={item.image}
          style={{ width: 24, height: 24, marginRight: 10 }}
        />
        <Text style={styles.pickerItemText}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Report an Incident</Text>

          <TouchableOpacity
            style={styles.customPicker}
            onPress={() => setPickerVisible(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={selectedIncident.image}
                style={{ width: 24, height: 24, marginRight: 10 }}
              />
              <Text style={styles.selectedItemText}>
                {selectedIncident.label}
              </Text>
            </View>
          </TouchableOpacity>

          <Modal visible={pickerVisible} transparent animationType="fade">
            <TouchableOpacity
              style={styles.pickerModalContainer}
              onPress={() => setPickerVisible(false)}
              activeOpacity={1}
            >
              <View style={styles.pickerContent}>
                <FlatList
                  data={incidentOptions}
                  renderItem={renderPickerItem}
                  keyExtractor={(item) => item.label}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <TextInput
            style={[styles.commentInput, { height: 80 }]}
            placeholder="Add a comment (optional)"
            placeholderTextColor={colors.mediumGray}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

ReportIncidentModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  location: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
};

export default ReportIncidentModal;
