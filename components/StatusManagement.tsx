
import React, { useState, useMemo } from 'react';
import { StatusConfig } from '../types';
import { 
  Plus, X, Tag, Info, Search, Save, Pencil, Trash2, ShieldAlert,
  Database, CheckCircle2, Loader2, Copy, Check, Terminal, Edit2, Zap, ShieldCheck, CheckCircle,
  Import, Filter, ListTree, Workflow, RefreshCw, Cloud, Lock
} from 'lucide-react';

interface StatusManagementProps {
  statuses: StatusConfig[];
  onAdd: (status: StatusConfig) => void;
  onReset: () => void;
  onBatchAdd: (statuses: any[]) => void;
  error?: string | null;
}

export const StatusManagement: React.FC<StatusManagementProps> = ({ 
  statuses, onAdd, onReset, onBatchAdd, error 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(error === 'DATABASE_SETUP_REQUIRED');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'ingestion' | 'final'>('all');

  const [newStatus, setNewStatus] = useState<Partial<StatusConfig>>({
    name: '',
    color: '#0d457a',
    isFinal: false
  });

  const [editingStatus, setEditingStatus] = useState<StatusConfig | null>(null);

  const handleSeedData = async () => {
    if (!window.confirm("Deseja carregar os estados padrão do Governo de Goiás diretamente no Banco de Dados Cloud?")) return;
    
    setIsLoading(true);
    const seed = [
      { name: 'ANÁLISE DA DOCUMENTAÇÃO', color: '#64748b', isFinal: false },
      { name: 'EM TRAMITAÇÃO TÉCNICA', color: '#0d457a', isFinal: false },
      { name: 'EM DILIGÊNCIA', color: '#f59e0b', isFinal: false },
      { name: 'AGUARDANDO PARECER JURÍDICO', color: '#8b5cf6', isFinal: false },
      { name: 'EMPENHO / LIQUIDAÇÃO', color: '#3b82f6', isFinal: true }, // Marcado como final para ativar lock
      { name: 'LIQUIDADO / PAGO', color: '#10b981', isFinal: true },
      { name: 'ARQUIVADO / REJEITADO', color: '#ef4444', isFinal: true }
    ];
    
    try {
      await onBatchAdd(seed);
    } catch (e) {
      console.error("Erro ao popular tabela:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStatuses = useMemo(() => {
    return statuses.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeTab === 'ingestion') return matchesSearch && !s.isFinal;
      if (activeTab === 'final') return matchesSearch && s.isFinal;
      return matchesSearch;
    });
  }, [statuses, searchTerm, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus.name) {
      onAdd({
        name: newStatus.name.toUpperCase(),
        color: newStatus.color || '#0d457a',
        isFinal: newStatus.isFinal || false
      } as StatusConfig);
      setIsModalOpen(false);
      setNewStatus({ name: '', color: '#0d457a', isFinal: false });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStatus) {
      onAdd(editingStatus);
      setIsEditModalOpen(false);
      setEditingStatus(null);
    }
  };

  const sqlSetup = `-- GESA CLOUD: ESTRUTURA DE ESTADOS DO CICLO
create table if not exists statuses (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  name text not null,
  color text default '#0d457a',
  "isFinal" boolean default false,
  "createdAt" timestamp with time zone default now()
);`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {error === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-red-50 border border-red-200 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-red-900/5">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center animate-bounce">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-red-900 uppercase">Tabela 'statuses' Offline!</h3>
            <p className="text-xs text-red-700 font-bold uppercase mt-2 max-w-xl">
              A estrutura física de **Ciclo de Vida** não foi detectada. Verifique seu banco Supabase.
            </p>
          </div>
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-red-700 transition-all flex items-center gap-3"
          >
            <Terminal size={18} /> Abrir Script SQL
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Gestão do Ciclo de Vida</h2>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Workflow size={14} className="text-blue-500"/> Workflow GESA Cloud v2.0
            </p>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleSeedData} 
              className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-6 py-4 rounded-[20px] hover:bg-blue-100 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
            >
                {isLoading ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16} />} 
                Padronizar GO
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-[20px] hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[11px] font-black tracking-[0.2em]"
            >
                <Plus size={18} /> Criar Novo Estado
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStatuses.map(status => (
          <div key={status.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: status.color }} />
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl shadow-inner flex items-center justify-center" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                  {status.isFinal ? <CheckCircle size={24} /> : <Workflow size={24} />}
               </div>
               <div className="flex gap-2">
                 {status.name === 'EMPENHO / LIQUIDAÇÃO' && (
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl" title="Trava de Segurança Ativa">
                      <Lock size={16} />
                    </div>
                 )}
                 <button 
                    onClick={() => { setEditingStatus(status); setIsEditModalOpen(true); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-[#0d457a] hover:bg-blue-50 rounded-xl transition-all"
                 >
                    <Edit2 size={16} />
                 </button>
               </div>
            </div>
            <h3 className="font-black text-base text-[#0d457a] uppercase leading-tight mb-4 min-h-[40px]">{status.name}</h3>
            {status.isFinal && (
               <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Estado de Bloqueio Ativo</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Novo Status */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
               <h3 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter">Novo Estado do Ciclo</h3>
               <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
               </button>
            </div>
            <div className="p-10 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Status *</label>
                  <input 
                    type="text" required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs"
                    value={newStatus.name}
                    onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor de Identificação</label>
                    <input 
                      type="color"
                      className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl outline-none p-2 cursor-pointer"
                      value={newStatus.color}
                      onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300"
                        checked={newStatus.isFinal}
                        onChange={(e) => setNewStatus({...newStatus, isFinal: e.target.checked})}
                      />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Travar Edição (Final)</span>
                    </label>
                  </div>
               </div>
               <button 
                  type="submit"
                  className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all flex items-center justify-center gap-3"
               >
                 <Save size={18} /> Efetivar Status
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
