
import React, { useState, useEffect } from 'react';
import { signIn, signUp } from '../services/firebase';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, Info } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (passwordStrength < 3) throw new Error("Aumente a segurança da senha.");
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      console.error(err);
      switch (err.code) {
        case 'auth/wrong-password': setError('Senha incorreta.'); break;
        case 'auth/user-not-found': setError('Usuário não encontrado.'); break;
        case 'auth/email-already-in-use': setError('E-mail já cadastrado.'); break;
        default: setError('Falha na autenticação. Verifique os dados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('admin@gesa.subipei.go.gov.br');
    setPassword('Goi@s2025!');
  };

  return (
    <div className="min-h-screen flex bg-[#0d457a] font-inter items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-slate-50 p-8 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d457a] rounded-xl text-white mb-4 shadow-lg ring-4 ring-blue-50">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
            {isRegistering ? 'Sistema GESA/SUBIPEI' : 'Acesso Restrito'}
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">ESTADO DE GOIÁS</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-5">
          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d457a] outline-none text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do Servidor"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">E-mail Institucional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d457a] outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@gesa.subipei.go.gov.br"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d457a] outline-none text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isRegistering && password.length > 0 && (
              <div className="mt-2 space-y-1 px-1">
                <div className="flex gap-1 h-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-full ${i < passwordStrength ? (passwordStrength <= 2 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Nível de Segurança: {['Fraco', 'Médio', 'Bom', 'Forte'][passwordStrength-1] || 'Inexistente'}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-[11px] font-bold border border-red-100 flex items-center gap-2 animate-shake">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#0d457a] text-white rounded-lg font-bold uppercase tracking-widest hover:bg-[#0a365f] shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isRegistering ? <><UserPlus size={16}/> Solicitar Acesso</> : <><LogIn size={16}/> Entrar no Sistema</>
            )}
          </button>

          <div className="flex flex-col gap-3 pt-2">
            {!isRegistering && (
              <button
                type="button"
                onClick={handleQuickLogin}
                className="text-[10px] font-bold text-slate-400 hover:text-[#0d457a] flex items-center justify-center gap-1 transition-colors uppercase tracking-widest"
              >
                <Info size={12} /> Preencher usuário de teste
              </button>
            )}
            
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-xs font-bold text-[#0d457a] hover:underline uppercase tracking-wide"
            >
              {isRegistering ? 'Já possuo credenciais' : 'Ainda não sou cadastrado'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Footer com Aviso de Segurança */}
      <div className="absolute bottom-6 text-white/40 text-[9px] uppercase tracking-[0.2em] font-medium text-center">
        Acesso monitorado - GESA / SUBIPEI
      </div>
    </div>
  );
};
