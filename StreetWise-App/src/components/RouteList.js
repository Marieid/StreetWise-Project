import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles";
import { formatWalkingTime, calculateWalkingTime } from "../utils/utils";

// Component to display a list of routes
const RouteList = ({ routes, selectedRouteIndex, onSelectRoute }) => {
  return (
    <View style={styles.routeList}>
      {routes.map((route, index) => {
        // Determine safety level based on route color
        let safetyLevel = "Unknown";
        if (route.color === "rgba(0, 102, 0, 0.7)") {
          safetyLevel = "Safe 🟢";
        } else if (route.color === "rgba(179, 179, 0, 0.7)") {
          safetyLevel = "Be cautious 🟡";
        } else if (route.color === "rgba(128, 0, 0, 0.7)") {
          safetyLevel = "Dangerous 🔴";
        }

        // Calculate walking time for the route
        const walkingTime = formatWalkingTime(
          calculateWalkingTime(route.distance)
        );

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.routeItem,
              index === selectedRouteIndex ? styles.selectedRouteItem : null,
            ]}
            onPress={() => onSelectRoute(index)}
          >
            <Text
              style={[
                styles.routeText,
                index === selectedRouteIndex ? styles.selectedRouteText : null,
              ]}
            >
              Route {index + 1} - {safetyLevel} - Walking time: {walkingTime}{" "}
              min
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default RouteList;
