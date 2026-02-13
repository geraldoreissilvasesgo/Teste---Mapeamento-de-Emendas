import React, { useState, useMemo } from 'react';
import { Amendment, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType, Status, AmendmentMovement, StatusConfig } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, MapPin, ChevronLeft, ChevronRight, FileText, 
  X, User, DollarSign, Calendar, Info, ArrowRight, Save, Loader2,
  LayoutGrid, FileSignature, History, Timer, CheckCircle2,
  Building2, ClipboardList, TrendingUp, AlertCircle, Clock,
  Zap, Layers, Target, Landmark, Percent, ChevronDown, ShieldCheck, AlertTriangle,
  ListFilter, Banknote
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
  const [activeTab, setActiveTab] = useState<'all' | AmendmentType.IMPOSITIVA | AmendmentType.GOIAS_CRESCIMENTO>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (activeTab !== 'all') base = base.filter(a => a.type === activeTab);
    
    if (!searchTerm) return base;
    const tokens = searchTerm.toLowerCase().split(/\s+/);
    return base.filter(a => 
      tokens.every(t => 
        a.seiNumber.toLowerCase().includes(t) || 
        a.object.toLowerCase().includes(t) || 
        a.deputyName.toLowerCase().includes(t) ||
        a.municipality.toLowerCase().includes(t)
      )
    );
  }, [amendments, searchTerm, activeTab]);

  const paginatedData = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seiNumber || !formData.municipality || !formData.object || !formData.value) {
      notify('warning', 'Atenção', 'Preencha os campos obrigatórios.');
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
          remarks: 'Abertura de processo via interface otimizada.',
          analysisType: 'Protocolo'
        }]
      };

      await onCreate(newAmendment);
      setIsCreateModalOpen(false);
      setFormData({
        seiNumber: '', year: new Date().getFullYear(), entryDate: new Date().toISOString().split('T')[0],
        type: AmendmentType.IMPOSITIVA, deputyName: 'Executivo Estadual', municipality: '', beneficiaryUnit: '',
        object: '', value: '', transferMode: TransferMode.FUNDO_A_FUNDO, gnd: GNDType.INVESTIMENTO,
        suinfra: false, sutis: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValueChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    const number = parseFloat(digits) / 100;
    if (isNaN(number)) return setFormData({ ...formData, value: '' });
    setFormData({ ...formData, value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Repositório de Emendas</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <LayoutGrid size={14} className="text-emerald-500" /> Painel de Alta Disponibilidade GESA
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="PESQUISAR SEI OU AUTOR..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl outline-none font-bold text-[10px] uppercase text-[#0d457a] shadow-sm focus:ring-4 ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0d457a] text-white px-8 py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:shadow-2xl hover:bg-blue-900 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Plus size={18} /> Novo Protocolo
          </button>
        </div>
      </div>

      <div className="flex bg-slate-200/40 p-1.5 rounded-[24px] w-fit">
        {[
          { id: 'all', label: 'Todos', icon: ListFilter },
          { id: AmendmentType.IMPOSITIVA, label: 'Impositivas', icon: Layers },
          { id: AmendmentType.GOIAS_CRESCIMENTO, label: 'Crescimento', icon: Landmark },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-3 rounded-[20px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-white text-[#0d457a] shadow-lg' : 'text-slate-500 hover:text-[#0d457a]'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedData.map((amendment) => {
          const isGc = amendment.type === AmendmentType.GOIAS_CRESCIMENTO;
          const lastMov = amendment.movements[amendment.movements.length - 1];
          const deadline = new Date(lastMov?.deadline || Date.now());
          const isLate = new Date() > deadline && amendment.status !== Status.CONCLUDED;
          
          return (
            <div 
              key={amendment.id} 
              onClick={() => onSelect(amendment)}
              className={`group bg-white rounded-[40px] border-2 transition-all cursor-pointer flex flex-col p-8 relative overflow-hidden ${
                isLate ? 'border-red-100 hover:border-red-200 shadow-red-900/5' : 'border-white hover:border-blue-100 hover:shadow-2xl'
              } shadow-sm`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full inline-block ${
                    isGc ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {amendment.type}
                  </span>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                    {amendment.seiNumber}
                  </h3>
                </div>
                <div className={`p-4 rounded-2xl ${isGc ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} transition-transform group-hover:rotate-6`}>
                  {isGc ? <Landmark size={20} /> : <FileSignature size={20} />}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed line-clamp-2 min-h-[32px]">
                  {amendment.object}
                </p>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[7px] font-black text-slate-300 uppercase leading-none mb-1">Autor</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase truncate max-w-[100px]">{amendment.deputyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[7px] font-black text-slate-300 uppercase leading-none mb-1">Município</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase truncate max-w-[100px]">{amendment.municipality}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">Valor Nominal</p>
                  <p className={`text-lg font-black tracking-tight ${isGc ? 'text-emerald-600' : 'text-[#0d457a]'}`}>
                    {formatBRL(amendment.value)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border mb-2 ${
                    isLate ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {isLate ? <AlertTriangle size={10} /> : <Timer size={10} />}
                    {amendment.status}
                  </div>
                  <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">
                    Limite: {deadline.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-10">
           <button 
             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             disabled={currentPage === 1}
             className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-slate-50 transition-all disabled:opacity-30"
           >
             <ChevronLeft size={20} />
           </button>
           <div className="px-8 py-4 bg-[#0d457a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
             Pág {currentPage} / {totalPages}
           </div>
           <button 
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             disabled={currentPage === totalPages}
             className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-slate-50 transition-all disabled:opacity-30"
           >
             <ChevronRight size={20} />
           </button>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4">
          <form 
            onSubmit={handleCreateSubmit} 
            className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
          >
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-[#0d457a] text-white rounded-2xl shadow-lg">
                  <Banknote size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Protocolar Novo SEI</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Ingressar Dados no Fluxo GESA</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-white rounded-xl transition-all">
                <X size={24} className="text-slate-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, type: AmendmentType.IMPOSITIVA})}
                   className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 text-center ${formData.type === AmendmentType.IMPOSITIVA ? 'border-blue-500 bg-blue-50/50 ring-8 ring-blue-500/5' : 'border-slate-100 opacity-40 grayscale'}`}
                 >
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-2"><Layers size={24}/></div>
                    <div>
                       <p className="text-xs font-black uppercase text-blue-900 leading-none">Emenda Impositiva</p>
                    </div>
                 </button>
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, type: AmendmentType.GOIAS_CRESCIMENTO, deputyName: 'Executivo Estadual'})}
                   className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 text-center ${formData.type === AmendmentType.GOIAS_CRESCIMENTO ? 'border-emerald-500 bg-emerald-50/50 ring-8 ring-emerald-500/5' : 'border-slate-100 opacity-40 grayscale'}`}
                 >
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-2"><Landmark size={24}/></div>
                    <div>
                       <p className="text-xs font-black uppercase text-emerald-900 leading-none">Goiás em Crescimento</p>
                    </div>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Processo SEI *</label>
                  <input 
                    type="text" required placeholder="0000.0000.000000"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs shadow-inner"
                    value={formData.seiNumber}
                    onChange={e => setFormData({...formData, seiNumber: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Recurso *</label>
                  <input 
                    type="text" required placeholder="R$ 0,00"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs shadow-inner"
                    value={formData.value}
                    onChange={e => handleValueChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parlamentar / Autor</label>
                  <select 
                    disabled={formData.type === AmendmentType.GOIAS_CRESCIMENTO}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none focus:ring-4 ring-blue-500/5 disabled:opacity-50 shadow-inner appearance-none"
                    value={formData.deputyName}
                    onChange={e => setFormData({...formData, deputyName: e.target.value})}
                  >
                    {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Município Beneficiado *</label>
                  <select 
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none focus:ring-4 ring-blue-500/5 shadow-inner appearance-none"
                    value={formData.municipality}
                    onChange={e => setFormData({...formData, municipality: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Objeto *</label>
                <textarea 
                  required
                  placeholder="DESCREVA A FINALIDADE DO RECURSO..."
                  className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[32px] font-bold text-[#0d457a] text-xs uppercase outline-none focus:ring-4 ring-blue-500/5 h-32 resize-none leading-relaxed shadow-inner"
                  value={formData.object}
                  onChange={e => setFormData({...formData, object: e.target.value})}
                />
              </div>
            </div>

            <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 shrink-0">
              <button 
                type="button" onClick={() => setIsCreateModalOpen(false)}
                className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-blue-900 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Efetivar Protocolo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};