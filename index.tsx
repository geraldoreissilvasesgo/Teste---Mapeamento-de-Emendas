/**
 * PONTO DE ENTRADA (ENTRYPOINT) DA APLICAÇÃO
 * 
 * Este arquivo é o primeiro a ser executado no lado do cliente.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Busca o elemento principal no DOM onde a aplicação será montada.
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Não foi possível encontrar o elemento 'root' para montar a aplicação.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);