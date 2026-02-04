import React, { useState, useMemo, useRef } from 'react';
import { Amendment, StatusConfig, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types.ts';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants.ts';
import { 
  Plus, Search, Filter, MapPin, Pencil, User, Send, ChevronDown, 
  Landmark, XCircle, ChevronLeft, ChevronRight, FileText, 
  X, ArrowRightLeft, Building2, Edit3, Tag, DollarSign, Calendar, Info, Layers, Zap, HardDrive, Settings2,
  ArrowRight, Lock, Check, ListFilter, ShieldAlert, Terminal, Copy, Settings, Sparkles, AlertCircle,
  Briefcase
} from 'lucide-react';

interface AmendmentListProps {
  amendments: Amendment[];
  sectors: SectorConfig[];
  statuses: StatusConfig[];
  userRole: Role;
  systemMode: SystemMode;
  onSelect: (amendment: Amendment) => void;
  onCreate: (amendment: Amendment) => void;
  onUpdate: (amendment: Amendment) => void;
  onInactivate: (id: string, justification: string) => void;
  onAddStatus?: (status: StatusConfig) => Promise<StatusConfig>;
  error?: string | null;
}

const ITEMS_PER_PAGE = 12;

export const AmendmentList: React.FC<AmendmentListProps> = ({ 
  amendments, 
  sectors,
  statuses,
  userRole, 
  systemMode,
  onSelect,
  onCreate,
  onUpdate,
  onInactivate,
  onAddStatus,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [deputyFilter, setDeputyFilter] = useState<string>('all');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Partial<Amendment> = {
    code: '',
    year: new Date().getFullYear(),
    type: AmendmentType.IMPOSITIVA,
    status: statuses.length > 0 ? statuses[0].name : 'Análise da Documentação',
    object: '',
    municipality: '',
    beneficiaryUnit: '',
    deputyName: 'Executivo Estadual',
    seiNumber: '',
    value: 0,
    suinfra: false,
    sutis: false,
    transferMode: TransferMode.FUNDO_A_FUNDO,
    gnd: GNDType.CUSTEIO,
    entryDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Amendment>>(initialFormState);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(v);

  const sqlSetup = `-- GESA CLOUD: ESTRUTURA DE PROCESSOS (AMENDMENTS)
-- 1. Criar Tabela de Emendas
create table if not exists amendments (
  id uuid primary key default gen_random_uuid(),
  "tenantId" text not null default 'GOIAS',
  code text,
  "seiNumber" text not null,
  year integer,
  type text,
  "deputyName" text,
  municipality text,
  "beneficiaryUnit" text,
  object text,
  value numeric(15,2),
  status text,
  "currentSector" text,
  movements jsonb default '[]'::jsonb,
  "createdAt" timestamp with time zone default now(),
  "entryDate" date,
  suinfra boolean default false,
  sutis boolean default false
);

-- 2. Habilitar Segurança RLS
alter table amendments enable row level security;
create policy "Acesso por Tenant Emendas" on amendments for all using (true);`;

  const filteredAmendments = useMemo(() => {
    return amendments.filter(a => {
      const matchesSearch = !searchTerm || 
        a.seiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.object.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(a.status);
      const matchesDeputy = deputyFilter === 'all' || a.deputyName === deputyFilter;
      const matchesMunicipality = municipalityFilter === 'all' || a.municipality === municipalityFilter;
      
      return matchesSearch && matchesStatus && matchesDeputy && matchesMunicipality;
    });
  }, [amendments, searchTerm, selectedStatuses, deputyFilter, municipalityFilter]);

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Amendment);
    } else {
      onCreate({ ...formData } as Amendment);
    }
    setIsModalOpen(false);
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {error === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-amber-900/5 mb-8">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center animate-pulse">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-900 uppercase">Sincronização de Emendas Necessária</h3>
            <p className="text-xs text-amber-700 font-bold uppercase mt-2">A estrutura do banco 'amendments' não foi provisionada.</p>
          </div>
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="px-10 py-5 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-amber-700 transition-all flex items-center gap-3"
          >
            <Terminal size={18} /> Ver Script de Migração
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Processos SEI</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
            <Layers size={16} className="text-blue-500" /> Gestão de Fluxo e Tramitação
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest"
        >
          <Plus size={18} /> Novo Registro SEI
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="PESQUISAR POR NÚMERO SEI OU OBJETO..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs uppercase text-[#0d457a]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="lg:col-span-3">
          <select 
            value={deputyFilter}
            onChange={(e) => setDeputyFilter(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-600 outline-none appearance-none"
          >
            <option value="all">TODOS OS PARLAMENTARES</option>
            {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="lg:col-span-3">
          <select 
            value={municipalityFilter}
            onChange={(e) => setMunicipalityFilter(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-600 outline-none appearance-none"
          >
            <option value="all">TODOS OS MUNICÍPIOS</option>
            {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="lg:col-span-1 flex justify-center">
          <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
         {statuses.map(s => (
           <button 
             key={s.id} 
             onClick={() => toggleStatusFilter(s.name)}
             className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
               selectedStatuses.includes(s.name) 
               ? 'bg-[#0d457a] text-white border-[#0d457a] shadow-lg' 
               : 'bg-white text-slate-400 border-slate-200 hover:border-blue-200'
             }`}
           >
             {s.name}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedData.map((amendment) => (
          <div 
            key={amendment.id} 
            onClick={() => onSelect(amendment)}
            className="group bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all cursor-pointer relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <FileText size={80} />
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-100">
                {amendment.type}
              </span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{amendment.year}</span>
            </div>

            <h3 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter leading-tight mb-2 group-hover:text-blue-600 transition-colors">{amendment.seiNumber}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase line-clamp-2 mb-6 leading-relaxed flex-1">{amendment.object}</p>
            
            <div className="pt-6 border-t border-slate-50 space-y-3 mt-auto">
               <div className="flex items-center gap-2">
                 <MapPin size={12} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-[#0d457a] uppercase tracking-tight">{amendment.municipality}</span>
               </div>
               <div className="flex items-center gap-2">
                 <User size={12} className="text-slate-400" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{amendment.deputyName}</span>
               </div>
               <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-black text-[#0d457a]">{formatBRL(amendment.value)}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#0d457a] group-hover:bg-[#0d457a] group-hover:text-white transition-all shadow-inner">
                    <ArrowRight size={14} />
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
           <button 
             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             disabled={currentPage === 1}
             className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] disabled:opacity-30 shadow-sm"
           >
             <ChevronLeft size={20} />
           </button>
           <span className="text-[10px] font-black uppercase tracking-widest bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">Página {currentPage} de {totalPages}</span>
           <button 
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             disabled={currentPage === totalPages}
             className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] disabled:opacity-30 shadow-sm"
           >
             <ChevronRight size={20} />
           </button>
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">
                    {editingId ? 'Ajustar Dossiê Digital' : 'Registrar Novo Processo SEI'}
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Sincronização GESA Cloud Engine</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={28} />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <FileText size={16}/> Identificação do Processo
                    </h4>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Processo SEI *</label>
                        <div className="relative">
                          <Settings size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                              type="text" 
                              value={formData.seiNumber}
                              onChange={(e) => setFormData({...formData, seiNumber: e.target.value})}
                              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none uppercase text-xs focus:ring-4 ring-blue-500/5 transition-all"
                              placeholder="EX: 20240001000..."
                              required
                          />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Entrada</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                              type="date" 
                              value={formData.entryDate || ''}
                              onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
                              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none text-xs focus:ring-4 ring-blue-500/5 transition-all"
                          />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ano Exercício</label>
                            <input 
                                type="number" 
                                value={formData.year}
                                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Previsto (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none text-xs"
                                required
                            />
                        </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <MapPin size={16}/> Localização e Autor
                    </h4>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Parlamentar / Autor</label>
                        <select 
                            value={formData.deputyName}
                            onChange={(e) => setFormData({...formData, deputyName: e.target.value})}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs"
                        >
                            {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Município Beneficiado</label>
                        <select 
                            value={formData.municipality}
                            onChange={(e) => setFormData({...formData, municipality: e.target.value})}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs"
                            required
                        >
                            <option value="">SELECIONE UM MUNICÍPIO</option>
                            {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Recurso</label>
                        <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as AmendmentType})}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs"
                        >
                            {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    {formData.type === AmendmentType.GOIAS_CRESCIMENTO && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                           <Building2 size={10} /> Unidade Beneficiada (Goiás em Crescimento) *
                        </label>
                        <div className="relative">
                           <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                           <input 
                               type="text" 
                               value={formData.beneficiaryUnit || ''}
                               onChange={(e) => setFormData({...formData, beneficiaryUnit: e.target.value})}
                               className="w-full pl-11 pr-4 py-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs focus:ring-4 ring-blue-500/10 transition-all placeholder:text-blue-200"
                               placeholder="EX: UNIDADE DE SAÚDE NORTE"
                               required={formData.type === AmendmentType.GOIAS_CRESCIMENTO}
                           />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <Sparkles size={16}/> Objeto e Finalidade
                    </h4>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Objeto *</label>
                        <textarea 
                            value={formData.object}
                            onChange={(e) => setFormData({...formData, object: e.target.value})}
                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none h-40 uppercase text-xs resize-none placeholder:text-slate-200"
                            placeholder="EX: AQUISIÇÃO DE EQUIPAMENTOS PARA UNIDADE DE SAÚDE..."
                            required
                        />
                    </div>
                    
                    <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <AlertCircle size={20} className="text-blue-500 shrink-0 mt-1" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
                          Ao salvar, o sistema irá vincular automaticamente o processo à unidade de protocolo padrão e iniciar o ciclo de SLA.
                        </p>
                    </div>
                  </div>
               </div>
               
               <div className="pt-10 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-[2] py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#0a365f] transition-all flex items-center justify-center gap-3">
                    <Check size={20} /> {editingId ? 'Efetivar Alterações' : 'Registrar Processo na Nuvem'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal SQL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-amber-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Esquema do Banco (amendments)</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sincronização de Processos GESA</p>
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