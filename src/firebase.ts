// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAZEy-9uo4BT0x4mMPlI9HgKvn8yhDNgcE',
  authDomain: 'vuelapp-fd261.firebaseapp.com',
  projectId: 'vuelapp-fd261',
  storageBucket: 'vuelapp-fd261.firebasestorage.app',
  messagingSenderId: '317272230186',
  appId: '1:317272230186:web:a139ec3f97e074d378b653',
  measurementId: 'G-XF1WFNNE0J',
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta Firestore
export const db = getFirestore(app);
