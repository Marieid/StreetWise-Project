import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import styles from "../styles";

const MyReports = () => {
  const [reports, setReports] = useState([]);

  // Fetch user reports on component mount
  useEffect(() => {
    const fetchUserReports = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "incidents"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const userReports = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(userReports);
      }
    };

    fetchUserReports();
  }, []);

  // Render each report item
  const renderReportItem = ({ item }) => (
    <View style={styles.reportItem}>
      <Text style={styles.reportType}>{item.type}</Text>
      <Text style={styles.reportTimestamp}>
        {item.timestamp.toDate().toLocaleString()}
      </Text>
      {item.comment && <Text style={styles.reportComment}>{item.comment}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.reportListHeader}>My Reports</Text>
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        style={styles.reportList}
      />
    </View>
  );
};

export default MyReports;
