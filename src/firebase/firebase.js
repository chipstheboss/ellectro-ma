// Import Firebase
import { initializeApp } from "firebase/app";

// Firestore (database)
import { getFirestore } from "firebase/firestore";

// Authentication (admin login)
import { getAuth } from "firebase/auth";

// Storage (product images)
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM_17rRyviCM_a293bXlZpKHpykEWeJrY",
  authDomain: "ellectro-ma.firebaseapp.com",
  projectId: "ellectro-ma",
  storageBucket: "ellectro-ma.firebasestorage.app",
  messagingSenderId: "1034161358025",
  appId: "1:1034161358025:web:c10eb3322bf2b5baa4f918",
  measurementId: "G-CY2XY1JBE6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);     // database
export const auth = getAuth(app);        // authentication
export const storage = getStorage(app);  // images storage

export default app;