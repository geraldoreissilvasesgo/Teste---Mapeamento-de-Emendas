import React, { useState } from 'react';
import { User, Role, Sector } from '../types';
import { MOCK_USERS, APP_NAME, DEPARTMENT } from '../constants';
import { LogIn, Lock, Mail, ArrowRight, ShieldCheck, Grid } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulation of Microsoft SSO Login
  const handleMicrosoftLogin = () => {
    setIsLoading(true);
    setError('');
    
    // Simulate network delay for Azure AD handshake
    setTimeout(() => {
      // Logic to mock a successful SSO response
      // In production, this would use MSAL (Microsoft Authentication Library)
      const mockSSOUser = MOCK_USERS[0]; // Logging in as Admin for demo
      onLogin(mockSSOUser);
      setIsLoading(false);
    }, 1500);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Procura usuário pelo email e verifica a senha
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (foundUser && foundUser.password === password) {
        onLogin(foundUser);
      } else {
        setError('Credenciais inválidas. Verifique seu email e senha.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-inter">
      {/* Left Side - Branding (GESA Identity) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d457a] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
           <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={40} className="text-emerald-400" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">GESA</h1>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Gerência de Suporte Administrativo - GESA/SUBIPEI</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Gestão Transparente de Emendas Parlamentares
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Acesse o sistema oficial de rastreamento e controle de fluxo. 
            Segurança, agilidade e integração com o processo SEI.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 uppercase tracking-wider">
          © {new Date().getFullYear()} Gerência de Suporte Administrativo - GESA/SUBIPEI. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-[#0d457a] mb-2">Acesso ao Sistema</h2>
            <p className="text-slate-500">Identifique-se para continuar.</p>
          </div>

          {/* Microsoft Login Button */}
          <button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 p-3 rounded-md shadow-sm transition-all group font-medium relative overflow-hidden"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-slate-300 border-t-[#0d457a] rounded-full animate-spin"></div>
            ) : (
              <>
                <Grid size={20} className="text-[#00a4ef]" /> {/* Microsoft Blue */}
                <span>Entrar com conta <strong className="text-slate-900">Microsoft</strong></span>
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-semibold">Ou acesse com credenciais</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleStandardLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Institucional</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d457a] focus:border-transparent sm:text-sm"
                  placeholder="usuario@saude.go.gov.br"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d457a] focus:border-transparent sm:text-sm"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#0d457a] hover:bg-[#0a365f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d457a] uppercase tracking-wide transition-colors"
            >
              {isLoading ? 'Autenticando...' : 'Acessar Painel'}
            </button>
            
            <div className="mt-4 text-center">
               <p className="text-xs text-slate-400">Para testes: Senha padrão <strong className="text-slate-600">123</strong></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};