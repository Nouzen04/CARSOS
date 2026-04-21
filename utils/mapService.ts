import * as Location from 'expo-location';
import { GeoPoint } from 'firebase/firestore';

export interface Coords {
    latitude: number;
    longitude: number;
}

/**
 * MapService — utility class matching the class diagram
 * Handles all location/map logic so screens stay clean
 */

/** Request permission and get the device's current GPS coordinates */
export async function getCurrentLocation(): Promise<Coords | null> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        return null;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
    };
}

/** Convert a Coords object to a Firestore GeoPoint for storage */
export function toGeoPoint(coords: Coords): GeoPoint {
    return new GeoPoint(coords.latitude, coords.longitude);
}

/** Convert coordinates to a human-readable address string */
export async function getAddressFromCoords(coords: Coords): Promise<string> {
    try {
        const address = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude
        });

        if (address && address.length > 0) {
            const item = address[0];
            const street = item.street || item.name || "";
            const city = item.city || item.district || "";
            const region = item.region || "";
            
            return `${street}${street ? ", " : ""}${city}${city ? ", " : ""}${region}`.trim() || "Address not found";
        }
        return "Address not found";
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return "Address lookup failed";
    }
}

/** Convert a Firestore GeoPoint back to a plain Coords object */
export function fromGeoPoint(geoPoint: { latitude: number; longitude: number }): Coords {
    return {
        latitude: geoPoint.latitude,
        longitude: geoPoint.longitude,
    };
}

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in kilometres — no external API needed.
 */
export function getDistance(from: Coords, to: Coords): number {
    const R = 6371; // Earth radius in km
    const dLat = (to.latitude - from.latitude) * (Math.PI / 180);
    const dLon = (to.longitude - from.longitude) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(from.latitude * (Math.PI / 180)) *
        Math.cos(to.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
}

/** Format a distance number nicely, e.g. "1.2 km" or "800 m" */
export function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km} km`;
}

/**
 * Filter a list of bengkels to only those within a given radius (km).
 * Each bengkel must have a { location: { latitude, longitude } } field.
 */
export function findNearbyBengkel(
    driverPos: Coords,
    bengkels: any[],
    radiusKm: number = 20
): any[] {
    return bengkels.filter(b => {
        if (!b.location?.latitude || !b.location?.longitude) return false;
        const dist = getDistance(driverPos, {
            latitude: b.location.latitude,
            longitude: b.location.longitude,
        });
        return dist <= radiusKm;
    });
}

/** Build a Google Maps deep-link URL from coordinates */
export function getGoogleMapsUrl(lat: number, lng: number, label?: string): string {
    const encoded = label ? encodeURIComponent(label) : '';
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encoded}`;
}

/** Build a Google Maps directions URL from origin to destination */
export function getDirectionsUrl(from: Coords, to: Coords): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&travelmode=driving`;
}
