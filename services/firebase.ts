/**
 * SERVIÇO DE AUTENTICAÇÃO (FIREBASE)
 * 
 * Este arquivo encapsula toda a configuração e interação com o Firebase Authentication.
 * Ele inicializa a conexão com o Firebase e exporta funções reutilizáveis para
 * realizar login, cadastro, logout e monitoramento do estado de autenticação.
 * Manter essa lógica isolada facilita a manutenção e a troca de provedor de
 * autenticação no futuro, se necessário.
 */

// Importa as funções necessárias do SDK do Firebase.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Objeto de configuração do Firebase.
// ATENÇÃO: As chaves aqui são placeholders. Para um ambiente de produção,
// elas devem ser substituídas pelas credenciais reais do projeto no console do Firebase.
const firebaseConfig = {
  apiKey: "AIzaSy-PLACEHOLDER",
  authDomain: "rastreio-emendas-go.firebaseapp.com",
  projectId: "rastreio-emendas-go",
  storageBucket: "rastreio-emendas-go.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

// Inicializa a aplicação Firebase com as configurações fornecidas.
const app = initializeApp(firebaseConfig);
// Obtém a instância do serviço de autenticação para a aplicação inicializada.
export const auth = getAuth(app);

/**
 * Realiza o login de um usuário com e-mail e senha.
 * @param email O e-mail do usuário.
 * @param pass A senha do usuário.
 * @returns Uma Promise com as credenciais do usuário se o login for bem-sucedido.
 */
export const signIn = (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

/**
 * Cadastra um novo usuário com e-mail, senha e nome de exibição.
 * @param email O e-mail do novo usuário.
 * @param pass A senha para o novo usuário.
 * @param name O nome de exibição para o perfil do novo usuário.
 * @returns Uma Promise com as credenciais do usuário recém-criado.
 */
export const signUp = async (email: string, pass: string, name: string) => {
  const creds = await createUserWithEmailAndPassword(auth, email, pass);
  // Após a criação, atualiza o perfil do usuário com o nome fornecido.
  await updateProfile(creds.user, { displayName: name });
  return creds;
};

/**
 * Registra um "ouvinte" (listener) que é acionado sempre que o estado
 * de autenticação do usuário muda (login ou logout).
 * @param callback A função a ser executada quando o estado de autenticação mudar.
 *                 Ela recebe o objeto do usuário (se logado) ou null (se deslogado).
 * @returns A função `unsubscribe` para remover o listener quando o componente for desmontado.
 */
export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Realiza o logout do usuário atualmente autenticado.
 * @returns Uma Promise que é resolvida quando o logout é concluído.
 */
export const logout = () => {
  return signOut(auth);
};
