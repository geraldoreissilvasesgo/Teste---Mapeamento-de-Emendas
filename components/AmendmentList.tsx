import React, { useState, useMemo } from 'react';
import { Amendment, StatusConfig, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType, Status, AmendmentMovement } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, MapPin, ChevronLeft, ChevronRight, FileText, 
  X, User, DollarSign, Calendar, Info, ArrowRight, Save, Loader2,
  LayoutGrid, FileSignature, History, Timer, CheckCircle2,
  Building2, ClipboardList, TrendingUp, AlertCircle, Clock,
  Zap, Layers, Target, Landmark, Percent, ChevronDown, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

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
  error?: string | null;
}

const ITEMS_PER_PAGE = 12;

export const AmendmentList: React.FC<AmendmentListProps> = ({ 
  amendments, 
  onSelect,
  onCreate
}) => {
  const { notify } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeputy, setSelectedDeputy] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | AmendmentType.IMPOSITIVA | AmendmentType.GOIAS_CRESCIMENTO>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trailAmendment, setTrailAmendment] = useState<Amendment | null>(null);

  const [formData, setFormData] = useState({
    seiNumber: '',
    year: new Date().getFullYear(),
    entryDate: new Date().toISOString().split('T')[0],
    type: AmendmentType.IMPOSITIVA,
    deputyName: 'Executivo Estadual',
    municipality: '',
    beneficiaryUnit: '',
    object: '',
    value: '',
    transferMode: TransferMode.FUNDO_A_FUNDO,
    gnd: GNDType.INVESTIMENTO,
    suinfra: false,
    sutis: false
  });

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL'
  }).format(v);

  const filteredAmendments = useMemo(() => {
    let base = amendments;
    
    if (activeTab !== 'all') {
      base = base.filter(a => a.type === activeTab);
    }

    if (selectedDeputy !== 'all') {
      base = base.filter(a => a.deputyName === selectedDeputy);
    }
    
    if (!searchTerm) return base;
    const tokens = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    return base.filter(a => {
      const sei = (a.seiNumber || '').toLowerCase();
      const obj = (a.object || '').toLowerCase();
      const city = (a.municipality || '').toLowerCase();
      const deputy = (a.deputyName || '').toLowerCase();
      
      return tokens.every(token => 
        sei.includes(token) || obj.includes(token) || city.includes(token) || deputy.includes(token)
      );
    });
  }, [amendments, searchTerm, activeTab, selectedDeputy]);

  const paginatedData = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seiNumber || !formData.municipality || !formData.object || !formData.value) {
      notify('warning', 'Dados Incompletos', 'Preencha todos os campos obrigatórios para protocolo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanValue = parseFloat(formData.value.replace(/[^\d]/g, '')) / 100 || 0;
      const INITIAL_SECTOR = 'SES/SUBIPEI-21286';

      const newAmendment: Amendment = {
        id: '', 
        tenantId: 'GOIAS',
        code: `REG-${formData.year}-${Math.floor(1000 + Math.random() * 9000)}`,
        seiNumber: formData.seiNumber,
        year: formData.year,
        entryDate: formData.entryDate,
        type: formData.type,
        deputyName: formData.deputyName,
        municipality: formData.municipality,
        beneficiaryUnit: formData.beneficiaryUnit || undefined,
        object: formData.object,
        value: cleanValue,
        status: 'Análise da Documentação',
        currentSector: INITIAL_SECTOR,
        createdAt: new Date().toISOString(),
        transferMode: formData.transferMode,
        gnd: formData.gnd,
        suinfra: formData.suinfra,
        sutis: formData.sutis,
        movements: [{
          id: `mov-init-${Date.now()}`,
          amendmentId: '',
          fromSector: 'Protocolo Externo',
          toSector: INITIAL_SECTOR,
          dateIn: new Date().toISOString(),
          dateOut: null,
          deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
          daysSpent: 0,
          handledBy: 'GESA Portal',
          remarks: `Protocolo inicial (${formData.type}) via sistema. Entrada direta em SUBIPEI.`,
          analysisType: 'Abertura de Processo'
        }]
      };

      await onCreate(newAmendment);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      seiNumber: '', year: new Date().getFullYear(), entryDate: new Date().toISOString().split('T')[0],
      type: AmendmentType.IMPOSITIVA, deputyName: 'Executivo Estadual', municipality: '', beneficiaryUnit: '',
      object: '', value: '', transferMode: TransferMode.FUNDO_A_FUNDO, gnd: GNDType.INVESTIMENTO,
      suinfra: false, sutis: false
    });
  };

  const handleValueChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    const number = parseFloat(digits) / 100;
    if (isNaN(number)) {
      setFormData({ ...formData, value: '' });
      return;
    }
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
    setFormData({ ...formData, value: formatted });
  };

  /**
   * Determina a conformidade do SLA para uma movimentação específica.
   */
  const checkMovementSla = (mov: AmendmentMovement) => {
    const end = mov.dateOut ? new Date(mov.dateOut) : new Date();
    const deadline = new Date(mov.deadline);
    const isDelayed = end > deadline;
    return {
      isDelayed,
      color: isDelayed ? 'text-red-500' : 'text-emerald-500',
      label: isDelayed ? 'Fora do Prazo' : 'Dentro do Prazo',
      icon: isDelayed ? AlertTriangle : ShieldCheck
    };
  };

  const isCrescimento = formData.type === AmendmentType.GOIAS_CRESCIMENTO;
  const isConvenio = formData.transferMode === TransferMode.CONVENIO;
  
  const themeColor = isCrescimento ? 'text-emerald-600' : 'text-blue-500';
  const themeBtn = isCrescimento ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#0d457a] hover:bg-[#0a365f]';

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* CABEÇALHO E FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Célula de Processos</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
            <LayoutGrid size={16} className="text-blue-500" /> Fluxo de Tramitação • GESA/SUBIPEI
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="BUSCAR SEI OU OBJETO..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[20px] outline-none font-bold text-[10px] uppercase text-[#0d457a] shadow-sm focus:ring-4 ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="md:w-64 relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
              className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-[20px] outline-none font-bold text-[10px] uppercase text-[#0d457a] shadow-sm focus:ring-4 ring-blue-500/5 transition-all appearance-none"
              value={selectedDeputy}
              onChange={(e) => { setSelectedDeputy(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">TODOS OS AUTORES</option>
              {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Abrir formulário de novo protocolo"
            className="bg-[#0d457a] text-white px-10 py-4 rounded-[24px] font-black uppercase text-[11px] tracking-[0.15em] shadow-xl shadow-blue-900/20 hover:bg-[#0a365f] hover:shadow-2xl transition-all flex items-center gap-3 shrink-0 active:scale-95 group"
          >
            <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <Plus size={20} className="text-white" />
            </div>
            <span>Novo Protocolo</span>
          </button>
        </div>
      </div>

      {/* TABS DE PROGRAMA */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-[24px] w-fit no-print">
        <button 
          onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          className={`px-8 py-3 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-[#0d457a] text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          Todos os Processos
        </button>
        <button 
          onClick={() => { setActiveTab(AmendmentType.IMPOSITIVA); setCurrentPage(1); }}
          className={`px-8 py-3 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === AmendmentType.IMPOSITIVA ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          <Layers size={14} /> Emendas Impositivas
        </button>
        <button 
          onClick={() => { setActiveTab(AmendmentType.GOIAS_CRESCIMENTO); setCurrentPage(1); }}
          className={`px-8 py-3 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === AmendmentType.GOIAS_CRESCIMENTO ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          <Landmark size={14} /> Goiás em Crescimento
        </button>
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginatedData.map((amendment) => {
          const isGc = amendment.type === AmendmentType.GOIAS_CRESCIMENTO;
          return (
            <div 
              key={amendment.id} 
              onClick={() => onSelect(amendment)}
              className={`group bg-white rounded-[48px] border shadow-sm hover:shadow-2xl transition-all cursor-pointer flex flex-col p-10 overflow-hidden relative ${isGc ? 'border-emerald-100 hover:border-emerald-300' : 'border-slate-200 hover:border-blue-100'}`}
            >
              {isGc && (
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
              )}
              <div className="flex justify-between items-start mb-8">
                <div className="flex flex-col gap-1.5">
                  <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isGc ? 'text-emerald-500' : 'text-blue-500'}`}>{amendment.type}</span>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                    {amendment.seiNumber}
                  </h3>
                </div>
                <div className={`p-4 rounded-2xl border group-hover:bg-opacity-50 transition-colors ${isGc ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-[#0d457a] border-slate-100'}`}>
                  {isGc ? <Landmark size={20} /> : <FileText size={20} />}
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 group-hover:bg-white transition-all">
                  <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed line-clamp-3">
                    {amendment.object}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isGc ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Autor</p>
                      <p className="text-[10px] font-black text-[#0d457a] uppercase truncate">{amendment.deputyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isGc ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'}`}>
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Município</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase truncate">{amendment.municipality}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Valor Nominal</span>
                  <span className={`text-xl font-black tracking-tight ${isGc ? 'text-emerald-600' : 'text-[#0d457a]'}`}>{formatBRL(amendment.value)}</span>
                </div>
                <div className="flex flex-col items-end gap-3">
                   <button 
                     onClick={(e) => { e.stopPropagation(); setTrailAmendment(amendment); }}
                     className="px-4 py-2 bg-[#0d457a] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-900 transition-all flex items-center gap-2 group/btn"
                   >
                     <History size={14} className="group-hover/btn:rotate-180 transition-transform duration-500" /> Ver Trilha
                   </button>
                   <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase border border-slate-100 truncate max-w-[150px] text-center">
                    {amendment.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-12">
           <button 
             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             disabled={currentPage === 1}
             className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30"
           >
             <ChevronLeft size={20} />
           </button>
           <div className="px-8 py-4 bg-[#0d457a] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
             Página {currentPage} / {totalPages}
           </div>
           <button 
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             disabled={currentPage === totalPages}
             className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30"
           >
             <ChevronRight size={20} />
           </button>
        </div>
      )}

      {/* MODAL DE TRILHA RÁPIDA (HISTÓRICO) */}
      {trailAmendment && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-5">
                  <div className="p-4 bg-[#0d457a] text-white rounded-[24px] shadow-lg">
                    <History size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Trilha de Tramitação</h3>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-2">SEI: {trailAmendment.seiNumber}</p>
                  </div>
               </div>
               <button onClick={() => setTrailAmendment(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} className="text-slate-300" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="space-y-0 relative">
                <div className="absolute left-[26px] top-6 bottom-6 w-1 bg-slate-100"></div>
                {[...trailAmendment.movements].reverse().map((mov, idx) => {
                  const isCurrent = !mov.dateOut;
                  const slaInfo = checkMovementSla(mov);
                  const SlaIcon = slaInfo.icon;

                  return (
                    <div key={mov.id} className="relative pl-20 pb-10 last:pb-0 group">
                      <div className={`absolute left-0 top-0 w-14 h-14 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center z-10 transition-all ${
                        isCurrent ? 'bg-[#0d457a] text-white ring-8 ring-blue-50' : 'bg-emerald-500 text-white'
                      }`}>
                          {isCurrent ? <Timer size={24} className="animate-pulse" /> : <CheckCircle2 size={24} />}
                      </div>
                      <div className={`p-6 rounded-[32px] border transition-all ${isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex flex-col md:flex-row justify-between gap-2 mb-3">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{mov.analysisType || 'ETAPA'}</span>
                                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${slaInfo.color} bg-white border border-current opacity-80`}>
                                     <SlaIcon size={8} /> {slaInfo.label}
                                  </div>
                               </div>
                               <h4 className="text-xs font-black text-[#0d457a] uppercase">{mov.toSector}</h4>
                            </div>
                            <div className="text-left md:text-right">
                               <p className="text-[9px] font-bold text-slate-400 uppercase">Entrada: {new Date(mov.dateIn).toLocaleDateString('pt-BR')}</p>
                               {mov.dateOut ? (
                                 <p className="text-[9px] font-bold text-slate-400 uppercase">Saída: {new Date(mov.dateOut).toLocaleDateString('pt-BR')}</p>
                               ) : (
                                 <p className="text-[9px] font-black text-blue-600 uppercase animate-pulse">Em Trâmite</p>
                               )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 pt-3 border-t border-slate-200/50">
                             <div className="flex items-center gap-2">
                                <Clock size={12} className="text-blue-400" />
                                <span className="text-[9px] font-black text-slate-600 uppercase">Permanência: {mov.daysSpent || 0} Dias</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <User size={12} className="text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-[150px]">{mov.handledBy}</span>
                             </div>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0 text-center">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                 Esta trilha é imutável e auditada conforme a Lei Estadual nº 20.918/2020.
               </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO ADAPTATIVO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4">
          <form 
            onSubmit={handleCreateSubmit} 
            className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
          >
            <div className={`p-10 border-b border-slate-100 flex justify-between items-center shrink-0 ${isCrescimento ? 'bg-emerald-50/50' : 'bg-slate-50/50'}`}>
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-3xl text-white shadow-lg ${isCrescimento ? 'bg-emerald-600' : 'bg-[#0d457a]'}`}>
                  {isCrescimento ? <Landmark size={28} /> : <FileSignature size={28} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Protocolo de Processo</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Carga Inicial de Dados para Trâmite</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all">
                <X size={24} className="text-slate-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, type: AmendmentType.IMPOSITIVA})}
                   className={`p-6 rounded-[32px] border-2 transition-all flex items-center gap-4 ${formData.type === AmendmentType.IMPOSITIVA ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 grayscale opacity-40'}`}
                 >
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Layers size={20}/></div>
                    <div className="text-left">
                       <p className="text-[10px] font-black uppercase text-blue-900">Emenda Impositiva</p>
                       <p className="text-[8px] font-bold uppercase text-blue-400">Fluxo Parlamentar</p>
                    </div>
                 </button>
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, type: AmendmentType.GOIAS_CRESCIMENTO, deputyName: 'Executivo Estadual'})}
                   className={`p-6 rounded-[32px] border-2 transition-all flex items-center gap-4 ${formData.type === AmendmentType.GOIAS_CRESCIMENTO ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 grayscale opacity-40'}`}
                 >
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Landmark size={20}/></div>
                    <div className="text-left">
                       <p className="text-[10px] font-black uppercase text-emerald-900">Goiás Crescimento</p>
                       <p className="text-[8px] font-bold uppercase text-emerald-400">Recurso do Tesouro</p>
                    </div>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${themeColor}`}>Número do Processo SEI *</label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" required placeholder="0000.0000.000000"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs"
                      value={formData.seiNumber}
                      onChange={e => setFormData({...formData, seiNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${themeColor}`}>Valor Nominal (R$) *</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" required placeholder="R$ 0,00"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs"
                      value={formData.value}
                      onChange={e => handleValueChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${themeColor}`}>Autor / Parlamentar</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select 
                      disabled={isCrescimento}
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none focus:ring-4 ring-blue-500/5 appearance-none disabled:opacity-60"
                      value={formData.deputyName}
                      onChange={e => setFormData({...formData, deputyName: e.target.value})}
                    >
                      {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${themeColor}`}>Município Beneficiado *</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select 
                      required
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none focus:ring-4 ring-blue-500/5 appearance-none"
                      value={formData.municipality}
                      onChange={e => setFormData({...formData, municipality: e.target.value})}
                    >
                      <option value="">Selecione a Cidade...</option>
                      {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {isCrescimento && isConvenio && (
                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${themeColor}`}>Nome da Instituição Beneficiada *</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" required placeholder="NOME DA ENTIDADE / OSC / INSTITUIÇÃO..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs"
                      value={formData.beneficiaryUnit}
                      onChange={e => setFormData({...formData, beneficiaryUnit: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${themeColor}`}>Objeto / Descrição do Recurso *</label>
                <textarea 
                  required
                  placeholder="DESCREVA A FINALIDADE DO RECURSO (EX: AQUISIÇÃO DE AMBULÂNCIA)..."
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] font-bold text-[#0d457a] text-xs uppercase outline-none focus:ring-4 ring-blue-500/5 h-32 resize-none leading-relaxed"
                  value={formData.object}
                  onChange={e => setFormData({...formData, object: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Zap size={14} className="text-blue-500"/> Classificação Orçamentária
                    </h4>
                    <div className="space-y-4">
                       <div className="flex flex-col gap-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Modalidade</label>
                          <select 
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase text-[#0d457a] outline-none"
                            value={formData.transferMode}
                            onChange={e => setFormData({...formData, transferMode: e.target.value as TransferMode})}
                          >
                             {Object.values(TransferMode).map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Natureza (GND)</label>
                          <select 
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase text-[#0d457a] outline-none"
                            value={formData.gnd}
                            onChange={e => setFormData({...formData, gnd: e.target.value as GNDType})}
                          >
                             {Object.values(GNDType).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Percent size={14} className="text-blue-500"/> Análises Setoriais
                    </h4>
                    <div className="space-y-4">
                       <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${formData.suinfra ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Building2 size={16}/></div>
                             <span className="text-[9px] font-black uppercase text-[#0d457a]">Exige SUINFRA</span>
                          </div>
                          <input type="checkbox" checked={formData.suinfra} onChange={e => setFormData({...formData, suinfra: e.target.checked})} className="w-5 h-5 rounded border-slate-300" />
                       </label>
                       <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${formData.sutis ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Zap size={16}/></div>
                             <span className="text-[9px] font-black uppercase text-[#0d457a]">Exige SUTIS</span>
                          </div>
                          <input type="checkbox" checked={formData.sutis} onChange={e => setFormData({...formData, sutis: e.target.checked})} className="w-5 h-5 rounded border-slate-300" />
                       </label>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 shrink-0">
              <button 
                type="button" onClick={() => setIsCreateModalOpen(false)}
                className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >
                Descartar
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`px-12 py-5 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 ${themeBtn}`}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Efetivar Protocolo {isCrescimento ? 'Crescimento' : 'Impositiva'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};