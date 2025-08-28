import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxpiorYRdOXPGjRXcMqE_y4gno9d8bfqY",
  authDomain: "healthcharityapp.firebaseapp.com",
  projectId: "healthcharityapp",
  storageBucket: "healthcharityapp.appspot.com",
  messagingSenderId: "34171229261",
  appId: "1:34171229261:web:61a0b9fcebb6ca7d2e3804"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
