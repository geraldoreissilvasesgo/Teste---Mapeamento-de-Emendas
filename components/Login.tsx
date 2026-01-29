
import React, { useState, useEffect } from 'react';
import { signIn, signUp } from '../services/firebase';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, Smartphone, CheckCircle2, AlertCircle, Fingerprint } from 'lucide-react';

export const Login: React.FC = () => {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
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
      await signIn(email, password);
      // O listener onAuthChange em App.tsx irá lidar com a transição de estado.
      // A lógica de MFA simulada é mantida para demonstrar o fluxo.
      if (email.includes('admin') || email.includes('auditor')) {
        setStep('mfa');
      }
    } catch (err: any) {
      setError('Credenciais inválidas. Utilize seu e-mail corporativo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      // Em uma aplicação real, aqui haveria uma verificação do token MFA.
      // O sucesso aqui permite que o onAuthChange prossiga.
      if (mfaCode === '123456') { // Mock de token seguro
        // O onAuthChange cuidará do login.
      } else {
        setError('Token MFA inválido ou expirado.');
      }
      setIsLoading(false);
    }, 800);
  };

  const quickLogin = (role: string) => {
    const emails: Record<string, string> = {
      admin: 'admin@gesa.subipei.go.gov.br',
      operador: 'operador@gesa.subipei.go.gov.br',
      auditor: 'auditor@cge.go.gov.br'
    };
    setEmail(emails[role]);
    setPassword('Goi@s2025!');
  };

  return (
    <div className="min-h-screen flex bg-[#0d457a] items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/10 z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-50 p-10 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0d457a] rounded-[24px] text-white mb-6 shadow-xl ring-8 ring-blue-50/50">
            {step === 'credentials' ? <ShieldCheck size={40} /> : <Smartphone size={40} className="animate-bounce" />}
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            {step === 'credentials' ? 'Acesso Institucional' : 'Múltiplo Fator'}
          </h2>
          <p className="text-slate-400 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">GESA / SUBIPEI - GOIÁS</p>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleAuth} className="p-10 space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
                <input 
                  required 
                  type="email" 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] focus:bg-white outline-none font-bold text-sm transition-all" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="usuario@go.gov.br" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full pl-12 pr-14 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] focus:bg-white outline-none font-bold text-sm transition-all" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-300 hover:text-[#0d457a]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex gap-1.5 h-1 mt-3 px-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < passwordStrength ? (passwordStrength < 3 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-100'}`} />
                ))}
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 ml-1">Segurança: {['Fraca', 'Média', 'Forte', 'Inviolável'][passwordStrength-1] || '---'}</p>
            </div>

            {error && <div className="text-red-500 text-[11px] font-bold bg-red-50 p-4 rounded-2xl flex items-center gap-2 border border-red-100 animate-shake"><AlertCircle size={18}/> {error}</div>}

            <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#0a365f] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
               {isLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={18}/> Validar Identidade</>}
            </button>

            <div className="flex flex-col gap-4 pt-4 border-t border-slate-50">
               <div className="flex justify-center gap-2">
                  {['admin', 'operador', 'auditor'].map(r => (
                    <button key={r} type="button" onClick={() => quickLogin(r)} className="px-3 py-1.5 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase hover:text-[#0d457a] hover:bg-blue-50 transition-all">{r}</button>
                  ))}
               </div>
               <p className="text-[9px] text-slate-400 text-center uppercase font-bold tracking-widest">Acesso restrito a servidores autorizados.</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMfaVerify} className="p-10 space-y-8 animate-in slide-in-from-right-10 duration-500">
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600 font-bold">Autenticação de Segundo Fator ativada para seu perfil.</p>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 justify-center">
                <Fingerprint className="text-blue-600" size={20} />
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Código Demo: 123456</p>
              </div>
            </div>
            <input 
              maxLength={6} 
              required 
              autoFocus
              className="w-full py-6 bg-slate-50 rounded-2xl outline-none text-4xl font-black text-center tracking-[0.6em] text-[#0d457a] border-2 border-transparent focus:border-[#0d457a] focus:bg-white transition-all" 
              value={mfaCode} 
              onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} 
              placeholder="000000" 
            />
            
            {error && <div className="text-red-500 text-[11px] font-bold bg-red-50 p-4 rounded-2xl flex items-center gap-2 border border-red-100"><AlertCircle size={18}/> {error}</div>}

            <button type="submit" disabled={isLoading || mfaCode.length < 6} className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 transition-all hover:bg-[#0a365f]">
              {isLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={18}/> Concluir MFA</>}
            </button>
            <button type="button" onClick={() => { setStep('credentials'); setError(''); }} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest text-center hover:text-slate-600 transition-colors">Voltar para Credenciais</button>
          </form>
        )}
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-center space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Criptografia de Ponta a Ponta</p>
        <p className="text-[8px] uppercase font-bold tracking-widest">Estado de Goiás - Controladoria Geral</p>
      </div>
    </div>
  );
};
