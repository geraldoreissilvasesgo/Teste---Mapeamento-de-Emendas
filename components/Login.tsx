import React, { useState, useEffect } from 'react';
import { db } from '../services/supabase.ts';
import { APP_VERSION, MOCK_USERS } from '../constants.ts';
import { Role, User } from '../types.ts';
import { 
  ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, 
  CheckCircle2, AlertCircle, Loader2, Info, MailQuestion, Sparkles
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{message: string, type?: 'auth' | 'confirm' | 'demo'}>({ message: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('gesa_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError({ message: '' });
    setSuccess('');

    if (rememberEmail) {
      localStorage.setItem('gesa_remembered_email', email);
    } else {
      localStorage.removeItem('gesa_remembered_email');
    }

    try {
      // Tenta login real via Supabase
      try {
        const authData = await db.auth.signIn(email, password);
        // Se sucesso, mapeia para o objeto User
        const user = MOCK_USERS.find(u => u.email === email) || {
          id: authData.user?.id || 'new-user',
          name: authData.user?.user_metadata?.name || 'Servidor',
          email: email,
          role: Role.OPERATOR,
          tenantId: 'GOIAS',
          lgpdAccepted: true
        };
        onLogin(user as User);
      } catch (err: any) {
        console.warn("Auth error, checking bypass:", err);
        
        // Bypass para modo demonstração com Geraldo Silva
        if (email === 'geraldo.rsilva@goias.gov.br' && password === 'Goias@2024') {
          onLogin(MOCK_USERS[0]);
          return;
        }

        if (err.message?.includes('Email not confirmed')) {
          setError({ 
            message: 'E-mail institucional não confirmado. Verifique seu e-mail.',
            type: 'confirm'
          });
        } else {
          setError({ 
            message: 'Credenciais inválidas ou erro de conexão. Tente o botão de provisionamento abaixo.',
            type: 'demo'
          });
        }
      }
    } catch (err: any) {
      setError({ message: err.message || 'Falha na autenticação corporativa.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvision = () => {
    setEmail('geraldo.rsilva@goias.gov.br');
    setPassword('Goias@2024');
    setSuccess('Credenciais de Geraldo Silva (Administrador) inseridas. Clique em Entrar.');
    setError({ message: '' });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200/50 p-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d457a] rounded-2xl text-white mb-4 shadow-xl ring-4 ring-blue-50">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Portal GESA Cloud</h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2">Acesso Restrito • ESTADO DE GOIÁS</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@goias.gov.br"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/5 outline-none font-bold text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/5 outline-none font-bold text-xs"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1 ml-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0d457a] focus:ring-[#0d457a]"
              />
              <label htmlFor="remember" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                Relembrar e-mail institucional
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Entrar no Sistema <LogIn size={16} /></>
              )}
            </button>
          </form>

          {error.message && (
            <div className={`mt-4 p-4 rounded-2xl text-[9px] font-bold border flex items-start gap-3 animate-shake ${error.type === 'confirm' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <AlertCircle size={18} className="shrink-0" />
              <span className="leading-relaxed">{error.message}</span>
            </div>
          )}
          
          {success && (
            <div className="mt-4 bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-[9px] font-bold border border-emerald-100 flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 size={18} className="shrink-0" /> 
              <span className="leading-relaxed">{success}</span>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-4 no-print">
           <button 
             onClick={handleProvision}
             className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-white transition-all shadow-sm group"
           >
             <Sparkles size={14} className="group-hover:text-blue-500 transition-colors" /> Modo Homologação: Usar Geraldo Silva
           </button>
        </div>
      </div>
    </div>
  );
};