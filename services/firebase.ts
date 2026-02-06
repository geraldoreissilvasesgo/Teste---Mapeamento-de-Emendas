
/**
 * SERVIÇO DE AUTENTICAÇÃO (FIREBASE)
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSy-PLACEHOLDER",
  authDomain: "rastreio-emendas-go.firebaseapp.com",
  projectId: "rastreio-emendas-go",
  storageBucket: "rastreio-emendas-go.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const signIn = (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

export const signUp = async (email: string, pass: string, name: string) => {
  const creds = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(creds.user, { displayName: name });
  return creds;
};

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logout = () => {
  return signOut(auth);
};
