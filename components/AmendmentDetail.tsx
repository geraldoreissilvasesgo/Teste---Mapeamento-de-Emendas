
import React, { useState, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  Amendment, StatusConfig, User, Role, SectorConfig, 
  AmendmentMovement, SystemMode, AIAnalysisResult, Status,
  PROCESS_PHASES
} from '../types';
import { analyzeAmendment } from '../services/geminiService';
import { 
  ArrowLeft, Send, MapPin, Calendar, Clock, 
  FileText, ArrowRightLeft, History, Lock, UserCheck, 
  MessageSquare, Sparkles, Download, Loader2, 
  ChevronDown, Quote, Check, CheckCircle2,
  Timer, FileSearch, ShieldCheck, Search, X,
  Plus, Building2, Activity, AlertCircle,
  FileBadge, Briefcase, DollarSign, Fingerprint,
  ChevronRight, ArrowUpRight, Scale
} from 'lucide-react';

interface AmendmentDetailProps {
  amendment: Amendment;
  currentUser: User;
  sectors: SectorConfig[];
  statuses: StatusConfig[];
  systemMode: SystemMode;
  onBack: () => void;
  onMove: (movements: AmendmentMovement[], newStatus: string) => void;
  onUpdate: (amendment: Amendment) => void;
  onStatusChange: (amendmentId: string, status: string) => void;
  onDelete: (id: string, justification: string) => void;
}

const DISPATCH_TEMPLATES = [
  { label: 'Análise Técnica', text: 'Encaminho o presente processo para análise técnica da documentação apensada, visando verificar a conformidade com as normas vigentes.' },
  { label: 'Solicitar Diligência', text: 'Considerando a ausência de documentos obrigatórios, solicito diligência junto ao beneficiário para saneamento das pendências apontadas.' },
  { label: 'Parecer Jurídico', text: 'Remeto os autos à Procuradoria Setorial para emissão de parecer jurídico acerca da viabilidade do repasse pretendido.' }
];

