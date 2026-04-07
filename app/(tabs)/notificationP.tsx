import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // Listener for service requests relating to this driver
    const q = query(
      collection(db, 'service_requests'),
      where('pemanduID', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(list);
      setLoading(false);
    }, (error) => {
      console.error("Notification listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusMessage = (status: string, workshop: string) => {
    switch (status) {
      case 'Pending':
        return `Your request to ${workshop} is pending. Please wait for a response.`;
      case 'Accepted':
        return `Good news! ${workshop} has accepted your request and is coming to help.`;
      case 'Cancelled':
        return `Sorry, ${workshop} was unable to take your request. Please try another workshop.`;
      case 'Completed':
        return `Your service with ${workshop} has been completed.`;
      default:
        return `Your request to ${workshop} is currently ${status}.`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#F39C12'; // Orange
      case 'Accepted': return '#27AE60'; // Green
      case 'Cancelled': return '#E74C3C'; // Red
      case 'Completed': return '#2980B9'; // Blue
      default: return '#7F8C8D';
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.pageTitle}>Notifications</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#8baaff" style={{ marginTop: 50 }} />
        ) : (
          <View style={{ width: '100%', alignItems: 'center' }}>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <View key={notif.id} style={styles.card}>
                  <View style={styles.iconContainer}>
                    <Image 
                      source={require('../../assets/images/wrench.png')} 
                      style={[styles.icon, { tintColor: getStatusColor(notif.status) }]} 
                      resizeMode="contain" 
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{notif.workshopName || 'Service Update'}</Text>
                    <Text style={styles.cardText}>{getStatusMessage(notif.status, notif.workshopName)}</Text>
                    <Text style={styles.timeText}>
                      {notif.timestamp?.toDate().toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(notif.status) }]}>
                    <Text style={styles.statusText}>{notif.status}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No notifications yet.</Text>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  scrollView: {
    backgroundColor: '#F8F9FA',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    alignSelf: 'flex-start',
    marginVertical: 20,
    marginLeft: 10,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    backgroundColor: '#F0F4F8',
    padding: 12,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 40, // Space for badge
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  icon: {
    width: 32,
    height: 32,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});
