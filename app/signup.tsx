import Feather from '@expo/vector-icons/Feather';
import { Checkbox } from 'expo-checkbox';
import { Href, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Text, SegmentedButtons, useTheme } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from "../firebase";
import { getCurrentLocation, toGeoPoint } from "../utils/mapService";
import { ModernCard } from '@/components/ModernCard';
import { GradientButton } from '@/components/GradientButton';
import Colors from '@/constants/Colors';

interface Service {
  id: number;
  name: string;
  icon: string;
}

const SERVICES = [
  { id: 1, name: 'Full Service', icon: 'settings' },
  { id: 2, name: 'Tire Change', icon: 'disc' },
  { id: 3, name: 'Brake Repair', icon: 'tool' },
  { id: 4, name: 'Engine Tune', icon: 'activity' },
  { id: 5, name: 'Oil Service', icon: 'droplet' },
  { id: 6, name: 'Aircond', icon: 'wind' }
];

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [address, setAddress] = useState('');
  const [facilities, setFacilities] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('pemandu');
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    const loc = await getCurrentLocation();
    setLoadingLocation(false);
    if (loc) {
      setLocation(loc);
      Alert.alert("Success", "Location captured successfully!");
    } else {
      Alert.alert("Error", "Could not get your location. Please check your GPS settings.");
    }
  };

  const signUp = async () => {
    if (!email || !password || !role) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const userData: any = {
          uid: user.uid,
          email: email,
          name: name,
          phone: phone,
          role: role,
          createdAt: new Date().toISOString(),
        };

        if (role === 'bengkel') {
          userData.name = workshopName; 
          userData.address = address;
          userData.selectedServices = selectedServices;
          userData.facilities = facilities;
          userData.description = description;
          userData.verified = false; 
          if (location) {
            userData.location = toGeoPoint(location);
          }
        }

        await setDoc(doc(db, "users", user.uid), userData);
        Alert.alert("Success", "Account created successfully!");
        
        if (role === 'bengkel') {
          router.replace('/menuD' as Href);
        } else if (role === 'admin') {
          router.replace('/menuA' as Href);
        } else {
          router.replace('/menuP' as Href);
        }
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert('Sign Up Failed', error.message);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.secondary]}
          style={styles.header}
        >
          <SafeAreaView style={styles.headerContent}>
            <Text variant="displaySmall" style={styles.headerTitle}>Join CARSOS</Text>
            <Text variant="titleMedium" style={styles.headerSubtitle}>Choose your role to get started</Text>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.body}>
          <ModernCard style={styles.card}>
            <SegmentedButtons
              value={role}
              onValueChange={setRole}
              buttons={[
                { value: 'pemandu', label: 'Driver', icon: 'car' },
                { value: 'bengkel', label: 'Workshop', icon: 'tools' },
                { value: 'admin', label: 'Admin', icon: 'shield-account' },
              ]}
              style={styles.segmentedButtons}
              theme={{ colors: { secondaryContainer: Colors.light.primary + '20', onSecondaryContainer: Colors.light.primary } }}
            />

            <TextInput
              mode="outlined"
              label={role === 'bengkel' ? "Workshop Name" : "Full Name"}
              value={role === 'bengkel' ? workshopName : name}
              onChangeText={role === 'bengkel' ? setWorkshopName : setName}
              style={styles.input}
              left={<TextInput.Icon icon="account-outline" color={Colors.light.primary} />}
            />

            <TextInput
              mode="outlined"
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" color={Colors.light.primary} />}
            />

            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" color={Colors.light.primary} />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />

            <TextInput
              mode="outlined"
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone-outline" color={Colors.light.primary} />}
            />

            {role === 'bengkel' && (
              <View style={styles.bengkelFields}>
                <TextInput
                  mode="outlined"
                  label="Business Address"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  left={<TextInput.Icon icon="map-marker-outline" color={Colors.light.primary} />}
                />

                <TouchableOpacity 
                  style={[styles.locationBtn, location ? styles.locationBtnSuccess : null]} 
                  onPress={handleGetLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Feather name={location ? "check-circle" : "map-pin"} size={18} color="white" />
                      <Text style={styles.locationBtnText}>
                        {location ? "Location Verified" : "Verify My Location"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text variant="titleSmall" style={styles.sectionLabel}>Services Offered</Text>
                <View style={styles.servicesGrid}>
                  {SERVICES.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.serviceItem,
                        selectedServices.includes(item.id) && styles.serviceItemSelected
                      ]}
                      onPress={() => toggleService(item.id)}
                    >
                      <Checkbox
                        value={selectedServices.includes(item.id)}
                        onValueChange={() => toggleService(item.id)}
                        color={selectedServices.includes(item.id) ? Colors.light.primary : undefined}
                        style={styles.checkbox}
                      />
                      <Text style={styles.serviceLabel}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  mode="outlined"
                  label="Facilities"
                  value={facilities}
                  onChangeText={setFacilities}
                  placeholder="e.g. WiFi, Waiting Room, Coffee"
                  style={styles.input}
                />

                <TextInput
                  mode="outlined"
                  label="Business Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />
              </View>
            )}

            <GradientButton 
              title="Create Account" 
              onPress={signUp} 
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text variant="bodyMedium">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/login' as Href)}>
                <Text variant="bodyMedium" style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </ModernCard>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 250,
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 30,
  },
  segmentedButtons: {
    marginBottom: 25,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  bengkelFields: {
    marginTop: 10,
  },
  sectionLabel: {
    color: '#0f172a',
    marginVertical: 15,
    fontWeight: 'bold',
  },
  locationBtn: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  locationBtnSuccess: {
    backgroundColor: '#10b981',
  },
  locationBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  serviceItemSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  checkbox: {
    width: 18,
    height: 18,
  },
  serviceLabel: {
    marginLeft: 10,
    fontSize: 13,
    color: '#334155',
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginLink: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
});