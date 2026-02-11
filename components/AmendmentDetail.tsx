import React, { useState, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  Amendment, StatusConfig, User as AppUser, Role, SectorConfig, 
  AmendmentMovement, SystemMode, AIAnalysisResult, Status
} from '../types';
import { analyzeAmendment } from '../services/geminiService';
import { FastTransitionModal } from './FastTransitionModal';
import { 
  ArrowLeft, Send, MapPin, Calendar, Clock, 
  FileText, History, Lock, UserCheck, 
  Sparkles, Download, Loader2, 
  ChevronDown, Quote, Check, CheckCircle2,
  Timer, FileSearch, ShieldCheck, X,
  Plus, Building2, Activity, AlertCircle,
  ShieldX, Save, ShieldAlert,
  ArrowRight, User, Zap, Trash2
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [sectorSearch, setSectorSearch] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [newStatus, setNewStatus] = useState<string>(amendment.status);
  const [remarks, setRemarks] = useState('');
  const [showDestList, setShowDestList] = useState(false);
  const [isFastTransitionOpen, setIsFastTransitionOpen] = useState(false);
  
  const isSUBIPEI = amendment.currentSector === 'SES/SUBIPEI-21286';

  const isLocked = useMemo(() => {
    const statusObj = statuses.find(s => s.name === amendment.status);
    return amendment.status === Status.COMMITMENT_LIQUIDATION || 
           amendment.status === Status.CONCLUDED ||
           amendment.status === Status.COMPLETED_IN_SECTOR ||
           amendment.status === Status.ARCHIVED ||
           (statusObj?.isFinal === true);
  }, [amendment.status, statuses]);

  const slaSummary = useMemo(() => {
    const lastMov = amendment.movements[amendment.movements.length - 1];
    if (!lastMov) return null;
    const today = new Date();
    const deadline = new Date(lastMov.deadline);
    const start = new Date(lastMov.dateIn);
    const totalDuration = deadline.getTime() - start.getTime();
    const elapsed = (lastMov.dateOut ? new Date(lastMov.dateOut).getTime() : today.getTime()) - start.getTime();
    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const diffDays = Math.ceil((deadline.getTime() - (lastMov.dateOut ? new Date(lastMov.dateOut).getTime() : today.getTime())) / (1000 * 60 * 60 * 24));
    return {
      deadlineDate: deadline,
      daysLeft: lastMov.dateOut ? 0 : diffDays,
      progressPercent,
      status: lastMov.dateOut ? 'Concluído' : (diffDays < 0 ? 'Excedido' : diffDays <= 2 ? 'Crítico' : 'Regular'),
      color: lastMov.dateOut ? 'text-emerald-600' : (diffDays < 0 ? 'text-red-600' : diffDays <= 2 ? 'text-amber-600' : 'text-emerald-600'),
      icon: lastMov.dateOut ? CheckCircle2 : (diffDays < 0 ? AlertCircle : diffDays <= 2 ? Clock : ShieldCheck)
    };
  }, [amendment]);

  const filteredSectors = useMemo(() => {
    if (!sectorSearch) return [];
    return sectors.filter(s => 
      s.name.toLowerCase().includes(sectorSearch.toLowerCase()) && 
      !selectedDestinations.find(sel => sel.id === s.id)
    );
  }, [sectors, sectorSearch, selectedDestinations]);

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const result = await analyzeAmendment(amendment);
      setAiResult(result);
      notify('success', 'Dossiê de IA Gerado', 'Análise técnica integrada com sucesso.');
    } catch (e) {
      notify('error', 'Falha na IA', 'Não foi possível processar a análise preditiva.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinalizeSUBIPEI = () => {
    if (isLocked) return;
    if (!window.confirm("⚠️ CONFIRMAÇÃO ADMINISTRATIVA: Deseja encerrar a tramitação neste setor e bloquear o registro?")) return;

    const now = new Date().toISOString();
    const updatedMovements = [...amendment.movements];
    if (updatedMovements.length > 0) {
      const lastIdx = updatedMovements.length - 1;
      updatedMovements[lastIdx] = {
        ...updatedMovements[lastIdx],
        dateOut: now, 
        remarks: (updatedMovements[lastIdx].remarks || '') + " [CONCLUSÃO ADMINISTRATIVA SUBIPEI]"
      };
    }

    onUpdate({
      ...amendment,
      movements: updatedMovements,
      status: Status.COMPLETED_IN_SECTOR,
      updatedAt: now
    });
    notify('success', 'Finalizado', 'Processo concluído no setor e protegido.');
  };

  const handleFinalMove = () => {
    if (isLocked || selectedDestinations.length === 0) return;
    setIsSubmitting(true);
    
    const newMovements: AmendmentMovement[] = selectedDestinations.map(dest => ({
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      amendmentId: amendment.id,
      fromSector: amendment.currentSector,
      toSector: dest.name,
      dateIn: new Date().toISOString(),
      dateOut: null,
      deadline: new Date(Date.now() + dest.defaultSlaDays * 86400000).toISOString(),
      daysSpent: 0,
      handledBy: currentUser.name,
      remarks: remarks || 'Tramitação de fluxo operacional GESA.',
      analysisType: statuses.find(s => s.name === newStatus)?.name || 'Análise Técnica'
    }));

    onMove(newMovements, newStatus);
    setSelectedDestinations([]);
    setRemarks('');
    setIsSubmitting(false);
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#0d457a] transition-all shadow-sm">
             <ArrowLeft size={20} />
           </button>
           <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">{amendment.seiNumber}</h2>
                {isLocked && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase border border-emerald-100">
                    <ShieldCheck size={10} /> Registro Protegido
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-1 flex items-center gap-2">
                <FileSearch size={14} className="text-blue-500"/> Dossiê Governamental • GESA Cloud
              </p>
           </div>
        </div>

        <div className="flex flex-wrap gap-3">
           {!isLocked ? (
             <>
               {isSUBIPEI && (
                 <button 
                   onClick={handleFinalizeSUBIPEI}
                   className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95"
                 >
                   <Zap size={18} /> Finalizar Administrativo (SUBIPEI)
                 </button>
               )}
               <button 
                 onClick={() => setIsFastTransitionOpen(true)}
                 className="flex items-center gap-2 bg-amber-500 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-amber-600 transition-all"
               >
                 <History size={18} /> Editor Cronológico
               </button>
             </>
           ) : (
             <div className="flex items-center gap-2 px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-slate-200">
               <Lock size={18} /> Fluxo Concluído no Setor
             </div>
           )}
           <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
             <Download size={18} /> Exportar PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 text-[#0d457a]"><FileText size={200} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                 <div className="space-y-8">
                    <div>
                       <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 block">Objeto do Processo</label>
                       <p className="text-sm font-bold text-[#0d457a] leading-relaxed uppercase">{amendment.object}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Valor Alocado</label>
                          <p className="text-xl font-black text-[#0d457a]">{formatBRL(amendment.value)}</p>
                       </div>
                       <div>
                          <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Programa</label>
                          <p className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded inline-block uppercase mt-1">{amendment.type}</p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-8 bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100"><UserCheck size={24} /></div>
                       <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Autor</label>
                          <p className="text-xs font-black text-[#0d457a] uppercase">{amendment.deputyName}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 border border-slate-100"><MapPin size={24} /></div>
                       <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Município</label>
                          <p className="text-xs font-black text-[#0d457a] uppercase">{amendment.municipality}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {!isLocked && (
             <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 no-print">
                <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                   <Send size={18} className="text-blue-500" /> Movimentar Processo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinos</label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Building2 size={18}/></div>
                         <input 
                           type="text"
                           placeholder="BUSCAR UNIDADE..."
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all"
                           value={sectorSearch}
                           onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                         />
                         {showDestList && filteredSectors.length > 0 && (
                            <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                               {filteredSectors.map(s => (
                                 <button
                                   key={s.id}
                                   className="w-full text-left px-6 py-4 hover:bg-blue-50 flex justify-between items-center group border-b border-slate-50"
                                   onClick={() => { setSelectedDestinations([...selectedDestinations, s]); setSectorSearch(''); setShowDestList(false); }}
                                 >
                                    <span className="text-[10px] font-black text-[#0d457a] uppercase">{s.name}</span>
                                    <Plus size={14} className="text-slate-300 group-hover:text-blue-500" />
                                 </button>
                               ))}
                            </div>
                         )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {selectedDestinations.map(s => (
                           <span key={s.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[9px] font-black uppercase border border-blue-100 shadow-sm animate-in zoom-in">
                             {s.name}
                             <button onClick={() => setSelectedDestinations(selectedDestinations.filter(d => d.id !== s.id))}><X size={12}/></button>
                           </span>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Novo Status</label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><History size={18}/></div>
                         <select 
                           className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] text-[#0d457a] uppercase outline-none appearance-none cursor-pointer"
                           value={newStatus}
                           onChange={(e) => setNewStatus(e.target.value)}
                         >
                           {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                         </select>
                         <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      </div>
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações / Despacho</label>
                   <textarea 
                     className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] font-bold text-[#0d457a] text-xs uppercase outline-none focus:ring-4 ring-blue-500/5 h-32 resize-none"
                     value={remarks}
                     onChange={(e) => setRemarks(e.target.value)}
                   />
                </div>
                <div className="flex justify-end pt-4">
                   <button 
                     onClick={handleFinalMove}
                     disabled={isSubmitting || selectedDestinations.length === 0}
                     className="bg-[#0d457a] text-white px-12 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-[#0a365f] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                   >
                     {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                     Efetivar Tramitação
                   </button>
                </div>
             </div>
           )}

           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
              <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                <Activity size={18} className="text-emerald-500" /> Trilha de Movimentações
              </h3>
              <div className="relative space-y-8 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[...amendment.movements].reverse().map((mov) => (
                  <div key={mov.id} className="relative pl-14">
                     <div className={`absolute left-0 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-md z-10 ${mov.dateOut ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white animate-pulse'}`}>
                        {mov.dateOut ? <Check size={18} strokeWidth={3} /> : <Clock size={18} />}
                     </div>
                     <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                        <div className="flex justify-between items-center gap-4 mb-4">
                           <div>
                              <p className="text-[10px] font-black text-[#0d457a] uppercase">{mov.toSector}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{mov.analysisType}</p>
                           </div>
                           <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black border border-slate-100">{mov.daysSpent} Dias</div>
                        </div>
                        <p className="text-[10px] text-slate-500 italic"><Quote size={12} className="inline mr-2 text-slate-300" /> {mov.remarks || 'Sem observações.'}</p>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           {/* IA Panel */}
           <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Sparkles size={120} /></div>
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10"><Activity size={24} className="text-emerald-400" /></div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">Dossiê de IA</h3>
                 </div>
                 {!aiResult ? (
                   <button onClick={handleAiAnalysis} disabled={isAiLoading} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                     {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Gerar Análise Preditiva
                   </button>
                 ) : (
                   <div className="space-y-6 animate-in zoom-in-95">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/5 p-5 rounded-3xl border border-white/10 text-center">
                            <p className="text-[8px] font-black text-blue-300 uppercase mb-1">Risco</p>
                            <p className="text-3xl font-black text-red-400">{aiResult.riskScore}%</p>
                         </div>
                         <div className="bg-white/5 p-5 rounded-3xl border border-white/10 text-center">
                            <p className="text-[8px] font-black text-blue-300 uppercase mb-1">Conclusão</p>
                            <p className="text-3xl font-black text-emerald-400">{(aiResult.completionProbability * 100).toFixed(0)}%</p>
                         </div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                        <p className="text-[9px] font-black text-blue-400 uppercase mb-2 flex items-center gap-2"><ShieldAlert size={14} /> Gargalo Técnico</p>
                        <p className="text-[10px] font-medium leading-relaxed text-blue-50/80 uppercase">{aiResult.bottleneck}</p>
                      </div>
                   </div>
                 )}
              </div>
           </div>

           {/* SLA Status */}
           {slaSummary && (
             <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Timer size={16} /> Status do Prazo</h4>
                   <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${slaSummary.color} bg-slate-50`}>{slaSummary.status}</span>
                </div>
                <div className="text-center">
                   <p className={`text-5xl font-black tracking-tighter ${slaSummary.color}`}>{slaSummary.daysLeft}</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Dias Restantes</p>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-1000 ${slaSummary.daysLeft < 0 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${slaSummary.progressPercent}%` }}></div>
                </div>
             </div>
           )}

           {/* Danger Zone */}
           {(currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN) && (
             <div className="p-10 bg-red-50 rounded-[48px] border border-red-100 space-y-6 no-print">
                <h4 className="text-[10px] font-black text-red-800 uppercase tracking-widest flex items-center gap-2"><ShieldX size={18} /> Zona de Governança</h4>
                <p className="text-[9px] text-red-700 font-bold uppercase leading-relaxed">A exclusão de processos SEI é irreversível e exige justificativa administrativa.</p>
                <button 
                  onClick={() => {
                    const justification = window.prompt("⚠️ JUSTIFICATIVA OBRIGATÓRIA: Por que deseja excluir este processo?");
                    if (justification && justification.length >= 5) onDelete(amendment.id, justification);
                    else if (justification) notify('warning', 'Justificativa Curta', 'Forneça mais detalhes para a auditoria.');
                  }}
                  className="w-full py-4 bg-white text-red-600 border border-red-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group"
                >
                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> Excluir Processo
                </button>
             </div>
           )}
        </div>
      </div>

      {isFastTransitionOpen && (
        <FastTransitionModal 
          amendment={amendment} sectors={sectors} statuses={statuses}
          onClose={() => setIsFastTransitionOpen(false)}
          onSave={(updated) => { onUpdate(updated); setIsFastTransitionOpen(false); }}
        />
      )}
    </div>
  );
};