/**
 * PONTO DE ENTRADA (ENTRYPOINT) DA APLICAÇÃO
 * 
 * Este arquivo é o primeiro a ser executado no lado do cliente.
 * Sua responsabilidade é encontrar o elemento 'root' no HTML e renderizar
 * o componente principal da aplicação, o <App />, dentro dele.
 * O React.StrictMode é um wrapper que ajuda a identificar potenciais problemas na aplicação.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Busca o elemento principal no DOM onde a aplicação será montada.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Não foi possível encontrar o elemento 'root' para montar a aplicação.");
}

// Cria a raiz da aplicação React e renderiza o componente App.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
