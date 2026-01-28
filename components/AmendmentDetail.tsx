
import React, { useState, useMemo, useCallback } from 'react';
import { Amendment, Status, User, Role, AIAnalysisResult, SectorConfig, AmendmentMovement, AnalysisType, SystemMode, GNDType } from '../types';
import { 
  ArrowLeft, Send, Sparkles, MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle2, FileText, Building2, HardHat, MonitorCheck, ShieldOff, 
  ShieldCheck, Printer, FileSearch, Lightbulb, Zap, XCircle, Search, ArrowRight, X, ChevronDown,
  Landmark, Layers, Plus, Trash2
} from 'lucide-react';
import { analyzeAmendment } from '../services/geminiService';

interface AmendmentDetailProps {
  amendment: Amendment;
  currentUser: User;
  sectors: SectorConfig[];
  systemMode: SystemMode;
  onBack: () => void;
  onMove: (movements: AmendmentMovement[]) => void;
  onStatusChange: (amendmentId: string, status: Status) => void;
  onDelete: (id: string) => void;
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
  
  // Lista de destinos selecionados para tramitação paralela
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<SectorConfig | null>(
    sectors.find(s => amendment.currentSector.split(' | ').includes(s.name)) || null
  );

  const [showDestList, setShowDestList] = useState(false);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const isInactive = amendment.status === Status.INACTIVE;

  const filteredDestSectors = useMemo(() => {
    const term = sectorSearch.toLowerCase();
    return sectors.filter(s => 
      s.name.toLowerCase().includes(term) && 
      (!selectedOrigin || s.name !== selectedOrigin.name) &&
      !selectedDestinations.some(d => d.id === s.id)
    );
  }, [sectors, sectorSearch, selectedOrigin, selectedDestinations]);

  const addDestination = (sector: SectorConfig) => {
    setSelectedDestinations(prev => [...prev, sector]);
    setSectorSearch('');
    setShowDestList(false);
  };

  const removeDestination = (id: string) => {
    setSelectedDestinations(prev => prev.filter(d => d.id !== id));
  };

  const handleMove = () => {
    if (selectedDestinations.length === 0 || !selectedOrigin) {
      alert("Selecione a origem e pelo menos um destino.");
      return;
    }

    const newMovements: AmendmentMovement[] = selectedDestinations.map(dest => {
      const dateIn = new Date().toISOString();
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + dest.defaultSlaDays);

      return {
        id: Math.random().toString(36).substr(2, 9),
        amendmentId: amendment.id,
        fromSector: selectedOrigin.name,
        toSector: dest.name,
        dateIn,
        dateOut: null,
        deadline: deadline.toISOString(),
        daysSpent: 0,
        handledBy: currentUser.name,
        analysisType: dest.analysisType
      };
    });

