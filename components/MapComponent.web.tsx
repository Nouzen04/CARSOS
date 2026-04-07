import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

interface MapComponentProps {
    bengkelLocation: { latitude: number, longitude: number };
    driverLocation: { latitude: number, longitude: number } | null;
    bengkelName: string;
}

const MapComponent = ({ bengkelLocation, bengkelName }: MapComponentProps) => {
    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${bengkelLocation.latitude},${bengkelLocation.longitude}`;
        Linking.openURL(url);
    };

    return (
        <View style={styles.webContainer}>
            <Feather name="map" size={40} color="#666" />
            <Text style={styles.webText}>Interactive Map is only available on Mobile</Text>
            <TouchableOpacity style={styles.webButton} onPress={openInGoogleMaps}>
                <Feather name="external-link" size={16} color="white" />
                <Text style={styles.webButtonText}>View Location on Google Maps</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    webContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    webText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    webButton: {
        backgroundColor: '#1a1a1a',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    webButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
});

export default MapComponent;
