
import React, { useState } from 'react';
import { Amendment, Status, User, Role, AIAnalysisResult, SectorConfig, AmendmentMovement, AnalysisType } from '../types';
import { 
  ArrowLeft, Send, Sparkles, MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle, FileText, Building2, HardHat, MonitorCheck, ShieldOff, 
  ShieldCheck, Printer, FileSearch, Lightbulb, Zap, XCircle
} from 'lucide-react';
import { analyzeAmendment } from '../services/geminiService';

interface AmendmentDetailProps {
  amendment: Amendment;
  currentUser: User;
  sectors: SectorConfig[];
  onBack: () => void;
  onMove: (movement: AmendmentMovement) => void;
  onStatusChange: (amendmentId: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export const AmendmentDetail: React.FC<AmendmentDetailProps> = ({ 
  amendment, 
  currentUser, 
  sectors,
  onBack, 
  onMove, 
  onStatusChange,
  onDelete
}) => {
  const [targetSectorId, setTargetSectorId] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const isInactive = amendment.status === Status.INACTIVE;

  const handleMove = () => {
    const selectedSector = sectors.find(s => s.id === targetSectorId);
    if (!selectedSector) return;

    const dateIn = new Date().toISOString();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + selectedSector.defaultSlaDays);

    const movement: AmendmentMovement = {
      id: Math.random().toString(36).substr(2, 9),
      amendmentId: amendment.id,
      fromSector: amendment.currentSector,
      toSector: selectedSector.name,
      dateIn,
      dateOut: null,
      deadline: deadline.toISOString(),
      daysSpent: 0,
      handledBy: currentUser.name,
      analysisType: selectedSector.analysisType
    };

    onMove(movement);
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

  const handlePrintProtocol = () => {
    window.print();
  };

  return (
    <div className={`space-y-6 ${isInactive ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#0d457a] transition-colors font-bold uppercase text-xs">
          <ArrowLeft size={18} /> Voltar à Lista
        </button>
        <div className="flex gap-2">
          <button onClick={handlePrintProtocol} className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase hover:bg-slate-50">
            <Printer size={16} /> Imprimir Protocolo
          </button>
          {!isInactive && currentUser.role !== Role.VIEWER && (
            <button onClick={() => onDelete(amendment.id)} className="flex items-center gap-2 text-red-600 hover:bg-red-50 border border-red-100 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase">
              <ShieldOff size={16} /> Inativar Registro
            </button>
          )}
        </div>
      </div>

      {isInactive && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex items-start gap-4 mb-6">
           <div className="bg-red-600 text-white p-2 rounded-xl">
             <XCircle size={24} />
           </div>
           <div>
             <h3 className="text-red-800 font-black uppercase text-sm">Registro Inativado (Anulado)</h3>
             <p className="text-red-700 text-xs mt-1 font-bold">Inativado em: {new Date(amendment.inactivatedAt || '').toLocaleString()}</p>
             <div className="bg-white/50 p-3 mt-3 rounded-xl border border-red-100">
                <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Motivo Formal:</p>
                <p className="text-xs text-red-900 italic">"{amendment.inactivationReason}"</p>
             </div>
           </div>
        </div>
      )}

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
            <p className="text-3xl font-black text-[#0d457a]">R$ {amendment.value.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Grid de Informações Técnicas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Localização</p>
              <div className="flex items-center gap-1.5 text-[#0d457a] font-bold text-sm">
                <MapPin size={14} /> {amendment.municipality}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Setor Atual</p>
              <div className="flex items-center gap-1.5 text-[#0d457a] font-bold text-sm">
                <Building2 size={14} /> {amendment.currentSector}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Parlamentar Autor</p>
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                <Zap size={14} className="text-amber-500" /> {amendment.deputyName || 'Governo GO'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Unidade Favorecida</p>
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm truncate">
                <Building2 size={14} className="text-blue-500" /> {amendment.healthUnit}
              </div>
            </div>
          </div>

          {/* AI ANALYSIS SECTION */}
          {!isInactive && (
            <div className="mb-10 print:hidden">
                {!aiResult && !isAiLoading ? (
                <button 
                    onClick={runAiAnalysis}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#0d457a] to-[#1e5aa0] text-white rounded-2xl font-bold uppercase text-xs shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
                >
                    <Sparkles size={18} /> Solicitar Análise Técnica de Fluxo (Google Gemini IA)
                </button>
                ) : isAiLoading ? (
                <div className="w-full py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-[#0d457a]">
                    <div className="h-8 w-8 border-4 border-[#0d457a]/20 border-t-[#0d457a] rounded-full animate-spin mb-3"></div>
                    <span className="text-xs font-black uppercase tracking-widest animate-pulse">A IA está analisando os gargalos...</span>
                </div>
                ) : (
                <div className="bg-[#0d457a]/5 border border-[#0d457a]/10 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 text-[#0d457a]/5">
                    <Sparkles size={120} />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative">
                    <div className="p-2 bg-[#0d457a] text-white rounded-xl shadow-md">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-[#0d457a] uppercase tracking-wide">Relatório Inteligente de Performance</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Baseado em Gemini 3 Flash API</p>
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-[9px] font-bold text-blue-500 uppercase mb-2 flex items-center gap-1"><FileSearch size={12}/> Diagnóstico</p>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{aiResult?.summary}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-[9px] font-bold text-red-500 uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Gargalo Identificado</p>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{aiResult?.bottleneck}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-[9px] font-bold text-emerald-500 uppercase mb-2 flex items-center gap-1"><Zap size={12}/> Sugestão de Ação</p>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{aiResult?.recommendation}</p>
                    </div>
                    </div>
                    <button onClick={() => setAiResult(null)} className="mt-6 text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-widest underline">Limpar Análise</button>
                </div>
                )}
            </div>
          )}

          {/* Workflow Control */}
          {!isInactive && currentUser.role !== Role.VIEWER && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-10 print:hidden">
              <h4 className="font-black text-[#0d457a] uppercase text-sm mb-6 flex items-center gap-2">
                <Send size={18} /> Próxima Etapa do Fluxo (Tramitação)
              </h4>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Setor de Destino</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d457a] transition-all font-bold text-slate-700"
                    value={targetSectorId}
                    onChange={e => setTargetSectorId(e.target.value)}
                  >
                    <option value="">Selecione o Departamento</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name} (SLA: {s.defaultSlaDays}d)</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleMove}
                  disabled={!targetSectorId}
                  className="bg-[#0d457a] text-white px-8 py-3.5 rounded-xl font-bold uppercase text-xs shadow-xl disabled:opacity-50 hover:bg-[#0a365f] transition-all active:scale-95 flex items-center gap-2"
                >
                  Confirmar Envio <Send size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-6">
            <h4 className="font-black text-slate-400 uppercase text-xs tracking-[0.2em] mb-4">Trilha Histórica de Movimentação</h4>
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
              {amendment.movements.slice().reverse().map((m, idx) => (
                <div key={m.id} className="relative pl-10">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white ${idx === 0 ? 'border-[#0d457a] scale-125' : 'border-slate-300'}`} />
                  <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-[#0d457a]/30 transition-all ${m.analysisType === AnalysisType.INACTIVATION ? 'bg-red-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-[#0d457a] uppercase text-sm">{m.toSector}</h5>
                      <span className="text-[10px] font-black text-slate-400 border border-slate-100 px-2 py-1 rounded-lg uppercase">{new Date(m.dateIn).toLocaleDateString()}</span>
                    </div>
                    {m.justification && (
                       <div className="mt-2 p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-600 italic">
                          " {m.justification} "
                       </div>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                        <ShieldCheck size={12} className={m.analysisType === AnalysisType.INACTIVATION ? 'text-red-500' : 'text-emerald-500'} />
                        Ação: {m.analysisType || 'Tramitação Inicial'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                        <Clock size={12} className="text-blue-500" />
                        Limite SLA: {new Date(m.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                        <Building2 size={12} className="text-slate-400" />
                        Operador: {m.handledBy}
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
