import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack>
            <Stack.Screen name="menuA" options={{ title: 'Admin Dashboard', headerShown: true, headerLeft: () => null }} />
            <Stack.Screen name="reportDetail" options={{ title: 'Workshop Metrics', headerShown: true }} />
        </Stack>
    );
}
