import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAjuB00lQF7_h4ID0ISccdwscrISK_M0xQ",
  authDomain: "studio-5407853011-bbe85.firebaseapp.com",
  databaseURL: "https://studio-5407853011-bbe85-default-rtdb.firebaseio.com",
  projectId: "studio-5407853011-bbe85",
  storageBucket: "studio-5407853011-bbe85.firebasestorage.app",
  messagingSenderId: "436509599334",
  appId: "1:436509599334:web:c97de2e06bbc5514152fa7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
