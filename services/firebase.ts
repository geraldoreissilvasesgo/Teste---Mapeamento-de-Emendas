
/**
 * SERVIÇO DE AUTENTICAÇÃO (FIREBASE / MOCK)
 * Este arquivo gerencia a conexão com o Firebase. 
 * Se as chaves não estiverem configuradas, ele provê um Mock para testes.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseCreateUser,
  onAuthStateChanged as firebaseOnAuth,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSy-PLACEHOLDER", // Altere para sua chave real quando for para produção
  authDomain: "rastreio-emendas-go.firebaseapp.com",
  projectId: "rastreio-emendas-go",
  storageBucket: "rastreio-emendas-go.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

// Detecção de Modo de Desenvolvimento (Mock)
const isMockMode = firebaseConfig.apiKey.includes("PLACEHOLDER");

let authInstance: any;

if (!isMockMode) {
  const app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
} else {
  // Mock do objeto Auth para não quebrar o sistema sem chaves reais
  authInstance = {
    currentUser: null,
    signOut: () => {
      authInstance.currentUser = null;
      if (mockAuthCallback) mockAuthCallback(null);
      return Promise.resolve();
    }
  };
}

let mockAuthCallback: ((user: any) => void) | null = null;

// Wrappers para suportar tanto Firebase Real quanto Mock de Teste
export const auth = authInstance;

export const signIn = async (email: string, pass: string) => {
  if (isMockMode) {
    // Simulação de login de teste
    if (email === "admin@gesa.subipei.go.gov.br" && pass === "Goi@s2025!") {
      const mockUser = { uid: 'test-123', email, displayName: 'Gestor de Teste' };
      authInstance.currentUser = mockUser;
      if (mockAuthCallback) mockAuthCallback(mockUser);
      return { user: mockUser };
    }
    throw { code: 'auth/wrong-password' };
  }
  return firebaseSignIn(auth, email, pass);
};

export const signUp = async (email: string, pass: string, name: string) => {
  if (isMockMode) {
    const mockUser = { uid: Math.random().toString(), email, displayName: name };
    authInstance.currentUser = mockUser;
    if (mockAuthCallback) mockAuthCallback(mockUser);
    return { user: mockUser };
  }
  const creds = await firebaseCreateUser(auth, email, pass);
  await firebaseUpdateProfile(creds.user, { displayName: name });
  return creds;
};

export const onAuthChange = (callback: (user: any) => void) => {
  if (isMockMode) {
    mockAuthCallback = callback;
    callback(authInstance.currentUser);
    return () => { mockAuthCallback = null; };
  }
  return firebaseOnAuth(auth, callback);
};

export const logout = () => {
  return isMockMode ? authInstance.signOut() : firebaseSignOut(auth);
};
