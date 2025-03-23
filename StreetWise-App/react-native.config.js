module.exports = {
  dependencies: {
    // Specify any dependencies that require manual linking here
  },
  assets: ["./assets/fonts"], // Example: Add custom fonts if you have any
  reactNativePath: "./node_modules/react-native",
  project: {
    android: {
      sourceDir: "./android",
    },
    ios: {}, // Remove the project key as it's causing the validation error
  },
};
