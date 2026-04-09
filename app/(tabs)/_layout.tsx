import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, router, Href } from 'expo-router';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';

interface SearchBarProps {
  clicked: boolean;
  searchPhrase: string;
  setSearchPhrase: (phrase: string) => void;
  onSearch: (query: string) => void;
}

const SearchBar = ({ clicked, searchPhrase, setSearchPhrase, onSearch }: SearchBarProps) => {
  if (!clicked) return null;
  
  return (
    <Surface style={styles.searchBarSurface} elevation={1}>
      <TextInput
        style={styles.input}
        placeholder="Search workshops..."
        placeholderTextColor="#94a3b8"
        value={searchPhrase}
        onChangeText={setSearchPhrase}
        onSubmitEditing={() => onSearch(searchPhrase)}
        autoFocus={true}
        underlineColorAndroid="transparent"
        returnKeyType="search"
      />
    </Surface>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [searchPhrase, setSearchPhrase] = React.useState("");
  const [clicked, setClicked] = React.useState(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setClicked(false);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: useClientOnlyValue(false, true),
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="menuP"
        options={{
          headerTitle: clicked ? '' : 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Feather name="search" size={24} color={color} />,
          headerRight: () => (
            <View style={styles.headerRight}>
              <SearchBar
                clicked={clicked}
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                onSearch={handleSearch}
              />
              <IconButton
                icon={clicked ? "close" : "magnify"}
                size={22}
                iconColor={clicked ? "#ef4444" : "#0f172a"}
                onPress={() => {
                  if (clicked) {
                    setClicked(false);
                    setSearchPhrase("");
                  } else {
                    setClicked(true);
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profileP' as Href)}
                style={styles.profileBtn}
              >
                <Feather name="user" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notificationP"
        options={{
          headerTitle: 'Inbox',
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color }) => <Feather name="mail" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sosP"
        options={{
          headerTitle: 'Assistance',
          tabBarLabel: 'Emergency',
          tabBarIcon: ({ color }) => (
            <Surface style={styles.sosIconContainer} elevation={2}>
              <MaterialCommunityIcons name="alert-octagon" size={24} color="#fff" />
            </Surface>
          ),
        }}
      />
      <Tabs.Screen
        name="aiP"
        options={{
          headerTitle: 'AI Assistant',
          tabBarLabel: 'Support',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="robot-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bengkelP"
        options={{
          headerTitle: 'Workshop',
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="profileP"
        options={{
          headerTitle: 'Settings',
          href: null,
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    height: 100,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#0f172a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
  },
  searchBarSurface: {
    width: 200,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: '#0f172a',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  tabBar: {
    height: 65,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sosIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    borderWidth: 4,
    borderColor: '#fff',
  },
});
