
import React, { useState, useMemo, useRef } from 'react';
import { Amendment, StatusConfig, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types.ts';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants.ts';
import { 
  Plus, Search, Filter, MapPin, Pencil, User, Send, ChevronDown, 
  Landmark, XCircle, ChevronLeft, ChevronRight, FileText, 
  X, ArrowRightLeft, Building2, Edit3, Tag, DollarSign, Calendar, Info, Layers, Zap, HardDrive, Settings2,
  ArrowRight, Lock, Check, ListFilter, ShieldAlert, Terminal, Copy, Settings, Sparkles
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
  const [isQuickStatusModalOpen, setIsQuickStatusModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [quickStatusData, setQuickStatusData] = useState({ name: '', color: '#0d457a', isFinal: false });
  
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

  const initialFormState: Partial<Amendment> = {
    code: '',
    year: new Date().getFullYear(),
    type: AmendmentType.IMPOSITIVA,
    status: statuses.length > 0 ? statuses[0].name : 'Análise da Documentação',
    object: '',
    municipality: '',
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

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStatusFilter = (statusName: string) => {
    setSelectedStatuses(prev => 
      prev.includes(statusName) 
        ? prev.filter(s => s !== statusName) 
        : [...prev, statusName]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setDeputyFilter('all');
    setMunicipalityFilter('all');
    setCurrentPage(1);
  };

  const filteredAmendments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return amendments.filter(a => {
      const matchesSearch = !term ||
        (a.seiNumber?.toLowerCase().includes(term)) ||
        (a.deputyName?.toLowerCase().includes(term)) ||
        (a.municipality?.toLowerCase().includes(term)) ||
        (a.object?.toLowerCase().includes(term)) ||
        (a.status?.toLowerCase().includes(term));
      
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(a.status);
      const matchesDeputy = deputyFilter === 'all' || a.deputyName === deputyFilter;
      const matchesMunicipality = municipalityFilter === 'all' || a.municipality === municipalityFilter;

      return matchesSearch && matchesStatus && matchesDeputy && matchesMunicipality;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [amendments, searchTerm, selectedStatuses, deputyFilter, municipalityFilter]);

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Amendment);
    } else {
      onCreate({ 
        ...formData, 
        id: `a-${Date.now()}`, 
        createdAt: new Date().toISOString(),
        movements: [] 
      } as Amendment);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleQuickStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddStatus && quickStatusData.name) {
      try {
        const savedStatus = await onAddStatus({
          id: '',
          tenantId: '',
          name: quickStatusData.name.toUpperCase(),
          color: quickStatusData.color,
          isFinal: quickStatusData.isFinal
        });
        setFormData(prev => ({ ...prev, status: savedStatus.name }));
        setIsQuickStatusModalOpen(false);
        setQuickStatusData({ name: '', color: '#0d457a', isFinal: false });
      } catch (err) {}
    }
  };

  const openEdit = (a: Amendment) => {
    setFormData(a);
    setEditingId(a.id);
    setIsModalOpen(true);
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Alerta de Banco Desconectado */}
      {error === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-amber-900/5">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center animate-pulse">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-900 uppercase">Repositório de Dados Offline</h3>
            <p className="text-xs text-amber-700 font-bold uppercase mt-2 max-w-xl">
              A tabela de processos (amendments) ainda não foi provisionada no Supabase. O sistema está exibindo dados temporários.
            </p>
          </div>
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="px-10 py-5 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-amber-700 transition-all flex items-center gap-3"
          >
            <Terminal size={18} /> Provisionar Tabela SQL
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Processos SEI</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
            <Layers size={16} className="text-blue-500" /> Fluxo de Gestão SES/SUBIPEI
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => { setEditingId(null); setFormData(initialFormState); setIsModalOpen(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest group"
          >
            <Plus size={18} className="group-hover:scale-125 transition-transform" />
            Novo Registro
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por SEI, Autor, Município ou Objeto..." 
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 uppercase text-xs focus:ring-4 ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="lg:col-span-3">
             <select 
               value={deputyFilter} 
               onChange={(e) => setDeputyFilter(e.target.value)}
               className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase outline-none focus:ring-4 ring-blue-500/5"
             >
                <option value="all">Parlamentar: Todos</option>
                {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
          </div>
          <div className="lg:col-span-3">
             <select 
               value={municipalityFilter} 
               onChange={(e) => setMunicipalityFilter(e.target.value)}
               className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase outline-none focus:ring-4 ring-blue-500/5"
             >
                <option value="all">Município: Todos</option>
                {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>

        {/* STATUS CHIPS FILTER */}
        <div className="pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ListFilter size={14} /> Filtrar por Status do Ciclo
            </h3>
            {(selectedStatuses.length > 0 || searchTerm || deputyFilter !== 'all' || municipalityFilter !== 'all') && (
              <button 
                onClick={clearFilters}
                className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <X size={12} /> Limpar Filtros
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => {
              const isActive = selectedStatuses.includes(s.name);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStatusFilter(s.name)}
                  style={{ 
                    backgroundColor: isActive ? s.color : 'transparent',
                    borderColor: isActive ? s.color : '#e2e8f0',
                    color: isActive ? '#fff' : '#64748b'
                  }}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all hover:shadow-md flex items-center gap-2 ${isActive ? 'shadow-lg scale-105' : 'bg-white'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : ''}`} style={{ backgroundColor: isActive ? 'white' : s.color }}></div>
                  {s.name}
                  {isActive && <Check size={12} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedData.map(a => {
          const statusConfig = statuses.find(s => s.name === a.status);
          const statusColor = statusConfig?.color || '#0d457a';
          
          return (
            <div 
              key={a.id} 
              className="bg-white rounded-[32px] lg:rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-[#0d457a]/20 transition-all group overflow-hidden flex flex-col"
            >
              <div className="p-8 flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div 
                    className="px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border"
                    style={{ backgroundColor: `${statusColor}10`, color: statusColor, borderColor: `${statusColor}30` }}
                  >
                    {a.status}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(a)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-[#0d457a] rounded-xl border border-slate-100 shadow-sm transition-all">
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>

                <div onClick={() => onSelect(a)} className="cursor-pointer space-y-3">
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">{a.seiNumber}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed line-clamp-3 h-[42px]">{a.object}</p>
                  
                  <div className="pt-4 flex flex-wrap gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-emerald-500" />
                       <span className="text-[9px] font-black text-slate-600 uppercase">{a.municipality}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-blue-500" />
                       <span className="text-[9px] font-black text-slate-600 uppercase">{a.deputyName}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
                 <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Montante</p>
                    <p className="text-lg font-black text-[#0d457a] tracking-tighter">{formatBRL(a.value)}</p>
                 </div>
                 <button 
                  onClick={() => onSelect(a)}
                  className="w-11 h-11 bg-white border border-slate-200 text-[#0d457a] rounded-2xl flex items-center justify-center hover:bg-[#0d457a] hover:text-white hover:shadow-lg transition-all"
                 >
                    <ArrowRight size={20} />
                 </button>
              </div>
            </div>
          );
        })}

        {paginatedData.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100">
             <Search size={64} className="mx-auto text-slate-100 mb-6" />
             <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Nenhum processo localizado</h3>
             <p className="text-xs text-slate-400 font-bold uppercase mt-2">Ajuste os filtros de busca ou status para expandir os resultados.</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-10">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:shadow-md disabled:opacity-30 disabled:shadow-none transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-8 py-4 bg-[#0d457a] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
            Página {currentPage} / {totalPages}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:shadow-md disabled:opacity-30 disabled:shadow-none transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL NEW/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">{editingId ? 'Ajustar Registro' : 'Novo Processo SEI'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sincronização com Repositório GESA Cloud</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número SEI *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.seiNumber}
                        onChange={(e) => setFormData({...formData, seiNumber: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none uppercase text-xs"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ano Exercício</label>
                        <input 
                          type="number" 
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Alocado (R$)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          value={formData.value}
                          onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none text-xs"
                        />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Município Beneficiado</label>
                      <select 
                        value={formData.municipality}
                        onChange={(e) => setFormData({...formData, municipality: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs"
                      >
                        <option value="">Selecione...</option>
                        {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Parlamentar / Autor</label>
                      <select 
                        value={formData.deputyName}
                        onChange={(e) => setFormData({...formData, deputyName: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs"
                      >
                        <option value="">Selecione...</option>
                        {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Objeto do Repasse</label>
                      <textarea 
                        required
                        value={formData.object}
                        onChange={(e) => setFormData({...formData, object: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none h-32 uppercase text-xs resize-none"
                        placeholder="EX: AQUISIÇÃO DE EQUIPAMENTOS MÉDICOS..."
                      />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status de Ingestão</label>
                        <button 
                          type="button" 
                          onClick={() => setIsQuickStatusModalOpen(true)}
                          className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                        >
                          <Plus size={12} /> Novo Status
                        </button>
                      </div>
                      <div className="relative">
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] uppercase outline-none text-xs appearance-none"
                        >
                          {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                        <Settings2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="bg-[#0d457a] text-white px-12 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-[#0a365f] transition-all flex items-center gap-3">
                   {editingId ? 'Salvar Alterações' : 'Registrar Processo'} <ArrowRight size={18}/>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STATUS MODAL */}
      {isQuickStatusModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#0d457a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
            <div className="p-8 bg-gradient-to-br from-[#0d457a] to-[#1e5a94] text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl"><Tag size={20}/></div>
                  <h4 className="font-black uppercase tracking-widest text-xs">Configurar Novo Status</h4>
               </div>
               <button onClick={() => setIsQuickStatusModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleQuickStatusSubmit} className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome do Status</label>
                  <input 
                    type="text"
                    required
                    autoFocus
                    placeholder="EX: AGUARDANDO ASSINATURA"
                    value={quickStatusData.name}
                    onChange={(e) => setQuickStatusData({...quickStatusData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none uppercase text-xs"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cor de Alerta</label>
                    <input 
                      type="color"
                      value={quickStatusData.color}
                      onChange={(e) => setQuickStatusData({...quickStatusData, color: e.target.value})}
                      className="w-full h-12 p-1 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer"
                    />
                  </div>
                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={quickStatusData.isFinal}
                          onChange={(e) => setQuickStatusData({...quickStatusData, isFinal: e.target.checked})}
                          className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#0d457a]">Estado Final</span>
                    </label>
                  </div>
               </div>
               <button 
                type="submit"
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
               >
                 <Sparkles size={16}/> Salvar e Selecionar
               </button>
            </form>
          </div>
        </div>
      )}

      {/* SQL MODAL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-amber-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Esquema do Banco (amendments)</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sincronização de Processos SEI Cloud</p>
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
