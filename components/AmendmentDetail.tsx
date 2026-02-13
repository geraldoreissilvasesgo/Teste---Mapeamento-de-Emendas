import React, { useState, useMemo, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  Amendment, StatusConfig, User as AppUser, Role, SectorConfig, 
  AmendmentMovement, SystemMode, Status
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
  Zap, ShieldX, Save, Trash2
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
  
  // Sincroniza novo status local quando a emenda muda
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

  const handleExportPdf = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      notify('error', 'Biblioteca Ausente', 'O motor de PDF não foi carregado corretamente.');
      return;
    }

    setIsGeneratingPdf(true);
    
    // Exibe temporariamente o cabeçalho institucional para captura
    const printHeader = document.getElementById('institutional-dossier-header');
    if (printHeader) printHeader.classList.remove('hidden');

    const element = document.getElementById('amendment-dossier-export-area');
    const opt = {
      margin: 8,
      filename: `DOSSIE_SEI_${amendment.seiNumber}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await h2p().set(opt).from(element).save();
      notify('success', 'PDF Gerado', 'O dossiê foi salvo em sua pasta de downloads.');
    } catch (e) {
      console.error(e);
      notify('warning', 'Tentando Impressão', 'Falha no motor direto. Abrindo diálogo de impressão...');
      window.print();
    } finally {
      if (printHeader) printHeader.classList.add('hidden');
      setIsGeneratingPdf(false);
    }
  };

  const filteredSectors = useMemo(() => {
    const search = sectorSearch.toLowerCase();
    return sectors.filter(s => 
      s.name.toLowerCase().includes(search) && 
      !selectedDestinations.find(sel => sel.id === s.id)
    );
  }, [sectors, sectorSearch, selectedDestinations]);

  const handleFinalMove = () => {
    if (isLocked) {
      notify('error', 'Ação Bloqueada', 'O processo está em fase de liquidação financeira ou arquivamento.');
      return;
    }

    if (selectedDestinations.length === 0) {
      notify('warning', 'Atenção', 'Selecione a unidade técnica de destino.');
      return;
    }

    setIsSubmitting(true);
    
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
    setIsSubmitting(false);
  };

  const toggleDestination = (sector: SectorConfig) => {
    setSelectedDestinations([sector]);
    setSectorSearch(sector.name);
    setShowDestList(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto">
      {/* CABEÇALHO DO DOSSIÊ (CONTROLES) */}
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
          {(currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN) && (
            <button 
              onClick={() => setIsFastTransitionOpen(true)}
              className="flex items-center gap-3 bg-amber-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-amber-600 transition-all active:scale-95"
            >
              <Zap size={16} /> Ajuste Cronológico
            </button>
          )}
          <button 
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50"
          >
            {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Salvar em PDF
          </button>
        </div>
      </div>

      <div id="amendment-dossier-export-area">
        {/* Cabeçalho Institucional (Visível apenas no PDF/Print) */}
        <div id="institutional-dossier-header" className="hidden print:block mb-10 border-b-2 border-slate-900 pb-8 text-center space-y-2">
           <h4 className="text-[12px] font-black uppercase text-slate-900">Estado de Goiás - Secretaria da Saúde</h4>
           <h5 className="text-[10px] font-bold uppercase text-slate-600">SUBSECRETARIA DE INOVAÇÃO, PLANEJAMENTO, EDUCAÇÃO E INFRAESTRUTURA - SUBIPEI</h5>
           <h6 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] mt-4">Dossiê Técnico de Processo SEI: {amendment.seiNumber}</h6>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* PAINEL DE TRAMITAÇÃO */}
            {!isLocked && (
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-700 no-print">
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
                  disabled={isSubmitting || selectedDestinations.length === 0}
                  className="w-full py-6 bg-[#0d457a] text-white rounded-[28px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-900 transition-all flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50"
                 >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <>Efetivar Trâmite de Processo <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                 </button>
              </div>
            )}

            {isLocked && (
              <div className="bg-blue-50 p-10 rounded-[48px] border border-blue-100 flex flex-col items-center text-center space-y-4 no-print">
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
                  {[...amendment.movements].reverse().map((mov) => {
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
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">Entrada: {new Date(mov.dateIn).toLocaleDateString('pt-BR')}</p>
                                  {mov.dateOut && <p className="text-[9px] font-bold text-slate-400 uppercase">Saída: {new Date(mov.dateOut).toLocaleDateString('pt-BR')}</p>}
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
                           <p className={`text-5xl font-black ${slaSummary.color}`}>
                             {slaSummary.daysLeft < 0 ? '-' : slaSummary.daysLeft}
                           </p>
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

             {/* ZONA DE PERIGO (DELETE) */}
             {(currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN) && (
               <div className="p-10 bg-red-50 rounded-[48px] border border-red-100 space-y-6 no-print">
                  <h4 className="text-[10px] font-black text-red-800 uppercase tracking-widest flex items-center gap-2"><ShieldX size={18} /> Governança Crítica</h4>
                  <p className="text-[9px] text-red-700 font-bold uppercase leading-relaxed">A exclusão de processos SEI é irreversível e exige justificativa administrativa rigorosa.</p>
                  <button 
                    onClick={() => {
                      const justification = window.prompt("⚠️ JUSTIFICATIVA OBRIGATÓRIA: Por que deseja excluir este processo permanentemente da base GESA?");
                      if (justification && justification.length >= 5) onDelete(amendment.id, justification);
                      else if (justification) notify('warning', 'Justificativa Inválida', 'A justificativa deve ser detalhada para fins de auditoria.');
                    }}
                    className="w-full py-4 bg-white text-red-600 border border-red-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group"
                  >
                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> Excluir Permanentemente
                  </button>
               </div>
             )}
          </div>
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