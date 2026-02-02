
/**
 * COMPONENTE DE DETALHES DO PROCESSO (EMENDA)
 * 
 * Este componente exibe uma visão completa e aprofundada de um único processo SEI.
 * Ele é o núcleo para a tramitação e análise individual.
 * Atualizado para exibir o rastreamento histórico detalhado de movimentações.
 */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Amendment, Status, User, Role, SectorConfig, AmendmentMovement, AnalysisType, SystemMode, GNDType } from '../types';
import { 
  ArrowLeft, Send, MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle2, FileText, Building2, ShieldOff, 
  ShieldCheck, Printer, FileSearch, Zap, XCircle, Search, ArrowRight, X, ChevronDown,
  Landmark, Layers, Plus, Trash2, User as UserIcon, DollarSign, MessageSquare, ArrowRightLeft, FastForward, Upload, FileUp, AlertCircle, Tag, Lock,
  History, CalendarDays, UserCheck, Sparkles, TrendingUp, BarChart3
} from 'lucide-react';

interface AmendmentDetailProps {
  amendment: Amendment;
  currentUser: User;
  sectors: SectorConfig[];
  systemMode: SystemMode;
  onBack: () => void;
  onMove: (movements: AmendmentMovement[], newStatus: Status) => void;
  onStatusChange: (amendmentId: string, status: Status) => void;
  onDelete: (id: string, justification: string) => void;
}

