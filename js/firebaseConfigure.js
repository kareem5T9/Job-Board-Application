import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}

from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyBtmDVZ8A65H2c6PbQ25pmOjeErVUWF_uk",
    authDomain: "job-board-application-5062f.firebaseapp.com",
    projectId: "job-board-application-5062f",
    storageBucket: "job-board-application-5062f.firebasestorage.app",
    messagingSenderId: "998956144862",
    appId: "1:998956144862:web:f33f25a9a6efc05025ca4f"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app);

export {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    onSnapshot
};