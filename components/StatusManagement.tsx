
import React, { useState, useMemo } from 'react';
import { StatusConfig } from '../types';
import { 
  Plus, X, Tag, Info, Search, Save, Pencil, Trash2, ShieldAlert,
  Database, CheckCircle2, Loader2, Copy, Check, Terminal, Edit2, Palette, CheckCircle, Zap
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
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(error === 'DATABASE_SETUP_REQUIRED');
  const [batchText, setBatchText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newStatus, setNewStatus] = useState<Partial<StatusConfig>>({
    name: '',
    color: '#0d457a',
    isFinal: false
  });

  const [editingStatus, setEditingStatus] = useState<StatusConfig | null>(null);

  const handleSeedData = async () => {
    if (!window.confirm("Deseja carregar os estados padrão do Governo de Goiás?")) return;
    
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
      alert("Erro ao popular tabela.");
    } finally {
      setIsLoading(false);
    }
  };

  const sqlSetup = `-- 1. Criar Tabela de Status
create table if not exists statuses (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'T-01',
  name text not null,
  color text default '#0d457a',
  "isFinal" boolean default false,
  "createdAt" timestamp with time zone default now()
);

-- 2. Habilitar Segurança RLS
alter table statuses enable row level security;
create policy "Acesso Total para Testes Status" on statuses for all using (true);`;

  const filteredStatuses = useMemo(() => {
    return statuses.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [statuses, searchTerm]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async () => {
    if (window.confirm("⚠️ OPERAÇÃO CRÍTICA: Deseja apagar todos os registros da tabela 'statuses'?")) {
      setIsLoading(true);
      await onReset();
      setIsLoading(false);
    }
  };

  const handleBatchSubmit = async () => {
    const lines = batchText.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return;

    setIsLoading(true);
    const statusesToInsert = lines.map(line => ({
      name: line.trim().toUpperCase(),
      color: '#64748b',
      isFinal: false
    }));

    try {
      await onBatchAdd(statusesToInsert);
      setBatchText('');
      setIsBatchModalOpen(false);
    } catch (e) {
      alert("Falha na inserção: Verifique a conexão com o banco.");
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-red-50 border border-red-200 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-red-900/5">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center animate-bounce">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-red-900 uppercase">Tabela 'statuses' não encontrada!</h3>
            <p className="text-xs text-red-700 font-bold uppercase mt-2 max-w-xl">
              Detectamos que você criou a tabela de setores, mas a de **status** ainda não está ativa no banco. Execute o script SQL abaixo.
            </p>
          </div>
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-red-700 transition-all flex items-center gap-3"
          >
            <Terminal size={18} /> Abrir Script de Status
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Estados de Processo</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <Tag size={14} className="text-blue-500"/> Ciclo de Vida do Processo GESA Cloud
          </p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleSeedData} 
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-6 py-4 rounded-[20px] hover:bg-blue-100 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
            >
                <Zap size={16} /> Carga Inicial
            </button>
            <button 
              onClick={handleReset} 
              disabled={isLoading || statuses.length === 0}
              className="flex items-center gap-2 bg-white text-red-400 border border-slate-200 px-6 py-4 rounded-[20px] hover:bg-red-50 hover:border-red-100 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest disabled:opacity-30"
            >
                <Trash2 size={16} /> Resetar
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-[20px] hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[11px] font-black tracking-[0.2em]"
            >
                <Plus size={18} /> Novo Status
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-3">
         <Search size={20} className="text-slate-300 ml-2" />
         <input 
            type="text" 
            placeholder="Pesquisar status cadastrados na base..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-600 placeholder:text-slate-300 uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStatuses.map(status => (
          <div key={status.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative">
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl shadow-inner flex items-center justify-center" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                  <Tag size={24} />
               </div>
               <button 
                  onClick={() => { setEditingStatus(status); setIsEditModalOpen(true); }}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-[#0d457a] hover:bg-blue-50 rounded-xl transition-all"
               >
                  <Edit2 size={16} />
               </button>
            </div>
            
            <h3 className="font-black text-base text-[#0d457a] uppercase leading-tight mb-4 min-h-[40px]">{status.name}</h3>
            
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1.5" style={{ color: status.color, backgroundColor: `${status.color}08` }}>
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                   Hex: {status.color}
                </span>
                {status.isFinal && (
                    <span className="px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                        <CheckCircle size={10} /> Estado Final
                    </span>
                )}
            </div>
          </div>
        ))}

        {filteredStatuses.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200">
             <Database size={48} className="text-slate-200 mx-auto mb-4" />
             <h3 className="text-slate-400 font-black uppercase tracking-widest">Base de Status Vazia</h3>
             <p className="text-slate-300 text-xs font-bold uppercase mt-2">Clique em 'Carga Inicial' para preencher com dados padrão do SEI.</p>
          </div>
        )}
      </div>

      {/* Modal SQL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-red-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Script de Status GESA</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Supabase Database Setup Required</p>
               </div>
               <button onClick={() => setIsSqlModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} />
               </button>
            </div>
            <div className="p-10 space-y-6">
               <pre className="bg-slate-900 text-blue-400 p-6 rounded-3xl font-mono text-[11px] overflow-x-auto h-64 border border-white/5 shadow-inner">
                   {sqlSetup}
               </pre>
               <button 
                  onClick={handleCopySql}
                  className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl"
               >
                 {copied ? <Check size={18}/> : <Copy size={18}/>}
                 {copied ? 'Copiado!' : 'Copiar Script SQL'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Status */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Novo Estado</h3>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nome do Estado</label>
                <input 
                  type="text" 
                  value={newStatus.name} 
                  onChange={(e) => setNewStatus({...newStatus, name: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase" 
                  required 
                  placeholder="EX: AGUARDANDO ASSINATURA" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Cor Identificadora</label>
                    <div className="flex gap-3">
                        <input 
                            type="color" 
                            value={newStatus.color} 
                            onChange={(e) => setNewStatus({...newStatus, color: e.target.value})} 
                            className="w-14 h-14 rounded-xl cursor-pointer border-none bg-transparent"
                        />
                        <input 
                            type="text" 
                            value={newStatus.color} 
                            onChange={(e) => setNewStatus({...newStatus, color: e.target.value})} 
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold uppercase"
                        />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-200 w-full">
                        <input 
                            type="checkbox" 
                            checked={newStatus.isFinal} 
                            onChange={(e) => setNewStatus({...newStatus, isFinal: e.target.checked})}
                            className="w-5 h-5 rounded border-slate-300 text-[#0d457a] focus:ring-[#0d457a]"
                        />
                        <span className="text-[10px] font-black text-slate-600 uppercase">Estado Final?</span>
                    </label>
                  </div>
              </div>
              <button type="submit" className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-lg">Cadastrar Status</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edição */}
      {isEditModalOpen && editingStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Editar Estado</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nome do Estado</label>
                <input 
                  type="text" 
                  value={editingStatus.name} 
                  onChange={(e) => setEditingStatus({...editingStatus, name: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Cor Identificadora</label>
                    <div className="flex gap-3">
                        <input 
                            type="color" 
                            value={editingStatus.color} 
                            onChange={(e) => setEditingStatus({...editingStatus, color: e.target.value})} 
                            className="w-14 h-14 rounded-xl cursor-pointer border-none bg-transparent"
                        />
                        <input 
                            type="text" 
                            value={editingStatus.color} 
                            onChange={(e) => setEditingStatus({...editingStatus, color: e.target.value})} 
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold uppercase"
                        />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-200 w-full">
                        <input 
                            type="checkbox" 
                            checked={editingStatus.isFinal} 
                            onChange={(e) => setEditingStatus({...editingStatus, isFinal: e.target.checked})}
                            className="w-5 h-5 rounded border-slate-300 text-[#0d457a] focus:ring-[#0d457a]"
                        />
                        <span className="text-[10px] font-black text-slate-600 uppercase">Estado Final?</span>
                    </label>
                  </div>
              </div>
              <button type="submit" className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-lg flex items-center justify-center gap-2">
                 <Save size={18} /> Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
