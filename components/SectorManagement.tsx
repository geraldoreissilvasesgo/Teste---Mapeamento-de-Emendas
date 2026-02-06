
import React, { useState, useMemo } from 'react';
import { SectorConfig, StatusConfig } from '../types';
import { 
  Plus, Clock, ShieldCheck, X, Building2, 
  Lock, Info, Search, Save, Pencil, ShieldAlert,
  Database, Loader2, Copy, Terminal, Edit2, AlertCircle,
  Settings2, Workflow
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
  sectors, statuses, onAdd, onBatchAdd, error 
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
create table if not exists sectors (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  name text not null,
  "defaultSlaDays" integer default 5,
  "analysisType" text,
  "createdAt" timestamp with time zone default now()
);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {error === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-amber-900/5">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center animate-pulse">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-900 uppercase">Infraestrutura 'sectors' Não Detectada</h3>
            <p className="text-xs text-amber-700 font-bold uppercase mt-2 max-w-xl">
              A estrutura física de unidades técnicas ainda não foi inicializada.
            </p>
          </div>
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="px-10 py-5 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-amber-700 transition-all flex items-center gap-3"
          >
            <Terminal size={18} /> Ver Script de Migração
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Unidades Técnicas</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <Building2 size={14} className="text-blue-500" /> Configuração de Unidades SES-GO
          </p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setIsBatchModalOpen(true)} 
              className="flex items-center gap-2 bg-white text-slate-400 border border-slate-200 px-6 py-4 rounded-[20px] hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
            >
                Carga em Lote
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-[20px] hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[11px] font-black tracking-[0.2em]"
            >
                <Plus size={18} /> Cadastrar Unidade
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSectors.map(sector => (
          <div key={sector.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 shadow-inner flex items-center justify-center">
                  <Building2 size={24} />
               </div>
            </div>
            <h3 className="font-black text-base text-[#0d457a] uppercase leading-tight mb-2">{sector.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sector.analysisType || 'Análise Geral'}</p>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-xs font-black text-slate-600">SLA: {sector.defaultSlaDays} Dias</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
