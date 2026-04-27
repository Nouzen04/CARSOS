import { GradientButton } from '@/components/GradientButton';
import Colors from '@/constants/Colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase';

export default function WaitingVerification() {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/login' as Href);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.secondary]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerContent}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Account Review</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>CARSOS Workshop Portal</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.body}>
        <Surface style={styles.card} elevation={2}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="clock-check-outline" size={80} color={Colors.light.primary} />
          </View>

          <Text variant="headlineSmall" style={styles.title}>Pending Verification</Text>
          <Text variant="bodyMedium" style={styles.description}>
            Thank you for registering with CARSOS! Our admin team is currently reviewing your business license and details.
          </Text>

          <View style={styles.infoBox}>
            <Feather name="info" size={18} color="#6366f1" />
            <Text style={styles.infoText}>
              This process typically takes 1-2 business days. You will receive access once verified.
            </Text>
          </View>

          <GradientButton
            title="Refresh Status"
            onPress={() => router.replace('/login' as Href)}
            style={styles.button}
          />

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 200,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  body: {
    flex: 1,
    marginTop: -60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 25,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  button: {
    width: '100%',
  },
  logoutBtn: {
    marginTop: 20,
    padding: 10,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});
