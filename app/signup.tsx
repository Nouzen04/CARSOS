// Signup screen for both Drivers and Workshops
import { GradientButton } from '@/components/GradientButton';
import { ModernCard } from '@/components/ModernCard';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import { Checkbox } from 'expo-checkbox';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db, storage } from "../firebase";
import { getAddressFromCoords, getCurrentLocation, toGeoPoint } from "../utils/mapService";


const EMAILJS_SERVICE_ID = 'service_dvj5f4w';
const EMAILJS_TEMPLATE_ID = 'template_dmf4rjw';
const EMAILJS_PUBLIC_KEY = 'D18XRujlx96q2VUFL';

interface Service {
  id: number;
  name: string;
  icon: string;
}

const SERVICES = [
  { id: 1, name: 'Full Service', icon: 'settings' },
  { id: 2, name: 'Tire Change', icon: 'disc' },
  { id: 3, name: 'Towing', icon: 'tool' },
  { id: 4, name: 'Engine Tune', icon: 'activity' },
  { id: 5, name: 'Battery', icon: 'battery' },
  { id: 6, name: 'Aircond', icon: 'air-conditioner' }
];

const COMMON_FACILITIES = [
  'WiFi', 'Waiting Area', 'Prayer Room', 'Toilet', 'Cafe / Vending', 'Air Conditioning', 'Parking'
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


/** Generate a random 6-digit numeric OTP string. */
const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const storeOtp = async (email: string, code: string): Promise<void> => {
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000));
  await setDoc(doc(db, 'otps', email.toLowerCase()), { code, expiresAt });
};

