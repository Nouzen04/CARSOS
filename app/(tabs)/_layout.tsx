import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, Tabs, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { IconButton, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase';

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
  const [unreadCount, setUnreadCount] = React.useState(0);
  const colorScheme = useColorScheme();
  const [searchPhrase, setSearchPhrase] = React.useState('');
  const [clicked, setClicked] = React.useState(false);

  const insets = useSafeAreaInsets();

  const prevStatusesRef = React.useRef<{ [key: string]: string }>({});

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'service_requests'),
      where('pemanduID', '==', auth.currentUser.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter((doc) => {
        const data = doc.data() as any;
        return !data.dismissedByPemandu && !data.readByPemandu;
      });
      setUnreadCount(unread.length);

      (snapshot.docChanges()).forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data() as any;
          const oldStatus = prevStatusesRef.current[change.doc.id];
          const newStatus = data.status;
          const workshopName = data.workshopName || 'the workshop';

          if (oldStatus && oldStatus !== newStatus) {
            if (newStatus === 'Completed') {
              Alert.alert(
                'Service Completed 🎉',
                `Your service request with ${workshopName} has been completed! Please check your Inbox to rate the workshop.`,
              );
            } else if (newStatus === 'Accepted') {
              Alert.alert(
                'Request Accepted 🔧',
                `${workshopName} has accepted your request and is on their way!`,
              );
            } else if (newStatus === 'Cancelled') {
              Alert.alert(
                'Request Cancelled ⚠️',
                `${workshopName} has cancelled your request. Please try contacting another workshop.`,
              );
            }
          }
        }

        prevStatusesRef.current[change.doc.id] = (change.doc.data() as any).status;
      });

      (snapshot.docs).forEach((doc) => {
        prevStatusesRef.current[doc.id] = (doc.data() as any).status;
      });
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (query: string) => {
    router.setParams({ search: query });
  };

  return (
    <View style={{ flex: 1, pointerEvents: 'box-none', }}>
      <View style={[styles.statusBarBackground, { height: insets.top }]} />
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[(colorScheme ?? 'light') as keyof typeof Colors].tint,
        }}
      >
        <Tabs.Screen
          name="menuP"
          options={{
            headerShown: true,
            headerTitle: '' ,
            headerStyle: { backgroundColor: '#ffffff', height: 100, borderBottomWidth: 0 },
            tabBarLabel: 'Home',
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
                  icon={clicked ? 'close' : 'magnify'}
                  size={22}
                  iconColor={clicked ? '#ef4444' : '#0f172a'}
                  onPress={() => {
                    if (clicked) {
                      setClicked(false);
                      setSearchPhrase('');
                      handleSearch('');
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
            headerLeft: () => (
              <View style={{ paddingLeft: 15 }}>
                <Text style={styles.headerTitle}>CARSOS</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="notificationP"
          options={{
            headerShown: false,
            headerTitle: 'Inbox',
            tabBarLabel: 'Inbox',
            tabBarIcon: ({ color }) => <Feather name="mail" size={24} color={color} />,
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          }}
        />
        <Tabs.Screen
          name="sosP"
          options={{
            headerTitle: 'Emergency',
            tabBarLabel: '',
            tabBarIcon: () => (
              <Surface style={styles.sosIconContainer} elevation={2} pointerEvents="none">
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
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="robot-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bengkelP"
          options={{
            headerTitle: 'Workshop',
            headerShown: false,
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="profileP"
          options={{
            headerTitle: 'Profile',
            headerShown: false,
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    height: 100,
  },
  headerTitle: {
    fontSize: 22,
    color: '#0f172a',
    fontFamily: 'SpaceMono',
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
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 10,
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
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  sosIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: 10,
  },
});