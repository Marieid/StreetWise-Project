import { StyleSheet } from "react-native";

// --- Color Palette ---
const colors = {
  primary: "#0056b3", // Blue (for buttons, links)
  secondary: "#6c757d", // Gray (for less important text)
  background: "#f8f9fa", // Light Gray (main background)
  white: "#ffffff",
  lightGray: "#ced4da",
  darkGray: "#212529",
  mediumGray: "#495057",
  borderGray: "#dee2e6",
  danger: "#dc3545",
  selected: "#e9ecef", // For selected items (like routes)
  black: "#000",
};

// --- Font Sizes ---
const fontSizes = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
};

// --- Spacing ---
const spacing = {
  small: 5,
  medium: 10,
  large: 15,
  xlarge: 20,
  xxlarge: 24,
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  // --- General Container Styles ---
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // --- Map Styles ---
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },

  // --- Error Text ---
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.medium,
    padding: spacing.medium,
    textAlign: "center",
  },

  // --- Control Board (Top Bar) ---
  controlBoard: {
    position: "absolute",
    top: spacing.small,
    left: spacing.medium,
    right: spacing.medium,
    backgroundColor: colors.white,
    borderRadius: spacing.medium,
    padding: spacing.large,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
  },

  // --- Text Input ---
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: spacing.medium,
    paddingHorizontal: spacing.medium,
    marginRight: spacing.medium,
    backgroundColor: colors.white,
    marginBottom: spacing.medium,
  },

  // --- Button Styles ---
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.medium,
    paddingHorizontal: spacing.medium,
  },
  viewCalRoute: {
    marginBottom: spacing.medium,
  },
  buttonCalRoute: {
    padding: spacing.medium,
    borderRadius: spacing.medium,
    alignItems: "center",
    marginTop: spacing.medium,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.small,
    borderRadius: spacing.small,
    alignItems: "center",
    marginTop: spacing.medium,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: "bold",
  },

  // --- Loading Overlay ---
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  // --- Route List ---
  routeList: {
    maxHeight: 200,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: spacing.medium,
    borderRadius: spacing.small,
    marginTop: spacing.medium,
  },
  routeItem: {
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  selectedRouteItem: {
    backgroundColor: colors.selected,
  },
  routeText: {
    fontSize: fontSizes.medium,
    color: colors.mediumGray,
  },
  selectedRouteText: {
    fontWeight: "bold",
    color: colors.darkGray,
  },

  // --- Localization Button ---
  localizationButton: {
    position: "absolute",
    bottom: spacing.xxlarge * 5,
    right: spacing.medium,
    backgroundColor: colors.mediumGray,
    borderRadius: 50,
    padding: spacing.medium,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
  },
  locatemeText: {
    color: colors.lightGray,
    fontSize: fontSizes.medium,
    fontWeight: "bold",
  },

  // --- Auth Screen Styles (Signup/Login) ---
  authContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.xxlarge,
    fontWeight: "bold",
    marginBottom: spacing.xxlarge,
    textAlign: "center",
    color: colors.darkGray,
  },
  switchText: {
    marginTop: spacing.large,
    textAlign: "center",
    color: colors.mediumGray,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: "bold",
  },
  logsigntextInput: {
    height: 40,
    borderColor: colors.lightGray,
    borderWidth: 1,
    marginBottom: spacing.medium,
    paddingHorizontal: spacing.medium,
    borderRadius: spacing.small,
    fontSize: fontSizes.medium,
  },

  // --- User Profile Styles ---
  profileContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.background,
    paddingTop: 10,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileNameInput: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    textAlign: "center",
    width: "80%",
  },
  profileEmail: {
    fontSize: 16,
    color: "#888",
  },
  chooseProfilePictureText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  profilePictureList: {
    marginBottom: 40,
  },
  profilePictureOption: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginHorizontal: 10,
  },
  selectedProfilePictureOption: {
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  profileButton: {
    backgroundColor: "#0056b3",
    padding: 10,
    borderRadius: spacing.medium,
    alignItems: "center",
    width: "45%",
  },
  signOutButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: spacing.medium,
    alignItems: "center",
    width: "45%",
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: spacing.medium,
    alignItems: "center",
    width: "45%",
  },
  buttonContainerProfile: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  profileButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  profileCredibility: {
    fontSize: fontSizes.medium,
    color: colors.primary,
    marginTop: spacing.small,
    fontWeight: "bold",
  },

  // --- Report list styles (User Profile) ---
  reportList: {
    flex: 1,
  },
  myReportsButton: {
    backgroundColor: colors.mediumGray,
    padding: spacing.medium,
    borderRadius: spacing.medium,
    alignItems: "center",
    marginTop: spacing.xxlarge,
  },
  reportListHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  reportItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: colors.white,
    borderRadius: spacing.small,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.mediumGray,
  },
  reportTimestamp: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 5,
  },
  reportComment: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 5,
  },

  // --- Report Button ---
  reportButton: {
    position: "absolute",
    bottom: spacing.xxlarge * 4,
    left: spacing.medium,
    backgroundColor: colors.danger,
    borderRadius: 50,
    padding: spacing.medium,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
  },
  reportButtonText: {
    color: colors.white,
    fontSize: fontSizes.large,
    fontWeight: "bold",
  },

  // --- Feedback Form Styles ---
  feedbackForm: {
    padding: spacing.medium,
    height: "100%",
  },
  feedbackInput: {
    height: 100,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: spacing.small,
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.medium,
    textAlignVertical: "top",
  },

  // --- Callout Styles ---
  calloutContainer: {
    width: 200,
    padding: spacing.small,
  },
  calloutTitle: {
    fontSize: fontSizes.large,
    fontWeight: "bold",
    marginBottom: spacing.small,
  },
  calloutText: {
    fontSize: fontSizes.medium,
    color: colors.mediumGray,
  },

  // --- Modal Styles ---
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  customPicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  selectedItemText: {
    fontSize: 16,
    color: "#000",
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  pickerContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 300,
    width: "80%",
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#000",
  },
  commentInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: "#dc3545",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // --- Upvote Button ---
  upvoteButton: {
    backgroundColor: colors.primary,
    padding: spacing.small,
    borderRadius: spacing.small,
    alignItems: "center",
    marginTop: spacing.medium,
    width: "40%",
  },
  upvoteButtonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: "bold",
  },

  // --- Downvote Button ---
  downvoteButton: {
    backgroundColor: colors.danger,
    padding: spacing.small,
    borderRadius: spacing.small,
    alignItems: "center",
    marginTop: spacing.medium,
    width: "40%",
  },
  downvoteButtonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: "bold",
  },

  // --- Incident Details Modal Styles ---
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incidentTitle: {
    fontSize: fontSizes.xlarge,
    fontWeight: "bold",
    marginBottom: spacing.medium,
    textAlign: "center",
    color: colors.darkGray,
  },
  incidentLabel: {
    fontSize: fontSizes.medium,
    fontWeight: "bold",
    marginTop: spacing.medium,
    color: colors.mediumGray,
  },
  incidentText: {
    fontSize: fontSizes.medium,
    marginBottom: spacing.small,
    color: colors.darkGray,
  },
  incidentButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.medium,
  },
  closeButton: {
    marginTop: spacing.medium,
    padding: spacing.small,
    backgroundColor: colors.mediumGray,
    borderRadius: 5,
    alignItems: "center",
    width: "40%",
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: fontSizes.medium,
  },
});

export { spacing, colors, fontSizes };
export default styles;
