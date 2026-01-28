
import React, { useState, useMemo } from 'react';
import { Amendment, Status, Role, AmendmentType, TransferMode, SectorConfig, SystemMode } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { Plus, Search, Filter, ArrowRight, MapPin, Pencil, X, User, Building2, Send, ChevronDown, Landmark, Award, Layers } from 'lucide-react';

interface AmendmentListProps {
  amendments: Amendment[];
  sectors: SectorConfig[];
  userRole: Role;
  systemMode: SystemMode;
  onSelect: (amendment: Amendment) => void;
  onCreate: (amendment: Amendment) => void;
  onUpdate: (amendment: Amendment) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 12;

type MacroCategory = 'ALL' | 'PARLIAMENTARY' | 'GOIAS_CRESCIMENTO';

export const AmendmentList: React.FC<AmendmentListProps> = ({ 
  amendments, 
  sectors,
  userRole, 
  systemMode,
  onSelect,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [macroCategory, setMacroCategory] = useState<MacroCategory>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [showOriginList, setShowOriginList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);

  const initialFormState: Partial<Amendment & { initialOrigin: string; initialDestination: string }> = {
    year: new Date().getFullYear(),
    type: AmendmentType.IMPOSITIVA,
    status: Status.PROCESSING,
    currentSector: 'GESA - Protocolo Central',
    object: '',
    municipality: '',
    deputyName: '',
    seiNumber: '',
    healthUnit: 'Unidade GESA',
    value: 0,
    suinfra: false,
    sutis: false,
    transferMode: TransferMode.FUNDO_A_FUNDO,
    entryDate: new Date().toISOString().split('T')[0],
    initialOrigin: '',
    initialDestination: 'GESA - Protocolo Central'
  };

  const [formData, setFormData] = useState<Partial<Amendment & { initialOrigin: string; initialDestination: string }>>(initialFormState);

  const filteredAmendments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return amendments.filter(a => {
      if (macroCategory === 'PARLIAMENTARY' && a.type === AmendmentType.GOIAS_CRESCIMENTO) return false;
      if (macroCategory === 'GOIAS_CRESCIMENTO' && a.type !== AmendmentType.GOIAS_CRESCIMENTO) return false;

      const matchesSearch = 
        !term ||
        (a.seiNumber && a.seiNumber.toLowerCase().includes(term)) ||
        (a.deputyName && a.deputyName.toLowerCase().includes(term)) ||
        (a.municipality && a.municipality.toLowerCase().includes(term)) ||
        (a.object && a.object.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [amendments, searchTerm, statusFilter, macroCategory]);

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);
  const paginatedAmendments = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.seiNumber || !formData.value || !formData.municipality || !formData.initialDestination) {
      alert("Campos obrigatórios: SEI, Valor, Município e Setor de Destino.");
      return;
    }

    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Amendment);
    } else {
      const destSector = formData.initialDestination || 'GESA - Protocolo Central';
      const created: Amendment = {
        ...formData as Amendment,
        id: Math.random().toString(36).substr(2, 9),
        code: `EM-${formData.year}-${Math.floor(Math.random() * 90000 + 10000)}`,
        createdAt: new Date().toISOString(),
        currentSector: destSector,
        movements: [{
          id: Math.random().toString(36).substr(2, 9),
          amendmentId: '',
          fromSector: formData.initialOrigin || 'Gabinete Parlamentar',
          toSector: destSector,
          dateIn: new Date().toISOString(),
          dateOut: null,
          deadline: new Date().toISOString(),
          daysSpent: 0,
          handledBy: userRole === Role.ADMIN ? 'Administrador' : 'Operador GESA'
        }]
      };
      onCreate(created);
    }
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setOriginSearch('');
    setDestSearch('');
  };

  const filteredOriginSectors = sectors.filter(s => s.name.toLowerCase().includes(originSearch.toLowerCase()));
  const filteredDestSectors = sectors.filter(s => s.name.toLowerCase().includes(destSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Gestão de Processos GESA/SUBIPEI</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monitoramento de Emendas e Recursos do Executivo.</p>
        </div>
        
        {userRole !== Role.VIEWER && (
          <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }} 
              className="bg-[#0d457a] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 uppercase text-xs shadow-xl hover:bg-[#0a365f] transition-all active:scale-95"
          >
              <Plus size={18} /> Novo Cadastro SEI
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit">
        <button 
          onClick={() => { setMacroCategory('ALL'); setCurrentPage(1); }}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${macroCategory === 'ALL' ? 'bg-[#0d457a] text-white shadow-md' : 'text-slate-500 hover:bg-slate-300/50'}`}
        >
          Todos os Processos
        </button>
        <button 
          onClick={() => { setMacroCategory('PARLIAMENTARY'); setCurrentPage(1); }}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${macroCategory === 'PARLIAMENTARY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-300/50'}`}
        >
          <Landmark size={14} /> Emendas Parlamentares
        </button>
        <button 
          onClick={() => { setMacroCategory('GOIAS_CRESCIMENTO'); setCurrentPage(1); }}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${macroCategory === 'GOIAS_CRESCIMENTO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-300/50'}`}
        >
          <Award size={14} /> Goiás em Crescimento
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por SEI, Parlamentar, Município..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
           <Filter size={16} className="text-slate-400" />
           <select 
              className="p-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-[#0d457a] text-slate-600"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Status: Todos</option>
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedAmendments.map(amendment => (
          <div 
            key={amendment.id} 
            onClick={() => onSelect(amendment)} 
            className={`group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-[#0d457a]/20 transition-all transform hover:-translate-y-1 
              ${amendment.status === Status.INACTIVE ? 'opacity-60 grayscale' : ''}`}
          >
            <div className={`h-1.5 w-full ${
                amendment.status === Status.CONCLUDED ? 'bg-emerald-500' : 
                amendment.status === Status.INACTIVE ? 'bg-slate-800' :
                amendment.status.includes('diligência') ? 'bg-amber-500' : 
                amendment.type === AmendmentType.GOIAS_CRESCIMENTO ? 'bg-indigo-600' : 'bg-[#0d457a]'
            }`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Processo SEI</p>
                <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase ${amendment.type === AmendmentType.GOIAS_CRESCIMENTO ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                   {amendment.type.includes('Impositiva') ? 'Parlamentar' : 'Executivo'}
                </span>
              </div>
              <h3 className="text-base font-black text-[#0d457a] mb-4 truncate">{amendment.seiNumber}</h3>

              <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-600 font-bold uppercase truncate">{amendment.deputyName || 'Execução Direta'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-600 font-bold uppercase truncate">{amendment.municipality}</span>
                  </div>
              </div>

              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-tight">Recurso</span>
                  <span className="font-black text-lg text-[#0d457a]">R$ {amendment.value.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0d457a] group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d457a]/90 p-4 backdrop-blur-xl overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl my-8 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">
                  {editingId ? 'Editar Registro GESA' : 'Novo Cadastro SEI'}
                </h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configuração de Fonte e Tramitação</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Fonte de Recurso</label>
                  <div className="flex gap-2">
                    {Object.values(AmendmentType).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          const isCrescimento = type === AmendmentType.GOIAS_CRESCIMENTO;
                          setFormData({
                            ...formData, 
                            type, 
                            deputyName: isCrescimento ? 'Governo de Goiás (Execução Direta)' : formData.deputyName 
                          });
                        }}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${formData.type === type ? 'bg-[#0d457a] text-white border-[#0d457a] shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Transferência</label>
                   <select className="w-full px-5 py-3 bg-white rounded-xl outline-none font-bold text-slate-700 text-xs uppercase" value={formData.transferMode} onChange={e => setFormData({...formData, transferMode: e.target.value as TransferMode})}>
                      {Object.values(TransferMode).map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nº do Processo SEI</label>
                  <input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] focus:bg-white outline-none transition-all font-bold text-slate-700" value={formData.seiNumber} onChange={e => setFormData({...formData, seiNumber: e.target.value})} placeholder="2025000..." />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Valor (R$)</label>
                  <input type="number" step="0.01" required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] focus:bg-white outline-none transition-all font-bold text-slate-700" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Exercício</label>
                  <input type="number" required className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] focus:bg-white outline-none transition-all font-bold text-slate-700" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Município Beneficiado</label>
                  <select required className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" value={formData.municipality} onChange={e => setFormData({...formData, municipality: e.target.value})}>
                    <option value="">Selecione...</option>
                    {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Parlamentar / Autor</label>
                  <select 
                    disabled={formData.type === AmendmentType.GOIAS_CRESCIMENTO}
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 disabled:opacity-50" 
                    value={formData.deputyName} 
                    onChange={e => setFormData({...formData, deputyName: e.target.value})}
                  >
                    <option value="">{formData.type === AmendmentType.GOIAS_CRESCIMENTO ? 'Governo de Goiás (Execução Direta)' : 'Selecione o Parlamentar...'}</option>
                    {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-[#0d457a]/5 p-8 rounded-3xl border-2 border-[#0d457a]/10 space-y-6">
                 <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-[#0d457a]" />
                    <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-wider">Gestão Técnica de Tramitação (De/Para)</h4>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Vindo de (Origem)</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#0d457a] font-bold text-xs uppercase"
                        value={formData.initialOrigin || originSearch}
                        onFocus={() => { setShowOriginList(true); setShowDestList(false); }}
                        onChange={e => { setOriginSearch(e.target.value); if(formData.initialOrigin) setFormData({...formData, initialOrigin: ''}); }}
                        placeholder="Ex: Gabinete Parlamentar..."
                      />
                      {showOriginList && (
                        <div className="absolute z-10 top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                           {filteredOriginSectors.map(s => (
                             <button key={s.id} type="button" onClick={() => { setFormData({...formData, initialOrigin: s.name}); setShowOriginList(false); }} className="w-full text-left px-5 py-3 hover:bg-slate-50 border-b border-slate-50 text-xs font-black uppercase text-[#0d457a]">{s.name}</button>
                           ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 ml-1">Entrando em (Destino)</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-5 py-4 bg-white border-2 border-blue-100 rounded-2xl outline-none focus:border-blue-600 font-bold text-xs uppercase text-blue-900"
                        value={formData.initialDestination || destSearch}
                        onFocus={() => { setShowDestList(true); setShowOriginList(false); }}
                        onChange={e => { setDestSearch(e.target.value); if(formData.initialDestination) setFormData({...formData, initialDestination: ''}); }}
                        placeholder="Setor Técnico GESA..."
                      />
                      {showDestList && (
                        <div className="absolute z-10 top-full left-0 w-full mt-2 bg-white border border-blue-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                           {filteredDestSectors.map(s => (
                             <button key={s.id} type="button" onClick={() => { setFormData({...formData, initialDestination: s.name}); setShowDestList(false); }} className="w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-blue-50 flex justify-between items-center group">
                               <span className="text-xs font-black uppercase text-blue-900">{s.name}</span>
                               <span className="text-[9px] font-black text-blue-400">SLA: {s.defaultSlaDays}D</span>
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Objeto do Processo</label>
                <textarea required rows={3} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] focus:bg-white outline-none transition-all font-medium text-slate-600" value={formData.object} onChange={e => setFormData({...formData, object: e.target.value})} placeholder="Finalidade do recurso..." />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-2xl hover:bg-[#0a365f] transition-all flex items-center justify-center gap-3">
                  {editingId ? 'Salvar Alterações' : 'Concluir Cadastro SEI'} <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
