// lib/firebase.ts
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjnGpfYVxi8nJtjtFN5BoExRs_NkoJQcQ",
  authDomain: "carsos-d5055.firebaseapp.com",
  projectId: "carsos-d5055",
  storageBucket: "carsos-d5055.firebasestorage.app",
  messagingSenderId: "611727964818",
  appId: "1:611727964818:android:556a4ba9138755d46c044b"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);