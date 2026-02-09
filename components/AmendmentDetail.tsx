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
  
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isFastTransitionOpen, setIsFastTransitionOpen] = useState(false);
  
  const [extensionData, setExtensionData] = useState({
    newDeadline: '',
    justification: ''
  });

  const isAdmin = currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN;

  const isLocked = useMemo(() => {
    const statusObj = statuses.find(s => s.name.toUpperCase() === amendment.status.toUpperCase());
    return amendment.status === Status.COMMITMENT_LIQUIDATION || (statusObj?.isFinal === true);
  }, [amendment.status, statuses]);

  const currentPhaseIndex = useMemo(() => {
    const idx = PROCESS_PHASES.findIndex(phase => phase.statuses.includes(amendment.status as Status));
    return idx === -1 ? 0 : idx;
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
      bg: diffDays < 0 ? 'bg-red-50' : diffDays <= 2 ? 'bg-amber-50' : 'bg-emerald-50',
      barColor: diffDays < 0 ? 'bg-red-500' : diffDays <= 2 ? 'bg-amber-500' : 'bg-emerald-500',
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

  const handleInactivate = () => {
    if (!window.confirm("⚠️ INATIVAÇÃO: Deseja mover este processo para o ARQUIVO? Ele não aparecerá mais no fluxo ativo.")) return;
    
    const justification = prompt("Justificativa para inativação:");
    if (!justification) {
      notify('warning', 'Ação Cancelada', 'Justificativa obrigatória para inativação.');
      return;
    }

    const updated = {
      ...amendment,
      status: Status.ARCHIVED,
      updatedAt: new Date().toISOString()
    };

    onUpdate(updated);
    notify('info', 'Processo Inativado', 'O SEI foi movido para o Repositório de Arquivos.');
  };

  const handleDelete = () => {
    if (!window.confirm("🚨 EXCLUSÃO CRÍTICA: Você está prestes a apagar este registro DEFINITIVAMENTE do banco de dados GESA. Esta ação é IRREVERSÍVEL. Confirmar exclusão?")) return;
    
    const justification = prompt("Justificativa para exclusão (será gravada nos logs de auditoria):");
    if (!justification) {
      notify('warning', 'Ação Cancelada', 'Justificativa obrigatória para exclusão.');
      return;
    }

    onDelete(amendment.id, justification);
  };

  const filteredDestSectors = useMemo(() => {
    const searchLower = sectorSearch.toLowerCase();
    return sectors.filter(s => 
      s.name.toLowerCase().includes(searchLower) && 
      s.name !== amendment.currentSector
    ).slice(0, 5);
  }, [sectors, sectorSearch, amendment.currentSector]);

  const handleFinalMove = () => {
    if (isLocked) {
      notify('error', 'Ação Bloqueada', 'O processo está em fase de Empenho/Liquidação.');
      return;
    }

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
    notify('success', 'Trâmite Registrado', 'Processo movimentado com sucesso.');
  };

  const handleDeadlineExtension = () => {
    if (isLocked) return;
    if (!extensionData.newDeadline || !extensionData.justification) {
      notify('warning', 'Campos Obrigatórios', 'Justificativa e nova data são obrigatórios.');
      return;
    }

    const updatedMovements = [...amendment.movements];
    const lastIndex = updatedMovements.length - 1;
    
    if (lastIndex >= 0) {
      const lastMov = updatedMovements[lastIndex];
      const previousDeadline = new Date(lastMov.deadline).toLocaleDateString('pt-BR');
      
      updatedMovements[lastIndex] = {
        ...lastMov,
        deadline: new Date(extensionData.newDeadline).toISOString(),
        remarks: (lastMov.remarks ? lastMov.remarks + "\n\n" : "") + 
                 `[DILAÇÃO DE PRAZO] De ${previousDeadline} para ${new Date(extensionData.newDeadline).toLocaleDateString('pt-BR')}. ` +
                 `Justificativa: ${extensionData.justification}`
      };

      onUpdate({
        ...amendment,
        movements: updatedMovements
      });

      setIsExtensionModalOpen(false);
      setExtensionData({ newDeadline: '', justification: '' });
      notify('success', 'Prazo Prorrogado', 'Alteração registrada.');
    }
  };

  const handleFastTransitionSave = (updatedAmendment: Amendment) => {
    onUpdate(updatedAmendment);
    setIsFastTransitionOpen(false);
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-blue-50 transition-all shadow-sm group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">{amendment.seiNumber}</h2>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${isLocked ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {isLocked && <Lock size={10} className="inline mr-1" />}
                {amendment.status}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
              <Fingerprint size={14} className="text-blue-500" /> Dossiê Digital GESA Cloud
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => setIsFastTransitionOpen(true)}
              disabled={isLocked}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${isLocked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              <Zap size={16} /> Transição Rápida
            </button>
          )}
          <button onClick={handleAiAnalysis} disabled={isAiLoading} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50">
            {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Análise IA
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-3 bg-white border border-slate-200 text-slate-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-[32px] flex items-center gap-6 animate-in slide-in-from-top-2">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h4 className="text-sm font-black text-blue-900 uppercase">Registro em Fase de Empenho/Liquidação</h4>
            <p className="text-[10px] text-blue-700 font-bold uppercase mt-1">Bloqueio financeiro ativo. Edições desabilitadas.</p>
          </div>
        </div>
      )}

      {/* STEPPER */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
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
          {slaSummary && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-2xl ${slaSummary.bg} ${slaSummary.color}`}>
                        <slaSummary.icon size={28} />
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter">Permanência na Unidade</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Unidade: {amendment.currentSector}</p>
                     </div>
                  </div>
                  {!isLocked && (
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setIsExtensionModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase text-[#0d457a] hover:bg-white transition-all shadow-sm group"
                      >
                        <CalendarPlus size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        Dilação de Prazo
                      </button>
                      <div className="text-right border-l border-slate-100 pl-6">
                        <p className={`text-2xl font-black ${slaSummary.color}`}>{slaSummary.daysLeft} Dias</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo de Prazo</p>
                      </div>
                    </div>
                  )}
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     <span>Consumo de Prazo - Vence em: {slaSummary.deadlineDate.toLocaleDateString('pt-BR')}</span>
                     <span className={slaSummary.color}>{slaSummary.progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                     <div className={`h-full rounded-full transition-all duration-1000 ${slaSummary.barColor}`} style={{ width: `${slaSummary.progressPercent}%` }} />
                  </div>
               </div>
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
                        isCurrent ? 'bg-[#0d457a] text-white ring-8 ring-blue-50' : 'bg-slate-100 text-slate-400'
                      }`}>
                          {isCurrent ? <Timer size={24} className="animate-pulse" /> : <CheckCircle2 size={24} />}
                      </div>

                      <div className={`p-8 rounded-[32px] border transition-all duration-300 ${
                        isCurrent ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}>
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{mov.toSector}</span>
                                     <ChevronRight size={12} className="text-slate-300" />
                                     <span className={`text-[10px] font-black uppercase ${isCurrent ? 'text-[#0d457a]' : 'text-slate-400'}`}>{mov.analysisType || 'Fluxo'}</span>
                                  </div>
                                  <h4 className={`text-base font-black uppercase tracking-tight ${isCurrent ? 'text-[#0d457a]' : 'text-slate-500'}`}>
                                    {isCurrent ? 'Ativo na Unidade' : `Processado por ${mov.handledBy}`}
                                  </h4>
                              </div>
                              <div className="text-right">
                                  <div className="flex items-center gap-2 justify-end text-slate-400">
                                      <Calendar size={14} />
                                      <span className="text-[10px] font-bold uppercase">Entrada: {new Date(mov.dateIn).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  <div className="flex items-center gap-2 justify-end text-blue-400 mt-1">
                                      <Timer size={14} />
                                      <span className="text-[10px] font-bold uppercase">Prazo: {new Date(mov.deadline).toLocaleDateString('pt-BR')}</span>
                                  </div>
                              </div>
                          </div>
                          {mov.remarks && (
                              <div className="p-6 bg-white/60 rounded-2xl border border-slate-200/50 italic text-[12px] text-slate-500 leading-relaxed relative whitespace-pre-wrap">
                                  <Quote className="absolute -top-3 -left-3 text-slate-200" size={24} />
                                  {mov.remarks}
                              </div>
                          )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* SIDEBAR OPERACIONAL */}
        <div className="space-y-8 no-print">
          <div className={`p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${isLocked ? 'bg-slate-400' : 'bg-[#0d457a]'}`}>
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 mb-10">
               {isLocked ? <Lock size={24} className="text-slate-200" /> : <Send size={24} className="text-blue-300" />} 
               {isLocked ? 'Tramitação Travada' : 'Movimentar'}
            </h3>

            {isLocked ? (
              <div className="space-y-6 text-center py-4">
                <ShieldX size={48} className="mx-auto text-white/50 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80 leading-relaxed">
                  Fase de liquidação financeira.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <label className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest block mb-3 ml-1">Unidade Técnica Destino</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all font-bold text-[11px] uppercase text-white placeholder:text-white/20"
                      placeholder="PESQUISAR..."
                      value={sectorSearch}
                      onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                    />
                    {showDestList && filteredDestSectors.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-100">
                        {filteredDestSectors.map(s => (
                          <button key={s.id} onClick={() => { setSelectedDestinations([s]); setShowDestList(false); }} className="w-full px-5 py-4 text-left hover:bg-blue-50 transition-colors">
                            <span className="text-[10px] font-black text-[#0d457a] uppercase">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-5 bg-white/10 border border-white/20 rounded-3xl outline-none h-40 font-medium text-[11px] text-white placeholder:text-white/20 resize-none uppercase" placeholder="DESPACHO SEI..." />
                <button onClick={handleFinalMove} className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                  Confirmar Trâmite
                </button>
              </div>
            )}
          </div>

          {/* ZONA DE GESTÃO CRÍTICA (ADMIN ONLY) */}
          {isAdmin && (
            <div className="p-10 rounded-[48px] bg-white border border-red-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                 <ShieldAlert size={16} /> Gestão de Registro
              </h3>
              
              <div className="space-y-3">
                 <button 
                   onClick={handleInactivate}
                   disabled={amendment.status === Status.ARCHIVED}
                   className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                     amendment.status === Status.ARCHIVED 
                     ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' 
                     : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                   }`}
                 >
                   <Archive size={14} /> 
                   {amendment.status === Status.ARCHIVED ? 'Já Inativado' : 'Inativar Processo'}
                 </button>
                 
                 <button 
                   onClick={handleDelete}
                   className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                 >
                   <Trash2 size={14} /> Excluir Definitivamente
                 </button>
              </div>

              <p className="text-[8px] font-bold text-slate-400 uppercase text-center leading-tight">
                Ações de exclusão e inativação são registradas no histórico de auditoria GESA.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: TRANSIÇÃO RÁPIDA */}
      {isFastTransitionOpen && (
        <FastTransitionModal 
          amendment={amendment}
          sectors={sectors}
          statuses={statuses}
          onClose={() => setIsFastTransitionOpen(false)}
          onSave={handleFastTransitionSave}
        />
      )}

      {/* MODAL: DILAÇÃO DE PRAZO */}
      {isExtensionModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Dilação de Prazo</h3>
              <button onClick={() => setIsExtensionModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-10 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Novo Prazo Limite</label>
                <input 
                  type="date"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a]"
                  value={extensionData.newDeadline}
                  onChange={(e) => setExtensionData({...extensionData, newDeadline: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Justificativa SES/SEI</label>
                <textarea 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] h-32 resize-none text-xs"
                  placeholder="MOTIVO DA ALTERAÇÃO..."
                  value={extensionData.justification}
                  onChange={(e) => setExtensionData({...extensionData, justification: e.target.value})}
                />
              </div>
              <button 
                onClick={handleDeadlineExtension}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                <Save size={18} /> Confirmar Novo Prazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};