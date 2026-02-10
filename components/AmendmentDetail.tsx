import React, { useState, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  Amendment, StatusConfig, User, Role, SectorConfig, 
  AmendmentMovement, SystemMode, AIAnalysisResult, Status,
  PROCESS_PHASES
} from '../types';
import { analyzeAmendment } from '../services/geminiService';
import { FastTransitionModal } from './FastTransitionModal';
import { 
  ArrowLeft, Send, MapPin, Calendar, Clock, 
  FileText, ArrowRightLeft, History, Lock, UserCheck, 
  MessageSquare, Sparkles, Download, Loader2, 
  ChevronDown, Quote, Check, CheckCircle2,
  Timer, FileSearch, ShieldCheck, Search, X,
  Plus, Building2, Activity, AlertCircle,
  FileBadge, Briefcase, DollarSign, Fingerprint,
  ChevronRight, ArrowUpRight, Scale, CalendarPlus,
  Zap, ShieldX, Save, Trash2, Archive, ShieldAlert
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
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [sectorSearch, setSectorSearch] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [newStatus, setNewStatus] = useState<string>(amendment.status);
  const [remarks, setRemarks] = useState('');
  const [showDestList, setShowDestList] = useState(false);
  
  const [isFastTransitionOpen, setIsFastTransitionOpen] = useState(false);
  
  const isAdmin = currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN;

  const isLocked = useMemo(() => {
    const statusObj = statuses.find(s => s.name === amendment.status);
    return amendment.status === Status.COMMITMENT_LIQUIDATION || (statusObj?.isFinal === true);
  }, [amendment.status, statuses]);

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
      icon: diffDays < 0 ? AlertCircle : diffDays <= 2 ? Clock : ShieldCheck
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
      notify('success', 'Análise Concluída', 'Insights preditivos gerados via Gemini Pro.');
    } catch (e) {
      notify('error', 'Erro na IA', 'Falha ao processar análise preditiva.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinalMove = () => {
    if (isLocked) {
      notify('error', 'Ação Bloqueada', 'O processo está em fase de liquidação financeira imutável.');
      return;
    }

    if (selectedDestinations.length === 0) {
      notify('warning', 'Atenção', 'Selecione a unidade técnica de destino.');
      return;
    }
    
    const newMovements: AmendmentMovement[] = selectedDestinations.map(dest => ({
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
    setSelectedDestinations([]);
    setRemarks('');
    setSectorSearch('');
  };

  const toggleDestination = (sector: SectorConfig) => {
    setSelectedDestinations([sector]); // Regra GESA: Um destino por vez no fluxo padrão
    setSectorSearch(sector.name);
    setShowDestList(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto">
      {/* CABEÇALHO DO DOSSIÊ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-blue-50 transition-all shadow-sm group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">{amendment.seiNumber}</h2>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${isLocked ? 'bg-[#0d457a] text-white' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {isLocked && <Lock size={10} className="inline mr-1" />}
                {amendment.status}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
              <Fingerprint size={14} className="text-blue-500" /> Dossiê Digital GESA Cloud • {amendment.deputyName}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => setIsFastTransitionOpen(true)}
              className="flex items-center gap-3 bg-amber-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-amber-600 transition-all active:scale-95"
            >
              <Zap size={16} /> Ajuste Cronológico
            </button>
          )}
          <button onClick={handleAiAnalysis} disabled={isAiLoading} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50">
            {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Análise IA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* PAINEL DE TRAMITAÇÃO (O CORAÇÃO DA TRANSIÇÃO) */}
          {!isLocked ? (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                    <ArrowRightLeft size={20} className="text-blue-500" /> Próxima Etapa (Tramitação)
                  </h3>
                  <div className="px-4 py-1.5 bg-blue-50 rounded-full text-[8px] font-black text-blue-600 uppercase">Unidade Atual: {amendment.currentSector}</div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Novo Status do Processo</label>
                    <div className="relative">
                       <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full pl-5 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none focus:ring-4 ring-blue-500/5 appearance-none"
                       >
                          {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                       </select>
                       <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade de Destino</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="BUSCAR SETOR..."
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none focus:ring-4 ring-blue-500/5"
                        value={sectorSearch}
                        onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                        onFocus={() => setShowDestList(true)}
                      />
                      {showDestList && filteredSectors.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                           {filteredSectors.map(s => (
                             <button 
                              key={s.id}
                              onClick={() => toggleDestination(s)}
                              className="w-full text-left px-5 py-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-none"
                             >
                                <p className="text-[10px] font-black text-[#0d457a] uppercase">{s.name}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">SLA Padrão: {s.defaultSlaDays} Dias</p>
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Despacho / Observações Técnicas</label>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-[#0d457a] text-xs uppercase outline-none focus:ring-4 ring-blue-500/5 h-32 resize-none leading-relaxed"
                    placeholder="INSIRA O RESUMO DO DESPACHO PARA A TRILHA DE AUDITORIA..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
               </div>

               <button 
                onClick={handleFinalMove}
                className="w-full py-6 bg-[#0d457a] text-white rounded-[28px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-900 transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
               >
                  Efetivar Trâmite de Processo <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </button>
            </div>
          ) : (
            <div className="bg-blue-50 p-10 rounded-[48px] border border-blue-100 flex flex-col items-center text-center space-y-4">
               <div className="p-5 bg-white rounded-[24px] text-blue-600 shadow-sm ring-8 ring-blue-50/50">
                  <Lock size={40} />
               </div>
               <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Fluxo Encerrado</h3>
               <p className="text-[10px] text-blue-700 font-bold uppercase max-w-sm leading-relaxed">
                  Este processo atingiu o status de liquidação financeira ou arquivamento. Tramitações e edições foram suspensas para garantir a integridade fiscal.
               </p>
            </div>
          )}

          {/* TRILHA DE AUDITORIA */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
            <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                <History size={20} className="text-blue-500" /> Trilha Digital de Auditoria
            </h3>
            <div className="space-y-0 relative">
                <div className="absolute left-[24px] top-8 bottom-8 w-1 bg-slate-50"></div>
                {[...amendment.movements].reverse().map((mov, idx) => {
                  const isCurrent = !mov.dateOut;
                  return (
                    <div key={mov.id} className="relative pl-20 pb-12 last:pb-0 group">
                      <div className={`absolute left-0 top-1 w-14 h-14 rounded-[20px] border-4 border-white shadow-lg flex items-center justify-center z-10 transition-all ${
                        isCurrent ? 'bg-[#0d457a] text-white ring-8 ring-blue-50' : 'bg-emerald-500 text-white'
                      }`}>
                          {isCurrent ? <Timer size={24} className="animate-pulse" /> : <CheckCircle2 size={24} />}
                      </div>
                      <div className={`p-8 rounded-[32px] border transition-all ${isCurrent ? 'bg-blue-50/50 border-blue-200 shadow-lg' : 'bg-emerald-50/10 border-emerald-100'}`}>
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                             <div>
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{mov.analysisType || 'Tramitação'}</span>
                                <h4 className="text-base font-black text-[#0d457a] uppercase mt-1">{mov.toSector}</h4>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Entrada: {new Date(mov.dateIn).toLocaleString('pt-BR')}</p>
                                {mov.dateOut && <p className="text-[9px] font-bold text-slate-400 uppercase">Saída: {new Date(mov.dateOut).toLocaleString('pt-BR')}</p>}
                             </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium uppercase leading-relaxed">
                            <span className="font-black text-slate-400">Responsável:</span> {mov.handledBy}
                          </p>
                          {mov.remarks && (
                            <div className="mt-6 p-5 bg-white/60 rounded-2xl italic text-[11px] text-slate-500 border border-slate-100 shadow-inner whitespace-pre-wrap leading-relaxed">
                              "{mov.remarks}"
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* KPI DE SLA */}
           {slaSummary && (
             <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000"><Clock size={200} /></div>
                <div className="relative z-10">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${slaSummary.color === 'text-emerald-600' ? 'bg-emerald-50' : 'bg-red-50'} ${slaSummary.color} shadow-sm`}>
                      <slaSummary.icon size={28} />
                   </div>
                   <h4 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter">Status de SLA</h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Permanência na Unidade</p>
                   
                   <div className="mt-10 space-y-6">
                      <div className="flex justify-between items-end">
                         <p className={`text-5xl font-black ${slaSummary.color}`}>{slaSummary.daysLeft}</p>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Dias Restantes</p>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                         <div className={`h-full rounded-full transition-all duration-1000 ${slaSummary.color.replace('text', 'bg')}`} style={{ width: `${100 - slaSummary.progressPercent}%` }}></div>
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Prazo Final: {slaSummary.deadlineDate.toLocaleDateString('pt-BR')}</p>
                   </div>
                </div>
             </div>
           )}

           {/* RESUMO DO OBJETO */}
           <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><FileText size={120} /></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-8 text-blue-200/50">Objeto do Processo</h4>
              <p className="text-xs font-bold leading-relaxed uppercase opacity-90">{amendment.object}</p>
              <div className="mt-10 pt-10 border-t border-white/10 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-blue-200/50 uppercase">Valor Nominal</span>
                    <span className="text-xl font-black">R$ {amendment.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-blue-200/50 uppercase">Município</span>
                    <span className="text-xs font-black uppercase">{amendment.municipality}</span>
                 </div>
              </div>
           </div>

           {/* RESULTADO IA (CASO EXISTA) */}
           {aiResult && (
             <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-10 rounded-[48px] text-white shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-3 bg-white/10 rounded-xl text-emerald-400"><Sparkles size={24} /></div>
                   <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">Parecer Gemini Pro</h4>
                      <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest">Análise Preditiva de Risco</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div>
                      <p className="text-[9px] font-black text-blue-200/40 uppercase mb-2">Gargalo Identificado</p>
                      <p className="text-[11px] font-bold text-emerald-400 uppercase leading-relaxed">{aiResult.bottleneck}</p>
                   </div>
                   <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[11px] leading-relaxed opacity-80 font-medium">"{aiResult.recommendation}"</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/20 rounded-2xl text-center">
                         <p className="text-[8px] font-black text-blue-200/30 uppercase mb-1">Confiança</p>
                         <p className="text-lg font-black">{(aiResult.completionProbability * 100).toFixed(0)}%</p>
                      </div>
                      <div className="p-4 bg-black/20 rounded-2xl text-center">
                         <p className="text-[8px] font-black text-blue-200/30 uppercase mb-1">Score Risco</p>
                         <p className="text-lg font-black text-red-400">{aiResult.riskScore}</p>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* MODAL DE TRANSIÇÃO RÁPIDA (REUSADO) */}
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