export const AmendmentDetail: React.FC<AmendmentDetailProps> = ({ 
  amendment, 
  currentUser, 
  sectors,
  systemMode,
  onBack, 
  onMove, 
  onStatusChange,
  onDelete
}) => {
  const [sectorSearch, setSectorSearch] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [newStatus, setNewStatus] = useState<Status>(amendment.status);
  const [remarks, setRemarks] = useState('');
  const [showDestList, setShowDestList] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveJustification, setArchiveJustification] = useState('');
  const tramitacaoRef = useRef<HTMLDivElement>(null);

  const isInactive = amendment.status === Status.ARCHIVED;
  const isLiquidated = amendment.status === Status.CONCLUDED;

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
    if (isLiquidated) return;
    if (selectedDestinations.length === 0) {
      alert("Selecione pelo menos um setor de destino para tramitar.");
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

  const confirmArchive = () => {
    if (isLiquidated) return;
    if (!archiveJustification.trim()) {
      alert("A justificativa é obrigatória para o arquivamento.");
      return;
    }
    onDelete(amendment.id, archiveJustification);
    setIsArchiveModalOpen(false);
  };

  const scrollToTramitacao = () => {
    tramitacaoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const statusStyle = useMemo(() => {
    switch (amendment.status) {
      case Status.CONCLUDED: return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 };
      case Status.IN_PROGRESS: return { bg: 'bg-blue-50', text: 'text-blue-600', icon: Clock };
      case Status.DILIGENCE: return { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertTriangle };
      case Status.REJECTED: return { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle };
      case Status.ARCHIVED: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: FileSearch };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', icon: FileText };
    }
  }, [amendment.status]);

  const StatusIcon = statusStyle.icon;

  const movementsList = useMemo(() => {
    return Array.isArray(amendment.movements) ? [...amendment.movements] : [];
  }, [amendment.movements]);

  return (
    <div className={`space-y-6 ${isInactive ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-[#0d457a] transition-all uppercase tracking-widest">
            <ArrowLeft size={18} /> Voltar para a Fila
        </button>
        <div className="flex items-center gap-3">
            {!isLiquidated && (
              <button 
                onClick={scrollToTramitacao}
                className="flex items-center gap-3 bg-emerald-500 text-white px-6 py-2.5 rounded-2xl hover:bg-emerald-600 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg animate-pulse hover:animate-none"
              >
                  <ArrowRightLeft size={18} /> Tramitar Agora
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center gap-2 bg-white text-[#0d457a] border border-slate-200 px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Printer size={16} /> Imprimir
            </button>
            {!isInactive && !isLiquidated && (currentUser.role === Role.ADMIN || currentUser.role === Role.OPERATOR) && (
                <button onClick={() => setIsArchiveModalOpen(true)} className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2.5 rounded-2xl hover:bg-red-100 transition-all text-[10px] font-black uppercase tracking-widest border border-red-100">
                    <XCircle size={16} /> Arquivar
                </button>
            )}
        </div>
      </div>
      
      {isLiquidated && (
        <div className="bg-emerald-600 p-6 rounded-[32px] border border-emerald-500 shadow-xl flex items-center gap-5 text-white animate-in slide-in-from-top-4 duration-500">
           <div className="p-4 bg-white/10 rounded-2xl">
              <Lock size={32} />
           </div>
           <div>
              <h4 className="text-sm font-black uppercase tracking-widest">Processo Finalizado e Imutável</h4>
              <p className="text-[10px] font-bold text-emerald-100 uppercase mt-1">Este registro foi Liquidado/Pago e não permite mais alterações de dados ou tramitações técnicas.</p>
           </div>
        </div>
      )}

      <div id="protocol-content" className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden">
        <div className={`p-10 border-b-4 ${statusStyle.bg.replace('50', '100')} border-dashed`}>
           <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${statusStyle.bg} ${statusStyle.text} border border-current/20`}>
                        <StatusIcon size={14} /> {amendment.status}
                    </span>
                    {amendment.suinfra && <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black uppercase border border-orange-200">Engenharia</span>}
                    {amendment.sutis && <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-[10px] font-black uppercase border border-purple-200">TI</span>}
                </div>
                <div>
                  <h1 className="text-5xl font-black text-[#0d457a] uppercase tracking-tighter leading-none mb-2">{amendment.seiNumber}</h1>
                  <p className="text-xl font-bold text-slate-400 uppercase max-w-2xl leading-tight">{amendment.object}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Valor Consolidado</p>
                 <p className="text-4xl font-black text-[#0d457a] mt-1 tracking-tighter">R$ {amendment.value.toLocaleString('pt-BR')}</p>
                 <div className="flex justify-end gap-2 mt-3">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase">{amendment.transferMode || 'Repasse Direto'}</span>
                    <span className="px-3 py-1 bg-blue-50 text-[#0d457a] border border-blue-100 rounded-lg text-[9px] font-black uppercase">{amendment.gnd || 'GND 3'}</span>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-12 pt-10 border-t border-dashed border-slate-200">
              <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><MapPin size={16} className="text-emerald-500"/> Beneficiário</p>
                 <p className="text-base font-black text-[#0d457a] uppercase leading-tight">{amendment.municipality}</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><UserIcon size={16} className="text-blue-500"/> Autor/Origem</p>
                 <p className="text-base font-black text-[#0d457a] uppercase leading-tight">{amendment.deputyName || 'Executivo Estadual'}</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><Landmark size={16} className="text-amber-500"/> Programa</p>
                 <p className="text-base font-black text-[#0d457a] uppercase leading-tight">{amendment.type}</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><Calendar size={16} className="text-purple-500"/> Exercício</p>
                 <p className="text-base font-black text-[#0d457a] uppercase leading-tight">{amendment.year}</p>
              </div>
           </div>
        </div>
        
        <div className="p-10">
          {!isInactive && !isLiquidated && (currentUser.role === Role.ADMIN || currentUser.role === Role.OPERATOR) && (
            <div ref={tramitacaoRef} className="bg-[#0d457a] p-12 rounded-[48px] border-4 border-white shadow-[0_35_60px_-15px_rgba(13,69,122,0.3)] mb-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-4 relative z-10">
                 <div className="p-3 bg-white text-[#0d457a] rounded-2xl shadow-xl"><ArrowRightLeft size={24} /></div>
                 Centro de Comando de Tramitação Institucional
              </h3>
              
              <div className="space-y-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                   <div className="w-full lg:w-1/4">
                      <label className="text-[11px] font-black text-white/50 uppercase mb-4 block tracking-[0.2em]">Setor de Origem</label>
                      <div className="px-6 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[28px] text-base font-black text-white flex items-center gap-4 shadow-inner group-hover:bg-white/15 transition-all">
                          <Building2 size={24} className="text-emerald-400"/>
                          {amendment.currentSector}
                      </div>
                   </div>
                   
                   <div className="w-full lg:w-1/4">
                      <label className="text-[11px] font-black text-white/50 uppercase mb-4 block tracking-[0.2em]">Novo Status</label>
                      <div className="relative">
                        <Tag size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
                        <select 
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as Status)}
                          className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[28px] text-base font-black text-white outline-none focus:ring-4 ring-emerald-500/30 transition-all appearance-none cursor-pointer uppercase"
                        >
                          {Object.values(Status).map(s => <option key={s} value={s} className="text-[#0d457a] font-bold">{s}</option>)}
                        </select>
                        <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                      </div>
                   </div>

                   <div className="flex-1 w-full relative">
                      <label className="text-[11px] font-black text-white/50 uppercase mb-4 block tracking-[0.2em]">Destinos Técnicos</label>
                      <div className="bg-white rounded-[28px] flex flex-wrap gap-2.5 p-4 min-h-[72px] shadow-2xl focus-within:ring-4 ring-emerald-500/30 transition-all">
                          {selectedDestinations.length === 0 && !sectorSearch && (
                             <div className="absolute inset-0 flex items-center px-6 pointer-events-none text-slate-300 font-bold uppercase text-xs tracking-widest">
                                Digite para buscar setores...
                             </div>
                          )}
                          {selectedDestinations.map(dest => (
                               <span key={dest.id} className="bg-[#0d457a] text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase flex items-center gap-3 animate-in zoom-in-95 shadow-lg">
                                  {dest.name} 
                                  <button onClick={() => removeDestination(dest.id)} className="hover:text-red-300 transition-colors p-1 bg-white/10 rounded-lg"><X size={16}/></button>
                               </span>
                          ))}
                          <input 
                             type="text" 
                             className="flex-1 min-w-[150px] outline-none text-base font-black p-2 placeholder:text-slate-200 text-[#0d457a] uppercase"
                             value={sectorSearch}
                             onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                             onFocus={() => setShowDestList(true)}
                          />
                      </div>
                      
                      {showDestList && sectorSearch && filteredDestSectors.length > 0 && (
                          <div className="absolute top-full left-0 w-full mt-4 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 z-50 max-h-72 overflow-y-auto p-3 animate-in slide-in-from-top-4">
                              {filteredDestSectors.map(s => (
                                  <button key={s.id} onClick={() => addDestination(s)} className="w-full text-left px-6 py-4 hover:bg-slate-50 text-[12px] font-black text-[#0d457a] uppercase border-b border-slate-50 last:border-0 rounded-2xl transition-all flex justify-between items-center group/btn">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0d457a] group-hover/btn:bg-[#0d457a] group-hover/btn:text-white transition-all"><Building2 size={16}/></div>
                                          {s.name}
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <span className="text-[10px] text-slate-300 font-bold bg-slate-50 px-3 py-1 rounded-full uppercase">SLA: {s.defaultSlaDays} dias</span>
                                          <Plus size={20} className="text-emerald-500 opacity-0 group-hover/btn:opacity-100 translate-x-4 group-hover/btn:translate-x-0 transition-all"/>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      )}
                   </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <label className="text-[11px] font-black text-white/50 uppercase mb-4 block tracking-[0.2em]">Despacho Administrativo</label>
                        <textarea 
                           className="w-full p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] text-base font-medium text-white outline-none focus:ring-4 ring-emerald-500/30 transition-all min-h-[120px] shadow-inner placeholder:text-white/20"
                           placeholder="Insira as orientações técnicas para as próximas etapas..."
                           value={remarks}
                           onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                    <div className="lg:w-1/4 flex items-end">
                        <button 
                          onClick={handleMove} 
                          disabled={selectedDestinations.length === 0}
                          className="w-full bg-emerald-500 text-white px-10 py-6 rounded-[32px] font-black uppercase text-sm shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] hover:bg-emerald-600 transition-all hover:-translate-y-2 active:translate-y-0 flex items-center justify-center gap-4 group/submit disabled:opacity-30 disabled:grayscale disabled:hover:translate-y-0"
                        >
                            Confirmar Trâmite <Send size={24} className="group-hover/submit:translate-x-2 transition-transform"/>
                        </button>
                    </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
             <div className="space-y-10">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-[12px] font-black text-[#0d457a] uppercase tracking-[0.4em] flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0d457a] shadow-sm"><History size={20} /></div>
                       Histórico de Tramitação
                   </h3>
                   <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                      <CalendarDays size={14} className="text-slate-400"/>
                      <span className="text-[10px] font-black text-slate-500 uppercase">Auditado em Tempo Real</span>
                   </div>
                </div>

                <div className="relative pl-12 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[3px] before:bg-slate-100">
                    {movementsList.length > 0 ? [...movementsList].reverse().map((m, idx) => {
                        const isCurrent = idx === 0 && !m.dateOut;
                        return (
                          <div key={m.id} className="relative group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                              <div className={`absolute -left-[44px] top-1.5 w-8 h-8 rounded-full border-[8px] border-white shadow-xl z-10 transition-all duration-700 ${isCurrent ? 'bg-emerald-500 scale-150 animate-pulse' : 'bg-slate-200 group-hover:bg-[#0d457a]'}`} />
                              <div className={`bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 group-hover:border-[#0d457a]/20 ${isCurrent ? 'ring-2 ring-emerald-500/20' : ''}`}>
                                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                                      <div>
                                          <div className="flex items-center gap-2 mb-2">
                                             <Building2 size={16} className="text-slate-300" />
                                             <h4 className="text-base font-black text-[#0d457a] uppercase tracking-tight leading-none">{m.toSector}</h4>
                                          </div>
                                          <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                             <span className="flex items-center gap-1.5"><Clock size={12} className="text-emerald-500"/> Entrada: {new Date(m.dateIn).toLocaleString('pt-BR')}</span>
                                             {m.dateOut && (
                                               <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-blue-500"/> Saída: {new Date(m.dateOut).toLocaleString('pt-BR')}</span>
                                             )}
                                          </div>
                                      </div>
                                      <div className="flex shrink-0">
                                        {m.deadline && !m.dateOut && (
                                            <span className={`text-[10px] px-4 py-1.5 rounded-xl font-black uppercase shadow-sm ${new Date(m.deadline) < new Date() ? 'bg-red-500 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                {`Limite SLA: ${new Date(m.deadline).toLocaleDateString()}`}
                                            </span>
                                        )}
                                        {m.dateOut && (
                                          <span className="text-[10px] px-4 py-1.5 rounded-xl font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">
                                             Concluído em Setor
                                          </span>
                                        )}
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-[#0d457a]/5 transition-colors">
                                             <UserCheck size={18} className="group-hover:text-[#0d457a] transition-colors"/>
                                          </div>
                                          <div>
                                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Responsável</p>
                                             <p className="text-[11px] font-black text-[#0d457a] uppercase">{m.handledBy}</p>
                                          </div>
                                      </div>
                                      
                                      {m.analysisType && (
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-2xl bg-blue-50/50 flex items-center justify-center text-[#0d457a] shadow-inner group-hover:bg-[#0d457a] group-hover:text-white transition-all">
                                                 <Layers size={18} />
                                              </div>
                                              <div>
                                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Tipo de Análise</p>
                                                 <p className="text-[11px] font-black text-blue-600 uppercase">{m.analysisType}</p>
                                              </div>
                                          </div>
                                      )}
                                  </div>

                                  {m.remarks && (
                                    <div className="mt-6 p-5 bg-slate-50 rounded-[24px] border border-slate-100 relative overflow-hidden group/remarks">
                                      <div className="absolute top-0 left-0 w-1 h-full bg-[#0d457a]/20 group-hover/remarks:bg-[#0d457a] transition-all" />
                                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                                         <MessageSquare size={12} /> Despacho Técnico
                                      </p>
                                      <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">
                                        "{m.remarks}"
                                      </p>
                                    </div>
                                  )}
                              </div>
                          </div>
                        );
                    }) : (
                      <div className="bg-slate-50 p-12 rounded-[40px] border-4 border-dashed border-slate-100 text-center">
                        <History size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest leading-relaxed">
                          Nenhum registro de movimentação <br/> localizado para este protocolo.
                        </p>
                      </div>
                    )}
                </div>
             </div>

             <div className="space-y-12">
                {/* Insights de IA (Google Gemini) */}
                <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700"><Sparkles size={120}/></div>
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-[12px] font-black text-[#0d457a] uppercase tracking-[0.4em] flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm"><Sparkles size={20} /></div>
                           Análise Preditiva GESA-IA
                        </h3>
                        {amendment.aiInsights && (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-100">Score Confiável</span>
                        )}
                    </div>

                    {amendment.aiInsights ? (
                      <div className="space-y-8 animate-in zoom-in-95 duration-500">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <TrendingUp size={14} className="text-blue-500"/> Risco de Atraso
                               </p>
                               <div className="flex items-end gap-2">
                                  <p className="text-3xl font-black text-[#0d457a] tracking-tighter">{amendment.aiInsights.riskScore}%</p>
                                  <span className={`text-[10px] font-bold mb-1 uppercase ${amendment.aiInsights.riskScore > 60 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {amendment.aiInsights.riskScore > 60 ? 'Crítico' : 'Sob Controle'}
                                  </span>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <CheckCircle2 size={14} className="text-emerald-500"/> Prob. Liquidação
                               </p>
                               <div className="flex items-end gap-2">
                                  <p className="text-3xl font-black text-[#0d457a] tracking-tighter">{(amendment.aiInsights.completionProbability * 100).toFixed(0)}%</p>
                                  <span className="text-[10px] font-bold mb-1 text-slate-400 uppercase">Exercício Atual</span>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100/50">
                               <h4 className="text-[10px] font-black text-[#0d457a] uppercase mb-2 tracking-widest">Resumo Estratégico</h4>
                               <p className="text-xs text-slate-600 leading-relaxed font-medium">{amendment.aiInsights.summary}</p>
                            </div>
                            <div className="p-6 bg-amber-50/50 rounded-[32px] border border-amber-100/50">
                               <h4 className="text-[10px] font-black text-[#0d457a] uppercase mb-2 tracking-widest flex items-center gap-2">
                                  <AlertCircle size={14} className="text-amber-500"/> Gargalo Identificado
                               </h4>
                               <p className="text-xs text-slate-600 leading-relaxed font-bold italic">"{amendment.aiInsights.bottleneck}"</p>
                            </div>
                            <div className="p-6 bg-[#0d457a] rounded-[32px] text-white shadow-xl shadow-blue-900/20">
                               <h4 className="text-[10px] font-black text-white/50 uppercase mb-3 tracking-widest flex items-center gap-2">
                                  <Zap size={14} className="text-yellow-400"/> Recomendação Técnica
                               </h4>
                               <p className="text-xs font-bold leading-relaxed">{amendment.aiInsights.recommendation}</p>
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-100">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                            <Sparkles size={24} className="text-purple-400" />
                         </div>
                         <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest leading-relaxed">
                           Aguardando processamento de IA... <br/> A análise automática será gerada no próximo trâmite.
                         </p>
                      </div>
                    )}
                </div>

                {/* Notas e Observações Adicionais */}
                <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                   <h3 className="text-[12px] font-black text-[#0d457a] uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><FileText size={20} /></div>
                       Notas da Pasta Orçamentária
                   </h3>
                   <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Observações Administrativas</p>
                         <p className="text-xs text-slate-600 leading-relaxed italic">
                           {amendment.notes || 'Nenhuma observação complementar registrada para este processo.'}
                         </p>
                      </div>
                      <div className="flex gap-4">
                         <div className="flex-1 p-5 bg-white border border-slate-100 rounded-[28px] flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl"><Calendar size={20}/></div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Criado em</p>
                               <p className="text-xs font-black text-[#0d457a]">{new Date(amendment.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="flex-1 p-5 bg-white border border-slate-100 rounded-[28px] flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><BarChart3 size={20}/></div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Passos Totais</p>
                               <p className="text-xs font-black text-[#0d457a]">{movementsList.length} Trâmites</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal de Justificativa de Arquivamento */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-red-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-red-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Confirmar Arquivamento</h3>
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">Operação Irreversível - GESA Cloud</p>
               </div>
               <button onClick={() => setIsArchiveModalOpen(false)} className="p-3 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl transition-all">
                  <X size={24} />
               </button>
            </div>
            <div className="p-10 space-y-8">
               <div className="bg-red-50 p-6 rounded-[24px] border border-red-100 flex gap-4 items-start">
                  <AlertTriangle className="text-red-500 shrink-0" size={24} />
                  <p className="text-xs text-red-800 font-bold leading-relaxed uppercase tracking-tight">
                    Ao arquivar este processo, ele sairá da fila ativa de tramitação e será marcado como inativo na base de dados governamental.
                  </p>
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Justificativa Legal / Técnica</label>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[28px] text-sm font-bold text-[#0d457a] outline-none focus:ring-4 ring-red-500/10 min-h-[150px] transition-all"
                    placeholder="Descreva o motivo formal do arquivamento deste processo SEI..."
                    value={archiveJustification}
                    onChange={(e) => setArchiveJustification(e.target.value)}
                  />
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setIsArchiveModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                    Cancelar
                  </button>
                  <button onClick={confirmArchive} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-900/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3">
                    Efetivar Arquivo <Trash2 size={18} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
