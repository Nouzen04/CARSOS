import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme
} from 'react-native-paper';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter, useSegments } from 'expo-router';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const { LightTheme: NavLightTheme, DarkTheme: NavDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CustomPaperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.primary,
    secondary: Colors.light.secondary,
    tertiary: Colors.light.accent,
    background: Colors.light.background,
    surface: Colors.light.surface,
  },
};

const CustomPaperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.primary,
    secondary: Colors.dark.secondary,
    tertiary: Colors.dark.accent,
    background: Colors.dark.background,
    surface: Colors.dark.surface,
  },
};

const CustomNavLightTheme = {
  ...NavLightTheme,
  colors: {
    ...NavLightTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.tabIconDefault,
    notification: Colors.light.accent,
  },
};

const CustomNavDarkTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.tabIconDefault,
    notification: Colors.dark.accent,
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
})

function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

export default RootLayout;

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? CustomPaperDarkTheme : CustomPaperLightTheme;
  const navTheme = colorScheme === 'dark' ? CustomNavDarkTheme : CustomNavLightTheme;
  
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === '(bengkel)' || segments[0] === '(admin)' || segments[0] === 'waitingVerification';

    if (!user && inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected routes
      router.replace('/login');
    }
  }, [user, segments, initializing]);

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme as any}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(bengkel)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="waitingVerification" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
