
import React, { useState, useMemo, useRef } from 'react';
import { 
  Amendment, StatusConfig, User, Role, SectorConfig, 
  AmendmentMovement, AnalysisType, SystemMode, AmendmentType, GNDType
} from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  ArrowLeft, Send, MapPin, Calendar, Clock, 
  FileText, Building2, Printer, ArrowRightLeft, 
  History, Lock, UserCheck, MessageSquare, 
  CalendarDays, Sparkles, Pencil, Save, DollarSign, 
  Tag, Info, ChevronRight, X, ShieldAlert,
  ChevronDown, Settings2, Download, Loader2, ChevronUp
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
  onUpdate
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editFormData, setEditFormData] = useState<Amendment>(amendment);
  const [sectorSearch, setSectorSearch] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [newStatus, setNewStatus] = useState<string>(amendment.status);
  const [remarks, setRemarks] = useState('');
  const [showDestList, setShowDestList] = useState(false);
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
      alert("Selecione um destino.");
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
        remarks: remarks || undefined
      };
    });

    onMove(newMovements, newStatus);
    setSelectedDestinations([]);
    setRemarks('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editFormData);
    setIsEditModalOpen(false);
  };

  const handleExportPDF = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      alert("Motor de PDF indisponível no momento.");
      return;
    }

    setIsGeneratingPdf(true);
    const element = document.getElementById('amendment-detail-card');
    
    const opt = {
      margin: 10,
      filename: `PROCESSO_SEI_${amendment.seiNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await h2p().set(opt).from(element).save();
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-[#0d457a] uppercase tracking-widest transition-all">
            <ArrowLeft size={18} /> Voltar ao Painel
        </button>
        <div className="flex gap-3">
            {!isLocked && (
              <>
                <button 
                  onClick={() => { setEditFormData(amendment); setIsEditModalOpen(true); }}
                  className="bg-white border border-slate-200 text-[#0d457a] px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Pencil size={16} /> Editar Dados
                </button>
                <button 
                  onClick={() => tramitacaoRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
                >
                  <ArrowRightLeft size={16} /> Nova Tramitação
                </button>
              </>
            )}
            <button 
              onClick={handleExportPDF} 
              disabled={isGeneratingPdf}
              className="bg-[#0d457a] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase hover:bg-[#0a365f] transition-all shadow-lg flex items-center gap-2"
            >
                {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isGeneratingPdf ? 'Gerando...' : 'Salvar em PDF'}
            </button>
        </div>
      </div>
      
      {isLocked && (
        <div className="bg-emerald-600 p-6 rounded-[32px] border border-emerald-500 shadow-xl flex items-center gap-5 text-white animate-in slide-in-from-top-4 duration-500 no-print">
           <div className="p-3 bg-white/20 rounded-2xl">
              <Lock size={32} />
           </div>
           <div>
              <h4 className="text-sm font-black uppercase tracking-widest leading-none">Processo Finalizado e Auditado</h4>
              <p className="text-[10px] font-bold text-emerald-100 uppercase mt-2">Este registro atingiu um estado de liquidação/arquivamento e não permite novos trâmites ou edições de dados.</p>
           </div>
        </div>
      )}

      <div id="amendment-detail-card" className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-10 border-b-4 border-dashed" style={{ borderColor: `${statusColor}20` }}>
           <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border" 
                          style={{ color: statusColor, backgroundColor: `${statusColor}10`, borderColor: `${statusColor}30` }}>
                        {amendment.status}
                    </span>
                    <span className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">v2.9.5-PROD</span>
                </div>
                <h1 className="text-5xl font-black text-[#0d457a] uppercase tracking-tighter leading-none mb-2 break-all">{amendment.seiNumber}</h1>
                <p className="text-xl font-bold text-slate-400 uppercase max-w-3xl leading-tight">{amendment.object}</p>
                <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2 text-[11px] font-black text-[#0d457a] uppercase">
                        <MapPin size={16} className="text-emerald-500" /> {amendment.municipality}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase">
                        <Calendar size={16} /> Exercício {amendment.year}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-black text-[#0d457a] uppercase">
                        <UserCheck size={16} className="text-blue-500" /> {amendment.deputyName || 'Executivo Estadual'}
                    </div>
                </div>
              </div>
              <div className="text-right bg-slate-50 p-8 rounded-[32px] border border-slate-100 min-w-[280px] shadow-inner">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Montante do Processo</p>
                 <p className="text-4xl font-black text-[#0d457a] tracking-tighter">R$ {amendment.value.toLocaleString('pt-BR')}</p>
                 <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Emenda</span>
                    <span className="text-[10px] font-black text-[#0d457a] uppercase">{amendment.type}</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="p-10">
          {!isLocked && (currentUser.role === Role.ADMIN || currentUser.role === Role.OPERATOR) && (
            <div ref={tramitacaoRef} className="bg-[#0d457a] p-12 rounded-[48px] border-4 border-white shadow-xl mb-16 relative overflow-hidden group/mover no-print">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover/mover:scale-110 transition-transform duration-1000"><ArrowRightLeft size={160} /></div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-4 relative z-10">
                 <ArrowRightLeft size={24} className="text-emerald-400" /> Comando de Tramitação GESA
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                   <div>
                      <label className="text-[11px] font-black text-white/50 uppercase mb-4 block tracking-widest">Novo Estado do Processo</label>
                      <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-[28px] text-base font-black text-white outline-none focus:ring-4 ring-emerald-500/30 transition-all uppercase"
                      >
                        {statuses.map(s => <option key={s.id} value={s.name} className="text-[#0d457a]">{s.name}</option>)}
                      </select>
                   </div>

                   <div className="lg:col-span-2 relative">
                      <label className="text-[11px] font-black text-white/50 uppercase mb-4 block tracking-widest">Unidades Técnicas Destinatárias</label>
                      <div className="bg-white rounded-[28px] flex flex-wrap gap-2.5 p-4 min-h-[72px] shadow-inner">
                          {selectedDestinations.length === 0 && !sectorSearch && (
                            <span className="text-slate-300 font-bold uppercase text-xs flex items-center ml-2 italic">Selecione os setores para envio concomitante...</span>
                          )}
                          {selectedDestinations.map(dest => (
                               <span key={dest.id} className="bg-[#0d457a] text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                  {dest.name} 
                                  <button onClick={() => removeDestination(dest.id)} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"><X size={16}/></button>
                               </span>
                          ))}
                          <input 
                             type="text" 
                             className="flex-1 min-w-[180px] outline-none text-base font-black p-2 text-[#0d457a] uppercase placeholder:text-slate-200"
                             placeholder="BUSCAR SETOR..."
                             value={sectorSearch}
                             onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                             onFocus={() => setShowDestList(true)}
                          />
                      </div>
                      
                      {showDestList && sectorSearch && filteredDestSectors.length > 0 && (
                          <div className="absolute top-full left-0 w-full mt-4 bg-white rounded-[32px] shadow-2xl border border-slate-100 z-50 max-h-72 overflow-y-auto p-3 shadow-blue-900/10">
                              {filteredDestSectors.map(s => (
                                  <button key={s.id} onClick={() => addDestination(s)} className="w-full text-left px-6 py-4 hover:bg-slate-50 text-[12px] font-black text-[#0d457a] uppercase border-b border-slate-50 last:border-0 rounded-2xl transition-all flex justify-between items-center group">
                                      {s.name}
                                      <span className="text-[9px] text-slate-300 group-hover:text-blue-500 font-black">ADICIONAR +</span>
                                  </button>
                              ))}
                          </div>
                      )}
                   </div>
              </div>

              <div className="mt-8 flex flex-col md:flex-row gap-6 relative z-10">
                  <div className="flex-1">
                    <label className="text-[11px] font-black text-white/50 uppercase mb-4 block tracking-widest">Despacho de Encaminhamento</label>
                    <textarea 
                      className="w-full p-6 bg-white/10 border border-white/20 rounded-[32px] text-base font-medium text-white outline-none focus:ring-4 ring-emerald-500/30 h-24 resize-none"
                      placeholder="Insira as observações técnicas para este trâmite..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                  <div className="md:w-64 flex items-end">
                    <button onClick={handleMove} className="w-full bg-emerald-500 text-white px-10 py-8 rounded-[32px] font-black uppercase shadow-lg hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-4">
                        Efetivar <Send size={24}/>
                    </button>
                  </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
             <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-black text-[#0d457a] uppercase tracking-[0.4em] flex items-center gap-4">
                      <History size={20} className="text-blue-500" /> Trilha de Tramitação
                  </h3>
                </div>

                <div className="relative pl-12 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[3px] before:bg-slate-100">
                    {[...amendment.movements].reverse().map((m, idx) => {
                        const isCurrent = idx === 0 && !m.dateOut;
                        const slaInfo = getSlaStatus(m.deadline, m.dateOut);
                        const isExpanded = expandedMovementId === m.id || isGeneratingPdf;
                        
                        return (
                          <div key={m.id} className="relative animate-in slide-in-from-left-4 duration-500 pdf-avoid-break" style={{ transitionDelay: `${idx * 100}ms` }}>
                              <div className={`absolute -left-[44px] top-1.5 w-8 h-8 rounded-full border-[8px] border-white shadow-xl z-10 transition-all ${isCurrent ? 'bg-emerald-500 scale-150 animate-pulse' : 'bg-slate-200'}`} />
                              <div 
                                onClick={() => toggleMovementExpansion(m.id)}
                                className={`bg-white p-8 rounded-[40px] border shadow-sm transition-all cursor-pointer group/card ${isCurrent ? 'border-emerald-100 shadow-emerald-900/5 hover:border-emerald-200' : 'border-slate-100 hover:border-blue-200'}`}
                              >
                                  <div className="flex justify-between items-start mb-6">
                                     <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                          <h4 className="text-lg font-black text-[#0d457a] uppercase leading-tight">{m.toSector}</h4>
                                          <div className={`p-1.5 rounded-lg bg-slate-50 text-slate-300 group-hover/card:text-blue-500 transition-colors no-print`}>
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </div>
                                     </div>
                                     <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${slaInfo.color}`}>
                                        {slaInfo.label}
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-6 mb-4 pt-6 border-t border-slate-50">
                                      <div>
                                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Entrada / Responsável</p>
                                          <p className="text-[11px] font-black text-slate-600 uppercase flex items-center gap-2">
                                              <CalendarDays size={14} className="text-blue-500" /> {new Date(m.dateIn).toLocaleDateString()}
                                          </p>
                                          <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-2">
                                              <UserCheck size={14} /> {m.handledBy}
                                          </p>
                                      </div>
                                      <div>
                                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Prazo de Resposta (SLA)</p>
                                          <p className="text-[11px] font-black text-slate-600 uppercase flex items-center gap-2">
                                              <Clock size={14} className="text-amber-500" /> {new Date(m.deadline).toLocaleDateString()}
                                          </p>
                                      </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                       {m.remarks ? (
                                          <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 relative">
                                              <div className="flex items-center gap-2 mb-2 text-blue-400">
                                                <MessageSquare size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Despacho / Observações</span>
                                              </div>
                                              <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{m.remarks}"</p>
                                          </div>
                                       ) : (
                                          <div className="p-4 text-center border border-dashed border-slate-100 rounded-2xl">
                                             <p className="text-[10px] text-slate-300 font-bold uppercase">Sem observações detalhadas registradas</p>
                                          </div>
                                       )}
                                       
                                       <div className="pt-4 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                          <div className="flex items-center gap-2">
                                             <Building2 size={12} /> Origem: {m.fromSector || 'Início do Ciclo'}
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <Tag size={12} /> Categoria: {m.analysisType || 'Tramitação Geral'}
                                          </div>
                                       </div>
                                    </div>
                                  )}
                                  
                                  {!isExpanded && m.remarks && !isGeneratingPdf && (
                                    <p className="text-[10px] text-blue-400 font-bold uppercase mt-2 flex items-center gap-2 no-print animate-pulse">
                                       <Info size={12}/> Clique para ver despacho
                                    </p>
                                  )}
                              </div>
                          </div>
                        );
                    })}
                </div>
             </div>

             <div className="space-y-12">
                 <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm print:break-inside-avoid pdf-avoid-break">
                    <h3 className="text-[12px] font-black text-[#0d457a] uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                      <FileText size={20} className="text-[#0d457a]" /> Anexos e Documentos SEI
                    </h3>
                    <div className="space-y-4">
                       <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-white text-red-500 rounded-xl shadow-sm"><FileText size={20}/></div>
                             <div>
                                <p className="text-xs font-black text-[#0d457a] uppercase">Ofício de Solicitação.pdf</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">1.2 MB • Enviado em 02/03/2025</p>
                             </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-[#0d457a] transition-all" />
                       </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição Otimizado para Usabilidade Superior */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-md p-4">
          <div className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
            {/* Header do Modal */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0d457a] text-white rounded-2xl">
                     <Pencil size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Ajustar Registro</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Sincronização com Base de Dados Governamental</p>
                  </div>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} className="text-slate-400" />
               </button>
            </div>
            
            {/* Body do Modal com Layout 2 Colunas */}
            <form onSubmit={handleEditSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  
                  {/* Coluna 1: Dados Estruturais */}
                  <div className="space-y-8">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                          <Info size={16} className="text-blue-500" />
                          <h4 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest">Informações Gerais</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Número SEI / Protocolo</label>
                          <input 
                            type="text" 
                            value={editFormData.seiNumber}
                            onChange={(e) => setEditFormData({...editFormData, seiNumber: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/10 transition-all uppercase"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Valor do Processo (BRL)</label>
                          <div className="relative">
                            <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                              type="number" 
                              step="0.01"
                              value={editFormData.value}
                              onChange={(e) => setEditFormData({...editFormData, value: parseFloat(e.target.value)})}
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/10 transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tipo de Emenda</label>
                          <select 
                            value={editFormData.type}
                            onChange={(e) => setEditFormData({...editFormData, type: e.target.value as AmendmentType})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none focus:ring-4 ring-blue-500/10 transition-all uppercase text-xs"
                          >
                            {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                          <MapPin size={16} className="text-emerald-500" />
                          <h4 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest">Localização e Autoria</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Município Beneficiário</label>
                          <select 
                            value={editFormData.municipality}
                            onChange={(e) => setEditFormData({...editFormData, municipality: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none focus:ring-4 ring-blue-500/10 transition-all uppercase text-xs"
                          >
                            {GOIAS_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Deputado / Autor</label>
                          <select 
                            value={editFormData.deputyName}
                            onChange={(e) => setEditFormData({...editFormData, deputyName: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none focus:ring-4 ring-blue-500/10 transition-all uppercase text-xs"
                          >
                            <option value="Executivo Estadual">Executivo Estadual (Gabinete)</option>
                            {GOIAS_DEPUTIES.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                          </select>
                        </div>
                     </div>
                  </div>

                  {/* Coluna 2: Detalhamento e Regras de Negócio */}
                  <div className="space-y-8">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                          <MessageSquare size={16} className="text-amber-500" />
                          <h4 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest">Objeto e Finalidade</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descrição Detalhada do Objeto</label>
                          <textarea 
                            value={editFormData.object}
                            onChange={(e) => setEditFormData({...editFormData, object: e.target.value})}
                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none focus:ring-4 ring-blue-500/10 h-32 uppercase resize-none leading-relaxed text-xs"
                            required
                            placeholder="EX: AQUISIÇÃO DE AMBULÂNCIA TIPO A PARA O MUNICÍPIO DE..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Observações Internas (Não-público)</label>
                          <textarea 
                            value={editFormData.notes || ''}
                            onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none focus:ring-4 ring-blue-500/10 h-24 uppercase resize-none leading-relaxed text-xs"
                            placeholder="NOTAS TÉCNICAS RELEVANTES PARA A GESA..."
                          />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                          <Settings2 className="text-purple-500" size={16} />
                          <h4 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest">Parâmetros Técnicos</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ano Exercício</label>
                              <input 
                                type="number" 
                                value={editFormData.year}
                                onChange={(e) => setEditFormData({...editFormData, year: parseInt(e.target.value)})}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">GND</label>
                              <select 
                                value={editFormData.gnd}
                                onChange={(e) => setEditFormData({...editFormData, gnd: e.target.value as GNDType})}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none text-xs"
                              >
                                {Object.values(GNDType).map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-3">
                           <ShieldAlert size={18} className="text-blue-500 mt-1 shrink-0" />
                           <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed">
                              Alterações nestes campos serão registradas na trilha de auditoria.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </form>

            {/* Footer do Modal com Ações */}
            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-4 shrink-0">
               <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all"
               >
                  Cancelar
               </button>
               <button 
                  onClick={handleEditSubmit}
                  className="px-10 py-4 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all flex items-center gap-3"
               >
                  <Save size={18} /> Salvar Alterações
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
