import React, { useState, useEffect } from 'react';
import { db } from '../services/supabase';
import { APP_VERSION, MOCK_USERS } from '../constants';
import { Role, User, AuditAction } from '../types';
import { 
  ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, 
  CheckCircle2, AlertCircle, Loader2, Info, MailQuestion, Sparkles, UserCheck, Zap
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
  const [error, setError] = useState<{message: string, type?: 'auth' | 'confirm' | 'demo' | 'missing_profile'}>({ message: '' });
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

    if (email === 'anderson.alves@goias.gov.br' && password === '123456') {
      setTimeout(() => onLogin(MOCK_USERS[1]), 500);
      return;
    }

    if (email === 'geraldo.rsilva@goias.gov.br' && password === 'Goias@2024') {
      setTimeout(() => onLogin(MOCK_USERS[0]), 500);
      return;
    }

    try {
      const authData = await db.auth.signIn(email, password);
      
      if (authData.user) {
        const profile = await db.users.getByEmail(email);
        
        if (profile) {
          await db.audit.log({
            tenantId: profile.tenantId,
            actorId: profile.id,
            actorName: profile.name,
            action: AuditAction.LOGIN,
            details: `Acesso autenticado via Portal Cloud.`,
            severity: 'INFO'
          });
          onLogin(profile);
        } else {
          setError({ 
            message: 'Usuário autenticado, mas perfil não localizado na base de servidores. Contate o administrador.',
            type: 'missing_profile'
          });
        }
      }
    } catch (err: any) {
      console.warn("Auth error:", err);
      
      if (err.message?.includes('Email not confirmed')) {
        setError({ 
          message: 'E-mail institucional não confirmado. Verifique sua caixa de entrada.',
          type: 'confirm'
        });
      } else if (err.message?.includes('Invalid login credentials')) {
        setError({ 
          message: 'E-mail ou senha incorretos. Verifique suas credenciais do Estado de Goiás.',
          type: 'auth'
        });
      } else {
        setError({ 
          message: `Erro de conexão: ${err.message}. Tente novamente em instantes.`,
          type: 'demo'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const provisionUser = (userType: 'anderson' | 'geraldo') => {
    if (userType === 'anderson') {
      setEmail('anderson.alves@goias.gov.br');
      setPassword('123456');
      setSuccess('Perfil de Anderson Alves (Admin) carregado. Clique em Entrar.');
    } else {
      setEmail('geraldo.rsilva@goias.gov.br');
      setPassword('Goias@2024');
      setSuccess('Perfil de Geraldo Silva (Super Admin) carregado. Clique em Entrar.');
    }
    setError({ message: '' });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200/50 p-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0d457a] rounded-[28px] text-white mb-6 shadow-2xl ring-8 ring-blue-50 relative">
              <ShieldCheck size={40} className="relative z-10" />
              <Zap size={18} className="absolute -top-2 -right-2 text-emerald-400 fill-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">RASTREIO <span className="text-emerald-500">GESA</span></h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-3">GESTÃO E TEMPORALIDADE • SUBIPEI</p>
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
                Relembrar credencial institucional
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Acessar Painel Governamental <LogIn size={16} /></>
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
        
        <div className="mt-8 flex flex-col gap-3 no-print">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Modo de Homologação (Acesso Rápido)</p>
           <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => provisionUser('geraldo')}
                className="flex-1 flex items-center justify-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/70 px-4 py-3 rounded-xl border border-slate-200 hover:bg-white hover:border-[#0d457a] hover:text-[#0d457a] transition-all shadow-sm group"
              >
                <UserCheck size={14} className="group-hover:text-blue-500 transition-colors" /> Geraldo (Super)
              </button>
              <button 
                onClick={() => provisionUser('anderson')}
                className="flex-1 flex items-center justify-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/70 px-4 py-3 rounded-xl border border-slate-200 hover:bg-white hover:border-[#0d457a] hover:text-[#0d457a] transition-all shadow-sm group"
              >
                <Sparkles size={14} className="group-hover:text-blue-500 transition-colors" /> Anderson (Admin)
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};