    onMove(newMovements);
    setSelectedDestinations([]);
    setSectorSearch('');
    setShowDestList(false);
  };

  const handleDelete = useCallback(() => {
    const confirmed = window.confirm(`CONFIRMAÇÃO DE ARQUIVAMENTO PERMANENTE:\n\nProcesso SEI: ${amendment.seiNumber}\n\nEsta ação é IRREVERSÍVEL para fins de auditoria. O processo será movido para o arquivo morto e não poderá mais ser tramitado.\n\nConfirma a inativação?`);
    if (confirmed) {
      onDelete(amendment.id);
      // A chamada onBack() foi removida para evitar race conditions e permitir que o usuário veja o resultado da ação na tela.
    }
  }, [amendment.id, amendment.seiNumber, onDelete]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const result = await analyzeAmendment(amendment);
      setAiResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const canEdit = currentUser.role === Role.ADMIN || currentUser.role === Role.OPERATOR;

  const getStatusStyle = (status: Status) => {
    switch(status) {
      case Status.CONCLUDED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case Status.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-100';
      case Status.FORWARDING: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case Status.CONSOLIDATION: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case Status.INACTIVE: return 'bg-slate-800 text-white border-slate-900';
      case Status.DILIGENCE: return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-blue-50 text-[#0d457a] border-blue-100';
    }
  };

  return (
    <div className={`space-y-6 ${isInactive ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#0d457a] transition-colors font-bold uppercase text-xs">
          <ArrowLeft size={18} /> Voltar à Lista
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase hover:bg-slate-50 shadow-sm"
          >
            <Printer size={16} /> Imprimir Protocolo
          </button>
          {!isInactive && canEdit && (
            <button 
              onClick={handleDelete} 
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 border border-red-100 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase shadow-sm"
            >
              <ShieldOff size={16} /> Inativar Registro
            </button>
          )}
        </div>
      </div>

      <div id="protocol-content" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-6 bg-slate-50/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-black text-[#0d457a] tracking-tighter uppercase">{amendment.seiNumber}</h2>
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${getStatusStyle(amendment.status)}`}>
                {amendment.status}
              </span>
            </div>
            <p className="text-slate-500 font-medium text-lg italic leading-tight">"{amendment.object}"</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Montante do Recurso</p>
            <p className={`text-3xl font-black ${amendment.type.includes('Impositiva') ? 'text-blue-600' : 'text-indigo-600'}`}>
              R$ {amendment.value.toLocaleString('pt-BR')}
            </p>
            <div className="flex flex-col items-end mt-1">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{amendment.type}</p>
               {amendment.gnd && <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-0.5">{amendment.gnd}</p>}
            </div>
          </div>
        </div>

        <div className="p-8">
          {!isInactive && canEdit && (
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner mb-10 print:hidden">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="font-black text-[#0d457a] uppercase text-sm flex items-center gap-2">
                   <Send size={18} /> Painel de Tramitação Múltipla (Paralela)
                 </h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-start gap-6 lg:gap-10">
                <div className="space-y-2 relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Setor de Origem</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    <select
                        className="w-full pl-12 pr-10 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-slate-400 transition-all font-bold text-slate-700 uppercase text-sm appearance-none"
                        value={selectedOrigin?.id || ''}
                        onChange={(e) => {
                            const sector = sectors.find(s => s.id === e.target.value);
                            setSelectedOrigin(sector || null);
                        }}
                    >
                        <option value="" disabled>Selecione um setor de origem...</option>
                        {sectors.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                  </div>
                </div>

                <div className="flex lg:flex-col items-center justify-center gap-2 pt-6 lg:pt-8">
                   <div className="h-px lg:h-8 w-10 lg:w-px bg-slate-200"></div>
                   <div className="bg-[#0d457a] p-2 rounded-full text-white shadow-lg">
                      <ArrowRight size={20} className="hidden lg:block" />
                      <ChevronDown size={20} className="lg:hidden" />
                   </div>
                   <div className="h-px lg:h-8 w-10 lg:w-px bg-slate-200"></div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 relative">
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 ml-2">Destinos Selecionados</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Pesquisar e adicionar setor..."
                        className="w-full pl-12 pr-10 py-4 bg-white border-2 border-blue-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-blue-900 uppercase text-sm"
                        value={sectorSearch}
                        onFocus={() => setShowDestList(true)}
                        onChange={(e) => setSectorSearch(e.target.value)}
                      />
                      <ChevronDown className="absolute right-4 top-4 text-blue-300" size={20} />

                      {showDestList && (
                        <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden max-h-60 overflow-y-auto">
                          {filteredDestSectors.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => addDestination(s)}
                              className="w-full text-left p-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 flex justify-between items-center group"
                            >
                              <div>
                                 <p className="text-sm font-black text-blue-900 uppercase">{s.name}</p>
                                 <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{s.analysisType}</p>
                              </div>
                              <span className="text-[10px] bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-100 font-black">SLA: {s.defaultSlaDays}D</span>
                            </button>
                          ))}
                          {filteredDestSectors.length === 0 && (
                            <div className="p-4 text-center text-xs text-slate-400">Nenhum setor disponível</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de chips de destinos */}
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {selectedDestinations.map(dest => (
                      <div key={dest.id} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl animate-in fade-in zoom-in duration-200">
                        <span className="text-[10px] font-black uppercase">{dest.name}</span>
                        <button type="button" onClick={() => removeDestination(dest.id)} className="hover:text-red-200 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {selectedDestinations.length === 0 && (
                      <p className="text-[10px] text-slate-400 font-bold italic uppercase mt-2 ml-2">Nenhum destino selecionado</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button 
                  disabled={selectedDestinations.length === 0 || !selectedOrigin}
                  onClick={handleMove}
                  className="bg-[#0d457a] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-2xl hover:bg-[#0a365f] disabled:opacity-30 transition-all flex items-center gap-3"
                >
                  Tramitar para {selectedDestinations.length} setor(es) <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2">
                   <Clock size={16} /> Histórico de Tramitação SEI
                </h3>
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   {amendment.movements.map((m, idx) => (
                     <div key={m.id} className="relative">
                        <div className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 ${idx === amendment.movements.length - 1 ? 'bg-[#0d457a]' : 'bg-slate-200'}`} />
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(m.dateIn).toLocaleDateString()} às {new Date(m.dateIn).toLocaleTimeString()}</p>
                              {m.deadline && (
                                <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${new Date(m.deadline) < new Date() && !m.dateOut ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {m.dateOut ? 'Finalizado' : `Até ${new Date(m.deadline).toLocaleDateString()}`}
                                </span>
                              )}
                           </div>
                           <p className="text-xs font-black text-[#0d457a] uppercase mb-1">{m.toSector}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase">Responsável: {m.handledBy}</p>
                           {m.fromSector && <p className="text-[9px] text-slate-400 font-medium uppercase mt-1">Origem: {m.fromSector}</p>}
                        </div>
                     </div>
                   )).reverse()}
                </div>
             </div>

             <div className="space-y-8">
                <div className="bg-[#0d457a] text-white p-8 rounded-[40px] shadow-2xl space-y-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform">
                      <Zap size={120} />
                   </div>
                   <div className="flex items-center gap-3">
                      <Sparkles className="text-amber-400" size={24} />
                      <h3 className="text-xl font-black uppercase tracking-tighter">Análise Preditiva GESA</h3>
                   </div>
                   
                   {!aiResult && !isAiLoading ? (
                     <div className="space-y-4">
                        <p className="text-sm font-medium opacity-80 leading-relaxed">Utilize o Gemini para analisar o fluxo deste processo e identificar possíveis gargalos técnicos ou orçamentários.</p>
                        <button 
                          onClick={runAiAnalysis}
                          className="w-full py-4 bg-white text-[#0d457a] rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                        >
                           <Lightbulb size={18} /> Iniciar Auditoria IA
                        </button>
                     </div>
                   ) : isAiLoading ? (
                     <div className="py-10 flex flex-col items-center justify-center gap-4">
                        <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Processando Trilha SEI...</p>
                     </div>
                   ) : (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Diagnóstico</p>
                           <p className="text-sm font-bold leading-relaxed">{aiResult?.summary}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Ponto Crítico</p>
                           <p className="text-sm font-bold leading-relaxed">{aiResult?.bottleneck}</p>
                        </div>
                        <div className="bg-white/10 p-5 rounded-3xl border border-white/10">
                           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Ação Recomendada</p>
                           <p className="text-xs font-bold leading-relaxed italic">"{aiResult?.recommendation}"</p>
                        </div>
                        <button onClick={() => setAiResult(null)} className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors">Nova Consulta</button>
                     </div>
                   )}
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                   <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2">
                      <Building2 size={16} /> Dados Consolidados
                   </h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Município</p>
                         <div className="flex items-center gap-2 text-slate-700">
                            <MapPin size={14} className="text-blue-500" />
                            <span className="text-sm font-black uppercase tracking-tight">{amendment.municipality}</span>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Parlamentar</p>
                         <div className="flex items-center gap-2 text-slate-700">
                            <Landmark size={14} className="text-[#0d457a]" />
                            <span className="text-sm font-black uppercase tracking-tight">{amendment.deputyName || 'Execução Direta'}</span>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GND (Modalidade)</p>
                         <div className="flex items-center gap-2 text-slate-700">
                            <Layers size={14} className="text-blue-600" />
                            <span className="text-sm font-black uppercase tracking-tight">{amendment.gnd || 'Não informado'}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
