import "react-native-get-random-values";
import { TextEncoder, TextDecoder } from "text-encoding";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import React, { useEffect } from "react";
import { View, Button, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppContent from "./src/components/AppContent";
import UserProfile from "./src/components/UserProfile";
import SignUp from "./src/components/signup";
import Login from "./src/components/login";
import Feedback from "./src/components/Feedback";
import MyReports from "./src/components/MyReports";
import { archiveOldIncidents } from "./src/firestoreOperations";

// Create a stack navigator
const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Call the function to archive old incidents when the app initializes
    archiveOldIncidents();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Streetwise" component={AppContent} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Feedback" component={Feedback} />
          <Stack.Screen name="MyReports" component={MyReports} />
        </Stack.Navigator>
        <View style={{ padding: 10 }}></View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
