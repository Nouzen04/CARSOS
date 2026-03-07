import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

export default function infoBengkel() {
    const handleCall = () => {
        Linking.openURL('tel:+60123456789'); // Example number
    };

    const handleDirections = () => {
        // Open Google Maps
        Linking.openURL('https://www.google.com/maps/search/?api=1&query=SNS+Service+Workshop');
    };

    const handleWhatsApp = () => {
        Linking.openURL('whatsapp://send?phone=+60123456789&text=Hello SNS Service, I need assistance with my car.');
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('../../assets/images/benkel.png')}
                    style={styles.headerImage}
                />
                <TouchableOpacity style={styles.backButton} onPress={() => { router.back() }}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Title and Rating */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>SNS Service</Text>
                    <View style={styles.ratingContainer}>
                        <Feather name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>4.8 <Text style={styles.reviewCount}>(120 reviews)</Text></Text>
                    </View>
                </View>

                {/* Quick Info Tags */}
                <View style={styles.tagContainer}>
                    <View style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={[styles.tagText, { color: '#4CAF50' }]}>Open Now</Text>
                    </View>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>12 min away</Text>
                    </View>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>Verified</Text>
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
                            <Text style={styles.infoValue}>No. 12, Jalan Industrial 1/1, Taman Perindustrian Utama, 47100 Puchong, Selangor</Text>
                        </View>
                    </View>

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
                        Professional car maintenance and repair services with over 15 years of experience. We specialize in engine diagnostics, major servicing, and suspension work for all major car brands.
                    </Text>
                </View>

                {/* Services List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services Offered</Text>
                    <View style={styles.servicesGrid}>
                        {[
                            { name: 'Full Service', icon: 'settings' },
                            { name: 'Tire Change', icon: 'disc' },
                            { name: 'Brake Repair', icon: 'tool' },
                            { name: 'Engine Tune', icon: 'activity' },
                            { name: 'Oil Service', icon: 'droplet' },
                            { name: 'Aircond', icon: 'wind' }
                        ].map((item, index) => (
                            <View key={index} style={styles.serviceItem}>
                                <Feather name={item.icon as any} size={20} color="#333" />
                                <Text style={styles.serviceName}>{item.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Facilities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Facilities</Text>
                    <View style={styles.facilitiesRow}>
                        <View style={styles.facility}>
                            <Feather name="wifi" size={16} color="#666" />
                            <Text style={styles.facilityText}>Free WiFi</Text>
                        </View>
                        <View style={styles.facility}>
                            <Feather name="coffee" size={16} color="#666" />
                            <Text style={styles.facilityText}>Lounge</Text>
                        </View>
                        <View style={styles.facility}>
                            <Feather name="thermometer" size={16} color="#666" />
                            <Text style={styles.facilityText}>Aircond Room</Text>
                        </View>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 350, // Increased height
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // Changed to contain so you see the whole picture
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
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 100, // Space for footer
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a1a',
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
        color: '#666',
        fontWeight: '500',
    },
    infoSection: {
        marginTop: 24,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 16,
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
        color: '#888',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
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
        justifyContent: 'space-between',
    },
    serviceItem: {
        width: (width - 64) / 3,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    serviceName: {
        fontSize: 12,
        marginTop: 8,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    facilitiesRow: {
        flexDirection: 'row',
        gap: 16,
    },
    facility: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    facilityText: {
        fontSize: 13,
        color: '#666',
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 30,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
