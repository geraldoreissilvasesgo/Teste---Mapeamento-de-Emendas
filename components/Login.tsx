/**
 * COMPONENTE DE LOGIN
 * 
 * Este componente gerencia a tela de autenticação do sistema. Ele é a porta de entrada
 * para usuários não autenticados.
 * 
 * Funcionalidades:
 * - Formulário para inserção de e-mail e senha.
 * - Simulação de um fluxo de Autenticação de Múltiplos Fatores (MFA) para perfis
 *   de maior privilégio (admin, auditor).
 * - Validação de força da senha em tempo real para feedback visual.
 * - Exibição de mensagens de erro claras em caso de falha na autenticação.
 * - Botões de "Login Rápido" para facilitar o acesso em ambiente de desenvolvimento.
 */
import React, { useState, useEffect } from 'react';
import { signIn } from '../services/firebase';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, Smartphone, CheckCircle2, AlertCircle, Fingerprint } from 'lucide-react';

export const Login: React.FC = () => {
  // Estado para controlar o passo da autenticação (credenciais ou MFA).
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  // Estados para os campos do formulário.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  // Estados para controle da UI.
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Efeito para calcular a força da senha digitada.
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  // Manipulador para a submissão do formulário de credenciais.
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Em um ambiente real, aqui haveria uma verificação no backend.
      // Para simulação, a lógica se baseia no e-mail para decidir se o MFA é necessário.
      if (email.includes('admin') || email.includes('auditor')) {
        setStep('mfa');
      } else {
        await signIn(email, password);
        // Se o signIn for bem-sucedido, o listener onAuthChange em App.tsx
        // irá detectar a mudança e redirecionar o usuário.
      }
    } catch (err: any) {
      const firebaseError = err.code?.split('/')[1]?.replace(/-/g, ' ') || 'Verifique suas credenciais';
      setError(`Falha na autenticação: ${firebaseError}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Manipulador para a submissão do código MFA.
  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simula a verificação do código MFA. Em produção, isso seria validado por um serviço.
    if (mfaCode === '123456') {
      try {
        await signIn(email, password);
      } catch (err: any) {
        setError('Credenciais inválidas mesmo com código MFA correto. Acesso negado.');
        setStep('credentials'); // Volta para o passo inicial
      }
    } else {
      setError('Código de autenticação inválido. Tente novamente.');
    }
    setIsLoading(false);
  };

  // Função para preencher e submeter o formulário com dados de teste.
  const quickLogin = (userType: 'admin' | 'operator') => {
    const userEmail = userType === 'admin' ? 'admin.teste@gesa.go.gov.br' : 'operador.gesa@goias.gov.br';
    const userPass = 'Senha@123';
    
    setEmail(userEmail);
    setPassword(userPass);

    // Simula a submissão do formulário após um pequeno delay para que o estado seja atualizado.
    setTimeout(() => {
      document.getElementById('login-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };
  
  // Renderiza a barra de força da senha.
  const renderPasswordStrength = () => (
    <div className="flex gap-1.5 mt-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full ${passwordStrength > i ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d457a] rounded-3xl text-white mb-4 shadow-xl ring-8 ring-blue-50">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Acesso Restrito GESA</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Plataforma de Gestão Governamental</p>
          </div>
          
          {/* Alterna entre o formulário de credenciais e o de MFA */}
          {step === 'credentials' ? (
            <form id="login-form" onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail Institucional</label>
                <div className="relative mt-2">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@gesa.go.gov.br"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha de Acesso</label>
                <div className="relative mt-2">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0d457a]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && renderPasswordStrength()}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#0d457a] text-white rounded-xl font-black uppercase text-xs shadow-xl hover:bg-[#0a365f] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Autenticando...' : 'Avançar'}
                {!isLoading && <LogIn size={16} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfa} className="space-y-6 animate-in fade-in">
              <div className="text-center">
                 <p className="text-sm text-slate-600">Um código de verificação foi enviado para seu dispositivo. Insira-o abaixo.</p>
                 <p className="font-bold text-[#0d457a] mt-1">{email}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Código de 6 dígitos</label>
                <div className="relative mt-2">
                  <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-bold text-lg pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all"
                    required
                    maxLength={6}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verificando...' : 'Confirmar Acesso'}
                {!isLoading && <CheckCircle2 size={16} />}
              </button>
               <button onClick={() => setStep('credentials')} type="button" className="w-full text-center text-xs text-slate-500 hover:text-[#0d457a] font-bold">Voltar</button>
            </form>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <div className="mt-6 bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {/* Rodapé com botões de login rápido para desenvolvimento */}
        <div className="mt-6 text-center space-y-2">
           <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Ambiente de Simulação</p>
           <div className="flex justify-center gap-3">
              <button onClick={() => quickLogin('admin')} className="px-4 py-2 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded-lg hover:bg-slate-300">Admin Rápido</button>
              <button onClick={() => quickLogin('operator')} className="px-4 py-2 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded-lg hover:bg-slate-300">Operador Rápido</button>
           </div>
        </div>
      </div>
    </div>
  );
};
