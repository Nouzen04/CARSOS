import Feather from '@expo/vector-icons/Feather';
import { Checkbox } from 'expo-checkbox';
import { Href, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, GeoPoint } from "firebase/firestore";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, ScrollView } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebase";
import { getCurrentLocation, toGeoPoint } from "../utils/mapService";

interface Service {
    id: number;
    name: string;
    icon: string;
}

export default function signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [workshopName, setWorkshopName] = useState('');
    const [address, setAddress] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [facilities, setFacilities] = useState('');
    const [description, setDescription] = useState('');
    const [role, setRole] = useState(null);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: 'Pemandu', value: 'pemandu' },
        { label: 'Bengkel', value: 'bengkel' }
    ]);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);

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
            Alert.alert("Error", "Please fill in all required fields and select a role.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user) {
                // Save user data to Firestore
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
                
                // Role-based navigation
                if (role === 'bengkel') {
                    router.replace('/(bengkel)/menuD' as Href);
                } else if (role === 'admin') {
                    router.replace('/(admin)/menuA' as Href);
                } else {
                    router.replace('/(tabs)/menuP' as Href);
                }
            }
        } catch (error: any) {
            console.log(error);
            Alert.alert('Sign Up Failed', error.message);
        }
    }

    const SERVICE = [
        { id: 1, name: 'Full Service', icon: 'settings' },
        { id: 2, name: 'Tire Change', icon: 'disc' },
        { id: 3, name: 'Brake Repair', icon: 'tool' },
        { id: 4, name: 'Engine Tune', icon: 'activity' },
        { id: 5, name: 'Oil Service', icon: 'droplet' },
        { id: 6, name: 'Aircond', icon: 'wind' }
    ]

    const pemandu = () => {
        return (
            <SafeAreaView>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone No"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
                <TouchableOpacity style={styles.Button} onPress={signUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    const bengkel = () => {
        return (
            <SafeAreaView >
                <TextInput
                    style={styles.input}
                    placeholder="Workshop Name"
                    value={workshopName}
                    onChangeText={setWorkshopName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone No"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="Address"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                />
                 <TouchableOpacity 
                    style={[styles.locationButton, location ? { backgroundColor: '#4CAF50' } : null]} 
                    onPress={handleGetLocation}
                    disabled={loadingLocation}
                >
                    {loadingLocation ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Feather name="map-pin" size={18} color="white" />
                            <Text style={styles.locationButtonText}>
                                {location ? "Location Captured" : "Use My Current Location"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
                <Text style={styles.label}>Service Types</Text>
                <View style={styles.servicesGrid}>
                    {SERVICE.map((item: Service) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.serviceItem}
                            onPress={() => toggleService(item.id)}
                        >
                            <Checkbox
                                value={selectedServices.includes(item.id)}
                                onValueChange={() => toggleService(item.id)}
                                color={selectedServices.includes(item.id) ? '#4630EB' : undefined}
                                style={styles.checkbox}
                            />
                            <Feather name={item.icon as any} size={18} color="#333" style={{ marginLeft: 8 }} />
                            <Text style={styles.serviceLabel}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Facilities"
                    value={facilities}
                    onChangeText={setFacilities}
                />
                <TextInput
                    style={[styles.input, { height: 100 }]}
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
                <TouchableOpacity style={styles.Button} onPress={signUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome to CARSOS</Text>
                <Text style={styles.subtitle}>Please sign up</Text>
                <DropDownPicker
                    open={open}
                    value={role}
                    items={items}
                    setOpen={setOpen}
                    setValue={setRole}
                    setItems={setItems}
                    placeholder="Select Role"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    zIndex={1000}
                />

                {role === 'pemandu' && pemandu()}
                {role === 'bengkel' && <ScrollView showsVerticalScrollIndicator={false}>{bengkel()}</ScrollView>}

                <View style={styles.signUpSection}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.replace('/login' as Href)}>
                        <Text style={styles.signUp}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    dropdown: {
        width: '90%',
        height: 50,
        borderColor: '#aaa9a9ff',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: '#fafafa',
        alignSelf: 'center',
    },
    dropdownContainer: {
        width: '90%',
        borderColor: '#aaa9a9ff',
        borderWidth: 1,
        backgroundColor: '#fafafa',
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8ff',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8ff',
    },
    signUpSection: {
        position: 'relative',
        marginTop: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signUp: {
        color: '#371dffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    footerText: {
        color: '#000000',
        fontSize: 14,
        marginRight: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        alignSelf: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        position: 'relative',
        alignSelf: 'center',
    },
    label: {
        fontSize: 16,
        color: '#000000',
        marginBottom: 8,
        textAlign: 'left',
        marginLeft: 4,
    },
    input: {
        width: '90%',
        height: 50,
        borderColor: '#aaa9a9ff',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: '#fafafa',
        alignSelf: 'center',
    },
    Button: {
        backgroundColor: '#8baaffff',
        padding: 15,
        borderRadius: 50,
        width: '50%',
        alignSelf: 'center',
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
        alignSelf: 'center',
    },
    choice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
        gap: 10,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 10,
        minWidth: '45%',
    },
    checkbox: {
        width: 20,
        height: 20,
    },
    serviceLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    locationButton: {
        backgroundColor: '#4630EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        width: '90%',
        alignSelf: 'center',
        marginBottom: 15,
        gap: 8,
    },
    locationButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

});