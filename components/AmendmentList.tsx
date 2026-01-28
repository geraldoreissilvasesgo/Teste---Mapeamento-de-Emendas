import React, { useState, useEffect } from 'react';
import { Amendment, Status, Sector, Role, AmendmentType, TransferMode } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { Plus, Search, Filter, ArrowRight, FileText, MapPin, HardHat, MonitorCheck, Briefcase, Pencil, Trash2, AlertTriangle, X, ChevronDown, ChevronUp, Calendar, Building2 } from 'lucide-react';

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
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<AmendmentType>(AmendmentType.IMPOSITIVA);
  
  const [newAmendment, setNewAmendment] = useState<Partial<Amendment>>({
    year: new Date().getFullYear(),
    status: Status.DILIGENCE_SGI,
    currentSector: Sector.PROTOCOL,
    object: '',
    municipality: '',
    deputyName: '',
    seiNumber: '',
    healthUnit: '',
    value: 0,
    suinfra: false,
    sutis: false,
    notes: '',
    transferMode: TransferMode.FUNDO_A_FUNDO,
    institutionName: '',
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: ''
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (!isModalOpen) {
        setEditingId(null);
        return;
    }
    
    if (!editingId) {
        setNewAmendment(prev => ({
            ...prev,
            type: formType,
            deputyName: formType === AmendmentType.GOIAS_CRESCIMENTO ? 'Governo de Goiás' : '',
            transferMode: TransferMode.FUNDO_A_FUNDO,
            institutionName: ''
        }));
    }
  }, [formType, isModalOpen, editingId]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredAmendments = amendments.filter(a => {
    const matchesSearch = 
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.seiNumber && a.seiNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.deputyName && a.deputyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.object.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAmendments = filteredAmendments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleEditClick = (amendment: Amendment, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingId(amendment.id);
      setFormType(amendment.type);
      setNewAmendment({ ...amendment });
      setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const confirmDelete = window.confirm(
          "ATENÇÃO: A exclusão desta emenda é IRREVERSÍVEL!\n\nTem certeza que deseja apagar permanentemente este registro?"
      );
      if (confirmDelete) {
          onDelete(id);
      }
  };

  const handleViewClick = (amendment: Amendment, e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(amendment);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAmendment.seiNumber || !newAmendment.value || !newAmendment.object || !newAmendment.municipality) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    if (editingId) {
        const original = amendments.find(a => a.id === editingId);
        if (!original) return;
        const updated: Amendment = {
            ...original,
            ...newAmendment as Amendment,
            id: original.id,
            movements: original.movements,
            code: original.code
        };
        onUpdate(updated);
    } else {
        const created: Amendment = {
        id: Math.random().toString(36).substr(2, 9),
        code: `EM-${newAmendment.year}-${Math.floor(Math.random() * 90000 + 10000)}`,
        type: formType,
        seiNumber: newAmendment.seiNumber,
        value: Number(newAmendment.value),
        municipality: newAmendment.municipality,
        object: newAmendment.object,
        deputyName: formType === AmendmentType.IMPOSITIVA ? newAmendment.deputyName : 'Governo de Goiás',
        transferMode: formType === AmendmentType.GOIAS_CRESCIMENTO ? newAmendment.transferMode : undefined,
        institutionName: (formType === AmendmentType.GOIAS_CRESCIMENTO && newAmendment.transferMode === TransferMode.CONVENIO) 
            ? newAmendment.institutionName 
            : undefined,
        suinfra: newAmendment.suinfra || false,
        sutis: newAmendment.sutis || false,
        status: newAmendment.status as Status,
        statusDescription: newAmendment.status,
        entryDate: newAmendment.entryDate,
        exitDate: newAmendment.exitDate || undefined,
        notes: newAmendment.notes || '',
        year: Number(newAmendment.year) || new Date().getFullYear(),
        party: '-',
        healthUnit: 'SES-GO',
        currentSector: Sector.PROTOCOL,
        createdAt: new Date().toISOString(),
        movements: [
            {
                id: Math.random().toString(36).substr(2, 9),
                amendmentId: 'temp', 
                fromSector: null,
                toSector: Sector.PROTOCOL,
                dateIn: newAmendment.entryDate ? new Date(newAmendment.entryDate).toISOString() : new Date().toISOString(),
                dateOut: null,
                daysSpent: 0,
                handledBy: 'current'
            }
        ]
        };
        created.movements[0].amendmentId = created.id;
        onCreate(created);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a]">Gestão de Emendas</h2>
          <p className="text-slate-500 text-sm">
            Exibindo {paginatedAmendments.length} de {filteredAmendments.length} registros encontrados.
          </p>
        </div>
        
        {userRole !== Role.VIEWER && (
          <button 
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-[#0d457a] text-white px-4 py-2.5 rounded-md hover:bg-[#0a365f] transition-shadow shadow-sm font-medium uppercase text-xs tracking-wide"
          >
            <Plus size={18} />
            Nova Emenda
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Processo SEI, deputado, objeto ou município..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] focus:border-[#0d457a] outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none bg-white"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedAmendments.map(amendment => {
          const isExpanded = expandedIds.has(amendment.id);
          return (
            <div 
              key={amendment.id} 
              className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-[#0d457a]/30 transition-all flex flex-col relative overflow-hidden group cursor-pointer"
              onClick={(e) => toggleExpand(amendment.id, e)}
            >
              <div className={`h-1 w-full ${amendment.status === Status.CONCLUDED ? 'bg-green-500' : amendment.status.includes('diligência') ? 'bg-amber-500' : 'bg-[#0d457a]'}`}></div>
              
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                       {amendment.type === AmendmentType.GOIAS_CRESCIMENTO && (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 rounded uppercase">GO Crescimento</span>
                       )}
                       <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 rounded uppercase">{amendment.year}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">Processo SEI</span>
                    <span className="font-bold text-[#0d457a] text-lg leading-tight">{amendment.seiNumber}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-right max-w-[120px] leading-tight
                    ${amendment.status === Status.CONCLUDED || amendment.status === Status.APPROVED ? 'bg-green-100 text-green-700' : 
                      amendment.status.includes('diligência') ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                    {amendment.statusDescription || amendment.status}
                  </span>
                </div>
                
                <div className="mb-4">
                   <h3 className={`text-sm font-bold text-slate-800 leading-snug ${!isExpanded ? 'line-clamp-2 min-h-[2.5em]' : ''}`} title={amendment.object}>
                     {amendment.object}
                   </h3>
                </div>

                {(amendment.suinfra || amendment.sutis) && (
                   <div className="flex gap-2 mb-4">
                      {amendment.suinfra && (
                         <span className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase rounded border border-orange-100">
                            <HardHat size={12} /> SUINFRA
                         </span>
                      )}
                      {amendment.sutis && (
                         <span className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-100">
                            <MonitorCheck size={12} /> SUTIS
                         </span>
                      )}
                   </div>
                )}

                <div className="space-y-2 mb-4 border-t border-slate-100 pt-3">
                   <p className="text-xs text-slate-600 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                     <span className="font-semibold">{amendment.deputyName}</span>
                   </p>
                   <p className="text-xs text-slate-600 flex items-center gap-2 truncate">
                     <MapPin size={12} className="text-slate-400" />
                     {amendment.municipality}
                   </p>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-5 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Detalhamento Técnico</h4>
                    <div className="mb-3">
                       <p className="text-[10px] text-slate-400 uppercase">Código Interno</p>
                       <p className="font-mono text-xs font-bold text-slate-500">{amendment.code}</p>
                    </div>
                    {amendment.transferMode && (
                        <div className="mb-3">
                           <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                              <Briefcase size={12} /> Modalidade
                           </p>
                           <p className="text-slate-800 bg-white border border-slate-200 p-2 rounded-md">
                              {amendment.transferMode}
                              {amendment.institutionName && (
                                <span className="block text-slate-600 text-xs mt-1 border-t border-slate-100 pt-1">
                                  <Building2 size={10} className="inline mr-1" />
                                  Inst: {amendment.institutionName}
                                </span>
                              )}
                           </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                       <div className="bg-white border border-slate-200 p-2 rounded-md">
                          <p className="text-[10px] text-slate-400 uppercase">Entrada</p>
                          <p className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Calendar size={10} />
                            {amendment.entryDate ? new Date(amendment.entryDate).toLocaleDateString() : '-'}
                          </p>
                       </div>
                       <div className="bg-white border border-slate-200 p-2 rounded-md">
                          <p className="text-[10px] text-slate-400 uppercase">Saída</p>
                          <p className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Calendar size={10} />
                            {amendment.exitDate ? new Date(amendment.exitDate).toLocaleDateString() : 'Em andamento'}
                          </p>
                       </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center mt-3 -mb-2">
                    {isExpanded ? <ChevronUp size={16} className="text-slate-300" /> : <ChevronDown size={16} className="text-slate-300" />}
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase">Valor Alocado</span>
                    <span className="font-bold text-[#0d457a]">R$ {amendment.value.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex border-t border-slate-100 divide-x divide-slate-100 bg-slate-50 z-10" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => handleViewClick(amendment, e)} className="flex-1 py-3 text-[#0d457a] font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                    Visualizar <ArrowRight size={14} />
                  </button>
                  {userRole !== Role.VIEWER && (
                      <>
                          <button onClick={(e) => handleEditClick(amendment, e)} className="w-12 py-3 text-amber-600 hover:text-amber-800 hover:bg-amber-50 flex items-center justify-center transition-colors border-l border-slate-100" title="Editar">
                              <Pencil size={16} />
                          </button>
                          <button onClick={(e) => handleDeleteClick(amendment.id, e)} className="w-12 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors border-l border-slate-100" title="Excluir">
                              <Trash2 size={16} />
                          </button>
                      </>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#0d457a] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d457a] bg-opacity-90 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl border border-slate-200 my-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-lg flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#0d457a] uppercase tracking-wide">{editingId ? 'Editar Emenda' : 'Cadastro de Emenda'}</h3>
                <p className="text-xs text-slate-500 mt-1">{editingId ? `Alterando dados do registro: ${newAmendment.seiNumber}` : 'Preencha os dados abaixo para registrar uma nova emenda.'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {!editingId && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button type="button" onClick={() => setFormType(AmendmentType.IMPOSITIVA)} className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${formType === AmendmentType.IMPOSITIVA ? 'border-[#0d457a] bg-blue-50 text-[#0d457a] font-bold' : 'border-slate-200 text-slate-500'}`}>Emenda Impositiva</button>
                    <button type="button" onClick={() => setFormType(AmendmentType.GOIAS_CRESCIMENTO)} className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${formType === AmendmentType.GOIAS_CRESCIMENTO ? 'border-[#0d457a] bg-blue-50 text-[#0d457a] font-bold' : 'border-slate-200 text-slate-500'}`}>Goiás em Crescimento</button>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Dados do Processo</h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Número do SEI</label>
                        <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none font-medium" value={newAmendment.seiNumber || ''} onChange={e => setNewAmendment({...newAmendment, seiNumber: e.target.value})} placeholder="Ex: 202500042004774" />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ano Ref. (Exercício)</label>
                         <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none" value={newAmendment.year} onChange={e => setNewAmendment({...newAmendment, year: Number(e.target.value)})} min={2020} max={2030} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Valor (R$)</label>
                        <input type="number" step="0.01" required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none font-mono text-[#0d457a] font-bold" value={newAmendment.value || ''} onChange={e => setNewAmendment({...newAmendment, value: Number(e.target.value)})} />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Origem e Destino</h4>
                    {formType === AmendmentType.IMPOSITIVA ? (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parlamentar (Titular/Suplente)</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none bg-white" value={newAmendment.deputyName || ''} onChange={e => setNewAmendment({...newAmendment, deputyName: e.target.value})}>
                                <option value="">Selecione o Deputado...</option>
                                {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Modalidade</label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none bg-white" value={newAmendment.transferMode || TransferMode.FUNDO_A_FUNDO} onChange={e => setNewAmendment({...newAmendment, transferMode: e.target.value as TransferMode})}>
                                    {Object.values(TransferMode).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            {newAmendment.transferMode === TransferMode.CONVENIO && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instituição</label>
                                    <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none" value={newAmendment.institutionName || ''} onChange={e => setNewAmendment({...newAmendment, institutionName: e.target.value})} placeholder="Nome da Entidade" />
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Município Beneficiado (Goiás)</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none bg-white" value={newAmendment.municipality || ''} onChange={e => setNewAmendment({...newAmendment, municipality: e.target.value})}>
                             <option value="">Selecione o Município...</option>
                             {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Detalhamento Técnico</h4>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Objeto da Emenda</label>
                    <textarea className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0d457a] outline-none" rows={2} value={newAmendment.object || ''} onChange={e => setNewAmendment({...newAmendment, object: e.target.value})} placeholder="Ex: Aquisição de Ambulância, Custeio de Unidade, etc..." />
                 </div>
                 <div className="flex flex-wrap gap-6">
                     <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white transition-colors">
                         <input type="checkbox" className="rounded text-[#0d457a] focus:ring-[#0d457a]" checked={newAmendment.suinfra || false} onChange={e => setNewAmendment({...newAmendment, suinfra: e.target.checked})} />
                         <span className="text-sm font-bold text-slate-700 uppercase">Envolve Obras (SUINFRA)?</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white transition-colors">
                         <input type="checkbox" className="rounded text-[#0d457a] focus:ring-[#0d457a]" checked={newAmendment.sutis || false} onChange={e => setNewAmendment({...newAmendment, sutis: e.target.checked})} />
                         <span className="text-sm font-bold text-slate-700 uppercase">Envolve TI/Equip. (SUTIS)?</span>
                     </label>
                 </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-bold text-sm uppercase transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#0d457a] text-white rounded-md hover:bg-[#0a365f] font-bold text-sm uppercase shadow-sm transition-colors">{editingId ? 'Salvar Alterações' : 'Cadastrar Emenda'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};