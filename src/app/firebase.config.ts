import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDxsL-10S8hOqhCM-MLjmElZ1KaXyz9hgU',
  authDomain: 'seedha-bazaar.firebaseapp.com',
  projectId: 'seedha-bazaar',
  storageBucket: 'seedha-bazaar.firebasestorage.app',
  messagingSenderId: '293845640799',
  appId: '1:293845640799:web:0f960dc150b1ccaa10ddea',
  measurementId: 'G-EV010CT8ZB',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
