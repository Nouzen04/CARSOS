import Feather from '@expo/vector-icons/Feather';
import { Component, ReactNode } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapComponentProps {
    bengkelLocation: { latitude: number; longitude: number };
    driverLocation?: { latitude: number; longitude: number } | null;
    bengkelName?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class MapErrorBoundary extends Component<{ children: ReactNode; bengkelLocation: any }, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.warn('MapComponent Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const loc = this.props.bengkelLocation;
            return (
                <View style={styles.fallbackContainer}>
                    <Feather name="map-pin" size={32} color="#6366f1" />
                    <Text style={styles.fallbackText}>Map Preview</Text>
                    {loc?.latitude && loc?.longitude && (
                        <TouchableOpacity
                            style={styles.fallbackButton}
                            onPress={() => {
                                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`);
                            }}
                        >
                            <Text style={styles.fallbackButtonText}>Open in Google Maps</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }
        return this.props.children;
    }
}

const MapComponentInner = ({ bengkelLocation, driverLocation, bengkelName }: MapComponentProps) => {
    const isValidNum = (val: any): val is number => typeof val === 'number' && !isNaN(val) && isFinite(val);

    const bLat = Number(bengkelLocation?.latitude);
    const bLng = Number(bengkelLocation?.longitude);

    if (!isValidNum(bLat) || !isValidNum(bLng)) {
        return (
            <View style={styles.fallbackContainer}>
                <Feather name="map-pin" size={28} color="#94a3b8" />
                <Text style={styles.fallbackText}>Location coordinates unavailable</Text>
            </View>
        );
    }

    const dLat = driverLocation && isValidNum(Number(driverLocation.latitude)) ? Number(driverLocation.latitude) : null;
    const dLng = driverLocation && isValidNum(Number(driverLocation.longitude)) ? Number(driverLocation.longitude) : null;

    const targetLat = dLat !== null ? (bLat + dLat) / 2 : bLat;
    const targetLng = dLng !== null ? (bLng + dLng) / 2 : bLng;
    const latDelta = dLat !== null ? Math.max(Math.abs(bLat - dLat) * 2, 0.01) : 0.01;
    const lngDelta = dLng !== null ? Math.max(Math.abs(bLng - dLng) * 2, 0.01) : 0.01;

    return (
        <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
                latitude: targetLat,
                longitude: targetLng,
                latitudeDelta: latDelta,
                longitudeDelta: lngDelta,
            }}
            scrollEnabled={true}
            zoomEnabled={false}
            loadingEnabled={true}
        >
            <Marker
                coordinate={{ latitude: bLat, longitude: bLng }}
                title={bengkelName || 'Workshop'}
                pinColor="#E31E24"
                tracksViewChanges={false}
            />
            {dLat !== null && dLng !== null && (
                <Marker
                    coordinate={{ latitude: dLat, longitude: dLng }}
                    title="Driver is here!"
                    pinColor="#2196F3"
                    tracksViewChanges={false}
                />
            )}
        </MapView>
    );
};

export default function MapComponent(props: MapComponentProps) {
    return (
        <MapErrorBoundary bengkelLocation={props.bengkelLocation}>
            <MapComponentInner {...props} />
        </MapErrorBoundary>
    );
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    fallbackContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    fallbackText: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 6,
        fontWeight: '500',
    },
    fallbackButton: {
        marginTop: 10,
        backgroundColor: '#6366f1',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    fallbackButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
});
