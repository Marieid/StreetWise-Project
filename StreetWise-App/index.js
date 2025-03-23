import { AppRegistry } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { name as appName } from "./app.json";

// Register the main application component
AppRegistry.registerComponent(appName, () => AppNavigator);
