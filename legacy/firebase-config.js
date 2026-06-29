import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdCrteuZ5LaPN7aagBI4ul6gDaz72L9i0",
  authDomain: "hotel-kurdistan.firebaseapp.com",
  databaseURL: "https://hotel-kurdistan-default-rtdb.firebaseio.com",
  projectId: "hotel-kurdistan",
  storageBucket: "hotel-kurdistan.firebasestorage.app",
  messagingSenderId: "952840390961",
  appId: "1:952840390961:web:4952c4eebd11020a7ec810",
  measurementId: "G-R62G145SD3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);