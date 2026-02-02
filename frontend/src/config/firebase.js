import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBSPrbhg1yn08bj2l_yOMbBT9QMZ1VzhbM",
  authDomain: "gaess-notes-app.firebaseapp.com",
  projectId: "gaess-notes-app",
  storageBucket: "gaess-notes-app.firebasestorage.app",
  messagingSenderId: "463200071910",
  appId: "1:463200071910:web:a4ee944645b9a993568b27",
  measurementId: "G-B0LXW9605G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;