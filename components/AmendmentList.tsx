
import React, { useState, useMemo } from 'react';
import { Amendment, Status, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, Filter, MapPin, Pencil, User, Send, ChevronDown, 
  Landmark, XCircle, ChevronLeft, ChevronRight, FileText, 
  X, ArrowRightLeft, Building2, Edit3, Tag, DollarSign, Calendar, Info, Layers, Zap, HardDrive, Settings2
} from 'lucide-react';

interface AmendmentListProps {
  amendments: Amendment[];
  sectors: SectorConfig[];
  userRole: Role;
  systemMode: SystemMode;
  onSelect: (amendment: Amendment) => void;
  onCreate: (amendment: Amendment) => void;
  onUpdate: (amendment: Amendment) => void;
  onInactivate: (id: string, justification: string) => void;
}

const ITEMS_PER_PAGE = 12;

export const AmendmentList: React.FC<AmendmentListProps> = ({ 
  amendments, 
  sectors,
  userRole, 
  systemMode,
  onSelect,
  onCreate,
  onUpdate,
  onInactivate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deputyFilter, setDeputyFilter] = useState<string>('all');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState: Partial<Amendment> = {
    code: '',
    year: new Date().getFullYear(),
    type: AmendmentType.IMPOSITIVA,
    status: Status.IN_PROGRESS,
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

  const filteredAmendments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return amendments.filter(a => {
      const matchesSearch = 
        !term ||
        (a.seiNumber && a.seiNumber.toLowerCase().includes(term)) ||
        (a.deputyName && a.deputyName.toLowerCase().includes(term)) ||
        (a.municipality && a.municipality.toLowerCase().includes(term)) ||
        (a.object && a.object.toLowerCase().includes(term));
      
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesDeputy = deputyFilter === 'all' || a.deputyName === deputyFilter;
      const matchesMunicipality = municipalityFilter === 'all' || a.municipality === municipalityFilter;

      return matchesSearch && matchesStatus && matchesDeputy && matchesMunicipality;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [amendments, searchTerm, statusFilter, deputyFilter, municipalityFilter]);

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);
  const paginatedAmendments = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDeputyFilter('all');
    setMunicipalityFilter('all');
  };

  const getStatusBadgeClass = (status: Status) => {
    switch (status) {
      case Status.CONCLUDED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case Status.IN_PROGRESS: return 'bg-blue-50 text-blue-600 border-blue-100';
      case Status.DILIGENCE: return 'bg-amber-50 text-amber-600 border-amber-100';
      case Status.REJECTED: return 'bg-red-50 text-red-600 border-red-100';
      case Status.ARCHIVED: return 'bg-slate-50 text-slate-500 border-slate-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };
  
  const handleEdit = (amendment: Amendment) => {
    setEditingId(amendment.id);
    setFormData(amendment);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Amendment);
    } else {
      // Uso de prefixo 'temp-' para evitar colisão com IDs reais e orientar o backend
      onCreate({ 
        ...formData, 
        id: `temp-${Math.random().toString(36).substr(2, 9)}`, 
        createdAt: new Date().toISOString(), 
        currentSector: 'GESA - Protocolo Central',
        movements: [] 
      } as Amendment);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Gestão de Processos</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#0d457a]"></div> Base Ativa GESA Cloud
          </p>
        </div>
        <button
            onClick={() => { setFormData(initialFormState); setEditingId(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-[#0d457a] text-white px-6 py-3 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest group"
        >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Novo Registro
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                value={searchTerm}
                placeholder="Pesquisar por SEI, Parlamentar ou Município..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-bold text-slate-600 uppercase placeholder:text-slate-200 text-xs"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          {(searchTerm || statusFilter !== 'all' || deputyFilter !== 'all' || municipalityFilter !== 'all') && (
            <button 
              onClick={clearFilters}
              className="px-4 py-3.5 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <X size={14} /> Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <select
                  value={statusFilter}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-black text-[10px] text-[#0d457a] uppercase tracking-widest cursor-pointer"
                  onChange={(e) => setStatusFilter(e.target.value)}
              >
                  <option value="all">Status: Todos</option>
                  {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0d457a] pointer-events-none" />
          </div>

          <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <select
                  value={deputyFilter}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-black text-[10px] text-[#0d457a] uppercase tracking-widest cursor-pointer"
                  onChange={(e) => setDeputyFilter(e.target.value)}
              >
                  <option value="all">Autor: Todos</option>
                  {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="Executivo Estadual">Executivo Estadual</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0d457a] pointer-events-none" />
          </div>

          <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <select
                  value={municipalityFilter}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-black text-[10px] text-[#0d457a] uppercase tracking-widest cursor-pointer"
                  onChange={(e) => setMunicipalityFilter(e.target.value)}
              >
                  <option value="all">Município: Todos</option>
                  {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0d457a] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedAmendments.map(amendment => (
          <div 
            key={amendment.id} 
            className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl hover:border-[#0d457a]/20 transition-all duration-300 relative"
          >
              <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-[#0d457a] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2 uppercase">
                        <FileText size={12}/> {amendment.seiNumber}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase">{amendment.year}</span>
                  </div>

                  <h3 className="font-black text-base text-[#0d457a] mb-4 leading-tight flex-1 uppercase tracking-tight group-hover:text-blue-700 transition-colors">
                    {amendment.object}
                  </h3>

                  <div className="mb-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${getStatusBadgeClass(amendment.status)}`}>
                        <Tag size={10} />
                        {amendment.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                         <MapPin size={16} className="text-emerald-500 shrink-0" />
                         <span className="text-[11px] font-black text-[#0d457a] uppercase truncate">{amendment.municipality}</span>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                          <Building2 size={16} className="text-[#0d457a] shrink-0" />
                          <span className="text-[11px] font-black text-[#0d457a] uppercase truncate">{amendment.currentSector}</span>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-auto">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Alocado</p>
                         <p className="font-black text-[#0d457a] text-lg tracking-tighter">
                           R$ {amendment.value.toLocaleString('pt-BR')}
                         </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {userRole !== Role.VIEWER && (
                          <>
                            <button 
                              onClick={() => handleEdit(amendment)} 
                              className="p-2.5 bg-white text-slate-400 border border-slate-200 rounded-xl hover:text-[#0d457a] transition-all"
                            >
                              <Edit3 size={18}/>
                            </button>
                            <button 
                              onClick={() => onSelect(amendment)} 
                              className="px-5 py-2.5 bg-[#0d457a] text-white rounded-xl hover:bg-[#0a365f] transition-all text-[10px] font-black uppercase tracking-widest shadow-md"
                            >
                              Abrir
                            </button>
                          </>
                        )}
                      </div>
                  </div>
              </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">{editingId ? 'Editar Processo SEI' : 'Novo Registro Governamental'}</h3>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                    <Settings2 size={12} className="text-blue-500" /> Parametrização Completa
                  </p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={20}/>
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {/* Seção 1: Identificação do Processo */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="p-1 bg-blue-50 text-[#0d457a] rounded-lg"><FileText size={14}/></div>
                  <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Identificação</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Número SEI</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input type="text" required value={formData.seiNumber} onChange={e => setFormData({...formData, seiNumber: e.target.value})} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs" placeholder="2025000..." />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Código Interno</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase text-xs" placeholder="EM-2025-..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ano Exercício</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Classificação e Beneficiário */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin size={14}/></div>
                  <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Origem</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Município</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <select required value={formData.municipality} onChange={e => setFormData({...formData, municipality: e.target.value})} className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-600 uppercase appearance-none text-xs">
                        <option value="">Selecione...</option>
                        {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Parlamentar</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <select value={formData.deputyName} onChange={e => setFormData({...formData, deputyName: e.target.value})} className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-600 uppercase appearance-none text-xs">
                        <option value="Executivo Estadual">Executivo Estadual</option>
                        {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                    </div>
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Objeto do Repasse</label>
                    <textarea required value={formData.object} onChange={e => setFormData({...formData, object: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 min-h-[80px] outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs" placeholder="Descreva a finalidade da emenda..." />
                  </div>
                </div>
              </div>

              {/* Seção 3: Financeiro e Orçamentário */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="p-1 bg-amber-50 text-amber-600 rounded-lg"><Landmark size={14}/></div>
                  <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Financeiro</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as AmendmentType})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-600 text-[9px] uppercase">
                      {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
                      <input type="number" required value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Modalidade</label>
                    <select value={formData.transferMode} onChange={e => setFormData({...formData, transferMode: e.target.value as TransferMode})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-600 text-[9px] uppercase">
                      {Object.values(TransferMode).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GND</label>
                    <select value={formData.gnd} onChange={e => setFormData({...formData, gnd: e.target.value as GNDType})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-600 text-[9px] uppercase">
                      {Object.values(GNDType).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 4: Configurações Técnicas */}
              <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1 bg-blue-100 text-[#0d457a] rounded-lg"><Layers size={14}/></div>
                  <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest">Requisitos Técnicos</h4>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" checked={formData.suinfra} onChange={e => setFormData({...formData, suinfra: e.target.checked})} className="sr-only" />
                      <div className={`w-10 h-6 rounded-full transition-all duration-300 ${formData.suinfra ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.suinfra ? 'left-5' : 'left-1'}`}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-2">
                        SUINFRA
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" checked={formData.sutis} onChange={e => setFormData({...formData, sutis: e.target.checked})} className="sr-only" />
                      <div className={`w-10 h-6 rounded-full transition-all duration-300 ${formData.sutis ? 'bg-purple-500' : 'bg-slate-200'}`}></div>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.sutis ? 'left-5' : 'left-1'}`}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-2">
                        SUTIS
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black uppercase text-[9px] text-slate-400 bg-white border border-slate-200 hover:bg-slate-50 transition-all tracking-widest">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] py-4 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] shadow-xl hover:bg-[#0a365f] transition-all flex items-center justify-center gap-3">
                    {editingId ? 'Salvar' : 'Cadastrar'} <Send size={16} />
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 pt-10 pb-20">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={24}/>
            </button>
            <div className="px-8 py-3 bg-[#0d457a] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
               Página {currentPage} de {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={24}/>
            </button>
        </div>
      )}
    </div>
  );
};
