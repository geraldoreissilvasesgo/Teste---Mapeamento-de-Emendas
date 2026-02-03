
import React, { useState, useMemo } from 'react';
import { SectorConfig, StatusConfig } from '../types.ts';
import { 
  Plus, Clock, ShieldCheck, X, Building2, Briefcase, 
  Lock, Info, Search, Save, Pencil, ShieldAlert,
  Database, FileJson, CheckCircle2, Loader2, Copy, Check, Terminal, Edit2
} from 'lucide-react';

interface SectorManagementProps {
  sectors: SectorConfig[];
  statuses: StatusConfig[];
  onAdd: (sector: SectorConfig) => void;
  onBatchAdd: (sectors: any[]) => void;
  onUpdateSla: (id: string, newSla: number) => void;
  error?: string | null;
}

export const SectorManagement: React.FC<SectorManagementProps> = ({ 
  sectors, statuses, onAdd, onBatchAdd, onUpdateSla, error 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(error === 'DATABASE_SETUP_REQUIRED');
  const [batchText, setBatchText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newSector, setNewSector] = useState<Partial<SectorConfig>>({
    name: '',
    defaultSlaDays: 5,
    analysisType: statuses.length > 0 ? statuses[0].name : ''
  });

  const [editingSector, setEditingSector] = useState<SectorConfig | null>(null);

  const sqlSetup = `-- GESA CLOUD: ESTRUTURA DE UNIDADES TÉCNICAS
-- 1. Criar Tabela de Setores
create table if not exists sectors (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  name text not null,
  "defaultSlaDays" integer default 5,
  "analysisType" text,
  "createdAt" timestamp with time zone default now()
);

-- 2. Habilitar Segurança RLS
alter table sectors enable row level security;
create policy "Acesso por Tenant Setores" on sectors for all using (true);`;

  const filteredSectors = useMemo(() => {
    return sectors.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sectors, searchTerm]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBatchSubmit = async () => {
    const lines = batchText.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return;

    setIsLoading(true);
    const sectorsToInsert = lines.map(line => ({
      name: line.trim().toUpperCase(),
      defaultSlaDays: 5,
      analysisType: statuses.length > 0 ? statuses[0].name : 'Análise Técnica'
    }));

    try {
      await onBatchAdd(sectorsToInsert);
      setBatchText('');
      setIsBatchModalOpen(false);
    } catch (e) {
      alert("Falha na inserção em lote.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSector.name) {
      onAdd({
        name: newSector.name.toUpperCase(),
        defaultSlaDays: newSector.defaultSlaDays || 5,
        analysisType: newSector.analysisType || (statuses.length > 0 ? statuses[0].name : '')
      } as SectorConfig);
      setIsModalOpen(false);
      setNewSector({ name: '', defaultSlaDays: 5, analysisType: statuses.length > 0 ? statuses[0].name : '' });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSector) {
      onAdd(editingSector);
      setIsEditModalOpen(false);
      setEditingSector(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-amber-900/5">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center animate-pulse">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-900 uppercase">Tabela 'sectors' não provisionada!</h3>
            <p className="text-xs text-amber-700 font-bold uppercase mt-2 max-w-xl">
              O sistema detectou que a estrutura física de unidades técnicas ainda não foi inicializada no seu Supabase. 
            </p>
          </div>
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="px-10 py-5 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-amber-700 transition-all flex items-center gap-3"
          >
            <Terminal size={18} /> Ver Script SQL
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Unidades Técnicas</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <Building2 size={14} className="text-blue-500"/> Arquitetura de Fluxo SES/SUBIPEI
          </p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setIsBatchModalOpen(true)} 
              className="flex items-center gap-2 bg-white text-[#0d457a] border border-slate-200 px-6 py-4 rounded-[20px] hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
            >
                <Database size={16} /> Carga em Lote
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-[20px] hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[11px] font-black tracking-[0.2em]"
            >
                <Plus size={18} /> Nova Unidade
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-3">
         <Search size={20} className="text-slate-300 ml-2" />
         <input 
            type="text" 
            placeholder="Pesquisar unidades técnicas..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-600 placeholder:text-slate-300 uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filteredSectors.map(sector => (
          <div key={sector.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 hover:shadow-xl hover:border-[#0d457a]/20 transition-all group relative">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl group-hover:bg-[#0d457a] group-hover:text-white transition-colors">
                      <Building2 size={24} />
                   </div>
                   <div className="flex gap-2">
                     <button 
                        onClick={() => { setEditingSector(sector); setIsEditModalOpen(true); }}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-[#0d457a] hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar SLA"
                     >
                        <Edit2 size={16} />
                     </button>
                     <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-100">Ativa</span>
                </div>
                </div>
                
                <h3 className="font-black text-base text-[#0d457a] uppercase leading-tight mb-2 min-h-[40px]">{sector.name}</h3>
                
                <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Estado Vinculado</span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{sector.analysisType || 'NÃO DEFINIDO'}</span>
                    </div>
                    <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 block">SLA Operacional</span>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-amber-500" />
                            <span className="text-base font-black text-[#0d457a]">{sector.defaultSlaDays} Dias</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Registrar Unidade</h3>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Sigla/Nome da Unidade</label>
                <input 
                  type="text" 
                  value={newSector.name} 
                  onChange={(e) => setNewSector({...newSector, name: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/10 transition-all" 
                  required 
                  placeholder="EX: SES/SUBIPEI-21286"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">SLA (Dias)</label>
                    <input 
                      type="number" 
                      value={newSector.defaultSlaDays} 
                      onChange={(e) => setNewSector({...newSector, defaultSlaDays: parseInt(e.target.value)})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Estado do Ciclo</label>
                    <select 
                      value={newSector.analysisType} 
                      onChange={(e) => setNewSector({...newSector, analysisType: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 uppercase text-[10px] outline-none"
                    >
                      <option value="">Selecione...</option>
                      {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
              </div>
              <button type="submit" className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-[#0a365f] transition-all">Confirmar Registro</button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingSector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Ajustar Unidade</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nome da Unidade</label>
                <input 
                  type="text" 
                  value={editingSector.name} 
                  onChange={(e) => setEditingSector({...editingSector, name: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">SLA (Dias)</label>
                    <input 
                      type="number" 
                      value={editingSector.defaultSlaDays} 
                      onChange={(e) => setEditingSector({...editingSector, defaultSlaDays: parseInt(e.target.value)})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Estado do Ciclo</label>
                    <select 
                      value={editingSector.analysisType} 
                      onChange={(e) => setEditingSector({...editingSector, analysisType: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 uppercase text-[10px] outline-none"
                    >
                      {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
              </div>
              <button type="submit" className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-lg flex items-center justify-center gap-2">
                <Save size={18} /> Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {isBatchModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Carga em Lote</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cole nomes das unidades (um por linha)</p>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)}><X/></button>
            </div>
            <div className="p-8 space-y-6">
              <textarea 
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="EX:&#10;SES/GCONV&#10;SES/SUBIPEI&#10;SES/FES"
                className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-xs text-[#0d457a] outline-none focus:ring-4 ring-blue-500/5 resize-none uppercase"
              />
              <button 
                onClick={handleBatchSubmit}
                disabled={isLoading || !batchText.trim()}
                className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <FileJson size={20} />}
                Processar Carga Digitada
              </button>
            </div>
          </div>
        </div>
      )}

      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden border-t-8 border-amber-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Esquema do Banco (sectors)</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sincronização de Infraestrutura Governamental</p>
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
    </div>
  );
};
