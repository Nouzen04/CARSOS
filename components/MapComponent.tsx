import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapComponentProps {
    bengkelLocation: { latitude: number, longitude: number };
    driverLocation: { latitude: number, longitude: number } | null;
    bengkelName: string;
}

const MapComponent = ({ bengkelLocation, driverLocation, bengkelName }: MapComponentProps) => {
    return (
        <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
                latitude: (bengkelLocation.latitude + (driverLocation?.latitude || bengkelLocation.latitude)) / 2,
                longitude: (bengkelLocation.longitude + (driverLocation?.longitude || bengkelLocation.longitude)) / 2,
                latitudeDelta: Math.abs(bengkelLocation.latitude - (driverLocation?.latitude || bengkelLocation.latitude)) * 2 + 0.01,
                longitudeDelta: Math.abs(bengkelLocation.longitude - (driverLocation?.longitude || bengkelLocation.longitude)) * 2 + 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
        >
            <Marker
                coordinate={{
                    latitude: bengkelLocation.latitude,
                    longitude: bengkelLocation.longitude
                }}
                title={bengkelName}
                pinColor="#E31E24"
            />
            {driverLocation && (
                <Marker
                    coordinate={driverLocation}
                    title="You Are Here"
                    pinColor="#2196F3"
                />
            )}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MapComponent;
