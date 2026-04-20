import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Text, Avatar, IconButton, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { router, Href } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernCard } from '@/components/ModernCard';
import Colors from '@/constants/Colors';

export default function PemanduProfile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/login' as Href);
            } catch (error) {
              Alert.alert('Error', 'Failed to log out.');
            }
          }
        },
      ]
    );
  };

  const seedRatingData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'bengkel'));
      const querySnapshot = await getDocs(q);
      
      for (const workshopDoc of querySnapshot.docs) {
        const workshopId = workshopDoc.id;
        const scores = [5, 4, 5];
        const comments = ["Excellent!", "Good job", "Fast service"];
        let total = 0;
        
        for (let i = 0; i < scores.length; i++) {
          await addDoc(collection(db, 'ratings'), {
            bengkelID: workshopId,
            pemanduID: 'seed_pemandu',
            requestID: 'seed_' + workshopId + '_' + i,
            score: scores[i],
            comment: comments[i],
            timestamp: serverTimestamp()
          });
          total += scores[i];
        }
        
        await updateDoc(doc(db, 'users', workshopId), {
          rating: Number((total / scores.length).toFixed(1)),
          totalRating: total,
          reviewCount: scores.length
        });
      }
      Alert.alert("Success", "Workshops have been seeded with dummy ratings!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to seed data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.secondary]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerContent}>
          <Avatar.Text 
            size={80} 
            label={userData?.name?.substring(0, 2).toUpperCase() || 'U'} 
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <Text variant="headlineSmall" style={styles.name}>{userData?.name || 'User'}</Text>
          <Text variant="bodyMedium" style={styles.role}>Pemandu Account</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <ModernCard style={styles.infoCard} elevation={1}>
           <Text variant="titleMedium" style={styles.sectionTitle}>Account Information</Text>
           
           <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Feather name="mail" size={18} color={Colors.light.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text variant="labelSmall" style={styles.infoLabel}>Email Address</Text>
                <Text variant="bodyLarge" style={styles.infoValue}>{userData?.email || auth.currentUser?.email}</Text>
              </View>
           </View>

           <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Feather name="phone" size={18} color={Colors.light.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text variant="labelSmall" style={styles.infoLabel}>Phone Number</Text>
                <Text variant="bodyLarge" style={styles.infoValue}>{userData?.phone || 'Not provided'}</Text>
              </View>
           </View>
        </ModernCard>

        <ModernCard style={styles.infoCard} elevation={1}>
           <Text variant="titleMedium" style={styles.sectionTitle}>Settings</Text>
           
           <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color="#64748b" />
              <Text variant="bodyLarge" style={styles.menuItemText}>Security</Text>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#64748b" />
              <Text variant="bodyLarge" style={styles.menuItemText}>Notifications</Text>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="help-circle-outline" size={22} color="#64748b" />
              <Text variant="bodyLarge" style={styles.menuItemText}>Support</Text>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
           </TouchableOpacity>
        </ModernCard>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LinearGradient
            colors={['#fee2e2', '#fee2e2']}
            style={styles.logoutGradient}
          >
            <Feather name="log-out" size={20} color="#ef4444" />
            <Text variant="titleMedium" style={styles.logoutText}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.seedBtn} onPress={seedRatingData}>
            <Feather name="database" size={16} color="#64748b" />
            <Text variant="bodySmall" style={styles.seedText}>Seed Rating Data (Dev Only)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    height: 260,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 16,
  },
  avatarLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
  },
  role: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  body: {
    flex: 1,
    marginTop: -30,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: '#0f172a',
    fontWeight: '500',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    color: '#334155',
  },
  logoutBtn: {
    marginTop: 10,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  seedBtn: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  seedText: {
    color: '#64748b',
  },
});
