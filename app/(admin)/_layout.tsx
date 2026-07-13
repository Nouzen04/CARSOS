import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminLayout() {
    const insets = useSafeAreaInsets();
    return (
        <>
        <Stack>
            <Stack.Screen name="menuA" options={{ title: 'Admin Dashboard', headerShown: false, headerLeft: () => null }} />
            <Stack.Screen name="reportDetail" options={{ title: 'Workshop Metrics', headerShown: true }} />
        </Stack>
        <BlurView
                intensity={10}
                tint="light"
                style={[styles.statusBarBackground, { height: insets.top }]}
            />
            <StatusBar style="dark" />
        </>
    );
}

const styles = StyleSheet.create({
    statusBarBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
});