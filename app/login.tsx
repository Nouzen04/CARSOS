import { Href, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TextInput, Text, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase';
import { ModernCard } from '@/components/ModernCard';
import { GradientButton } from '@/components/GradientButton';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (auth.currentUser) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;
            if (role === 'admin') {
              router.replace('/menuA' as Href);
            } else if (role === 'bengkel') {
              router.replace(userData.verified === false ? '/waitingVerification' as Href : '/menuD' as Href);
            } else {
              router.replace('/menuP' as Href);
            }
          }
        } catch (error) {
          console.error("Auto-login error:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    checkUser();
  }, []);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role;

          if (role === 'admin') {
            router.replace('/menuA' as Href);
          } else if (role === 'bengkel') {
            if (userData.verified === false) {
              router.replace('/waitingVerification' as Href);
            } else {
              router.replace('/menuD' as Href);
            }
          } else {
            router.replace('/menuP' as Href);
          }
        } else {
          // If Firestore document doesn't exist, the user hasn't completed sign up
          await auth.signOut();
          Alert.alert('Sign In Failed', 'Your account profile was not found. Please sign up first.');
        }
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert('Sign In Failed', error.message);
    }
  }

  const signUp = () => {
    router.replace('/signup' as Href);
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.secondary]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerContent}>
          <Text variant="displaySmall" style={styles.headerTitle}>CARSOS</Text>
          <Text variant="titleMedium" style={styles.headerSubtitle}>Professional Roadside Assistance</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.body}>
        <ModernCard style={styles.card}>
          <Text variant="headlineSmall" style={styles.formTitle}>Welcome Back</Text>
          <Text variant="bodyMedium" style={styles.formSubtitle}>Sign in to continue</Text>

          <TextInput
            mode="outlined"
            label="Email Address"
            placeholder="example@mail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email-outline" color={Colors.light.primary} />}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock-outline" color={Colors.light.primary} />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
                color={Colors.light.primary} 
              />
            }
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text variant="bodySmall" style={{ color: Colors.light.primary, fontWeight: '600' }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <GradientButton 
            title="Log In" 
            onPress={signIn} 
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <TouchableOpacity onPress={signUp}>
              <Text variant="bodyMedium" style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ModernCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: '35%',
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  body: {
    flex: 1,
    marginTop: -60,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 30,
  },
  formTitle: {
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  formSubtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 5,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signUpLink: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
});
