import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function BengkelLayout() {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1 }}>
            <BlurView
                intensity={10}
                tint="light"
                style={[styles.statusBarBackground, { height: insets.top }]}
            />
            <StatusBar style="dark" />
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors[(colorScheme ?? 'light') as keyof typeof Colors].tint,
                }}>
                <Tabs.Screen
                    name="menuD"
                    options={{
                        headerShown: false,
                        title: 'Home',
                        tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        headerShown: false,
                        title: 'Profile',
                        tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
                    }}
                />
            </Tabs>
        </View>
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