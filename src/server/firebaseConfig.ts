// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage'
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC34me74fOS0QivEkeKOFQgAT8raRXl5-M",
  authDomain: "hizitickets.firebaseapp.com",
  projectId: "hizitickets",
  storageBucket: "hizitickets.appspot.com",
  messagingSenderId: "936680876554",
  appId: "1:936680876554:web:2a16d69aaa0a4a07bd8df3",
  measurementId: "G-GZYL7NX3CN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export default storage;
