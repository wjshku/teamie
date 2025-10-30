// ==================== Firebase Configuration ====================
// Firebase 初始化和配置

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDC1c-5pkhxJ0LQUDr9yIXxM6esUwxF_OQ",
  authDomain: "teamie-61d5c.firebaseapp.com",
  projectId: "teamie-61d5c",
  storageBucket: "teamie-61d5c.firebasestorage.app",
  messagingSenderId: "415238569171",
  appId: "1:415238569171:web:c5968690da20c1cf9fe826",
  measurementId: "G-8YG2GL66FX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