const sendOtpEmail = async (toEmail: string, code: string): Promise<void> => {
  const expiryDate = new Date(Date.now() + 5 * 60 * 1000);
  const time = expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        email: toEmail,
        passcode: code,
        time,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`EmailJS error (${response.status}): ${text}`);
  }
  console.log("Sending OTP email:", toEmail);
  console.log("OTP:", code);
};



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
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [operatingDays, setOperatingDays] = useState<string[]>([]);
  const [sameAllDays, setSameAllDays] = useState(true);
  const [commonHours, setCommonHours] = useState({ open: '09:00', close: '18:00' });
  const [perDayHours, setPerDayHours] = useState<Record<string, { open: string; close: string }>>(
    Object.fromEntries(DAYS.map((d) => [d, { open: '09:00', close: '18:00' }]))
  );

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

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
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const pickProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
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

  const toggleDay = (day: string) => {
    setOperatingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const updateDayTime = (day: string, field: 'open' | 'close', value: string) => {
    setPerDayHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
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

  // ─── Core account-creation logic (called after OTP passes for bengkel) ──
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
          userData.operatingDays = operatingDays;
          userData.operatingHours = {
            sameAllDays,
            common: commonHours,
            perDay: perDayHours,
          };
          userData.description = description;
          userData.verified = false;
          if (location) {
            userData.location = toGeoPoint(location);
          }

          // Handle profile picture upload
          if (profilePicture) {
            setUploading(true);
            try {
              const response = await fetch(profilePicture);
              const blob = await response.blob();
              const storageRef = ref(storage, `workshop_profiles/${user.uid}.jpg`);
              await uploadBytes(storageRef, blob);
              userData.profilePicture = await getDownloadURL(storageRef);
            } catch (uploadError) {
              console.error("Error uploading profile picture:", uploadError);
              Alert.alert("Upload Failed", "Profile picture could not be saved.");
            } finally {
              setUploading(false);
            }
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
        } else {
          router.replace('/menuP' as Href);
        }
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  // ─── Validate bengkel fields before triggering OTP ─────────────────────
  const validateBengkelFields = (): boolean => {
    setShowValidation(true);
    if (!email || !password) {
      Alert.alert("Missing Info", "Please fill in your email and password.");
      return false;
    }
    if (!profilePicture) {
      Alert.alert("Missing Info", "Please select a workshop profile picture.");
      return false;
    }
    if (selectedFiles.length === 0) {
      Alert.alert("Missing Info", "Please upload your business license.");
      return false;
    }
    return true;
  };

  // ─── Initiate OTP flow (generate → store → send → show modal) ──────────
  const initiateOtp = async () => {
    if (!validateBengkelFields()) return;

    setOtpSending(true);
    setOtpError('');
    setOtpInput('');

    try {
      const code = generateOtp();
      await storeOtp(email, code);
      await sendOtpEmail(email, code);
      setOtpModalVisible(true);
    } catch (err: any) {
      console.error('OTP send error:', err);
      Alert.alert('OTP Error', `Could not send verification email. ${err.message ?? ''}`);
    } finally {
      setOtpSending(false);
    }
  };

  /** Resend: generate a fresh code, overwrite the Firestore doc, resend email. */
  const resendOtp = async () => {
    setOtpSending(true);
    setOtpError('');
    setOtpInput('');

    try {
      const code = generateOtp();
      await storeOtp(email, code);
      await sendOtpEmail(email, code);
      Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
    } catch (err: any) {
      console.error('OTP resend error:', err);
      Alert.alert('OTP Error', `Could not resend code. ${err.message ?? ''}`);
    } finally {
      setOtpSending(false);
    }
  };

  /** Verify the code entered by the user, then proceed with account creation. */
  const verifyOtp = async () => {
    if (otpInput.length !== 6) {
      setOtpError('Please enter the full 6-digit code.');
      return;
    }

    setOtpVerifying(true);
    setOtpError('');

    try {
      const otpRef = doc(db, 'otps', email.toLowerCase());
      const otpSnap = await getDoc(otpRef);

      if (!otpSnap.exists()) {
        setOtpError('Verification code not found. Please request a new one.');
        setOtpVerifying(false);
        return;
      }

      const { code, expiresAt } = otpSnap.data() as { code: string; expiresAt: Timestamp };

      if (expiresAt.toDate() < new Date()) {
        setOtpError('This code has expired. Please tap "Resend Code".');
        setOtpVerifying(false);
        return;
      }

      if (otpInput.trim() !== code) {
        setOtpError('Incorrect code. Please try again.');
        setOtpVerifying(false);
        return;
      }

      // ✅ Code is valid — clean up and proceed
      await deleteDoc(otpRef);
      setOtpModalVisible(false);
      setOtpInput('');
      setOtpError('');

      await signUp();
    } catch (err: any) {
      console.error('OTP verify error:', err);
      setOtpError('Verification failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  /** Unified "Create Account" button handler — branches on role. */
  const handleCreateAccount = () => {
    if (role === 'bengkel') {
      initiateOtp();
    } else {
      signUp();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* ─── OTP Verification Modal ─────────────────────────────────────── */}
      <Modal
        visible={otpModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ModernCard style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <LinearGradient
                colors={[Colors.light.primary, '#a855f7']}
                style={styles.modalIconBg}
              >
                <Feather name="mail" size={24} color="#ffffff" />
              </LinearGradient>
              <Text variant="titleLarge" style={styles.modalTitle}>Verify Your Email</Text>
              <Text variant="bodyMedium" style={styles.modalSubtitle}>
                We've sent a 6-digit code to{'\n'}
                <Text style={styles.modalEmail}>{email}</Text>
              </Text>
            </View>

            {/* OTP Input */}
            <TextInput
              mode="outlined"
              label="6-Digit Code"
              value={otpInput}
              onChangeText={(v) => {
                setOtpInput(v.replace(/[^0-9]/g, ''));
                setOtpError('');
              }}
              keyboardType="numeric"
              maxLength={6}
              style={styles.otpInput}
              left={<TextInput.Icon icon="shield-key-outline" color={Colors.light.primary} />}
              outlineColor={otpError ? '#ef4444' : undefined}
              activeOutlineColor={otpError ? '#ef4444' : Colors.light.primary}
            />

            {otpError !== '' && (
              <Text style={styles.otpErrorText}>{otpError}</Text>
            )}

            {/* Verify button */}
            <GradientButton
              title={otpVerifying ? '' : 'Verify & Create Account'}
              onPress={verifyOtp}
              loading={otpVerifying}
              style={styles.modalVerifyBtn}
            />

            {/* Resend & Cancel row */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={resendOtp}
                disabled={otpSending}
                style={styles.resendBtn}
              >
                {otpSending ? (
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                ) : (
                  <Text style={styles.resendText}>Resend Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setOtpModalVisible(false);
                  setOtpInput('');
                  setOtpError('');
                }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text variant="bodySmall" style={styles.otpHint}>
              Code expires in 5 minutes. Check your spam folder if you don't see it.
            </Text>
          </ModernCard>
        </View>
      </Modal>
      {/* ──────────────────────────────────────────────────────────────── */}

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
                // { value: 'admin', label: 'Admin', icon: 'shield-account' },
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

            {/*ADDRESS*/}
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

                {/*MAP*/}
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

                {/*SERVICE*/}
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

                {/*FACILITIES*/}
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

                {/*OPERATING DAYS*/}
                <Text variant="titleSmall" style={styles.sectionLabel}>Operating Days</Text>
                <View style={styles.servicesGrid}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.serviceItem,
                        operatingDays.includes(day) && styles.serviceItemSelected
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Checkbox
                        value={operatingDays.includes(day)}
                        onValueChange={() => toggleDay(day)}
                        color={operatingDays.includes(day) ? Colors.light.primary : undefined}
                        style={styles.checkbox}
                      />
                      <Text style={styles.serviceLabel}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => setSameAllDays((v) => !v)}
                >
                  <Checkbox
                    value={sameAllDays}
                    onValueChange={() => setSameAllDays((v) => !v)}
                    color={sameAllDays ? Colors.light.primary : undefined}
                    style={styles.checkbox}
                  />
                  <Text style={{ marginLeft: 10 }}>Use the same hours every open day</Text>
                </TouchableOpacity>

                {sameAllDays ? (
                  <View style={styles.timeRow}>
                    <TextInput
                      mode="outlined"
                      label="Open"
                      value={commonHours.open}
                      onChangeText={(v) => setCommonHours((prev) => ({ ...prev, open: v }))}
                      placeholder="09:00"
                      style={styles.timeInput}
                    />
                    <TextInput
                      mode="outlined"
                      label="Close"
                      value={commonHours.close}
                      onChangeText={(v) => setCommonHours((prev) => ({ ...prev, close: v }))}
                      placeholder="18:00"
                      style={styles.timeInput}
                    />
                  </View>
                ) : (
                  operatingDays.map((day) => (
                    <View key={day} style={styles.perDayRow}>
                      <Text style={styles.dayLabel}>{day}</Text>
                      <View style={styles.timeRow}>
                        <TextInput
                          mode="outlined"
                          label="Open"
                          value={perDayHours[day].open}
                          onChangeText={(v) => updateDayTime(day, 'open', v)}
                          placeholder="09:00"
                          style={styles.timeInput}
                        />
                        <TextInput
                          mode="outlined"
                          label="Close"
                          value={perDayHours[day].close}
                          onChangeText={(v) => updateDayTime(day, 'close', v)}
                          placeholder="18:00"
                          style={styles.timeInput}
                        />
                      </View>
                    </View>
                  ))
                )}

                {/*DESCRIPTION BUSINESS*/}
                <Text variant="titleSmall" style={styles.sectionLabel}>Description about Workshop</Text>
                <TextInput
                  mode="outlined"
                  label="Business Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />

                {/*PROFILE PICTURE WORKSHOP*/}
                <Text style={styles.sectionLabel}>Workshop Profile Picture</Text>
                <TouchableOpacity
                  style={[styles.profilePicBtn, showValidation && !profilePicture && styles.inputError]}
                  onPress={pickProfilePicture}
                >
                  {profilePicture ? (
                    <Image source={{ uri: profilePicture }} style={styles.profilePicPreview} />
                  ) : (
                    <View style={styles.profilePicPlaceholder}>
                      <Feather name="image" size={24} color={Colors.light.primary} />
                      <Text style={styles.profilePicBtnText}>Select Workshop Picture</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {showValidation && !profilePicture && (
                  <Text style={styles.errorText}>Workshop profile picture is required</Text>
                )}

                {/*BUSINESS VERIFICATION*/}
                <Text style={styles.sectionLabel}>Business Verification</Text>
                <TouchableOpacity
                  style={[styles.uploadBtn, showValidation && selectedFiles.length === 0 && styles.inputError]}
                  onPress={selectFile}
                >
                  <Feather name="upload-cloud" size={20} color={Colors.light.primary} />
                  <Text style={styles.uploadBtnText}>Upload Business License</Text>
                </TouchableOpacity>
                {showValidation && selectedFiles.length === 0 && (
                  <Text style={styles.errorText}>Business license is required</Text>
                )}

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

            {/* OTP badge shown when bengkel role is selected */}
            {role === 'bengkel' && (
              <View style={styles.otpNotice}>
                <Feather name="shield" size={14} color={Colors.light.primary} />
                <Text style={styles.otpNoticeText}>
                  Email verification required for workshop accounts
                </Text>
              </View>
            )}

            <GradientButton
              title={otpSending ? '' : 'Create Account'}
              onPress={handleCreateAccount}
              style={styles.button}
              loading={uploading || otpSending}
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
  profilePicBtn: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePicPlaceholder: {
    alignItems: 'center',
    gap: 10,
  },
  profilePicBtnText: {
    color: '#6366f1',
    fontWeight: '600',
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
  required: {
    color: "#ef4444",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 1,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  perDayRow: {
    marginBottom: 12,
  },
  dayLabel: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#0f172a',
  },

  // ─── OTP notice badge ────────────────────────────────────────────────────
  otpNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.primary + '12',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  otpNoticeText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
    flex: 1,
  },

  // ─── OTP Modal ───────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 28,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalEmail: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  otpInput: {
    backgroundColor: '#ffffff',
    marginBottom: 4,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
  },
  otpErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalVerifyBtn: {
    marginTop: 16,
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
  },
  resendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  resendText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#94a3b8',
    fontWeight: '500',
    fontSize: 14,
  },
  otpHint: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
