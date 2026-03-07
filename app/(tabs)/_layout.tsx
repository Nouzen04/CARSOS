import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

interface SearchBarProps {
  clicked: boolean;
  searchPhrase: string;
  setSearchPhrase: (phrase: string) => void;
  onSearch: (query: string) => void;
}

const SearchBar = ({ clicked, searchPhrase, setSearchPhrase, onSearch }: SearchBarProps) => {
  return (
    <View style={clicked ? styles.searchBar__expanded : styles.searchBar__collapsed}>
      {clicked && (
        <TextInput
          style={[styles.input, { outlineStyle: 'none' } as any]}
          placeholder="Search for everything..."
          placeholderTextColor="#999"
          value={searchPhrase}
          onChangeText={setSearchPhrase}
          onSubmitEditing={() => onSearch(searchPhrase)}
          autoFocus={true}
          underlineColorAndroid="transparent"
          returnKeyType="search"
        />
      )}
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [searchPhrase, setSearchPhrase] = React.useState("");
  const [clicked, setClicked] = React.useState(false);

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // You can add navigation or filtering logic here
    if (query.trim()) {
      // Example: router.push(`/(tabs)/search?q=${query}`)
      setClicked(false);
    }
  };

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
          headerTitle: clicked ? '' : 'Hi Pemandu',
          tabBarLabel: 'Home',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'normal',
            color: 'black',
            padding: 4,
          },
          tabBarIcon: () => <Image source={require('../../assets/images/home.png')} style={{ width: 30, height: 30 }} />,
          headerRight: () => (
            <View style={styles.headerRight}>
              <SearchBar
                clicked={clicked}
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                onSearch={handleSearch}
              />
              {clicked && (
                //this is for penambahan search icon untuk search
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSearch(searchPhrase)}
                  style={styles.iconButton}
                >
                  <Feather name="search" size={22} color="#333" />
                </TouchableOpacity>
              )}
              {/* this is for close icon untuk close search dan dia akan tukar search icon kepada close icon */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (clicked) {
                    setClicked(false);
                    setSearchPhrase("");
                  } else {
                    setClicked(true);
                  }
                }}
                style={styles.iconButton}
              >
                <Feather
                  name={clicked ? "x" : "search"}
                  size={22}
                  color={clicked ? "#FF4B4B" : "#333"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => { /* router.push() */ }}
                style={styles.iconButton}
              >
                <Feather name={"user"} size={22} color={"#333"} />
              </TouchableOpacity>
            </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginLeft: 10,
  },
  searchBar__expanded: {
    width: 180,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    // Removed borderWidth and borderColor to get rid of the lines
    // Subtle shadow remains for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar__collapsed: {
    width: 0,
    overflow: 'hidden',
  },
  input: {
    width: 150,
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
  },
});
