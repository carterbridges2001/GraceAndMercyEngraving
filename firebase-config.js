// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDw38zs4pTPk0apvurKCVjFr16TbnDNNw4",
  authDomain: "graceandmercy-c2b13.firebaseapp.com",
  projectId: "graceandmercy-c2b13",
  storageBucket: "graceandmercy-c2b13.firebasestorage.app",
  messagingSenderId: "592238884802",
  appId: "1:592238884802:web:9ccf17b299230d25d0c85b",
  measurementId: "G-P94EQBYY7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the Firebase services
export { 
  auth, 
  db, 
  storage, 
  signInWithEmailAndPassword, 
  signOut,
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  ref, 
  uploadBytes, 
  getDownloadURL 
};
