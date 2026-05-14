import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { Href, router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db, storage } from '../../firebase';

export default function BengkelProfile() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editableDescription, setEditableDescription] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setEditableDescription(data.description || '');
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            Alert.alert("Error", "Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        if (!auth.currentUser) return;

        try {
            setUploading(true);
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `workshop_profiles/${auth.currentUser.uid}.jpg`);

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                profilePicture: downloadURL
            });

            setUserData((prev: any) => ({ ...prev, profilePicture: downloadURL }));
            Alert.alert("Success", "Profile picture updated successfully!");
        } catch (error) {
            console.error("Error uploading image:", error);
            Alert.alert("Error", "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const saveDescription = async () => {
        if (!auth.currentUser) return;

        try {
            setLoading(true);
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                description: editableDescription
            });
            setUserData((prev: any) => ({ ...prev, description: editableDescription }));
            setIsEditingDescription(false);
            Alert.alert("Success", "Description updated successfully!");
        } catch (error) {
            console.error("Error saving description:", error);
            Alert.alert("Error", "Failed to update description.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out from Bengkel mode?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            router.replace('/login' as Href);
                        } catch (error) {
                            Alert.alert("Error", "Failed to log out.");
                        }
                    }
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4630EB" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}>
            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.avatarWrapper}
                            onPress={pickImage}
                            disabled={uploading}
                        >
                            <View style={styles.avatarContainer}>
                                {uploading ? (
                                    <ActivityIndicator color="#4630EB" />
                                ) : userData?.profilePicture ? (
                                    <Image
                                        source={{ uri: userData.profilePicture }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Feather name="settings" size={50} color="#666" />
                                )}
                            </View>
                            <View style={styles.editBadge}>
                                <Feather name="camera" size={14} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.name}>{userData?.name || 'Workshop Name'}</Text>
                        <Text style={styles.role}>Workshop Account</Text>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Workshop Information</Text>

                        <View style={styles.infoRow}>
                            <Feather name="mail" size={20} color="#666" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{userData?.email}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Feather name="phone" size={20} color="#666" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <Text style={styles.infoValue}>{userData?.phone || 'Not provided'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Feather name="map-pin" size={20} color="#666" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Address</Text>
                                <Text style={styles.infoValue}>{userData?.address || 'Not provided'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Business Description</Text>
                            <TouchableOpacity onPress={() => {
                                if (isEditingDescription) {
                                    saveDescription();
                                } else {
                                    setIsEditingDescription(true);
                                }
                            }}>
                                <Feather name={isEditingDescription ? "check" : "edit-2"} size={18} color="#6366f1" />
                            </TouchableOpacity>
                        </View>

                        {isEditingDescription ? (
                            <TextInput
                                mode="outlined"
                                value={editableDescription}
                                onChangeText={setEditableDescription}
                                multiline
                                numberOfLines={4}
                                style={styles.editInput}
                            />
                        ) : (
                            <Text style={styles.descriptionText}>{userData?.description || 'No description provided.'}</Text>
                        )}
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Feather name="log-out" size={20} color="#FF4B4B" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 15,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4630EB',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    role: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoSection: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    editInput: {
        backgroundColor: '#fff',
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoContent: {
        marginLeft: 15,
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#999',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    descriptionText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderWidth: 1,
        padding: 15,
        borderRadius: 15,
        gap: 10,
        marginBottom: 30,
    },
    logoutText: {
        color: '#FF4B4B',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
