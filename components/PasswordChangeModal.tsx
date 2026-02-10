
import React, { useState, useMemo } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, Save, X, Check, AlertCircle } from 'lucide-react';
import { db } from '../services/supabase';
import { useNotification } from '../context/NotificationContext';
import { User, AuditAction } from '../types';

interface PasswordChangeModalProps {
  currentUser: User;
  onClose: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ currentUser, onClose }) => {
  const { notify } = useNotification();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const strength = useMemo(() => {
    let s = 0;
    if (newPassword.length >= 8) s += 25;
    if (/[A-Z]/.test(newPassword)) s += 25;
    if (/[0-9]/.test(newPassword)) s += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) s += 25;
    return s;
  }, [newPassword]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      notify('error', 'Divergência', 'As senhas digitadas não coincidem.');
      return;
    }

    if (strength < 75) {
      notify('warning', 'Senha Fraca', 'A senha deve conter ao menos 8 caracteres, maiúsculas, números e símbolos.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Atualiza no Supabase Auth (se existir sessão real)
      try {
        await db.auth.updatePassword(newPassword);
      } catch (authErr) {
        console.warn("Não foi possível atualizar no Auth Managed, tentando persistência via Perfil DB...");
      }
      
      // 2. Persiste a senha na tabela 'users' para o fluxo de fallback do GESA
      await db.users.upsert({
        ...currentUser,
        password: newPassword // Grava a nova senha para validação futura no Login
      });

      await db.audit.log({
        tenantId: currentUser.tenantId,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: AuditAction.SECURITY,
        details: `Alteração de senha realizada e persistida na base governamental.`,
        severity: 'INFO'
      });

      notify('success', 'Segurança Atualizada', 'Sua nova senha foi gravada com sucesso na base GESA Cloud.');
      onClose();
    } catch (err: any) {
      notify('error', 'Falha na Operação', err.message || 'Erro ao comunicar com servidor de base de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-blue-500">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Segurança de Acesso</h3>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Atualizar Senha Institucional</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <X size={24} className="text-slate-300" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-10 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
              <div className="relative">
                <input 
                  type={showPass ? 'text' : 'password'}
                  className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
              <input 
                type={showPass ? 'text' : 'password'}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Força da Senha</span>
                <span className={strength >= 75 ? 'text-emerald-500' : strength >= 50 ? 'text-amber-500' : 'text-red-500'}>
                   {strength >= 75 ? 'Excelente' : strength >= 50 ? 'Média' : 'Fraca'}
                </span>
             </div>
             <div className="h-1.5 w-full bg-slate-100 rounded-full flex gap-1">
                <div className={`h-full rounded-full transition-all duration-500 ${strength >= 25 ? 'bg-red-500 w-1/4' : 'w-0'}`} />
                <div className={`h-full rounded-full transition-all duration-500 ${strength >= 50 ? 'bg-amber-500 w-1/4' : 'w-0'}`} />
                <div className={`h-full rounded-full transition-all duration-500 ${strength >= 75 ? 'bg-blue-500 w-1/4' : 'w-0'}`} />
                <div className={`h-full rounded-full transition-all duration-500 ${strength === 100 ? 'bg-emerald-500 w-1/4' : 'w-0'}`} />
             </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
             <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
             <p className="text-[9px] text-blue-700 font-bold uppercase leading-relaxed">
               A nova senha será exigida no próximo acesso ao sistema. Guarde-a com segurança.
             </p>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#0a365f] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Efetivar Nova Senha
          </button>
        </form>
      </div>
    </div>
  );
};
