
import React, { useState, useMemo } from 'react';
import { Amendment, Status, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, Filter, MapPin, Pencil, User, Send, ChevronDown, 
  Landmark, XCircle, ChevronLeft, ChevronRight, FileText, 
  X, ArrowRightLeft, Building2, Edit3, Tag, DollarSign, Calendar, Info, Layers, Zap, HardDrive, Settings2,
  ArrowRight, Lock
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
    if (amendment.status === Status.CONCLUDED) return;
    setEditingId(amendment.id);
    setFormData(amendment);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Amendment);
    } else {
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
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-4 focus:ring-[#0d457a]/5 outline-none transition-all font-black text-[10px] text-[#0d457a] uppercase tracking-widest cursor-pointer"
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
        {paginatedAmendments.map(amendment => {
          const isLiquidated = amendment.status === Status.CONCLUDED;
          return (
            <div 
              key={amendment.id} 
              className={`bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl hover:border-[#0d457a]/20 transition-all duration-300 relative ${isLiquidated ? 'bg-slate-50/30' : ''}`}
            >
                <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-black text-white bg-[#0d457a] px-3 py-1.5 rounded-full border border-blue-900 flex items-center gap-2 uppercase shadow-md">
                          <FileText size={12}/> PROCESSO SEI: {amendment.seiNumber}
                        </span>
                        <span className="text-[10px] font-black text-slate-300 uppercase">{amendment.year}</span>
                    </div>

                    <h3 className="font-black text-base text-[#0d457a] mb-4 leading-tight flex-1 uppercase tracking-tight group-hover:text-blue-700 transition-colors">
                      {amendment.object}
                    </h3>

                    <div className="mb-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${getStatusBadgeClass(amendment.status)}`}>
                          {isLiquidated ? <Lock size={10} /> : <Tag size={10} />}
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
                          {userRole !== Role.VIEWER && !isLiquidated && (
                            <button 
                              onClick={() => handleEdit(amendment)} 
                              className="p-2.5 bg-slate-50 text-slate-400 hover:text-[#0d457a] hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all"
                              title="Editar"
                            >
                              <Edit3 size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => onSelect(amendment)} 
                            className="p-2.5 bg-[#0d457a] text-white rounded-xl hover:bg-[#0a365f] shadow-lg transition-all"
                            title="Ver Detalhes"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                    </div>
                </div>
            </div>
          );
        })}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="p-3 bg-white border border-slate-200 rounded-xl text-[#0d457a] disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-black text-[#0d457a] uppercase tracking-widest bg-white px-6 py-2 rounded-xl border border-slate-200 shadow-sm">Página {currentPage} de {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="p-3 bg-white border border-slate-200 rounded-xl text-[#0d457a] disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
        </div>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl my-auto animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">{editingId ? 'Editar Registro' : 'Novo Processo SEI'}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Goiás em Crescimento - GESA Cloud</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl transition-all border border-slate-100">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Processo SEI</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="text" 
                                    value={formData.seiNumber}
                                    placeholder="Ex: 20250006700..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none transition-all font-bold text-slate-600 uppercase"
                                    onChange={(e) => setFormData({...formData, seiNumber: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Emenda</label>
                                <select 
                                    value={formData.type}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none font-bold text-slate-600 uppercase text-xs"
                                    onChange={(e) => setFormData({...formData, type: e.target.value as AmendmentType})}
                                >
                                    {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ano Exercício</label>
                                <input 
                                    type="number" 
                                    value={formData.year}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none font-bold text-slate-600"
                                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Processo (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.value}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none font-bold text-slate-600"
                                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Autor / Parlamentar</label>
                            <select 
                                value={formData.deputyName}
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none font-bold text-slate-600 uppercase text-xs"
                                onChange={(e) => setFormData({...formData, deputyName: e.target.value})}
                            >
                                <option value="Executivo Estadual">Executivo Estadual</option>
                                {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Município Beneficiário</label>
                            <select 
                                value={formData.municipality}
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none font-bold text-slate-600 uppercase text-xs"
                                onChange={(e) => setFormData({...formData, municipality: e.target.value})}
                                required
                            >
                                <option value="">Selecione o Município</option>
                                {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objeto do Repasse</label>
                            <textarea 
                                value={formData.object}
                                placeholder="Descreva a finalidade do recurso..."
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none font-bold text-slate-600 uppercase text-xs min-h-[100px]"
                                onChange={(e) => setFormData({...formData, object: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-6 border-t border-slate-100 flex gap-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-4 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-900/20 hover:bg-[#0a365f] transition-all flex items-center justify-center gap-3"
                        >
                            {editingId ? 'Atualizar Dados' : 'Efetivar Cadastro'} <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
