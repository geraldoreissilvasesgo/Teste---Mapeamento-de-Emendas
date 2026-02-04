import React, { useState, useMemo } from 'react';
import { StatusConfig } from '../types.ts';
import { 
  Plus, X, Tag, Info, Search, Save, Pencil, Trash2, ShieldAlert,
  Database, CheckCircle2, Loader2, Copy, Check, Terminal, Edit2, Zap, ShieldCheck, CheckCircle,
  Import, Filter, ListTree, Workflow, RefreshCw, Cloud
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
            <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase flex items-center gap-1.5 ${!error ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${!error ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {!error ? `Base Online: ${statuses.length} estados` : 'Offline'}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleSeedData} 
              disabled={isLoading || error === 'DATABASE_SETUP_REQUIRED'}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-6 py-4 rounded-[20px] hover:bg-blue-100 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16} />} 
                Padronizar GO
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              disabled={error === 'DATABASE_SETUP_REQUIRED'}
              className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-[20px] hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[11px] font-black tracking-[0.2em] disabled:opacity-50"
            >
                <Plus size={18} /> Criar Novo Estado
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-3 flex-1 w-full">
            <Search size={20} className="text-slate-300 ml-2" />
            <input 
                type="text" 
                placeholder="Pesquisar estados ativos no ciclo..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-600 placeholder:text-slate-300 uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
                { id: 'all', label: 'Todos', icon: ListTree },
                { id: 'ingestion', label: 'Em Aberto', icon: RefreshCw },
                { id: 'final', label: 'Concluídos', icon: CheckCircle }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-[#0d457a] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
        </div>
      </div>

      {statuses.length === 0 && !error && (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[48px] border-4 border-dashed border-slate-100 text-center space-y-6">
           <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
              <Cloud size={40} />
           </div>
           <div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Repositório de Estados Vazio</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1 max-w-xs mx-auto leading-relaxed">
                Não localizamos estados configurados para sua unidade técnica na nuvem.
              </p>
           </div>
           <button 
             onClick={handleSeedData} 
             className="px-10 py-4 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center gap-2"
           >
              <RefreshCw size={14} /> Sincronizar Agora
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStatuses.map(status => (
          <div key={status.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: status.color }} />
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl shadow-inner flex items-center justify-center" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                  {status.isFinal ? <CheckCircle size={24} /> : <Workflow size={24} />}
               </div>
               <button 
                  onClick={() => { setEditingStatus(status); setIsEditModalOpen(true); }}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-[#0d457a] hover:bg-blue-50 rounded-xl transition-all"
               >
                  <Edit2 size={16} />
               </button>
            </div>
            
            <h3 className="font-black text-base text-[#0d457a] uppercase leading-tight mb-4 min-h-[40px]">{status.name}</h3>
            
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50 mt-auto">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1.5" style={{ color: status.color, backgroundColor: `${status.color}08` }}>
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                   Hex: {status.color}
                </span>
                {status.isFinal ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 size={10}/> Finalizador
                    </span>
                ) : (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                        <RefreshCw size={10} className="animate-spin-slow"/> Em Trâmite
                    </span>
                )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Novo Estado do Ciclo</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nome do Estado (Cloud Reference)</label>
                <input 
                  type="text" 
                  value={newStatus.name} 
                  onChange={(e) => setNewStatus({...newStatus, name: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/10 transition-all" 
                  required 
                  placeholder="EX: AGUARDANDO ASSINATURA"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Cor de Fluxo</label>
                    <input 
                      type="color" 
                      value={newStatus.color} 
                      onChange={(e) => setNewStatus({...newStatus, color: e.target.value})} 
                      className="w-full h-14 p-1 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer" 
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={newStatus.isFinal} 
                          onChange={(e) => setNewStatus({...newStatus, isFinal: e.target.checked})} 
                          className="w-6 h-6 rounded-lg border-slate-200 text-emerald-500 focus:ring-emerald-500 transition-all"
                        />
                        <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-[#0d457a]">Estado de Encerramento</span>
                    </label>
                  </div>
              </div>
              <button type="submit" className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-[#0a365f] transition-all">Persistir na Nuvem GESA</button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Editar Estado do Ciclo</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X/></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nome do Estado</label>
                <input 
                  type="text" 
                  value={editingStatus.name} 
                  onChange={(e) => setEditingStatus({...editingStatus, name: e.target.value.toUpperCase()})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/10 transition-all" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Cor de Fluxo</label>
                    <input 
                      type="color" 
                      value={editingStatus.color} 
                      onChange={(e) => setEditingStatus({...editingStatus, color: e.target.value})} 
                      className="w-full h-14 p-1 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer" 
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={editingStatus.isFinal} 
                          onChange={(e) => setEditingStatus({...editingStatus, isFinal: e.target.checked})} 
                          className="w-6 h-6 rounded-lg border-slate-200 text-emerald-500 focus:ring-emerald-500 transition-all"
                        />
                        <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-[#0d457a]">Estado de Encerramento</span>
                    </label>
                  </div>
              </div>
              <button type="submit" className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-[#0a365f] transition-all flex items-center justify-center gap-2">
                 <Save size={16}/> Atualizar na Base Cloud
              </button>
            </form>
          </div>
        </div>
      )}

      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden border-t-8 border-red-500 animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Esquema do Banco (statuses)</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Configuração de Infraestrutura GESA Cloud</p>
               </div>
               <button onClick={() => setIsSqlModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} />
               </button>
            </div>
            <div className="p-10 space-y-6">
               <pre className="bg-slate-900 text-blue-400 p-6 rounded-3xl font-mono text-[11px] overflow-x-auto h-72 border border-white/5 shadow-inner">
                   {sqlSetup}
               </pre>
               <button 
                  onClick={() => {
                    navigator.clipboard.writeText(sqlSetup);
                    alert("Script copiado. Cole no SQL Editor do Supabase.");
                  }}
                  className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl"
               >
                 <Copy size={18}/> Copiar Script de Migração
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};