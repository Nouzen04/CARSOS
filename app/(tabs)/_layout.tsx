import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableHighlight, View } from 'react-native';
// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[(colorScheme ?? 'light') as keyof typeof Colors].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="menuP"
        options={{
          headerTitle: 'Hi Pemandu',
          tabBarLabel: 'Home',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'normal',
            color: 'black',
            padding: 4,
          },
          tabBarIcon: () => <Image source={require('../../assets/images/home.png')} style={{ width: 30, height: 30 }} />,
          headerRight: () => (
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() => { }}>
              <View style={styles.searchContainer}>
                <EvilIcons name="search" color="black" size={24} style={{ marginRight: 5 }} />
                <Feather name="user" color="black" size={24} style={{ marginLeft: 5 }} />
              </View>
            </TouchableHighlight>
          ),
        }}
      />
      <Tabs.Screen
        name="notificationP"
        options={{
          headerTitle: 'Notification',
          tabBarLabel: 'Notification',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'normal',
            color: 'black',
            padding: 4,
          },
          tabBarIcon: ({ color }) => <Image source={require('../../assets/images/notification.png')} style={{ width: 30, height: 30 }} />,
        }}
      />
      <Tabs.Screen
        name="sosP"
        options={{
          headerTitle: 'SOS',
          tabBarLabel: 'SOS',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'normal',
            color: 'black',
            padding: 4,
          },
          tabBarIcon: ({ color }) => <Image source={require('../../assets/images/SOS.png')} style={{ width: 30, height: 30 }} />,
        }}
      />
      <Tabs.Screen
        name="aiP"
        options={{
          headerTitle: 'AI',
          tabBarLabel: 'AI',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'normal',
            color: 'black',
            padding: 4,
          },
          tabBarIcon: ({ color }) => <Image source={require('../../assets/images/aichatbot.png')} style={{ width: 30, height: 30 }} />,
        }}
      />
      <Tabs.Screen
        name="bengkelP"
        options={{
          headerTitle: 'Bengkel Details',
          href: null, // Hides the icon from the tab bar
          tabBarStyle: { display: 'none' }, // Hides the tab bar when on this screen
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    padding: 20,
    flexDirection: 'row',
  },
});
