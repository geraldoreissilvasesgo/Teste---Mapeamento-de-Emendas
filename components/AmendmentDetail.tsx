
import React, { useState, useMemo } from 'react';
import { Amendment, Status, User, Role, AIAnalysisResult, SectorConfig, AmendmentMovement, AnalysisType, SystemMode } from '../types';
import { 
  ArrowLeft, Send, Sparkles, MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle, FileText, Building2, HardHat, MonitorCheck, ShieldOff, 
  ShieldCheck, Printer, FileSearch, Lightbulb, Zap, XCircle, Search, ArrowRight, X, ChevronDown
} from 'lucide-react';
import { analyzeAmendment } from '../services/geminiService';

interface AmendmentDetailProps {
  amendment: Amendment;
  currentUser: User;
  sectors: SectorConfig[];
  // Added systemMode to fix the error in App.tsx
  systemMode: SystemMode;
  onBack: () => void;
  onMove: (movement: AmendmentMovement) => void;
  onStatusChange: (amendmentId: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export const AmendmentDetail: React.FC<AmendmentDetailProps> = ({ 
  amendment, 
  currentUser, 
  sectors,
  // Included systemMode in destructuring
  systemMode,
  onBack, 
  onMove, 
  onStatusChange,
  onDelete
}) => {
  const [sectorSearch, setSectorSearch] = useState('');
  const [originSearch, setOriginSearch] = useState('');
  
  const [selectedDestination, setSelectedDestination] = useState<SectorConfig | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<SectorConfig | null>(
    sectors.find(s => s.name === amendment.currentSector) || null
  );

  const [showOriginList, setShowOriginList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const isInactive = amendment.status === Status.INACTIVE;

  const filteredDestSectors = useMemo(() => {
    const term = sectorSearch.toLowerCase();
    return sectors.filter(s => 
      s.name.toLowerCase().includes(term) && s.name !== (selectedOrigin?.name || amendment.currentSector)
    );
  }, [sectors, sectorSearch, selectedOrigin, amendment.currentSector]);

  const filteredOriginSectors = useMemo(() => {
    const term = originSearch.toLowerCase();
    return sectors.filter(s => s.name.toLowerCase().includes(term));
  }, [sectors, originSearch]);

  const handleMove = () => {
    if (!selectedDestination || !selectedOrigin) return;

    const dateIn = new Date().toISOString();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + selectedDestination.defaultSlaDays);

    const movement: AmendmentMovement = {
      id: Math.random().toString(36).substr(2, 9),
      amendmentId: amendment.id,
      fromSector: selectedOrigin.name,
      toSector: selectedDestination.name,
      dateIn,
      dateOut: null,
      deadline: deadline.toISOString(),
      daysSpent: 0,
      handledBy: currentUser.name,
      analysisType: selectedDestination.analysisType
    };

    onMove(movement);
    setSelectedDestination(null);
    setSectorSearch('');
    setShowDestList(false);
    setShowOriginList(false);
  };

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

  return (
    <div className={`space-y-6 ${isInactive ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#0d457a] transition-colors font-bold uppercase text-xs">
          <ArrowLeft size={18} /> Voltar à Lista
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase hover:bg-slate-50">
            <Printer size={16} /> Imprimir Protocolo
          </button>
          {!isInactive && currentUser.role !== Role.VIEWER && (
            <button onClick={() => onDelete(amendment.id)} className="flex items-center gap-2 text-red-600 hover:bg-red-50 border border-red-100 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase">
              <ShieldOff size={16} /> Inativar Registro
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
        {/* Banner de Identificação */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-6 bg-slate-50/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-black text-[#0d457a] tracking-tighter uppercase">{amendment.seiNumber}</h2>
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${
                amendment.status === Status.CONCLUDED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                amendment.status === Status.INACTIVE ? 'bg-slate-800 text-white border-slate-900' :
                'bg-blue-50 text-[#0d457a] border-blue-100'
              }`}>{amendment.status}</span>
            </div>
            <p className="text-slate-500 font-medium text-lg italic leading-tight">"{amendment.object}"</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Montante do Recurso</p>
            <p className={`text-3xl font-black ${amendment.type.includes('Impositiva') ? 'text-blue-600' : 'text-indigo-600'}`}>
              R$ {amendment.value.toLocaleString('pt-BR')}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{amendment.type}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Workflow Control: NOVO DESIGN DE TRAMITAÇÃO BILATERAL */}
          {!isInactive && currentUser.role !== Role.VIEWER && (
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner mb-10 print:hidden">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="font-black text-[#0d457a] uppercase text-sm flex items-center gap-2">
                   <Send size={18} /> Painel de Tramitação Técnica
                 </h4>
                 <div className="flex gap-2">
                    <span className="text-[9px] bg-white border border-slate-200 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Passo a Passo</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-start gap-6 lg:gap-10">
                
                {/* ORIGEM (SELECIONÁVEL) */}
                <div className="space-y-2 relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Setor de Origem</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Origem do processo..."
                      className="w-full pl-12 pr-10 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-slate-400 transition-all font-bold text-slate-700 uppercase text-sm"
                      value={selectedOrigin ? selectedOrigin.name : originSearch}
                      onFocus={() => { setShowOriginList(true); setShowDestList(false); }}
                      onChange={(e) => {
                        setOriginSearch(e.target.value);
                        if (selectedOrigin) setSelectedOrigin(null);
                      }}
                    />
                    <ChevronDown className="absolute right-4 top-4 text-slate-300" size={20} />
                    
                    {showOriginList && (
                      <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                        {filteredOriginSectors.map(s => (
                          <button
                            key={s.id}
                            onClick={() => { setSelectedOrigin(s); setShowOriginList(false); setOriginSearch(''); }}
                            className="w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <p className="text-sm font-black text-[#0d457a] uppercase">{s.name}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* DIVISOR / SETA */}
                <div className="flex lg:flex-col items-center justify-center gap-2 pt-6 lg:pt-8">
                   <div className="h-px lg:h-8 w-10 lg:w-px bg-slate-200"></div>
                   <div className="bg-[#0d457a] p-2 rounded-full shadow-lg text-white">
                      <ArrowRight size={20} className="rotate-90 lg:rotate-0" />
                   </div>
                   <div className="h-px lg:h-8 w-10 lg:w-px bg-slate-200"></div>
                </div>

                {/* DESTINO (BUSCÁVEL + LISTA COMPLETA) */}
                <div className="space-y-2 relative">
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 ml-2">Setor de Destino</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Selecionar destino..."
                      className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#0d457a]/5 focus:border-[#0d457a] transition-all font-bold text-slate-700 uppercase text-sm"
                      value={selectedDestination ? selectedDestination.name : sectorSearch}
                      onFocus={() => { setShowDestList(true); setShowOriginList(false); }}
                      onChange={(e) => {
                         setSectorSearch(e.target.value);
                         if (selectedDestination) setSelectedDestination(null);
                      }}
                    />
                    <ChevronDown className="absolute right-4 top-4 text-slate-300" size={20} />
                    
                    {showDestList && (
                      <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                        {filteredDestSectors.length > 0 ? (
                          filteredDestSectors.map(s => (
                            <button
                              key={s.id}
                              onClick={() => { setSelectedDestination(s); setShowDestList(false); setSectorSearch(''); }}
                              className="w-full text-left p-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 flex justify-between items-center group"
                            >
                              <div>
                                <p className="text-sm font-black text-[#0d457a] uppercase group-hover:text-blue-600">{s.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Análise: {s.analysisType}</p>
                              </div>
                              <div className="bg-slate-50 px-2 py-1 rounded-md text-[9px] font-black text-slate-500 group-hover:bg-[#0d457a] group-hover:text-white transition-all">SLA: {s.defaultSlaDays}D</div>
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400">
                             <p className="text-xs font-bold uppercase">Nenhum setor disponível</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTÃO DE CONFIRMAÇÃO CENTRALIZADO */}
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleMove}
                  disabled={!selectedDestination || !selectedOrigin}
                  className="w-full max-w-md bg-[#0d457a] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl disabled:opacity-30 hover:bg-[#0a365f] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {selectedDestination 
                    ? `Confirmar Tramitação para ${selectedDestination.name}` 
                    : 'Selecione o Destino para Continuar'} 
                  <Send size={16} />
                </button>
              </div>

              {(showDestList || showOriginList) && (
                <div 
                  className="fixed inset-0 z-20 bg-transparent" 
                  onClick={() => { setShowDestList(false); setShowOriginList(false); }}
                />
              )}
            </div>
          )}

          {/* AI ANALYSIS SECTION */}
          {!isInactive && (
            <div className="mb-10 print:hidden">
                {!aiResult && !isAiLoading ? (
                <button 
                    onClick={runAiAnalysis}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-bold uppercase text-xs shadow-lg hover:shadow-xl transition-all"
                >
                    <Sparkles size={18} className="text-amber-400" /> Solicitar Insight de Gestão (Gemini AI)
                </button>
                ) : isAiLoading ? (
                <div className="w-full py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <div className="h-8 w-8 border-4 border-[#0d457a]/20 border-t-[#0d457a] rounded-full animate-spin mb-3"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0d457a]">Processando histórico SEI...</span>
                </div>
                ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 text-white/5"><Sparkles size={120} /></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-amber-400 text-slate-900 rounded-xl shadow-md"><Lightbulb size={24} /></div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">Relatório de Performance do Processo</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Análise Preditiva de Gargalos</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-white">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-black text-amber-400 uppercase mb-2">Diagnóstico</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{aiResult?.summary}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-black text-red-400 uppercase mb-2">Onde Travou?</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{aiResult?.bottleneck}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-black text-emerald-400 uppercase mb-2">Ação Sugerida</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{aiResult?.recommendation}</p>
                        </div>
                    </div>
                    <button onClick={() => setAiResult(null)} className="mt-6 text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors">Fechar Análise</button>
                </div>
                )}
            </div>
          )}

          {/* Timeline - HISTÓRICO */}
          <div className="space-y-6">
            <h4 className="font-black text-slate-400 uppercase text-xs tracking-[0.2em] mb-4">Trilha Histórica de Movimentação</h4>
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
              {amendment.movements.slice().reverse().map((m, idx) => (
                <div key={m.id} className="relative pl-10">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white ${idx === 0 ? 'border-[#0d457a] scale-125' : 'border-slate-300'}`} />
                  <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-[#0d457a]/30 transition-all ${m.analysisType === AnalysisType.INACTIVATION ? 'bg-red-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Entrada em {m.toSector}</span>
                        <h5 className="font-black text-[#0d457a] uppercase text-sm">{m.toSector}</h5>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 border border-slate-100 px-2 py-1 rounded-lg uppercase">{new Date(m.dateIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                        <ShieldCheck size={12} className={m.analysisType === AnalysisType.INACTIVATION ? 'text-red-500' : 'text-emerald-500'} />
                        Fase: {m.analysisType || 'Tramitação'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                        <Clock size={12} className="text-blue-500" />
                        Limite SLA: {new Date(m.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                        <Building2 size={12} className="text-slate-400" />
                        Responsável: {m.handledBy}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
