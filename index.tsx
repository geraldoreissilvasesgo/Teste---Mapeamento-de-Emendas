/**
 * PONTO DE ENTRADA (ENTRYPOINT) DA APLICAÇÃO
 * 
 * Este arquivo é o primeiro a ser executado no lado do cliente.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Busca o elemento principal no DOM onde a aplicação será montada.
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Não foi possível encontrar o elemento 'root' para montar a aplicação.");
} else {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}