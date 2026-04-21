// Signup screen for both Drivers and Workshops
import { GradientButton } from '@/components/GradientButton';
import { ModernCard } from '@/components/ModernCard';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import * as DocumentPicker from 'expo-document-picker';
import { Checkbox } from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getCurrentLocation, toGeoPoint, getAddressFromCoords } from "../utils/mapService";

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

const COMMON_FACILITIES = [
  'WiFi', 'Waiting Area', 'Prayer Room', 'Toilet', 'Cafe / Vending', 'Air Conditioning', 'Parking'
];

export default function SignupScreen() {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [address, setAddress] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('pemandu');
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Handlers for launching file picker
  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', 
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFiles(prev => [...prev, ...result.assets]);
        console.log('Files selected:', result.assets.length);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Error picking document:', error);
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };


  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleFacility = (facility: string) => {
    setFacilities(prev =>
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    const loc = await getCurrentLocation();
    if (loc) {
      setLocation(loc);
      // Automatically lookup address
      const addr = await getAddressFromCoords(loc);
      setAddress(addr);
      Alert.alert("Success", "Location and address captured!");
    } else {
      Alert.alert("Error", "Could not get your location. Please check your GPS settings.");
    }
    setLoadingLocation(false);
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

          // Handle multi-file upload
          if (selectedFiles.length > 0) {
            setUploading(true);
            try {
              const uploadPromises = selectedFiles.map(async (file) => {
                const response = await fetch(file.uri);
                const blob = await response.blob();
                const storageRef = ref(storage, `workshop_docs/${user.uid}/${file.name || `doc_${Date.now()}`}`);
                await uploadBytes(storageRef, blob);
                return getDownloadURL(storageRef);
              });
              userData.documentURLs = await Promise.all(uploadPromises);
            } catch (uploadError) {
              console.error("Error uploading documents:", uploadError);
              Alert.alert("Warning", "Account created, but some documents failed to upload.");
            } finally {
              setUploading(false);
            }
          }
        }

        await setDoc(doc(db, "users", user.uid), userData);
        Alert.alert("Success", "Account created successfully!");

        if (role === 'bengkel') {
          router.replace('/waitingVerification' as Href);
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

                <Text variant="titleSmall" style={styles.sectionLabel}>Facilities</Text>
                <View style={styles.servicesGrid}>
                  {COMMON_FACILITIES.map((facility) => (
                    <TouchableOpacity
                      key={facility}
                      style={[
                        styles.serviceItem,
                        facilities.includes(facility) && styles.serviceItemSelected
                      ]}
                      onPress={() => toggleFacility(facility)}
                    >
                      <Checkbox
                        value={facilities.includes(facility)}
                        onValueChange={() => toggleFacility(facility)}
                        color={facilities.includes(facility) ? Colors.light.primary : undefined}
                        style={styles.checkbox}
                      />
                      <Text style={styles.serviceLabel}>{facility}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  mode="outlined"
                  label="Business Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />
                <Text style={styles.sectionLabel}>Business Verification</Text>
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={selectFile}
                >
                  <Feather name="upload-cloud" size={20} color={Colors.light.primary} />
                  <Text style={styles.uploadBtnText}>Upload Business License</Text>
                </TouchableOpacity>

                {selectedFiles.length > 0 && (
                  <View style={styles.filesList}>
                    {selectedFiles.map((file, index) => (
                      <View key={index} style={styles.fileInfoContainer}>
                        <View style={styles.fileIconCircle}>
                          <Feather name="file-text" size={18} color="#6366f1" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fileInfoText} numberOfLines={1}>{file.name}</Text>
                          <Text style={styles.fileInfoSubtext}>{(file.size / 1024).toFixed(2)} KB</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeFile(index)}>
                          <Feather name="x-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <GradientButton 
              title="Create Account" 
              onPress={signUp} 
              style={styles.button}
              loading={uploading}
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
  filesList: {
    marginTop: 10,
    marginBottom: 10,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#6366f1',
    gap: 10,
    marginBottom: 16,
  },
  uploadBtnText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 15,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 20,
  },
  fileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfoText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  fileInfoSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
});
