import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARO0gIxWfz2wDYV5tYFvWjEKEzsgXhBgY",
  authDomain: "tarefasplus-12191.firebaseapp.com",
  projectId: "tarefasplus-12191",
  storageBucket: "tarefasplus-12191.firebasestorage.app",
  messagingSenderId: "617595449687",
  appId: "1:617595449687:web:e16ae4a5e109b48323ce12"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export {db};