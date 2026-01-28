
import React, { useState } from 'react';
import { Amendment, Status, Sector, Role, AmendmentType, TransferMode } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { Plus, Search, Filter, ArrowRight, MapPin, Pencil, X, Calendar, FileText, User, Tag, Landmark, HardHat, MonitorCheck } from 'lucide-react';

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
  
  // Estado para o formulário completo
  const [formData, setFormData] = useState<Partial<Amendment>>({
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
  });

  const filteredAmendments = amendments.filter(a => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (a.seiNumber && a.seiNumber.toLowerCase().includes(term)) ||
      (a.deputyName && a.deputyName.toLowerCase().includes(term)) ||
      (a.municipality && a.municipality.toLowerCase().includes(term)) ||
      (a.object && a.object.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAmendments = filteredAmendments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seiNumber || !formData.value || !formData.municipality || !formData.deputyName) {
      alert("Por favor, preencha todos os campos obrigatórios (SEI, Valor, Município e Parlamentar).");
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
        movements: [{
          id: Math.random().toString(36).substr(2, 9),
          amendmentId: '',
          fromSector: null,
          toSector: Sector.PROTOCOL,
          dateIn: new Date().toISOString(),
          dateOut: null,
          daysSpent: 0,
          handledBy: 'Administrador'
        }]
      };
      onCreate(created);
    }
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
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
    });
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

      {/* Barra de Filtros */}
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

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedAmendments.map(amendment => (
          <div key={amendment.id} onClick={() => onSelect(amendment)} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-[#0d457a]/30 transition-all transform hover:-translate-y-1">
            <div className={`h-1.5 w-full ${
                amendment.status === Status.CONCLUDED ? 'bg-emerald-500' : 
                amendment.status.includes('diligência') ? 'bg-amber-500' : 
                'bg-[#0d457a]'
            }`} />
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Processo SEI</p>
                  <h3 className="text-base font-bold text-[#0d457a] group-hover:text-blue-700 transition-colors">{amendment.seiNumber}</h3>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">{amendment.year}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        amendment.status === Status.CONCLUDED ? 'bg-emerald-50 text-emerald-700' : 
                        amendment.status.includes('diligência') ? 'bg-amber-50 text-amber-700' : 
                        'bg-slate-50 text-slate-600'
                    }`}>
                    {amendment.status}
                    </span>
                </div>
              </div>

              <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium truncate">{amendment.deputyName || 'Parlamentar não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">{amendment.municipality}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 h-8 leading-relaxed italic">"{amendment.object}"</p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Montante Alocado</span>
                  <span className="font-bold text-lg text-[#0d457a]">R$ {amendment.value.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0d457a] group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
        {paginatedAmendments.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-slate-400">
             <Search size={48} className="opacity-20" />
             <p className="text-sm font-medium uppercase tracking-widest">Nenhuma emenda encontrada</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4">
            <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 py-2 text-sm font-bold text-[#0d457a] disabled:opacity-30 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
                Anterior
            </button>
            <span className="flex items-center px-4 text-sm font-bold text-slate-500">
                Página {currentPage} de {totalPages}
            </span>
            <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 text-sm font-bold text-[#0d457a] disabled:opacity-30 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
                Próxima
            </button>
        </div>
      )}

      {/* Modal de Cadastro Completo (Acesso Administrador/Operador) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d457a]/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl my-8">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-bold text-[#0d457a] flex items-center gap-2 uppercase tracking-tight">
                  <Plus className="bg-[#0d457a] text-white p-1 rounded" />
                  Registro Completo de Emenda
                </h3>
                <p className="text-slate-500 text-sm mt-1">Insira todos os dados técnicos e parlamentares para o rastreio.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Seção 1: Identificação */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">1. Identificação Administrativa</h4>
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
                    <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Valor da Emenda (R$)</label>
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
              </div>

              {/* Seção 2: Origem e Destino */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">2. Origem e Destino</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Parlamentar / Titular</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-300" size={18} />
                      <select 
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none bg-white appearance-none"
                        value={formData.deputyName}
                        onChange={e => setFormData({...formData, deputyName: e.target.value})}
                      >
                        <option value="">Selecione o Parlamentar</option>
                        {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Município Beneficiado</label>
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
                </div>
              </div>

              {/* Seção 3: Detalhes Técnicos */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">3. Detalhes Técnicos e Modalidade</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Tipo de Emenda</label>
                    <select 
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none bg-white"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as AmendmentType})}
                    >
                        {Object.values(AmendmentType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Forma de Repasse</label>
                    <select 
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none bg-white"
                        value={formData.transferMode}
                        onChange={e => setFormData({...formData, transferMode: e.target.value as TransferMode})}
                    >
                        {Object.values(TransferMode).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Unidade de Saúde / Destino</label>
                    <input 
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none" 
                        value={formData.healthUnit} 
                        onChange={e => setFormData({...formData, healthUnit: e.target.value})} 
                        placeholder="Ex: Hospital Municipal, FMS..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Objeto / Descrição da Emenda</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none resize-none"
                    value={formData.object}
                    onChange={e => setFormData({...formData, object: e.target.value})}
                    placeholder="Descreva o que será adquirido ou realizado com o recurso..."
                  />
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-slate-300 text-[#0d457a] focus:ring-[#0d457a]"
                            checked={formData.suinfra}
                            onChange={e => setFormData({...formData, suinfra: e.target.checked})}
                        />
                        <div className="flex items-center gap-2">
                            <HardHat size={18} className={formData.suinfra ? 'text-orange-600' : 'text-slate-400'} />
                            <span className="text-xs font-bold uppercase text-slate-600">Requer análise SUINFRA (Obras)</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-slate-300 text-[#0d457a] focus:ring-[#0d457a]"
                            checked={formData.sutis}
                            onChange={e => setFormData({...formData, sutis: e.target.checked})}
                        />
                        <div className="flex items-center gap-2">
                            <MonitorCheck size={18} className={formData.sutis ? 'text-indigo-600' : 'text-slate-400'} />
                            <span className="text-xs font-bold uppercase text-slate-600">Requer análise SUTIS (Tecnologia)</span>
                        </div>
                    </label>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-6 py-3 bg-[#0d457a] text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#0a365f] shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Landmark size={18} />
                  Salvar Registro Completo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
