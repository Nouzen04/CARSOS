import { Href, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebase';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8ff',
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8ff',
  },
  loginSection: {
    position: 'absolute',
    bottom: 200, // Distance from the bottom
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  login: {
    color: '#371dffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#000000',
    fontSize: 14,
    marginRight: 10,
  },
  title: {
    position: 'absolute',
    alignItems: 'center',
    top: 100,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#fafafa',
  },
  Button: {
    backgroundColor: '#8baaffff',
    padding: 15,
    borderRadius: 50,
    width: '50%',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
  },

});

export default function loginsignup() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Fetch user data for role-based navigation
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role;

          if (role === 'admin') {
            router.replace('/(admin)/menuA' as Href);
          } else if (role === 'bengkel') {
            router.replace('/(bengkel)/menuD' as Href);
          } else {
            // Default to pemandu (tabs)
            router.replace('/(tabs)/menuP' as Href);
          }
        } else {
          // If no doc exists, default to tabs
          router.replace('/(tabs)/menuP' as Href);
        }
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert('Sign In Failed', error.message);
    }
  }

  const signUp = async () => {
    try {
      router.replace('/signup' as Href);
    } catch (error: any) {
      console.log(error)
      alert('Sign Up Failed: ' + error.message)
    }
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome to CARSOS</Text>
        <Text style={styles.subtitle}>Please login </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.Button} onPress={signIn}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

        {/* This section is now pinned to the bottom */}
        <View style={styles.loginSection}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={signUp}>
            <Text style={styles.login}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
