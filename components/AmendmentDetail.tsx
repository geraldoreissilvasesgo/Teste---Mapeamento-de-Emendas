import React, { useState, useMemo, useRef } from 'react';
import { useNotification } from '../context/NotificationContext.tsx';
import { 
  Amendment, StatusConfig, User, Role, SectorConfig, 
  AmendmentMovement, AnalysisType, SystemMode, AmendmentType, GNDType
} from '../types.ts';
import { analyzeAmendment } from '../services/geminiService.ts';
import { 
  ArrowLeft, Send, MapPin, Calendar, Clock, 
  FileText, Building2, Printer, ArrowRightLeft, 
  History, Lock, UserCheck, MessageSquare, 
  CalendarDays, Sparkles, Pencil, Save, DollarSign, 
  Tag, Info, ChevronRight, X, ShieldAlert,
  ChevronDown, Settings2, Download, Loader2, ChevronUp,
  AlertTriangle, CheckCircle, Quote, PenTool, Search, 
  BookMarked, ClipboardList, Type as TypeIcon, ShieldCheck,
  Timer, FileSearch
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
  { label: 'Parecer Jurídico', text: 'Remeto os autos à Procuradoria Setorial para emissão de parecer jurídico acerca da viabilidade do repasse pretendido.' },
  { label: 'Fins de Empenho', text: 'Após aprovação técnica e jurídica, encaminho para reserva orçamentária e posterior empenho da despesa.' },
  { label: 'Pagamento/Liquidação', text: 'Processo devidamente instruído e auditado. Encaminho para fins de liquidação e pagamento conforme cronograma financeiro.' }
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<Amendment>(amendment);
  const [sectorSearch, setSectorSearch] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [newStatus, setNewStatus] = useState<string>(amendment.status);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENTE' | 'URGENTISSIMO'>('NORMAL');
  const [remarks, setRemarks] = useState('');
  const [showDestList, setShowDestList] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedMovementId, setExpandedMovementId] = useState<string | null>(null);
  
  const tramitacaoRef = useRef<HTMLDivElement>(null);

  const currentStatusConfig = statuses.find(s => s.name === amendment.status);
  const isLocked = currentStatusConfig?.isFinal;

  const currentSectorsNames = (amendment.currentSector || '').split(' | ');
  
  const filteredDestSectors = useMemo(() => {
    const searchLower = sectorSearch.toLowerCase();
    const selectedIds = selectedDestinations.map(d => d.id);
    return sectors.filter(s => {
      const sectorName = s.name || '';
      return !currentSectorsNames.includes(sectorName) &&
             !selectedIds.includes(s.id) &&
             sectorName.toLowerCase().includes(searchLower);
    });
  }, [sectors, sectorSearch, currentSectorsNames, selectedDestinations]);

  const applyTemplate = (text: string) => {
    setRemarks(text);
    setShowTemplates(false);
  };

  const generateAiDispatch = async () => {
    if (selectedDestinations.length === 0) {
      notify('info', 'Destino Necessário', 'Selecione a unidade de destino para que a IA gere o despacho adequado.');
      return;
    }
    
    setIsAiLoading(true);
    try {
      const result = await analyzeAmendment(amendment);
      const destNames = selectedDestinations.map(d => d.name).join(', ');
      
      const suggestedText = `DESPACHO INTERNO GESA\n\nEncaminho o presente processo SEI ${amendment.seiNumber} à unidade ${destNames} para fins de ${selectedDestinations[0].analysisType || 'análise técnica'}.\n\nContexto: ${result.summary}\n\nRecomendação: ${result.recommendation}\n\nAtenciosamente,\n${currentUser.name}\n${currentUser.department}`;
      
      setRemarks(suggestedText);
      notify('success', 'Minuta Gerada', 'Despacho redigido pela IA com base no histórico do processo.');
    } catch (err) {
      notify('error', 'Falha IA', 'Não foi possível gerar a minuta automática.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const addDestination = (sector: SectorConfig) => {
    setSelectedDestinations(prev => [...prev, sector]);
    setSectorSearch('');
    setShowDestList(false);
  };

  const removeDestination = (id: string) => {
    setSelectedDestinations(prev => prev.filter(d => d.id !== id));
  };

  const handleMove = () => {
    if (isLocked) return;
    if (selectedDestinations.length === 0) {
      notify('warning', 'Destino Obrigatório', 'Você precisa selecionar pelo menos uma unidade técnica de destino.');
      return;
    }

    const newMovements: AmendmentMovement[] = selectedDestinations.map(dest => {
      const slaDays = dest.defaultSlaDays || 5;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + slaDays);
      
      return {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        amendmentId: amendment.id,
        fromSector: amendment.currentSector,
        toSector: dest.name,
        dateIn: new Date().toISOString(),
        dateOut: null,
        deadline: deadline.toISOString(),
        daysSpent: 0,
        handledBy: currentUser.name,
        analysisType: dest.analysisType,
        remarks: `${priority !== 'NORMAL' ? `[${priority}] ` : ''}${remarks}` || undefined
      };
    });

    onMove(newMovements, newStatus);
    setSelectedDestinations([]);
    setRemarks('');
    setPriority('NORMAL');
    notify('success', 'Trâmite Concluído', `Processo enviado para ${selectedDestinations.length} unidade(s).`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editFormData);
    setIsEditModalOpen(false);
  };

  const handleExportPDF = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      notify('error', 'Motor de PDF Indisponível', 'Aguarde o carregamento das bibliotecas de exportação.');
      return;
    }

    setIsGeneratingPdf(true);
    const element = document.getElementById('amendment-detail-card');
    
    const opt = {
      margin: 10,
      filename: `DOSSIE_SEI_${amendment.seiNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await h2p().set(opt).from(element).save();
      notify('success', 'PDF Gerado', 'O dossiê do processo foi salvo com sucesso.');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getSlaStatus = (deadline: string, dateOut: string | null) => {
    const limit = new Date(deadline);
    const end = dateOut ? new Date(dateOut) : new Date();
    const isDelayed = end > limit;
    
    return {
      isDelayed,
      label: isDelayed ? 'Atrasado' : 'No Prazo',
      color: isDelayed ? 'text-red-500 bg-red-50 border-red-100' : 'text-emerald-500 bg-emerald-50 border-emerald-100'
    };
  };

  const toggleMovementExpansion = (id: string) => {
    setExpandedMovementId(expandedMovementId === id ? null : id);
  };

  const statusColor = currentStatusConfig?.color || '#0d457a';

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-[#0d457a] uppercase tracking-widest transition-all">
            <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {!isLocked && (currentUser.role === Role.ADMIN || currentUser.role === Role.OPERATOR) && (
              <>
                <button 
                  onClick={() => { setEditFormData(amendment); setIsEditModalOpen(true); }}
                  className="flex-1 md:flex-none bg-white border border-slate-200 text-[#0d457a] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center justify-center gap-2"
                >
                  <Pencil size={16} /> Editar Dados
                </button>
                <button 
                  onClick={() => tramitacaoRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 md:flex-none bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft size={16} /> Novo Despacho
                </button>
              </>
            )}
            <button 
              onClick={handleExportPDF} 
              disabled={isGeneratingPdf}
              className="flex-1 md:flex-none bg-[#0d457a] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2"
            >
                {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Exportar Dossiê
            </button>
        </div>
      </div>
      
      {isLocked && (
        <div className="bg-emerald-600 p-6 rounded-[32px] border border-emerald-500 shadow-xl flex items-center gap-4 text-white animate-in slide-in-from-top-4 duration-500 no-print">
           <Lock size={24} className="shrink-0" />
           <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest">Processo Liquidado / Auditado</h4>
              <p className="text-[10px] font-bold text-emerald-100 uppercase mt-1">Status final atingido. Trâmites e edições bloqueados para conformidade fiscal.</p>
           </div>
        </div>
      )}

      <div id="amendment-detail-card" className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden">
        {/* CABEÇALHO INSTITUCIONAL RÍGIDO (PRINT ONLY) */}
        <div className="hidden print:block p-12 border-b-8 border-[#0d457a] bg-white">
            <div className="flex justify-between items-start mb-10">
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">ESTADO DE GOIÁS</h1>
                    <div className="space-y-1">
                      <p className="text-[14px] font-black text-slate-900 uppercase leading-tight">
                        SUBSECRETARIA DE INOVAÇÃO, PLANEJAMENTO, EDUCAÇÃO E INFRAESTRUTURA - SES/SUBIPEI-21286
                      </p>
                      <p className="text-[12px] font-black text-[#0d457a] uppercase tracking-widest">
                        GERÊNCIA DE SUPORTE ADMINISTRATIVO
                      </p>
                    </div>
                </div>
                <div className="text-right">
                  <div className="flex justify-end mb-4">
                    <ShieldCheck size={48} className="text-[#0d457a]" />
                  </div>
                  <p className="text-[12px] font-black text-[#0d457a] uppercase tracking-widest">DOSSIÊ TÉCNICO DE PROCESSO</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Extraído em: {new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>
        </div>

        <div className="p-8 lg:p-12 border-b-4 border-dashed" style={{ borderColor: `${statusColor}20` }}>
           <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border" 
                          style={{ color: statusColor, backgroundColor: `${statusColor}10`, borderColor: `${statusColor}30` }}>
                        {amendment.status}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizado via SEI</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-[#0d457a] uppercase tracking-tighter leading-none break-all">{amendment.seiNumber}</h1>
                <p className="text-lg lg:text-xl font-bold text-slate-400 uppercase leading-tight">{amendment.object}</p>
                <div className="flex flex-wrap gap-4 lg:gap-6 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#0d457a] uppercase">
                        <MapPin size={14} className="text-emerald-500" /> {amendment.municipality}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                        <Calendar size={14} /> Exercício {amendment.year}
                    </div>
                </div>
              </div>
              <div className="w-full lg:w-auto text-center lg:text-right bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-inner">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Dotação Orçamentária</p>
                 <p className="text-3xl lg:text-4xl font-black text-[#0d457a] tracking-tighter">R$ {amendment.value.toLocaleString('pt-BR')}</p>
              </div>
           </div>
        </div>
        
        <div className="p-8 lg:p-12">
          {!isLocked && (currentUser.role === Role.ADMIN || currentUser.role === Role.OPERATOR) && (
            <div ref={tramitacaoRef} className="bg-[#0d457a] p-8 lg:p-12 rounded-[48px] border-4 border-white shadow-2xl mb-12 relative overflow-hidden no-print">
              <div className="absolute top-0 right-0 p-8 opacity-5"><PenTool size={200}/></div>
              
              <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                   <ArrowRightLeft size={20} className="text-emerald-400" /> Guia de Despacho e Tramitação
                </h3>
                <div className="flex gap-2">
                    {(['NORMAL', 'URGENTE', 'URGENTISSIMO'] as const).map(p => (
                        <button 
                            key={p}
                            onClick={() => setPriority(p)}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                                priority === p 
                                ? (p === 'NORMAL' ? 'bg-blue-500 border-blue-400 text-white' : p === 'URGENTE' ? 'bg-amber-500 border-amber-400 text-white' : 'bg-red-500 border-red-400 text-white animate-pulse')
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                   <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-white/50 uppercase mb-3 block">Alterar Estado do Ciclo</label>
                        <select 
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-[12px] font-black text-white outline-none focus:ring-4 ring-emerald-500/30 transition-all uppercase"
                        >
                            {statuses.map(s => <option key={s.id} value={s.name} className="text-[#0d457a]">{s.name}</option>)}
                        </select>
                      </div>

                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                         <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-4">Resumo do Destino</p>
                         <div className="space-y-3">
                            {selectedDestinations.length === 0 ? (
                                <p className="text-[10px] text-white/20 italic">Selecione unidades de destino ao lado...</p>
                            ) : selectedDestinations.map(dest => (
                                <div key={dest.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase">{dest.name}</p>
                                        <p className="text-[8px] font-bold text-white/40 uppercase">SLA: {dest.defaultSlaDays} Dias</p>
                                    </div>
                                    <button onClick={() => removeDestination(dest.id)} className="text-white/20 hover:text-red-400 p-1"><X size={14}/></button>
                                </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-2 space-y-6">
                      <div className="relative">
                        <label className="text-[10px] font-black text-white/50 uppercase mb-3 block">Unidade(s) Técnica(s) de Destino</label>
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-[12px] font-black text-white outline-none focus:ring-4 ring-emerald-500/30 transition-all uppercase placeholder:text-white/20"
                                placeholder="BUSCAR UNIDADE (EX: SES/FES, CEP...)"
                                value={sectorSearch}
                                onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                                onFocus={() => setShowDestList(true)}
                            />
                        </div>
                        
                        {showDestList && sectorSearch && filteredDestSectors.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-50 max-h-48 overflow-y-auto p-2">
                                {filteredDestSectors.map(s => (
                                    <button key={s.id} onClick={() => addDestination(s)} className="w-full text-left px-5 py-3 hover:bg-slate-50 text-[10px] font-black text-[#0d457a] uppercase border-b border-slate-50 last:border-0 rounded-xl transition-all flex justify-between items-center">
                                        {s.name}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase">{s.analysisType}</span>
                                            <span className="text-[10px] text-blue-500 font-black">+</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                      </div>

                      <div className="relative">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <label className="text-[10px] font-black text-white/50 uppercase">Texto do Despacho / Minuta</label>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowTemplates(!showTemplates)}
                                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all"
                                    >
                                        <BookMarked size={12}/> Modelos Padrão
                                    </button>
                                    
                                    {showTemplates && (
                                        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[60] animate-in zoom-in-95 duration-200">
                                            <p className="p-3 text-[9px] font-black text-slate-400 border-b border-slate-50 mb-1 uppercase tracking-widest">Textos Oficiais</p>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                {DISPATCH_TEMPLATES.map((t, i) => (
                                                    <button 
                                                        key={i} 
                                                        onClick={() => applyTemplate(t.text)}
                                                        className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-all group"
                                                    >
                                                        <p className="text-[10px] font-black text-[#0d457a] uppercase mb-1">{t.label}</p>
                                                        <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">{t.text}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={generateAiDispatch}
                                disabled={isAiLoading}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:scale-105 transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
                            >
                                {isAiLoading ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12}/>}
                                Redigir via IA
                            </button>
                        </div>
                        <textarea 
                            className="w-full p-6 bg-white/10 border border-white/20 rounded-3xl text-[11px] font-medium text-white outline-none focus:ring-4 ring-emerald-500/30 h-40 resize-none leading-relaxed placeholder:text-white/10"
                            placeholder="Descreva a finalidade do envio ou selecione um modelo padrão..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                      </div>
                   </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/5">
                        <UserCheck size={24}/>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Assinatura Digital</p>
                        <p className="text-xs font-black text-white uppercase">{currentUser.name}</p>
                        <p className="text-[8px] font-bold text-white/40 uppercase">{currentUser.department} • Autenticação GESA • GOIAS Cloud</p>
                     </div>
                  </div>
                  <button 
                    onClick={handleMove} 
                    className="w-full md:w-72 bg-emerald-500 text-white px-8 py-5 rounded-[22px] font-black uppercase text-[12px] tracking-widest shadow-2xl shadow-emerald-900/40 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                      Concluir e Enviar <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                        <History size={18} className="text-blue-500" /> Trilha Digital de Movimentos
                    </h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[8px] font-black uppercase">{amendment.movements.length} Registros</span>
                </div>

                <div className="relative pl-10 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {[...amendment.movements].reverse().map((m, idx) => {
                        const isCurrent = idx === 0 && !m.dateOut;
                        const slaInfo = getSlaStatus(m.deadline, m.dateOut);
                        const isExpanded = expandedMovementId === m.id || isGeneratingPdf;
                        
                        const isUrgent = m.remarks?.includes('[URGENTE]');
                        const isUrgentissimo = m.remarks?.includes('[URGENTISSIMO]');
                        
                        return (
                          <div key={m.id} className="relative pdf-avoid-break">
                              <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-[6px] border-white shadow-md z-10 transition-all ${isCurrent ? 'bg-emerald-500 scale-125' : 'bg-slate-200'}`} />
                              <div 
                                onClick={() => toggleMovementExpansion(m.id)}
                                className={`bg-white p-6 lg:p-8 rounded-[36px] border shadow-sm cursor-pointer transition-all hover:shadow-xl group/card ${
                                    isCurrent ? 'border-emerald-200 bg-emerald-50/10' : 
                                    isUrgentissimo ? 'border-red-200 bg-red-50/5' :
                                    isUrgent ? 'border-amber-200 bg-amber-50/5' :
                                    'border-slate-100'
                                }`}
                              >
                                  <div className="flex justify-between items-start gap-4">
                                     <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-base font-black text-[#0d457a] uppercase leading-tight truncate">{m.toSector}</h4>
                                            {(isUrgent || isUrgentissimo) && (
                                                <AlertTriangle size={14} className={isUrgentissimo ? 'text-red-500' : 'text-amber-500'} />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.analysisType || 'Análise Geral'}</p>
                                            {m.daysSpent > 0 && (
                                                <span className="flex items-center gap-1 text-[8px] font-bold text-slate-300 uppercase">
                                                    <Timer size={10}/> {m.daysSpent} {m.daysSpent === 1 ? 'dia' : 'dias'} permanência
                                                </span>
                                            )}
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shrink-0 ${slaInfo.color}`}>
                                            {slaInfo.label}
                                        </div>
                                        <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 no-print ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
                                      <div>
                                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Data de Entrada</p>
                                          <p className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-1.5">
                                            <Clock size={10} className="text-blue-500"/> {new Date(m.dateIn).toLocaleDateString('pt-BR')}
                                          </p>
                                      </div>
                                      <div>
                                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Responsável</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate flex items-center gap-1.5">
                                            <UserCheck size={10} className="text-emerald-500"/> {m.handledBy}
                                          </p>
                                      </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                                       <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 relative shadow-inner">
                                          <Quote size={20} className="absolute top-4 right-4 text-slate-200" />
                                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200/50">
                                             <FileSearch size={14} className="text-blue-400" />
                                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conteúdo do Despacho Técnico</span>
                                          </div>
                                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                             {m.remarks || "Sem observações detalhadas registradas neste trâmite setorial."}
                                          </p>
                                          {m.dateOut && (
                                            <div className="mt-6 pt-4 border-t border-slate-200/50 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Saída da Unidade</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase">{new Date(m.dateOut).toLocaleString('pt-BR')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Análise Finalizada por</p>
                                                    <p className="text-[9px] font-bold text-[#0d457a] uppercase">{m.handledBy}</p>
                                                </div>
                                            </div>
                                          )}
                                       </div>
                                    </div>
                                  )}
                                  
                                  {!isExpanded && m.remarks && (
                                    <div className="mt-4 flex items-center gap-2 text-blue-500 no-print">
                                        <MessageSquare size={12}/>
                                        <span className="text-[8px] font-black uppercase tracking-widest">Visualizar Despacho e Detalhes do Setor</span>
                                    </div>
                                  )}
                              </div>
                          </div>
                        );
                    })}
                </div>
             </div>

             <div className="space-y-8">
                 <div className="bg-white p-8 lg:p-10 rounded-[40px] border border-slate-200 shadow-sm pdf-avoid-break">
                    <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest mb-6 flex items-center gap-3">
                      <FileText size={18} className="text-blue-500" /> Repositório de Documentos
                    </h3>
                    <div className="space-y-3">
                       {[
                         { name: 'Ofício de Solicitação.pdf', size: '1.2 MB', type: 'PDF' },
                         { name: 'Parecer Técnico Inicial.pdf', size: '2.4 MB', type: 'PDF' },
                         { name: 'Comprovante de Endereço.jpg', size: '800 KB', type: 'IMG' }
                       ].map((doc, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3">
                               <FileText size={18} className={doc.type === 'PDF' ? 'text-red-500' : 'text-blue-500'}/>
                               <div>
                                  <p className="text-[10px] font-black text-[#0d457a] uppercase">{doc.name}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">{doc.size}</p>
                               </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                         </div>
                       ))}
                    </div>
                    <button className="w-full mt-6 py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all">
                        + Anexar Novo Documento
                    </button>
                 </div>

                 <div className="bg-gradient-to-br from-[#0d457a] to-[#1e5a94] p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert size={120} /></div>
                    <div className="relative z-10">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-4">Atenção ao SLA</h4>
                        <p className="text-[10px] text-blue-100/60 leading-relaxed font-medium uppercase mb-6">
                            Cada unidade técnica possui um tempo de resposta padrão. Tramitações atrasadas geram alertas automáticos para a Auditoria e Controladoria Geral do Estado.
                        </p>
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                            <CheckCircle size={14} className="text-emerald-400" />
                            <span className="text-[9px] font-black uppercase">Monitoramento GESA Cloud Ativo</span>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 lg:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="text-xl lg:text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Ajustar Registro</h3>
               <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número SEI</label>
                        <input 
                            type="text" 
                            value={editFormData.seiNumber}
                            onChange={(e) => setEditFormData({...editFormData, seiNumber: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none uppercase text-xs"
                            placeholder="NÚMERO SEI"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Repasse</label>
                        <input 
                            type="number" 
                            value={editFormData.value}
                            onChange={(e) => setEditFormData({...editFormData, value: parseFloat(e.target.value)})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none text-xs"
                            placeholder="VALOR"
                        />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Objeto do Processo</label>
                        <textarea 
                            value={editFormData.object}
                            onChange={(e) => setEditFormData({...editFormData, object: e.target.value})}
                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none h-32 uppercase text-xs resize-none"
                            placeholder="OBJETO"
                        />
                    </div>
                  </div>
               </div>
               <button type="submit" className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-[#0a365f] transition-all">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};