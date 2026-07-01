import { WorkshopImage } from '@/components/WorkshopImage';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapComponent from '../../components/MapComponent';
import { auth, db } from '../../firebase';
import { formatDistance, getDirectionsUrl, getDistance, getGoogleMapsUrl } from '../../utils/mapService';

const { width } = Dimensions.get('window');

export const SERVICES = [
    { id: 1, name: 'Full Service', icon: 'settings' },
    { id: 2, name: 'Tire Change', icon: 'disc' },
    { id: 3, name: 'Brake Repair', icon: 'tool' },
    { id: 4, name: 'Engine Tune', icon: 'activity' },
    { id: 5, name: 'Oil Service', icon: 'droplet' },
    { id: 6, name: 'Aircond', icon: 'wind' }
];

export default function infoBengkel() {
    const params = useLocalSearchParams();
    const workshopId = params.id as string || 'SNSService123'; // Fallback for testing

    const [bengkelData, setBengkelData] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBengkelData();
        getDriverLocation();
    }, [workshopId]);

    const fetchBengkelData = async () => {
        try {
            const docRef = doc(db, 'users', workshopId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setBengkelData(docSnap.data());
            } else {
                Alert.alert("Error", "Workshop data not found.");
                router.back();
            }
        } catch (error) {
            console.error("Error fetching bengkel:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDriverLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const loc = await Location.getCurrentPositionAsync({});
            setDriverLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });
        } catch (error) {
            console.error("Error getting driver location:", error);
        }
    };

    useEffect(() => {
        if (driverLocation && bengkelData?.location) {
            const dist = getDistance(driverLocation, {
                latitude: bengkelData.location.latitude,
                longitude: bengkelData.location.longitude
            });
            setDistance(dist);
        }
    }, [driverLocation, bengkelData]);

    const createServiceRequest = async (contactMethod: 'call' | 'whatsapp') => {
        if (!auth.currentUser) {
            Alert.alert("Login Required", "Please sign in to request assistance.");
            return;
        }

        try {
            // Fetch driver's phone number from their profile
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();

            await addDoc(collection(db, 'service_requests'), {
                pemanduID: auth.currentUser.uid,
                bengkelID: workshopId,
                workshopName: bengkelData?.name || 'SNS Service',
                status: 'Pending',
                contactMethod: contactMethod,
                timestamp: serverTimestamp(),
                pemanduName: auth.currentUser.displayName || userData?.name || 'Guest Driver',
                pemanduPhone: userData?.phone || '',
                pemanduLocation: driverLocation, // Driver's current location
            });
            console.log("Service request created automatically via " + contactMethod);
        } catch (error) {
            console.error("Error creating service request:", error);
        }
    };

    const handleCall = async () => {
        const number = bengkelData?.phone;
        await createServiceRequest('call');
        Linking.openURL('tel:+60' + number);
    };

    const handleDirections = () => {
        if (bengkelData?.location) {
            const url = driverLocation
                ? getDirectionsUrl(driverLocation, { latitude: bengkelData.location.latitude, longitude: bengkelData.location.longitude })
                : getGoogleMapsUrl(bengkelData.location.latitude, bengkelData.location.longitude, bengkelData.name);
            Linking.openURL(url);
        } else {
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bengkelData.address)}`);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#E31E24" />
            </View>
        );
    }

    const handleWhatsApp = async () => {
        const number = bengkelData?.phone;
        const name = bengkelData?.name;
        await createServiceRequest('whatsapp');
        Linking.openURL('whatsapp://send?phone=+60' + number + '&text=Hello ' + name + ', I need assistance with my car.');
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
                <WorkshopImage
                    profilePicture={bengkelData?.profilePicture}
                    workshopId={workshopId}
                    style={styles.headerImage}
                    resizeMode="cover"
                />
                <TouchableOpacity style={styles.backButton} onPress={() => { router.back() }}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Title and Rating */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{bengkelData?.name}</Text>
                    <View style={styles.ratingContainer}>
                        <Feather name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{bengkelData?.rating || '0.0'} <Text style={styles.reviewCount}>({bengkelData?.reviewCount || '0'} reviews)</Text></Text>
                    </View>
                </View>

                {/* Quick Info Tags */}
                <View style={styles.tagContainer}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{distance ? formatDistance(distance) : 'Calculating...'} away</Text>
                    </View>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{bengkelData?.verified ? 'Verified' : 'Unverified'}</Text>
                    </View>
                </View>

                {/* Location and Hours */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <Feather name="map-pin" size={18} color="#E31E24" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.infoValue}>{bengkelData?.address}</Text>
                        </View>
                    </View>

                    {/* Map Integration */}
                    {bengkelData?.location && (
                        <View style={styles.mapSection}>
                            <MapComponent
                                bengkelLocation={{
                                    latitude: bengkelData.location.latitude,
                                    longitude: bengkelData.location.longitude
                                }}
                                driverLocation={driverLocation}
                                bengkelName={bengkelData.name}
                            />
                        </View>
                    )}

                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <Feather name="clock" size={18} color="#2196F3" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Operating Hours</Text>
                            <Text style={styles.infoValue}>Mon - Sat: 9:00 AM - 6:00 PM</Text>
                            <Text style={[styles.infoValue, { color: '#666', fontSize: 13 }]}>Sunday: Closed</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About this Workshop</Text>
                    <Text style={styles.description}>
                        {bengkelData?.description}
                    </Text>
                </View>

                {/* Services List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services Offered</Text>
                    <View style={styles.servicesGrid}>
                        {SERVICES.filter(service => (bengkelData?.selectedServices || []).includes(service.id)).map((item: any, index: number) => (
                            <View key={index} style={styles.serviceItem}>
                                <Feather name={item.icon as any} size={20} color="#333" />
                                <Text style={[styles.serviceName, {marginTop: 8}]}>{item.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Facilities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Facilities</Text>
                    <View style={styles.servicesGrid}>
                        {(Array.isArray(bengkelData?.facilities)
                            ? bengkelData.facilities
                            : (typeof bengkelData?.facilities === 'string'
                                ? bengkelData.facilities.split(',').map((s: string) => s.trim())
                                : [])
                        ).map((facility: string, index: number) => (
                            <View key={index} style={styles.facilityItem}>
                                <Feather name="check-circle" size={14} color="#4CAF50"  />
                                <Text style={styles.serviceName}>{facility}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Bottom Action Bar */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleWhatsApp}>
                    <FontAwesome5 name="whatsapp" size={20} color="#25D366" />
                    <Text style={[styles.footerButtonText, { color: '#333' }]}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.callActionButton} onPress={handleCall}>
                    <Feather name="phone" size={20} color="white" />
                    <Text style={styles.footerButtonText}>Call Workshop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.directionActionButton} onPress={handleDirections}>
                    <MaterialCommunityIcons name="map-search-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 350, // Increased height
    },
    headerImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 8,
    },
    content: {
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#001453',
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9C4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    reviewCount: {
        fontWeight: 'normal',
        color: '#666',
        fontSize: 12,
    },
    tagContainer: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    tag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagText: {
        fontSize: 12,
        color: '#475273',
        fontWeight: '500',
    },
    infoSection: {
        marginTop: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
        marginTop: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        backgroundColor: 'white',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#475273',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    mapSection: {
        height: 180,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#b7b7b7ff',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    section: {
        marginTop: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#001453',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    facilityItem: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#3ad4ff0a',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#3755c318',   
    },
    serviceItem: {
        width: (width - 64) / 3,
        backgroundColor: '#3ad4ff0a',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3755c318',   
    },
    serviceName: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    photoList: {
        marginTop: 8,
    },
    smallPhoto: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    footer: {
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 30,
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    callActionButton: {
        flex: 2,
        backgroundColor: '#1a1a1a',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    directionActionButton: {
        width: 52,
        backgroundColor: '#E31E24',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
    },
    footerButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
