// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtW208GAiwjeitEoIIGmOcW5tvIid1h6Y",
  authDomain: "devtuna-authentication.firebaseapp.com",
  projectId: "devtuna-authentication",
  storageBucket: "devtuna-authentication.firebasestorage.app",
  messagingSenderId: "835439215720",
  appId: "1:835439215720:web:5e56bdd5944ef595b1e7dd",
  measurementId: "G-VZZKXX338H"
};

let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig)
} else {
    firebaseApp = getApp();
}
export const firebaseAuth = getAuth(firebaseApp);