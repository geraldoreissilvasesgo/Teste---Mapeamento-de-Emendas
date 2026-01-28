
import React, { useState, useMemo } from 'react';
import { Amendment, Status, Sector, Role, AmendmentType, TransferMode } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { Plus, Search, Filter, ArrowRight, MapPin, Pencil, X, Calendar, FileText, User, Tag, Landmark, HardHat, MonitorCheck, ShieldOff } from 'lucide-react';

interface AmendmentListProps {
  amendments: Amendment[];
  userRole: Role;
  onSelect: (amendment: Amendment) => void;
  onCreate: (amendment: Amendment) => void;
  onUpdate: (amendment: Amendment) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 12;

export const AmendmentList: React.FC<AmendmentListProps> = ({ 
  amendments, 
  userRole, 
  onSelect,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState: Partial<Amendment> = {
    year: new Date().getFullYear(),
    type: AmendmentType.IMPOSITIVA,
    status: Status.PROCESSING,
    currentSector: Sector.PROTOCOL,
    object: '',
    municipality: '',
    deputyName: '',
    seiNumber: '',
    healthUnit: 'SES-GO',
    value: 0,
    suinfra: false,
    sutis: false,
    transferMode: TransferMode.FUNDO_A_FUNDO,
    entryDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Amendment>>(initialFormState);

  // Optimized Filtering using useMemo
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
      return matchesSearch && matchesStatus;
    });
  }, [amendments, searchTerm, statusFilter]);

  const totalPages = useMemo(() => Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE), [filteredAmendments.length]);
  
  const paginatedAmendments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAmendments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAmendments, currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.seiNumber || !formData.value || !formData.municipality) {
      alert("Por favor, preencha os campos obrigatórios básicos (SEI, Valor e Município).");
      return;
    }

    if (formData.type === AmendmentType.IMPOSITIVA && !formData.deputyName) {
      alert("Para Emendas Impositivas, a identificação do Parlamentar é obrigatória.");
      return;
    }

    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Amendment);
    } else {
      const created: Amendment = {
        ...formData as Amendment,
        id: Math.random().toString(36).substr(2, 9),
        code: `EM-${formData.year}-${Math.floor(Math.random() * 90000 + 10000)}`,
        createdAt: new Date().toISOString(),
        deputyName: formData.type === AmendmentType.GOIAS_CRESCIMENTO && !formData.deputyName 
          ? 'Diretoria Executiva / Governo' 
          : formData.deputyName,
        movements: [{
          id: Math.random().toString(36).substr(2, 9),
          amendmentId: '',
          fromSector: null,
          toSector: Sector.PROTOCOL,
          dateIn: new Date().toISOString(),
          dateOut: null,
          deadline: new Date().toISOString(),
          daysSpent: 0,
          handledBy: 'Administrador'
        }]
      };
      onCreate(created);
    }
    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (amendment: Amendment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (amendment.status === Status.INACTIVE) {
      alert("Este registro está inativado e não permite alterações cadastrais.");
      return;
    }
    setEditingId(amendment.id);
    setFormData({ ...amendment });
    setIsModalOpen(true);
  };

  const handleDelete = (amendment: Amendment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (amendment.status === Status.INACTIVE) {
      alert("Este registro já se encontra inativado.");
      return;
    }
    onDelete(amendment.id);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight">Emendas e Processos SEI</h2>
          <p className="text-slate-500 text-sm">Gestão de tramitação e conformidade técnica.</p>
        </div>
        
        <div className="flex gap-2">
          {userRole !== Role.VIEWER && (
            <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }} 
                className="bg-[#0d457a] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 uppercase text-xs shadow-md hover:bg-[#0a365f] transition-all active:scale-95"
            >
                <Plus size={18} /> Novo Registro Completo
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por SEI, Parlamentar, Município ou Objeto..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d457a] outline-none transition-all text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Filter size={18} className="text-slate-400" />
           <select 
             className="p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0d457a]"
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value)}
           >
             <option value="all">Todos os Status</option>
             {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedAmendments.map(amendment => (
          <div 
            key={amendment.id} 
            onClick={() => onSelect(amendment)} 
            className={`group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-[#0d457a]/30 transition-all transform hover:-translate-y-1 
              ${amendment.status === Status.INACTIVE ? 'opacity-60 bg-slate-50' : ''}`}
          >
            <div className={`h-1.5 w-full ${
                amendment.status === Status.CONCLUDED ? 'bg-emerald-500' : 
                amendment.status === Status.INACTIVE ? 'bg-slate-900' :
                amendment.status.includes('diligência') ? 'bg-amber-500' : 
                'bg-[#0d457a]'
            }`} />
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Processo SEI</p>
                  <h3 className={`text-base font-bold transition-colors truncate ${amendment.status === Status.INACTIVE ? 'text-slate-500 line-through' : 'text-[#0d457a] group-hover:text-blue-700'}`}>{amendment.seiNumber}</h3>
                </div>
                <div className="flex gap-1 ml-2 no-print">
                   {userRole !== Role.VIEWER && (
                     <>
                        <button 
                          onClick={(e) => handleEdit(amendment, e)}
                          className={`p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all ${amendment.status === Status.INACTIVE ? 'cursor-not-allowed opacity-30' : ''}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(amendment, e)}
                          className={`p-1.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all ${amendment.status === Status.INACTIVE ? 'cursor-not-allowed opacity-30' : ''}`}
                        >
                          <ShieldOff size={14} />
                        </button>
                     </>
                   )}
                </div>
              </div>

              <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-600 font-medium truncate">{amendment.deputyName || 'Governo / Executivo'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-600 font-medium truncate">{amendment.municipality}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 h-8 leading-relaxed italic mt-1">"{amendment.object}"</p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">Valor</span>
                  <span className="font-bold text-base text-[#0d457a]">R$ {amendment.value.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0d457a] group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-6">
            <button 
                disabled={currentPage === 1}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0d457a] disabled:opacity-30 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
                Anterior
            </button>
            <span className="flex items-center px-4 text-xs font-bold text-slate-500 uppercase">
                Página {currentPage} de {totalPages}
            </span>
            <button 
                disabled={currentPage === totalPages}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0d457a] disabled:opacity-30 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
                Próxima
            </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d457a]/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl my-8">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-bold text-[#0d457a] flex items-center gap-2 uppercase tracking-tight">
                  {editingId ? <Pencil className="bg-blue-600 text-white p-1 rounded" /> : <Plus className="bg-[#0d457a] text-white p-1 rounded" />}
                  {editingId ? 'Alterar Registro de Emenda' : 'Novo Registro Completo'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {editingId ? `Editando o processo SEI ${formData.seiNumber}` : 'Insira todos os dados técnicos e parlamentares.'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Número do Processo SEI</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-slate-300" size={18} />
                    <input 
                        required 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all" 
                        value={formData.seiNumber} 
                        onChange={e => setFormData({...formData, seiNumber: e.target.value})} 
                        placeholder="Ex: 20250004..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Valor do Repasse (R$)</label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-3 text-slate-300" size={18} />
                    <input 
                        type="number" 
                        step="0.01" 
                        required 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all" 
                        value={formData.value} 
                        onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Exercício (Ano)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-300" size={18} />
                    <input 
                        type="number" 
                        required 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none transition-all" 
                        value={formData.year} 
                        onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Tipo de Emenda</label>
                  <select 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none bg-white font-medium"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as AmendmentType})}
                  >
                      {Object.values(AmendmentType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Município de Destino</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-300" size={18} />
                    <select 
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none bg-white appearance-none"
                      value={formData.municipality}
                      onChange={e => setFormData({...formData, municipality: e.target.value})}
                    >
                      <option value="">Selecione o Município</option>
                      {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">
                    Parlamentar Autor {formData.type === AmendmentType.IMPOSITIVA && <span className="text-red-500 font-black"> - OBRIGATÓRIO</span>}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-300" size={18} />
                    <select 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none bg-white appearance-none"
                      value={formData.deputyName}
                      onChange={e => setFormData({...formData, deputyName: e.target.value})}
                    >
                      <option value="">{formData.type === AmendmentType.GOIAS_CRESCIMENTO ? 'Não Aplicável - Programa Executivo' : 'Selecione o Parlamentar'}</option>
                      {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Objeto / Finalidade do Recurso</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none resize-none font-medium text-sm"
                  value={formData.object}
                  onChange={e => setFormData({...formData, object: e.target.value})}
                  placeholder="Ex: Aquisição de Ambulância tipo A, Custeio MAC..."
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 text-[#0d457a] focus:ring-[#0d457a]"
                          checked={formData.suinfra}
                          onChange={e => setFormData({...formData, suinfra: e.target.checked})}
                      />
                      <div className="flex items-center gap-2">
                          <HardHat size={18} className={formData.suinfra ? 'text-orange-600' : 'text-slate-400'} />
                          <span className="text-[10px] font-bold uppercase text-slate-600">Requer SUINFRA (Obras)</span>
                      </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 text-[#0d457a] focus:ring-[#0d457a]"
                          checked={formData.sutis}
                          onChange={e => setFormData({...formData, sutis: e.target.checked})}
                      />
                      <div className="flex items-center gap-2">
                          <MonitorCheck size={18} className={formData.sutis ? 'text-indigo-600' : 'text-slate-400'} />
                          <span className="text-[10px] font-bold uppercase text-slate-600">Requer SUTIS (TI)</span>
                      </div>
                  </label>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-6 py-3 bg-[#0d457a] text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#0a365f] shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {editingId ? <Pencil size={18} /> : <Landmark size={18} />}
                  {editingId ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
