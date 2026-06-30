import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RatingModal } from '../../components/RatingModal';
import { auth, db } from '../../firebase';

function formatTimestamp(ts: any): string {
  if (!ts) return '';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  return isNaN(date.getTime()) ? '' : date.toLocaleString();
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const isFocusedRef = useRef(false);
  const notificationsRef = useRef<any[]>([]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const markVisibleAsRead = useCallback(async (list: any[]) => {
    const unread = list.filter(n => !n.readByPemandu);
    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, 'service_requests', n.id), { readByPemandu: true });
      });
      await batch.commit();
    } catch (e) {
      console.error('Error marking notifications read:', e);
    }
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'service_requests'),
      where('pemanduID', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map(d => ({
          id: d.id,
          ...d.data()
        }))
        .filter((notif: any) => !notif.dismissedByPemandu);
      setNotifications(list);
      setLoading(false);
      if (isFocusedRef.current) {
        markVisibleAsRead(list);
      }
    }, (error) => {
      console.error("Notification listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [markVisibleAsRead]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      markVisibleAsRead(notificationsRef.current);

      return () => {
        isFocusedRef.current = false;
      };
    }, [markVisibleAsRead])
  );

  const handleDismiss = async (id: string) => {
    try {
      await updateDoc(doc(db, 'service_requests', id), {
        dismissedByPemandu: true,
        readByPemandu: true,
      });
    } catch (e) {
      console.error('Error dismissing notification:', e);
    }
  };

  const getStatusMessage = (status: string, workshop: string) => {
    const name = workshop || 'the workshop';
    switch (status) {
      case 'Pending':
        return `Your request to ${name} is pending. Please wait for a response.`;
      case 'Accepted':
        return `Good news! ${name} has accepted your request and is coming to help.`;
      case 'Cancelled':
        return `Sorry, ${name} was unable to take your request. Please try another workshop.`;
      case 'Completed':
        return `Your service with ${name} has been completed.`;
      default:
        return `Your request to ${name} is currently ${status}.`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#F39C12';
      case 'Accepted': return '#27AE60';
      case 'Cancelled': return '#E74C3C';
      case 'Completed': return '#2980B9';
      default: return '#7F8C8D';
    }
  };

  const getCardColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#fff2dbff';
      case 'Accepted': return '#eaf9ef';
      case 'Cancelled': return '#ffecec';
      case 'Completed': return '#eaf4f8';
      default: return '#f8f9fa';
    }
  }

  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={styles.scrollView}
      contentContainerStyle={{
        paddingTop: insets.top + 20
      }}>
      <Text style={styles.pageTitle}>Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#8baaff" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.list}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <View key={notif.id} style={styles.cardContainer}>
                <View style={[styles.card, { backgroundColor: getCardColor(notif.status) }, !notif.readByPemandu && styles.cardUnread]}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(notif.status) }]}>
                    <Text style={styles.statusText}>{notif.status}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dismissBtn}
                    onPress={() => handleDismiss(notif.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Dismiss notification"
                  >
                    <Feather name="x" size={18} color="#000000ff" />
                  </TouchableOpacity>
                  <View style={styles.cardRow}>
                    <View style={[styles.iconContainer, { backgroundColor: getCardColor(notif.status) }]}>
                      <MaterialCommunityIcons
                        name="wrench"
                        size={28}
                        color={getStatusColor(notif.status)}
                      />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{notif.workshopName || 'Service Update'}</Text>
                      <Text style={styles.cardText}>
                        {getStatusMessage(notif.status, notif.workshopName)}
                      </Text>
                      {formatTimestamp(notif.timestamp) ? (
                        <Text style={styles.timeText}>{formatTimestamp(notif.timestamp)}</Text>
                      ) : null}
                      {notif.status === 'Completed' && !notif.rated && (
                        <Button
                          mode="contained"
                          onPress={() => {
                            setSelectedRequest(notif);
                            setRatingModalVisible(true);
                          }}
                          style={styles.rateBtn}
                          labelStyle={styles.rateBtnLabel}
                          icon="star"
                        >
                          Rate Workshop
                        </Button>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          )}

          {selectedRequest && (
            <RatingModal
              visible={ratingModalVisible}
              onClose={() => setRatingModalVisible(false)}
              request={selectedRequest}
              onSuccess={() => {
                setRatingModalVisible(false);
                setSelectedRequest(null);
              }}
            />
          )}
        </View>
      )}
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
    color: '#1a1a1a',
    alignSelf: 'center',
    fontFamily: 'SpaceMono-Bold',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  list: {
    width: '100%',
    alignSelf: 'stretch',
  },
  cardContainer: {
    width: '85%',
    marginBottom: 24,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 1,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 16,
    paddingTop: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#8baaff',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dismissBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 3,
    padding: 6,
    borderRadius: 16,
  },
  iconContainer: {
    backgroundColor: '#F0F4F8',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'SpaceMono-Bold',
    color: '#000000ff',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#3b3b3bae',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  rateBtn: {
    marginTop: 8,
    borderRadius: 12,
  },
  rateBtnLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold'
  },
});
