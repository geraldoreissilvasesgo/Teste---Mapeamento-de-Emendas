
import React, { useState, useEffect } from 'react';
import { db, supabase } from '../services/supabase';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, Smartphone, CheckCircle2, AlertCircle, Loader2, UserPlus, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulação de MFA para contas administrativas no ambiente de homologação
      if ((email.includes('admin') || email.includes('auditor')) && step === 'credentials') {
        setStep('mfa');
        setIsLoading(false);
        return;
      }

      await db.auth.signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvision = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const emailTest = 'admin.teste@gesa.go.gov.br';
      const passTest = 'Senha@123';
      
      await db.auth.signUp(emailTest, passTest, 'Administrador GESA Teste');
      setSuccess('Conta Admin provisionada! E-mail: ' + emailTest + ' / Senha: ' + passTest);
      setEmail(emailTest);
      setPassword(passTest);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setSuccess('Usuário admin.teste já está registrado. Pode logar.');
        setEmail('admin.teste@gesa.go.gov.br');
        setPassword('Senha@123');
      } else {
        setError(err.message || 'Erro ao provisionar usuário de teste.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200/50 p-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0d457a] rounded-[28px] text-white mb-6 shadow-xl ring-8 ring-blue-50">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Portal GESA Cloud</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Autenticação Unificada - Governo de Goiás</p>
          </div>
          
          {step === 'credentials' ? (
            <form id="login-form" onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@goias.gov.br"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-bold text-slate-600"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-bold text-slate-600"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0d457a]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-900/20 hover:bg-[#0a365f] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Acessar Sistema <LogIn size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-6 animate-in fade-in">
              <div className="text-center bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-6">
                 <p className="text-xs text-blue-700 font-bold leading-relaxed">Verificação MFA: Insira o código de 6 dígitos enviado ao seu dispositivo.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código de Segurança</label>
                <div className="relative">
                  <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.5em] font-black text-xl pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                    required
                    maxLength={6}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
              >
                Confirmar Identidade <CheckCircle2 size={18} />
              </button>
              <button onClick={() => setStep('credentials')} type="button" className="w-full text-center text-[10px] text-slate-400 hover:text-[#0d457a] font-black uppercase tracking-widest mt-2">Voltar</button>
            </form>
          )}

          {error && <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-bold border border-red-100 flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
          {success && <div className="mt-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-2"><CheckCircle2 size={14}/> {success}</div>}
        </div>
        
        <div className="mt-10 flex flex-col items-center gap-6">
           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[32px] border border-slate-200 shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                 <Info size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Ações de Homologação</span>
              </div>
              <button 
                onClick={handleProvision}
                disabled={isLoading}
                className="flex items-center gap-2 text-[10px] font-black text-[#0d457a] uppercase tracking-widest bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                <UserPlus size={16} /> Provisionar Usuário de Teste
              </button>
           </div>
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Gerência de Suporte Administrativo - GESA</p>
        </div>
      </div>
    </div>
  );
};
