
/**
 * COMPONENTE DE LISTA DE PROCESSOS (EMENDAS) - ULTRA COMPACTO
 * 
 * Este componente gerencia a visualização e filtragem da base ativa de processos.
 * Otimizado para alta densidade de informação e melhor aproveitamento vertical nos cards.
 */
import React, { useState, useMemo } from 'react';
import { Amendment, Status, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, Filter, MapPin, Pencil, User, Send, ChevronDown, 
  ChevronUp, Landmark, XCircle, ChevronLeft, ChevronRight, FileText, 
  Calendar, DollarSign, ListTree, Banknote, X, ArrowRightLeft, 
  CheckCircle2, Building2, HardHat, MonitorCheck, Edit3, Briefcase, 
  Stethoscope, ClipboardList, Info
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

const ITEMS_PER_PAGE = 15;

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
  const [minValFilter, setMinValFilter] = useState<string>('');
  const [maxValFilter, setMaxValFilter] = useState<string>('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
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
    entryDate: new Date().toISOString().split('T')[0],
    healthUnit: '',
    institutionName: '',
    notes: ''
  };

  const [formData, setFormData] = useState<Partial<Amendment>>(initialFormState);

  const filteredAmendments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const minVal = minValFilter ? parseFloat(minValFilter) : -Infinity;
    const maxVal = maxValFilter ? parseFloat(maxValFilter) : Infinity;

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
      const matchesValue = a.value >= minVal && a.value <= maxVal;

      return matchesSearch && matchesStatus && matchesDeputy && matchesMunicipality && matchesValue;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [amendments, searchTerm, statusFilter, deputyFilter, municipalityFilter, minValFilter, maxValFilter]);

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);
  const paginatedAmendments = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDeputyFilter('all');
    setMunicipalityFilter('all');
    setMinValFilter('');
    setMaxValFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || deputyFilter !== 'all' || municipalityFilter !== 'all' || minValFilter || maxValFilter;

  const getStatusColor = (status: Status) => {
    switch (status) {
        case Status.CONCLUDED: return 'bg-emerald-500';
        case Status.IN_PROGRESS: return 'bg-blue-600';
        case Status.DILIGENCE: return 'bg-amber-500';
        case Status.REJECTED: return 'bg-red-500';
        case Status.ARCHIVED: return 'bg-slate-500';
        default: return 'bg-gray-400';
    }
  };
  
  const handleEdit = (amendment: Amendment) => {
    setEditingId(amendment.id);
    setFormData({
      ...amendment,
      entryDate: amendment.entryDate ? new Date(amendment.entryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Amendment);
    } else {
      onCreate({ 
        ...formData, 
        id: Math.random().toString(36).substr(2, 9), 
        createdAt: new Date().toISOString(), 
        currentSector: 'GESA - Protocolo Central',
        movements: [] 
      } as Amendment);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h2 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Gestão de Processos</h2>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1.5">
            <div className="w-2 h-0.5 bg-[#0d457a]"></div> Base Ativa GESA
          </p>
        </div>
        <button
            onClick={() => { setFormData(initialFormState); setEditingId(null); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 bg-[#0d457a] text-white px-3 py-1.5 rounded-lg hover:bg-[#0a365f] transition-all shadow-sm uppercase text-[8px] font-black tracking-widest group"
        >
            <Plus size={12} className="group-hover:rotate-90 transition-transform" />
            Novo Registro
        </button>
      </div>

      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 space-y-2">
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
              <input 
                type="text"
                value={searchTerm}
                placeholder="Pesquisar SEI, Parlamentar ou Município..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-[#0d457a]/5 outline-none transition-all font-bold text-slate-600 uppercase placeholder:text-slate-200 text-[8px]"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="px-2 py-1.5 bg-red-50 text-red-500 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-1"
            >
              <X size={8} /> Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={10} />
              <select
                  value={statusFilter}
                  className="w-full pl-7 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg appearance-none focus:ring-2 focus:ring-[#0d457a]/5 outline-none transition-all font-black text-[7px] text-[#0d457a] uppercase tracking-widest cursor-pointer"
                  onChange={(e) => setStatusFilter(e.target.value)}
              >
                  <option value="all">Status: Todos</option>
                  {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={8} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0d457a] pointer-events-none" />
          </div>

          <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={10} />
              <select
                  value={deputyFilter}
                  className="w-full pl-7 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg appearance-none focus:ring-2 focus:ring-[#0d457a]/5 outline-none transition-all font-black text-[7px] text-[#0d457a] uppercase tracking-widest cursor-pointer"
                  onChange={(e) => setDeputyFilter(e.target.value)}
              >
                  <option value="all">Autor: Todos</option>
                  {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="Executivo Estadual">Executivo Estadual</option>
              </select>
              <ChevronDown size={8} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0d457a] pointer-events-none" />
          </div>

          <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={10} />
              <select
                  value={municipalityFilter}
                  className="w-full pl-7 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg appearance-none focus:ring-2 focus:ring-[#0d457a]/5 outline-none transition-all font-black text-[7px] text-[#0d457a] uppercase tracking-widest cursor-pointer"
                  onChange={(e) => setMunicipalityFilter(e.target.value)}
              >
                  <option value="all">Município: Todos</option>
                  {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={8} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0d457a] pointer-events-none" />
          </div>

          <div className="flex gap-1">
            <input 
              type="number"
              value={minValFilter}
              placeholder="Min"
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-[#0d457a]/5 outline-none font-bold text-[7px] text-[#0d457a] uppercase"
              onChange={(e) => setMinValFilter(e.target.value)}
            />
            <input 
              type="number"
              value={maxValFilter}
              placeholder="Max"
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-[#0d457a]/5 outline-none font-bold text-[7px] text-[#0d457a] uppercase"
              onChange={(e) => setMaxValFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
        {paginatedAmendments.map(amendment => {
          const isExpanded = expandedId === amendment.id;
          return (
            <div 
              key={amendment.id} 
              onClick={(e) => toggleExpand(e, amendment.id)}
              className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col cursor-pointer group hover:shadow-md hover:border-[#0d457a]/20 transition-all duration-300 relative ${isExpanded ? 'ring-1 ring-[#0d457a]/20' : ''}`}
            >
                <div className={`h-0.5 w-full ${getStatusColor(amendment.status)}`}></div>
                
                <div className="p-2.5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[7px] font-black text-[#0d457a] bg-blue-50/50 px-1 py-0.5 rounded border border-blue-100/30 flex items-center gap-1">
                            {amendment.seiNumber}
                          </span>
                        </div>
                        <div className="text-right">
                           <span className="text-[7px] font-black text-slate-300">{amendment.year}</span>
                        </div>
                    </div>

                    <h3 className={`font-black text-[#0d457a] mb-1 leading-tight flex-1 uppercase tracking-tight group-hover:text-blue-700 transition-colors ${isExpanded ? 'text-[9px]' : 'text-[8px] line-clamp-2 min-h-[2.4em]'}`}>
                      {amendment.object}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-1 mb-1.5">
                        <div className="flex items-center gap-1 p-1 bg-slate-50/50 rounded border border-slate-100/50 min-w-0">
                           <MapPin size={7} className="text-emerald-500 shrink-0" />
                           <span className="text-[7px] font-black text-[#0d457a] uppercase truncate">{amendment.municipality}</span>
                        </div>

                        <div className="flex items-center gap-1 p-1 bg-blue-50/30 rounded border border-blue-100/30 min-w-0">
                            <Send size={7} className="text-[#0d457a] shrink-0" />
                            <span className="text-[7px] font-black text-[#0d457a] uppercase truncate">{amendment.currentSector.split(' ')[0]}...</span>
                        </div>

                        {isExpanded && (
                          <div className="col-span-1 pt-1.5 mt-1 border-t border-slate-100 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-1">
                             <div className="bg-slate-50 p-1 rounded">
                                <span className="text-[5px] font-black text-slate-400 uppercase tracking-widest block">GND</span>
                                <span className="text-[7px] font-black text-[#0d457a] uppercase">{amendment.gnd?.split(' ')[0] || '---'}</span>
                             </div>
                             <div className="bg-slate-50 p-1 rounded">
                                <span className="text-[5px] font-black text-slate-400 uppercase tracking-widest block">Autor</span>
                                <span className="text-[7px] font-black text-[#0d457a] uppercase truncate">{amendment.deputyName?.split(' ')[1] || '---'}</span>
                             </div>
                          </div>
                        )}
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center">
                        <div>
                           <span className="font-black text-[#0d457a] text-[10px] tracking-tighter leading-none">
                             R$ {amendment.value.toLocaleString('pt-BR')}
                           </span>
                        </div>
                        
                        <div className="flex gap-1">
                          {userRole !== Role.VIEWER && (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEdit(amendment)}} 
                                className="p-0.5 bg-white text-slate-400 border border-slate-200 rounded hover:text-[#0d457a] transition-all"
                              >
                                <Edit3 size={8}/>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onSelect(amendment)}} 
                                className="px-1.5 py-0.5 bg-[#0d457a] text-white rounded hover:bg-[#0a365f] transition-all text-[7px] font-black uppercase"
                              >
                                Tramitar
                              </button>
                            </>
                          )}
                        </div>
                    </div>
                </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro / Edição Compacto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
               <div>
                  <h3 className="text-base font-black text-[#0d457a] uppercase tracking-tighter leading-tight">{editingId ? 'Editar SEI' : 'Novo Cadastro SEI'}</h3>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:text-red-500 transition-all">
                  <X size={16}/>
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-full md:col-span-1 space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Processo SEI</label>
                    <input type="text" required value={formData.seiNumber} onChange={e => setFormData({...formData, seiNumber: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[#0d457a] text-[10px] outline-none focus:ring-1 ring-[#0d457a]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Código Interno</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[#0d457a] text-[10px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Ano</label>
                    <input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[#0d457a] text-[10px]" />
                  </div>
                  <div className="col-span-full space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Objeto</label>
                    <textarea required value={formData.object} onChange={e => setFormData({...formData, object: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[#0d457a] text-[10px] min-h-[50px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Município</label>
                    <select required value={formData.municipality} onChange={e => setFormData({...formData, municipality: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-600 text-[10px]">
                      <option value="">Selecione...</option>
                      {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Autor</label>
                    <select value={formData.deputyName} onChange={e => setFormData({...formData, deputyName: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-600 text-[10px]">
                      <option value="Executivo Estadual">Executivo Estadual</option>
                      {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Dotação (R$)</label>
                    <input type="number" required value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-black text-[#0d457a] text-[10px]" />
                  </div>
              </div>
            </form>

            <div className="px-4 py-3 border-t border-slate-100 flex gap-2 bg-slate-50/50 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-1.5 rounded-lg font-black uppercase text-[7px] text-slate-400 bg-white border border-slate-200">
                    Cancelar
                  </button>
                  <button onClick={handleSubmit} type="button" className="flex-[2] py-1.5 bg-[#0d457a] text-white rounded-lg font-black uppercase text-[7px] tracking-widest shadow-lg">
                    {editingId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                  </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-3">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 disabled:opacity-30 bg-white border border-slate-200 rounded text-[#0d457a]">
              <ChevronLeft size={12}/>
            </button>
            <span className="text-[7px] font-black text-slate-400 uppercase">Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 disabled:opacity-30 bg-white border border-slate-200 rounded text-[#0d457a]">
              <ChevronRight size={12}/>
            </button>
        </div>
      )}
    </div>
  );
};
