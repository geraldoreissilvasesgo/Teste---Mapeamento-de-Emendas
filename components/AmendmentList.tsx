
import React, { useState, useMemo } from 'react';
import { Amendment, StatusConfig, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, MapPin, ChevronLeft, ChevronRight, FileText, 
  X, User, DollarSign, Calendar, Info, ArrowRight, Save, Loader2,
  LayoutGrid, Briefcase, FileSignature, Landmark, TrendingUp,
  Filter, AlertCircle, Clock, History, Timer, CheckCircle2,
  Quote, Building2, HardDrive, Settings, ClipboardList, 
  CalendarDays, BookOpen, ShieldCheck, Scale, Binary
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
  sectors,
  onSelect,
  onCreate
}) => {
  const { notify } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    seiNumber: '',
    year: new Date().getFullYear(),
    entryDate: new Date().toISOString().split('T')[0],
    type: AmendmentType.IMPOSITIVA,
    deputyName: '',
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
    if (!searchTerm) return amendments;
    const tokens = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    return amendments.filter(a => {
      const sei = (a.seiNumber || '').toLowerCase();
      const obj = (a.object || '').toLowerCase();
      const deputy = (a.deputyName || '').toLowerCase();
      const city = (a.municipality || '').toLowerCase();
      return tokens.every(token => 
        sei.includes(token) || obj.includes(token) || deputy.includes(token) || city.includes(token)
      );
    });
  }, [amendments, searchTerm]);

  const paginatedData = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seiNumber || !formData.deputyName || !formData.municipality || !formData.object || !formData.value) {
      notify('warning', 'Dados Incompletos', 'Preencha todos os campos obrigatórios para protocolo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanValue = parseFloat(formData.value.replace(/[^\d]/g, '')) / 100 || 0;
      
      const newAmendment: Amendment = {
        id: '', // Será gerado UUID no serviço
        tenantId: 'GOIAS',
        code: `EM-${formData.year}-${Math.floor(1000 + Math.random() * 9000)}`,
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
        currentSector: sectors[0]?.name || 'SES/CEP-20903',
        createdAt: new Date().toISOString(),
        transferMode: formData.transferMode,
        gnd: formData.gnd,
        suinfra: formData.suinfra,
        sutis: formData.sutis,
        movements: [{
          id: `mov-init-${Date.now()}`,
          amendmentId: '',
          fromSector: 'Protocolo Externo',
          toSector: sectors[0]?.name || 'SES/CEP-20903',
          dateIn: new Date().toISOString(),
          dateOut: null,
          deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
          daysSpent: 0,
          handledBy: 'GESA Portal',
          remarks: `Protocolo inicial. Modalidade: ${formData.transferMode}. GND: ${formData.gnd}.`,
          analysisType: 'Abertura de Processo'
        }]
      };

      await onCreate(newAmendment);
      setIsCreateModalOpen(false);
      setFormData({
        seiNumber: '',
        year: new Date().getFullYear(),
        entryDate: new Date().toISOString().split('T')[0],
        type: AmendmentType.IMPOSITIVA,
        deputyName: '',
        municipality: '',
        beneficiaryUnit: '',
        object: '',
        value: '',
        transferMode: TransferMode.FUNDO_A_FUNDO,
        gnd: GNDType.INVESTIMENTO,
        suinfra: false,
        sutis: false
      });
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Célula de Processos</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
            <LayoutGrid size={16} className="text-blue-500" /> Fluxo de Tramitação • GESA/SUBIPEI
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="BUSCAR SEI, OBJETO OU AUTOR..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[20px] outline-none font-bold text-[10px] uppercase text-[#0d457a] shadow-sm focus:ring-4 ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0d457a] text-white px-8 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all flex items-center gap-3 shrink-0 active:scale-95"
          >
            <Plus size={20} /> Novo Protocolo
          </button>
        </div>
      </div>

      {/* GRID DE CARDS GOVERNAMENTAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginatedData.map((amendment) => (
          <div 
            key={amendment.id} 
            onClick={() => onSelect(amendment)}
            className="group bg-white rounded-[48px] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all cursor-pointer flex flex-col p-10 overflow-hidden relative"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.25em]">{amendment.type}</span>
                <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                  {amendment.seiNumber}
                </h3>
              </div>
              <div className="p-4 bg-slate-50 text-[#0d457a] rounded-2xl border border-slate-100 group-hover:bg-blue-50 transition-colors">
                <FileText size={20} />
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
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Autor</p>
                    <p className="text-[10px] font-black text-[#0d457a] uppercase truncate">{amendment.deputyName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
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
                <span className="text-xl font-black text-emerald-600 tracking-tight">{formatBRL(amendment.value)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Status GESA</span>
                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase border border-blue-100">{amendment.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-12">
           <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-5 bg-white border border-slate-200 rounded-[28px] text-[#0d457a] shadow-sm hover:bg-blue-50 transition-all disabled:opacity-30"><ChevronLeft size={24} /></button>
           <div className="bg-white px-10 py-5 rounded-[28px] shadow-sm border border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0d457a]">Página {currentPage} de {totalPages}</span>
           </div>
           <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-5 bg-white border border-slate-200 rounded-[28px] text-[#0d457a] shadow-sm hover:bg-blue-50 transition-all disabled:opacity-30"><ChevronRight size={24} /></button>
        </div>
      )}

      {/* MODAL DE PROTOCOLO ROBUSTO (PADRÃO SES-GO) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="bg-white rounded-[60px] w-full max-w-6xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto border border-white/10 flex flex-col max-h-[95vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[60px] shrink-0">
               <div className="flex items-center gap-6">
                  <div className="p-5 bg-[#0d457a] text-white rounded-[32px] shadow-2xl">
                     <FileSignature size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Novo Protocolo Governamental</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">GESA Cloud Native • Emendas e Repasses</p>
                  </div>
               </div>
               <button onClick={() => setIsCreateModalOpen(false)} className="p-4 hover:bg-white rounded-2xl shadow-sm transition-all border border-transparent hover:border-slate-200">
                  <X size={32} className="text-slate-400" />
               </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 p-12 overflow-y-auto custom-scrollbar space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                
                {/* GRUPO 1: PROTOCOLO E IDENTIFICAÇÃO */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><ClipboardList size={20}/></div>
                      <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest">Protocolo e Origem</h4>
                   </div>
                   
                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Processo SEI (Principal) *</label>
                      <input type="text" required placeholder="XXXX.XXXX.XXXXXXX" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-[#0d457a] uppercase text-xs outline-none focus:border-blue-500 transition-all shadow-inner" value={formData.seiNumber} onChange={(e) => setFormData({...formData, seiNumber: e.target.value})} />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Exercício *</label>
                        <input type="number" required className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-[#0d457a] text-xs outline-none focus:border-blue-500" value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Data de Protocolo *</label>
                        <input type="date" required className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-[#0d457a] text-xs outline-none focus:border-blue-500" value={formData.entryDate} onChange={(e) => setFormData({...formData, entryDate: e.target.value})} />
                      </div>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Parlamentar / Autor *</label>
                      <select required className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-[#0d457a] uppercase text-[10px] outline-none focus:border-blue-500" value={formData.deputyName} onChange={(e) => setFormData({...formData, deputyName: e.target.value})}>
                        <option value="">SELECIONE O AUTOR...</option>
                        {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                </div>

                {/* GRUPO 2: CLASSIFICAÇÃO ORÇAMENTÁRIA */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><TrendingUp size={20}/></div>
                      <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest">Plano Orçamentário</h4>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">GND (Gasto)</label>
                        <select className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-[#0d457a] uppercase text-[10px] outline-none focus:border-blue-500" value={formData.gnd} onChange={(e) => setFormData({...formData, gnd: e.target.value as GNDType})}>
                          {Object.values(GNDType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Modalidade</label>
                        <select className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-[#0d457a] uppercase text-[10px] outline-none focus:border-blue-500" value={formData.transferMode} onChange={(e) => setFormData({...formData, transferMode: e.target.value as TransferMode})}>
                          {Object.values(TransferMode).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Valor Nominal (R$) *</label>
                      <input 
                        type="text" required 
                        placeholder="R$ 0,00" 
                        className="w-full px-8 py-6 bg-emerald-50 border-2 border-emerald-100 rounded-[32px] font-black text-emerald-700 text-2xl outline-none focus:border-emerald-500 transition-all shadow-inner" 
                        value={formData.value} 
                        onChange={(e) => handleValueChange(e.target.value)} 
                      />
                   </div>

                   <div className="space-y-4 pt-6">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Checkpoints de Conformidade</label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-between p-5 rounded-[24px] border-2 transition-all cursor-pointer ${formData.suinfra ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                           <span className="text-[9px] font-black uppercase text-slate-600">SUINFRA (Obras)</span>
                           <input type="checkbox" checked={formData.suinfra} onChange={(e) => setFormData({...formData, suinfra: e.target.checked})} className="w-5 h-5 rounded-lg text-emerald-600" />
                        </label>
                        <label className={`flex items-center justify-between p-5 rounded-[24px] border-2 transition-all cursor-pointer ${formData.sutis ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                           <span className="text-[9px] font-black uppercase text-slate-600">SUTIS (Tecnologia)</span>
                           <input type="checkbox" checked={formData.sutis} onChange={(e) => setFormData({...formData, sutis: e.target.checked})} className="w-5 h-5 rounded-lg text-blue-600" />
                        </label>
                      </div>
                   </div>
                </div>

                {/* GRUPO 3: BENEFICIÁRIO E OBJETO */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Building2 size={20}/></div>
                      <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest">Beneficiário e Objeto</h4>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Unidade Beneficiária (Opcional)</label>
                      <input type="text" placeholder="EX: HOSPITAL REGIONAL..." className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-[#0d457a] uppercase text-xs outline-none focus:border-blue-500 transition-all shadow-inner mb-6" value={formData.beneficiaryUnit} onChange={(e) => setFormData({...formData, beneficiaryUnit: e.target.value})} />
                      
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Município de Aplicação *</label>
                      <select required className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] font-black text-[#0d457a] uppercase text-[10px] outline-none focus:border-blue-500" value={formData.municipality} onChange={(e) => setFormData({...formData, municipality: e.target.value})}>
                        <option value="">CIDADE...</option>
                        {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Objeto Detalhado *</label>
                      <textarea required className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] font-bold text-[#0d457a] uppercase text-xs outline-none focus:border-blue-500 h-44 resize-none shadow-inner leading-relaxed" placeholder="DESCREVA A FINALIDADE DOS RECURSOS..." value={formData.object} onChange={(e) => setFormData({...formData, object: e.target.value})} />
                   </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row justify-end gap-6 pt-12 border-t border-slate-100 no-print">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Descartar Protocolo</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#0d457a] text-white px-20 py-8 rounded-[36px] font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:bg-[#0a365f] transition-all flex items-center gap-5 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? <Loader2 size={28} className="animate-spin" /> : <Save size={28} />}
                  Gravar Processo no Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
