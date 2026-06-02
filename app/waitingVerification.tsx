import { GradientButton } from '@/components/GradientButton';
import Colors from '@/constants/Colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import { Surface, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db, storage } from '../firebase';

export default function WaitingVerification() {
  const [loading, setLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');

  // Form states for re-submission
  const [workshopName, setWorkshopName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setLoading(false);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.verified === true) {
          Alert.alert("Approved 🎉", "Congratulations! Your workshop has been approved. Welcome to CARSOS!");
          router.replace('/menuD' as Href);
        } else if (userData.status === 'rejected') {
          setIsRejected(true);
          setRejectionMessage(userData.rejectionMessage || 'No reason provided.');
          // Initialize fields with existing data (if not already modified by the user)
          setWorkshopName(prev => prev || userData.name || '');
          setPhone(prev => prev || userData.phone || '');
          setAddress(prev => prev || userData.address || '');
        } else {
          setIsRejected(false);
          setRejectionMessage('');
        }
      }
    }, (error) => {
      console.error("Error listening to user document status:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/login' as Href);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFiles(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Error picking document:', error);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleResubmit = async () => {
    if (!workshopName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Required Fields", "Please fill in all the details.");
      return;
    }

    setSubmitting(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No authenticated user");

      const updateData: any = {
        name: workshopName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        status: 'pending',
        rejectionMessage: null
      };

      // Upload files if selected
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          const storageRef = ref(storage, `workshop_docs/${uid}/${file.name || `doc_${Date.now()}`}`);
          await uploadBytes(storageRef, blob);
          return getDownloadURL(storageRef);
        });

        const newDocUrls = await Promise.all(uploadPromises);

        // Fetch current document URLs to append to them
        const docSnap = await getDoc(doc(db, 'users', uid));
        const currentUrls = docSnap.data()?.documentURLs || [];
        updateData.documentURLs = [...currentUrls, ...newDocUrls];
      }

      await updateDoc(doc(db, "users", uid), updateData);
      Alert.alert("Success", "Your application has been re-submitted for review.");
      setIsRejected(false);
      setSelectedFiles([]);
    } catch (error: any) {
      console.error("Resubmission error:", error);
      Alert.alert("Failed to Re-submit", error.message || "An error occurred during re-submission.");
    } finally {
      setSubmitting(false);
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

      {loading ? (
        <View style={[styles.body, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : isRejected ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Surface style={styles.card} elevation={2}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
              <MaterialCommunityIcons name="close-circle-outline" size={80} color="#ef4444" />
            </View>

            <Text variant="headlineSmall" style={[styles.title, { color: '#ef4444' }]}>Application Rejected</Text>

            <View style={styles.rejectionReasonBox}>
              <Text style={styles.rejectionReasonTitle}>Admin Feedback:</Text>
              <Text style={styles.rejectionReasonText}>{rejectionMessage}</Text>
            </View>

            <Text variant="bodyMedium" style={styles.sectionSubtitle}>
              Please update your workshop details and re-upload documents if required to improve your application:
            </Text>

            <TextInput
              mode="outlined"
              label="Workshop Name"
              value={workshopName}
              onChangeText={setWorkshopName}
              style={styles.input}
              left={<TextInput.Icon icon="account-outline" color={Colors.light.primary} />}
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

            <Text style={styles.fieldLabel}>Upload New Business License (Optional)</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={selectFile}>
              <Feather name="upload-cloud" size={20} color={Colors.light.primary} />
              <Text style={styles.uploadBtnText}>Choose Business License File</Text>
            </TouchableOpacity>

            {selectedFiles.length > 0 && (
              <View style={styles.filesList}>
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.fileInfoContainer}>
                    <Feather name="file-text" size={18} color="#6366f1" style={{ marginRight: 8 }} />
                    <Text style={styles.fileInfoText} numberOfLines={1}>{file.name}</Text>
                    <TouchableOpacity onPress={() => removeFile(index)} style={{ marginLeft: 'auto' }}>
                      <Feather name="x-circle" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <GradientButton
              title="Re-submit Application"
              onPress={handleResubmit}
              style={styles.button}
              loading={submitting}
            />

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </Surface>
        </ScrollView>
      ) : (
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
      )}
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
  scrollView: {
    flex: 1,
    marginTop: -60,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  rejectionReasonBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  rejectionReasonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 14,
    color: '#b91c1c',
    lineHeight: 20,
  },
  sectionSubtitle: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 10,
  },
  uploadBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
    backgroundColor: '#fff',
    gap: 8,
    marginBottom: 16,
  },
  uploadBtnText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  filesList: {
    width: '100%',
    marginBottom: 20,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileInfoText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
});
