
import React, { useState, useMemo, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
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
  const { notify } = useNotification();
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
      notify('error', 'Motor de PDF Indisponível', 'Aguarde o carregamento das bibliotecas de exportação.');
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
            {!isLocked && (
              <>
                <button 
                  onClick={() => { setEditFormData(amendment); setIsEditModalOpen(true); }}
                  className="flex-1 md:flex-none bg-white border border-slate-200 text-[#0d457a] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center justify-center gap-2"
                >
                  <Pencil size={16} /> Editar
                </button>
                <button 
                  onClick={() => tramitacaoRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 md:flex-none bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft size={16} /> Tramitar
                </button>
              </>
            )}
            <button 
              onClick={handleExportPDF} 
              disabled={isGeneratingPdf}
              className="flex-1 md:flex-none bg-[#0d457a] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center justify-center gap-2"
            >
                {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                PDF
            </button>
        </div>
      </div>
      
      {isLocked && (
        <div className="bg-emerald-600 p-6 rounded-[32px] border border-emerald-500 shadow-xl flex items-center gap-4 text-white animate-in slide-in-from-top-4 duration-500 no-print">
           <Lock size={24} className="shrink-0" />
           <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest">Processo Auditado</h4>
              <p className="text-[10px] font-bold text-emerald-100 uppercase mt-1">Status de liquidação atingido. Registro imutável.</p>
           </div>
        </div>
      )}

      <div id="amendment-detail-card" className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 lg:p-12 border-b-4 border-dashed" style={{ borderColor: `${statusColor}20` }}>
           <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border" 
                          style={{ color: statusColor, backgroundColor: `${statusColor}10`, borderColor: `${statusColor}30` }}>
                        {amendment.status}
                    </span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-[#0d457a] uppercase tracking-tighter leading-none break-all">{amendment.seiNumber}</h1>
                <p className="text-lg lg:text-xl font-bold text-slate-400 uppercase leading-tight">{amendment.object}</p>
                <div className="flex flex-wrap gap-4 lg:gap-6 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#0d457a] uppercase">
                        <MapPin size={14} className="text-emerald-500" /> {amendment.municipality}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                        <Calendar size={14} /> {amendment.year}
                    </div>
                </div>
              </div>
              <div className="w-full lg:w-auto text-center lg:text-right bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-inner">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Montante Consolidado</p>
                 <p className="text-3xl lg:text-4xl font-black text-[#0d457a] tracking-tighter">R$ {amendment.value.toLocaleString('pt-BR')}</p>
              </div>
           </div>
        </div>
        
        <div className="p-8 lg:p-12">
          {!isLocked && (currentUser.role === Role.ADMIN || currentUser.role === Role.OPERATOR) && (
            <div ref={tramitacaoRef} className="bg-[#0d457a] p-8 lg:p-12 rounded-[40px] border-4 border-white shadow-xl mb-12 relative overflow-hidden no-print">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                 <ArrowRightLeft size={20} className="text-emerald-400" /> Nova Tramitação
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                   <div>
                      <label className="text-[10px] font-black text-white/50 uppercase mb-3 block">Próximo Estado</label>
                      <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-[12px] font-black text-white outline-none focus:ring-4 ring-emerald-500/30 transition-all uppercase"
                      >
                        {statuses.map(s => <option key={s.id} value={s.name} className="text-[#0d457a]">{s.name}</option>)}
                      </select>
                   </div>

                   <div className="lg:col-span-2 relative">
                      <label className="text-[10px] font-black text-white/50 uppercase mb-3 block">Unidades de Destino</label>
                      <div className="bg-white rounded-2xl flex flex-wrap gap-2 p-3 min-h-[56px] shadow-inner">
                          {selectedDestinations.length === 0 && !sectorSearch && (
                            <span className="text-slate-300 font-bold uppercase text-[10px] flex items-center ml-2">Clique aqui para buscar setores...</span>
                          )}
                          {selectedDestinations.map(dest => (
                               <span key={dest.id} className="bg-[#0d457a] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                                  {dest.name} 
                                  <button onClick={() => removeDestination(dest.id)} className="p-1"><X size={14}/></button>
                               </span>
                          ))}
                          <input 
                             type="text" 
                             className="flex-1 min-w-[120px] outline-none text-[11px] font-black p-1 text-[#0d457a] uppercase placeholder:text-slate-200"
                             placeholder="BUSCAR..."
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
                                      <span className="text-[8px] text-blue-500 font-black">+</span>
                                  </button>
                              ))}
                          </div>
                      )}
                   </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-4 relative z-10">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-white/50 uppercase mb-3 block">Observações do Despacho</label>
                    <textarea 
                      className="w-full p-5 bg-white/10 border border-white/20 rounded-2xl text-[11px] font-medium text-white outline-none focus:ring-4 ring-emerald-500/30 h-24 resize-none"
                      placeholder="Detalhes para a próxima unidade técnica..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                  <div className="md:w-56 flex items-end">
                    <button onClick={handleMove} className="w-full bg-emerald-500 text-white px-8 py-5 rounded-2xl font-black uppercase text-[12px] shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                        Enviar <Send size={20}/>
                    </button>
                  </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
             <div className="space-y-8">
                <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                    <History size={18} className="text-blue-500" /> Trilha de Movimentos
                </h3>

                <div className="relative pl-10 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {[...amendment.movements].reverse().map((m, idx) => {
                        const isCurrent = idx === 0 && !m.dateOut;
                        const slaInfo = getSlaStatus(m.deadline, m.dateOut);
                        const isExpanded = expandedMovementId === m.id || isGeneratingPdf;
                        
                        return (
                          <div key={m.id} className="relative pdf-avoid-break">
                              <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-[6px] border-white shadow-md z-10 transition-all ${isCurrent ? 'bg-emerald-500 scale-125' : 'bg-slate-200'}`} />
                              <div 
                                onClick={() => toggleMovementExpansion(m.id)}
                                className={`bg-white p-6 lg:p-8 rounded-[32px] border shadow-sm cursor-pointer transition-all ${isCurrent ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100'}`}
                              >
                                  <div className="flex justify-between items-start gap-4">
                                     <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-black text-[#0d457a] uppercase leading-tight truncate">{m.toSector}</h4>
                                     </div>
                                     <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shrink-0 ${slaInfo.color}`}>
                                        {slaInfo.label}
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                                      <div>
                                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Entrada</p>
                                          <p className="text-[10px] font-black text-slate-600 uppercase">{new Date(m.dateIn).toLocaleDateString()}</p>
                                      </div>
                                      <div>
                                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Responsável</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{m.handledBy}</p>
                                      </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 animate-in fade-in duration-300">
                                       <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">
                                          {m.remarks || "Sem observações detalhadas registradas."}
                                       </p>
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
                      <FileText size={18} className="text-[#0d457a]" /> Repositório de Documentos
                    </h3>
                    <div className="space-y-3">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                             <FileText size={18} className="text-red-500"/>
                             <div>
                                <p className="text-[10px] font-black text-[#0d457a] uppercase">Ofício de Solicitação.pdf</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">1.2 MB</p>
                             </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300" />
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
               <button onClick={() => setIsEditModalOpen(false)} className="p-2"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  <div className="space-y-6">
                    <input 
                      type="text" 
                      value={editFormData.seiNumber}
                      onChange={(e) => setEditFormData({...editFormData, seiNumber: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none uppercase"
                      placeholder="NÚMERO SEI"
                    />
                    <input 
                      type="number" 
                      value={editFormData.value}
                      onChange={(e) => setEditFormData({...editFormData, value: parseFloat(e.target.value)})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none"
                      placeholder="VALOR"
                    />
                  </div>
                  <div className="space-y-6">
                    <textarea 
                      value={editFormData.object}
                      onChange={(e) => setEditFormData({...editFormData, object: e.target.value})}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 outline-none h-32 uppercase text-xs"
                      placeholder="OBJETO"
                    />
                  </div>
               </div>
               <button type="submit" className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-xl">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
