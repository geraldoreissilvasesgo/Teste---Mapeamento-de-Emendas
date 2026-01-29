
/**
 * SERVIÇO DE AUTENTICAÇÃO (FIREBASE)
 * Este arquivo gerencia a conexão com o Firebase para autenticação de produção.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// A configuração do Firebase deve ser preenchida com as chaves reais do projeto em produção.
const firebaseConfig = {
  apiKey: "AIzaSy-PLACEHOLDER",
  authDomain: "rastreio-emendas-go.firebaseapp.com",
  projectId: "rastreio-emendas-go",
  storageBucket: "rastreio-emendas-go.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

// Inicializa o Firebase e obtém a instância de autenticação
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Funções de Autenticação para Produção
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
