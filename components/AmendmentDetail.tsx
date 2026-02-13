import React, { useState, useMemo, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  Amendment, StatusConfig, User as AppUser, Role, SectorConfig, 
  AmendmentMovement, SystemMode, Status, PROCESS_PHASES
} from '../types';
import { FastTransitionModal } from './FastTransitionModal';
import { 
  ArrowLeft, Send, MapPin, Calendar, Clock, 
  FileText, ArrowRightLeft, History, Lock, 
  Download, Loader2, 
  ChevronDown, Quote, CheckCircle2,
  Timer, ShieldCheck, Search, X,
  Plus, Building2, Activity, AlertCircle,
  Fingerprint,
  Zap, ShieldX, Save, Trash2, ChevronRight,
  Landmark, User, ArrowRight
} from 'lucide-react';

interface AmendmentDetailProps {
  amendment: Amendment;
  currentUser: AppUser;
  sectors: SectorConfig[];
  statuses: StatusConfig[];
  systemMode: SystemMode;
  onBack: () => void;
  onMove: (movements: AmendmentMovement[], newStatus: string) => void;
  onUpdate: (amendment: Amendment) => void;
  onStatusChange: (amendmentId: string, status: string) => void;
  onDelete: (id: string, justification: string) => void;
}

export const AmendmentDetail: React.FC<AmendmentDetailProps> = ({ 
  amendment, 
  currentUser, 
  sectors,
  statuses,
  onBack, 
  onMove,
  onUpdate,
  onDelete
}) => {
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [sectorSearch, setSectorSearch] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [newStatus, setNewStatus] = useState<string>(amendment.status);
  const [remarks, setRemarks] = useState('');
  const [showDestList, setShowDestList] = useState(false);
  
  const [isFastTransitionOpen, setIsFastTransitionOpen] = useState(false);
  
  useEffect(() => {
    setNewStatus(amendment.status);
    setSelectedDestinations([]);
    setRemarks('');
  }, [amendment.id, amendment.status]);

  const isLocked = useMemo(() => {
    const statusObj = statuses.find(s => s.name === amendment.status);
    return amendment.status === Status.COMMITMENT_LIQUIDATION || 
           amendment.status === Status.CONCLUDED ||
           amendment.status === Status.ARCHIVED ||
           (statusObj?.isFinal === true);
  }, [amendment.status, statuses]);

  const currentPhaseIndex = useMemo(() => {
    return PROCESS_PHASES.findIndex(phase => phase.statuses.includes(amendment.status as Status));
  }, [amendment.status]);

  const slaSummary = useMemo(() => {
    const lastMov = amendment.movements[amendment.movements.length - 1];
    if (!lastMov) return null;
    
    const today = new Date();
    const deadline = new Date(lastMov.deadline);
    const start = new Date(lastMov.dateIn);
    
    const totalDuration = deadline.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      deadlineDate: deadline,
      daysLeft: diffDays,
      progressPercent,
      status: diffDays < 0 ? 'Excedido' : diffDays <= 2 ? 'Crítico' : 'Regular',
      color: diffDays < 0 ? 'text-red-600' : diffDays <= 2 ? 'text-amber-600' : 'text-emerald-600',
      bg: diffDays < 0 ? 'bg-red-50 border-red-200 shadow-red-900/5' : diffDays <= 2 ? 'bg-amber-50 border-amber-200 shadow-amber-900/5' : 'bg-emerald-50 border-emerald-100 shadow-emerald-900/5',
      icon: diffDays < 0 ? AlertCircle : diffDays <= 2 ? Clock : ShieldCheck
    };
  }, [amendment]);

  const handleExportPdf = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      notify('error', 'Motor PDF', 'Aguarde o carregamento do módulo de exportação.');
      return;
    }
    setIsGeneratingPdf(true);
    const element = document.getElementById('amendment-dossier-export-area');
    const opt = {
      margin: 8,
      filename: `DOSSIE_SEI_${amendment.seiNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    try {
      await h2p().set(opt).from(element).save();
    } catch (e) {
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleFinalMove = () => {
    if (isLocked) return;
    if (selectedDestinations.length === 0) {
      notify('warning', 'Ação Requerida', 'Selecione a unidade técnica de destino.');
      return;
    }
    setIsSubmitting(true);
    const newMovements: AmendmentMovement[] = selectedDestinations.map(dest => ({
      id: `mov-${Date.now()}`,
      amendmentId: amendment.id,
      fromSector: amendment.currentSector,
      toSector: dest.name,
      dateIn: new Date().toISOString(),
      dateOut: null,
      deadline: new Date(Date.now() + (dest.defaultSlaDays * 86400000)).toISOString(),
      daysSpent: 0,
      handledBy: currentUser.name,
      remarks: remarks,
      analysisType: newStatus
    }));
    onMove(newMovements, newStatus);
    setIsSubmitting(false);
  };

  const filteredSectors = useMemo(() => {
    const search = sectorSearch.toLowerCase();
    return sectors.filter(s => s.name.toLowerCase().includes(search) && !selectedDestinations.find(sel => sel.id === s.id));
  }, [sectors, sectorSearch, selectedDestinations]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* HEADER DE AÇÃO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-4 bg-white border border-slate-200 rounded-[28px] text-[#0d457a] hover:bg-blue-50 transition-all shadow-sm group">
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">{amendment.seiNumber}</h2>
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border shadow-sm ${isLocked ? 'bg-[#0d457a] text-white border-blue-900' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {amendment.status}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
              <Building2 size={14} className="text-emerald-500" /> Custódia Atual: {amendment.currentSector}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {(currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN) && (
            <button 
              onClick={() => setIsFastTransitionOpen(true)}
              className="flex-1 md:flex-none px-8 py-4 bg-amber-500 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
            >
              <Zap size={16} /> Ajuste de Fluxo
            </button>
          )}
          <button 
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className="flex-1 md:flex-none px-8 py-4 bg-[#0d457a] text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Dossiê Digital
          </button>
        </div>
      </div>

      {/* STEPPER DE FLUXO GOVERNAMENTAL */}
      <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm no-print overflow-x-auto custom-scrollbar">
         <div className="flex items-center justify-between min-w-[900px]">
            {PROCESS_PHASES.map((phase, idx) => {
              const isPast = idx < currentPhaseIndex;
              const isCurrent = idx === currentPhaseIndex;
              return (
                <React.Fragment key={phase.id}>
                  <div className="flex flex-col items-center gap-4 relative z-10 flex-1">
                    <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center transition-all duration-700 ${
                      isPast ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/10' : 
                      isCurrent ? 'bg-[#0d457a] text-white ring-8 ring-blue-50 animate-pulse-sync shadow-2xl' : 
                      'bg-slate-50 text-slate-300 border-2 border-slate-100'
                    }`}>
                      {isPast ? <CheckCircle2 size={28} /> : <span className="text-base font-black">{idx + 1}</span>}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-[#0d457a]' : 'text-slate-400'}`}>
                      {phase.label}
                    </span>
                  </div>
                  {idx < PROCESS_PHASES.length - 1 && (
                    <div className="flex-1 h-1.5 bg-slate-100 relative top-[-14px] rounded-full mx-4 overflow-hidden">
                      <div className={`h-full bg-emerald-500 transition-all duration-1000 ${idx < currentPhaseIndex ? 'w-full' : 'w-0'}`}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
         </div>
      </div>

      <div id="amendment-dossier-export-area" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* PAINEL DE METADADOS */}
          <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Objeto do Recurso</p>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase pr-4">{amendment.object}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Autor</p>
                      <div className="flex items-center gap-2">
                         <User size={14} className="text-blue-500" />
                         <p className="text-xs font-black text-[#0d457a] uppercase truncate">{amendment.deputyName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Município</p>
                      <div className="flex items-center gap-2">
                         <MapPin size={14} className="text-emerald-500" />
                         <p className="text-xs font-black text-[#0d457a] uppercase truncate">{amendment.municipality}</p>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="bg-slate-50 p-10 rounded-[44px] border border-slate-100 flex flex-col justify-center text-center relative overflow-hidden group hover:bg-slate-100 transition-colors">
                 <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <Landmark size={100} className="absolute -bottom-6 -right-6 text-slate-200 opacity-20 group-hover:scale-110 transition-transform" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2 relative z-10">Valor Liquidado</p>
                 <p className="text-4xl font-black text-[#0d457a] relative z-10 tracking-tighter">{formatBRL(amendment.value)}</p>
                 <div className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-xl text-[9px] font-black text-blue-600 uppercase border border-blue-50 mx-auto relative z-10 shadow-sm">
                    <History size={12} /> Exercício Orçamentário {amendment.year}
                 </div>
              </div>
          </div>

          {/* PAINEL DE TRAMITAÇÃO ATIVA */}
          {!isLocked && (
            <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-xl space-y-10 no-print border-t-[12px] border-[#0d457a]">
               <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center shadow-inner"><ArrowRightLeft size={24} /></div>
                   Evolução de Trâmite SEI
                 </h3>
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">GESA • Cloud Native</span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Evoluir Status Para:</label>
                    <div className="relative">
                      <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full pl-6 pr-12 py-5 bg-slate-50 border border-slate-100 rounded-[28px] font-black text-[#0d457a] uppercase text-xs outline-none focus:ring-8 ring-blue-500/5 appearance-none transition-all shadow-inner"
                      >
                        {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                      <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Unidade Técnica de Destino:</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"><Search size={20} /></div>
                      <input 
                        type="text" placeholder="BUSCAR SETOR..."
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[28px] font-black text-[#0d457a] uppercase text-xs outline-none focus:ring-8 ring-blue-500/5 transition-all shadow-inner"
                        value={sectorSearch}
                        onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                        onFocus={() => setShowDestList(true)}
                      />
                      {showDestList && filteredSectors.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-200 rounded-[32px] shadow-2xl z-[60] overflow-hidden max-h-80 overflow-y-auto custom-scrollbar border-t-8 border-[#0d457a]">
                           {filteredSectors.map(s => (
                             <button 
                              key={s.id} onClick={() => { setSelectedDestinations([s]); setSectorSearch(s.name); setShowDestList(false); }}
                              className="w-full text-left px-8 py-5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-none flex items-center justify-between group"
                             >
                                <div>
                                   <p className="text-xs font-black text-[#0d457a] uppercase">{s.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tight">SLA Normativo: {s.defaultSlaDays} Dias Úteis</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Despacho Técnico / Observações:</label>
                 <textarea 
                   className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[40px] font-bold text-[#0d457a] text-xs uppercase outline-none focus:ring-8 ring-blue-500/5 h-32 resize-none transition-all shadow-inner leading-relaxed"
                   placeholder="INSIRA O CONTEÚDO DO DESPACHO PARA A TRILHA DE AUDITORIA..."
                   value={remarks}
                   onChange={(e) => setRemarks(e.target.value)}
                 />
               </div>

               <button 
                onClick={handleFinalMove}
                disabled={isSubmitting || selectedDestinations.length === 0}
                className="w-full py-6 bg-[#0d457a] text-white rounded-[32px] font-black uppercase text-xs tracking-[0.25em] shadow-2xl hover:bg-blue-900 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 active:scale-[0.98]"
               >
                  {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <>Processar Movimentação <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
               </button>
            </div>
          )}

          {/* TRILHA HISTÓRICA (ENGINEERING LOG STYLE) */}
          <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm space-y-12">
            <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-[20px] flex items-center justify-center shadow-inner"><History size={24} /></div>
                Trilha de Auditoria Imutável
            </h3>

            <div className="space-y-0 pl-4 border-l-2 border-slate-100 ml-6">
              {[...amendment.movements].reverse().map((mov, idx) => (
                <div key={mov.id} className="relative pb-16 pl-14 last:pb-0 group">
                   {/* Timeline Anchor */}
                   <div className="absolute -left-[1.95rem] top-0 w-14 h-14 rounded-[22px] bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-blue-500 transition-all duration-500">
                      {idx === 0 ? <Activity size={24} className="text-blue-500" /> : <ChevronRight size={20} className="text-slate-300" />}
                   </div>

                   <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="space-y-3 flex-1">
                         <div className="flex items-center gap-5 flex-wrap">
                            <span className="text-base font-black text-[#0d457a] uppercase tracking-tight">{mov.toSector}</span>
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${mov.dateOut ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse'}`}>
                               {mov.dateOut ? 'Processado' : 'Em Análise'}
                            </span>
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-3 tracking-widest">
                            <User size={12} className="text-slate-300" /> {mov.handledBy} • {new Date(mov.dateIn).toLocaleDateString('pt-BR')} ÀS {new Date(mov.dateIn).toLocaleTimeString('pt-BR')}
                         </p>
                         {mov.remarks && (
                            <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 mt-5 relative group-hover:bg-white transition-colors shadow-inner group-hover:shadow-sm">
                               <Quote size={16} className="absolute top-4 right-4 text-slate-200" />
                               <p className="text-[11px] font-medium text-slate-500 italic uppercase leading-relaxed pr-8">{mov.remarks}</p>
                            </div>
                         )}
                      </div>
                      <div className="text-right shrink-0 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 shadow-inner">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Permanência</p>
                         <p className={`text-2xl font-black ${mov.daysSpent > 7 ? 'text-red-500' : 'text-[#0d457a]'}`}>{mov.daysSpent} <span className="text-xs">Dias</span></p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR DE STATUS E SLA TÉRMICO */}
        <div className="space-y-8 no-print">
          {slaSummary && (
            <div className={`p-10 rounded-[56px] border-2 shadow-2xl transition-all duration-1000 ${slaSummary.bg} sticky top-8`}>
               <div className="flex items-center gap-5 mb-10">
                  <div className={`p-5 rounded-[28px] bg-white shadow-xl ${slaSummary.color}`}>
                     <slaSummary.icon size={40} className={slaSummary.daysLeft < 0 ? 'animate-bounce' : ''} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Saúde do Prazo</h4>
                    <p className={`text-[11px] font-black uppercase mt-1 tracking-[0.2em] ${slaSummary.color}`}>{slaSummary.status}</p>
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempo Restante Estimado</p>
                        <p className={`text-5xl font-black ${slaSummary.color} tracking-tighter`}>{Math.abs(slaSummary.daysLeft)} <span className="text-lg">Dias</span></p>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Limite SLA</p>
                        <p className="text-xs font-black text-[#0d457a]">{slaSummary.deadlineDate.toLocaleDateString('pt-BR')}</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Consumo de Tempo</span>
                        <span>{slaSummary.progressPercent.toFixed(0)}%</span>
                     </div>
                     <div className="h-4 w-full bg-white rounded-full overflow-hidden p-1 border border-slate-100/50 shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 shadow-sm ${slaSummary.daysLeft < 0 ? 'bg-red-500' : slaSummary.daysLeft <= 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${slaSummary.progressPercent}%` }}
                        ></div>
                     </div>
                  </div>

                  <div className="p-8 bg-white/60 rounded-[36px] border border-white space-y-4 shadow-sm">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <span>Conformidade Decreto</span>
                        <ShieldCheck size={16} className="text-emerald-500" />
                     </div>
                     <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">O prazo é parametrizado conforme as atribuições da unidade {amendment.currentSector} sob a égide do Decreto 10.634/2025.</p>
                  </div>
               </div>
            </div>
          )}

          {/* TRAVA DE SEGURANÇA SE BLOQUEADO */}
          {isLocked && (
            <div className="p-12 rounded-[56px] bg-[#0d457a] text-white shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10"><Lock size={150} /></div>
               <div className="flex items-center gap-5 relative z-10">
                  <div className="p-5 bg-white/10 rounded-[28px] backdrop-blur-sm">
                     <ShieldX size={40} className="text-red-400" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black uppercase tracking-tighter leading-none">Processo Encerrado</h4>
                     <p className="text-[10px] font-bold text-blue-200/50 uppercase tracking-widest mt-2">Imutabilidade GESA Ativa</p>
                  </div>
               </div>
               <p className="text-xs font-medium text-blue-100 leading-relaxed uppercase relative z-10 pr-4">
                  Este registro foi liquidado financeiramente ou arquivado por decisão técnica. Alterações retrospectivas são bloqueadas para garantir a integridade da prestação de contas.
               </p>
               <button 
                 onClick={() => notify('info', 'Solicitação de Abertura', 'Para reabrir este processo, encaminhe despacho via SEI para a GESA-SES.')}
                 className="w-full py-5 bg-white/10 hover:bg-white/20 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 border border-white/5"
               >
                 Solicitar Desbloqueio
               </button>
            </div>
          )}
        </div>
      </div>

      {isFastTransitionOpen && (
        <FastTransitionModal 
          amendment={amendment} 
          sectors={sectors} 
          statuses={statuses}
          onClose={() => setIsFastTransitionOpen(false)}
          onSave={(updated) => {
            onUpdate(updated);
            setIsFastTransitionOpen(false);
          }}
        />
      )}
    </div>
  );
};