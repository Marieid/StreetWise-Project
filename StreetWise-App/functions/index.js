const functions = require("firebase-functions");
const admin = require("firebase-admin");
const userId = user.uid;

admin.initializeApp();

exports.updateCredibilityScore = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { userId, score } = data;

    if (context.auth.uid !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Cannot modify other users' data"
      );
    }

    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const credibilityScore = userDoc.data().credibilityScore || 0;

    await userRef.update({
      credibilityScore: Math.max(0, credibilityScore + score),
    });

    return { message: "Credibility score updated successfully" };
  }
);
