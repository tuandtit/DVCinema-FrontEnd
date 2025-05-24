import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../../environments/environment';

const firebaseConfig = environment.firebaseConfig;

let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}
export const firebaseAuth = getAuth(firebaseApp);