export const AmendmentDetail: React.FC<AmendmentDetailProps> = ({ 
  amendment, 
  currentUser, 
  sectors,
  statuses,
  onBack, 
  onMove,
  onUpdate
}) => {
  const { notify } = useNotification();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [sectorSearch, setSectorSearch] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [newStatus, setNewStatus] = useState<string>(amendment.status);
  const [remarks, setRemarks] = useState('');
  const [showDestList, setShowDestList] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const currentPhaseIndex = useMemo(() => {
    return PROCESS_PHASES.findIndex(phase => phase.statuses.includes(amendment.status as Status));
  }, [amendment.status]);

  const slaSummary = useMemo(() => {
    const lastMov = amendment.movements[amendment.movements.length - 1];
    if (!lastMov) return null;
    
    const today = new Date();
    const deadline = new Date(lastMov.deadline);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalDaysElapsed = Math.ceil((today.getTime() - new Date(amendment.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      daysLeft: diffDays,
      totalElapsed: totalDaysElapsed,
      status: diffDays < 0 ? 'Excedido' : diffDays <= 2 ? 'Crítico' : 'Regular',
      color: diffDays < 0 ? 'text-red-600' : diffDays <= 2 ? 'text-amber-600' : 'text-emerald-600',
      bg: diffDays < 0 ? 'bg-red-50' : diffDays <= 2 ? 'bg-amber-50' : 'bg-emerald-50',
      border: diffDays < 0 ? 'border-red-200' : diffDays <= 2 ? 'border-amber-200' : 'border-emerald-200',
      icon: diffDays < 0 ? AlertCircle : diffDays <= 2 ? Clock : ShieldCheck
    };
  }, [amendment]);

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const result = await analyzeAmendment(amendment);
      setAiResult(result);
      notify('success', 'Análise Concluída', 'Insight preditivo gerado via Gemini Pro.');
    } catch (e) {
      notify('error', 'Erro na IA', 'Falha ao processar análise preditiva.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredDestSectors = useMemo(() => {
    const searchLower = sectorSearch.toLowerCase();
    return sectors.filter(s => 
      s.name.toLowerCase().includes(searchLower) && 
      s.name !== amendment.currentSector
    ).slice(0, 5);
  }, [sectors, sectorSearch, amendment.currentSector]);

  const handleFinalMove = () => {
    if (selectedDestinations.length === 0) {
      notify('warning', 'Atenção', 'Selecione a unidade técnica de destino.');
      return;
    }
    
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
    notify('success', 'Trâmite Registrado', 'Processo movimentado com sucesso no ledger GESA.');
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto">
      {/* Botão Voltar e Título */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-blue-50 transition-all shadow-sm group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">{amendment.seiNumber}</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-100">{amendment.type}</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
              <Fingerprint size={14} className="text-blue-500" /> Rastreabilidade Imutável GESA Cloud
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleAiAnalysis} disabled={isAiLoading} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50">
            {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Análise Preditiva IA
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-3 bg-white border border-slate-200 text-slate-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
            <Download size={16} /> Exportar Dossiê
          </button>
        </div>
      </div>

      {/* Stepper de Progresso - Nova Melhoria de Rastreabilidade */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm overflow-hidden relative">
         <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 -z-0"></div>
            {PROCESS_PHASES.map((phase, idx) => {
              const isCompleted = idx < currentPhaseIndex || amendment.status === Status.CONCLUDED;
              const isCurrent = idx === currentPhaseIndex;
              return (
                <div key={phase.id} className="relative z-10 flex flex-col items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 border-white shadow-md ${
                    isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-[#0d457a] text-white ring-8 ring-blue-50' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={20} strokeWidth={4} /> : <span className="text-sm font-black">{idx + 1}</span>}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-[#0d457a]' : 'text-slate-400'}`}>{phase.label}</span>
                </div>
              );
            })}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Eficiência SLA e Status */}
          {slaSummary && (
            <div className={`p-8 rounded-[40px] border-2 ${slaSummary.bg} ${slaSummary.border} grid grid-cols-1 md:grid-cols-3 gap-8 shadow-sm relative overflow-hidden`}>
               <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm border ${slaSummary.color}`}>
                     <slaSummary.icon size={32} />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temporalidade</p>
                     <h4 className={`text-xl font-black uppercase tracking-tight ${slaSummary.color}`}>{slaSummary.status}</h4>
                  </div>
               </div>
               <div className="flex flex-col justify-center text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Saldo Prazo Unidade</p>
                  <p className={`text-3xl font-black ${slaSummary.color}`}>{slaSummary.daysLeft} Dias</p>
               </div>
               <div className="flex flex-col justify-center text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Ciclo de Vida</p>
                  <p className="text-xl font-black text-slate-700">{slaSummary.totalElapsed} Dias Decorridos</p>
               </div>
            </div>
          )}

          {/* Ledger de Trilha de Rastreabilidade SEI - Redesign */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                  <History size={20} className="text-blue-500" /> Ledger de Trilha Digital
              </h3>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase">Buffer Sincronizado</span>
              </div>
            </div>

            <div className="space-y-0 relative">
                <div className="absolute left-[24px] top-8 bottom-8 w-1 bg-slate-50"></div>
                {[...amendment.movements].reverse().map((mov, idx) => {
                  const isCurrent = !mov.dateOut;
                  return (
                    <div key={mov.id} className="relative pl-20 pb-12 last:pb-0 group">
                      {/* Indicador Lateral de Trâmite */}
                      <div className={`absolute left-0 top-1 w-14 h-14 rounded-[20px] border-4 border-white shadow-lg flex items-center justify-center z-10 transition-all ${
                        isCurrent ? 'bg-[#0d457a] text-white ring-8 ring-blue-50' : 'bg-slate-100 text-slate-400 grayscale'
                      }`}>
                          {isCurrent ? <Timer size={24} className="animate-pulse" /> : <CheckCircle2 size={24} />}
                      </div>

                      {/* Card de Trâmite */}
                      <div className={`p-8 rounded-[32px] border transition-all duration-300 ${
                        isCurrent ? 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-900/5' : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}>
                          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                              <div>
                                  <div className="flex items-center gap-3 mb-2">
                                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{mov.toSector}</span>
                                     <ChevronRight size={12} className="text-slate-300" />
                                     <span className={`text-[10px] font-black uppercase ${isCurrent ? 'text-[#0d457a]' : 'text-slate-400'}`}>{mov.analysisType || 'Análise de Fluxo'}</span>
                                  </div>
                                  <h4 className={`text-base font-black uppercase tracking-tight ${isCurrent ? 'text-[#0d457a]' : 'text-slate-500'}`}>
                                    {isCurrent ? 'Permanência Ativa na Unidade' : `Finalizado em ${mov.toSector}`}
                                  </h4>
                              </div>
                              <div className="text-right space-y-1">
                                  <div className="flex items-center gap-2 justify-end">
                                      <Calendar size={14} className="text-slate-300" />
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Recebido: {new Date(mov.dateIn).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  {!isCurrent && (
                                      <div className="flex items-center gap-2 justify-end">
                                          <ArrowUpRight size={14} className="text-emerald-400" />
                                          <span className="text-[9px] font-bold text-emerald-600 uppercase">Tramitado: {new Date(mov.dateOut!).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {mov.remarks && (
                              <div className="p-6 bg-white/60 rounded-2xl border border-slate-200/50 mb-6 italic text-[12px] text-slate-500 leading-relaxed relative">
                                  <Quote className="absolute -top-3 -left-3 text-slate-200" size={24} />
                                  "{mov.remarks}"
                              </div>
                          )}

                          <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-[#0d457a] uppercase">
                                    {mov.handledBy.charAt(0)}
                                 </div>
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsável: {mov.handledBy}</span>
                              </div>
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                                isCurrent ? 'bg-[#0d457a] text-white shadow-lg shadow-blue-900/20' : 'bg-slate-50 text-slate-400'
                              }`}>
                                  {isCurrent ? <Timer size={14} /> : <Activity size={14} />}
                                  {isCurrent ? `SLA Expira em ${new Date(mov.deadline).toLocaleDateString('pt-BR')}` : `${mov.daysSpent} dias permanência`}
                              </div>
                          </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Sidebar Operacional (Tramitação) */}
        <div className="space-y-8 no-print">
          <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform"><ArrowRightLeft size={120} /></div>
            <div className="relative z-10 space-y-10">
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                 <Send size={24} className="text-blue-300" /> Registrar Trâmite
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest block mb-3 ml-1">Unidade Técnica Destino</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all font-bold text-[11px] uppercase text-white placeholder:text-white/20"
                      placeholder="PESQUISAR UNIDADE..."
                      value={sectorSearch}
                      onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                    />
                    {showDestList && filteredDestSectors.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-100">
                        {filteredDestSectors.map(s => (
                          <button 
                            key={s.id}
                            onClick={() => { setSelectedDestinations([s]); setShowDestList(false); }}
                            className="w-full px-5 py-4 text-left hover:bg-blue-50 transition-colors flex justify-between items-center group/item"
                          >
                            <span className="text-[10px] font-black text-[#0d457a] uppercase">{s.name}</span>
                            <Plus size={14} className="text-slate-200 group-hover/item:text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedDestinations.map(d => (
                      <span key={d.id} className="px-3 py-1.5 bg-blue-400/30 text-blue-50 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 border border-white/10">
                        {d.name}
                        <button onClick={() => setSelectedDestinations([])}><X size={12}/></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest block mb-3 ml-1">Novo Status do Ciclo</label>
                  <div className="relative">
                     <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none font-bold text-[11px] uppercase text-white appearance-none cursor-pointer">
                        {statuses.map(s => <option key={s.id} value={s.name} className="text-slate-900 font-bold">{s.name}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 ml-1">
                     <label className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Parecer Administrativo (Ledger)</label>
                     <button onClick={() => setShowTemplates(!showTemplates)} className="text-[8px] font-black text-blue-300 uppercase hover:text-white">Templates</button>
                  </div>
                  {showTemplates && (
                    <div className="grid grid-cols-1 gap-1.5 mb-3">
                        {DISPATCH_TEMPLATES.map((t, i) => (
                            <button key={i} onClick={() => { setRemarks(t.text); setShowTemplates(false); }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] text-blue-200 text-left hover:bg-white/10 transition-all">
                                {t.label}
                            </button>
                        ))}
                    </div>
                  )}
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-5 bg-white/10 border border-white/20 rounded-3xl outline-none h-40 font-medium text-[11px] text-white placeholder:text-white/20 resize-none uppercase" placeholder="DIGITE O DESPACHO SEI..." />
                </div>

                <button onClick={handleFinalMove} className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                  <span className="flex items-center gap-3"><CheckCircle2 size={18} /> Confirmar Trâmite</span>
                </button>
              </div>
            </div>
          </div>

          {/* Análise IA Preditiva */}
          {aiResult && (
            <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden border border-white/10 animate-in zoom-in-95">
                <div className="absolute top-0 right-0 p-12 opacity-10"><Sparkles size={160} /></div>
                <div className="relative z-10 space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 flex items-center gap-3">
                        <Sparkles size={20} /> Análise Gemini Pro
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <p className="text-[9px] font-black text-blue-300 uppercase mb-2">Resumo Executivo</p>
                            <p className="text-xs text-blue-100/80 leading-relaxed font-medium">{aiResult.summary}</p>
                        </div>
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                            <p className="text-[9px] font-black text-red-400 uppercase mb-2">Gargalo Identificado</p>
                            <p className="text-xs text-red-100/80 font-black uppercase">{aiResult.bottleneck}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Risco</p>
                                <p className="text-xl font-black text-emerald-400">{aiResult.riskScore}%</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Sucesso</p>
                                <p className="text-xl font-black text-blue-400">{(aiResult.completionProbability * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
