
import React, { useState, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  Amendment, StatusConfig, User, Role, SectorConfig, 
  AmendmentMovement, SystemMode, AIAnalysisResult, Status
} from '../types';
import { analyzeAmendment } from '../services/geminiService';
import { 
  ArrowLeft, Send, MapPin, Calendar, Clock, 
  FileText, ArrowRightLeft, History, Lock, UserCheck, 
  MessageSquare, Sparkles, Download, Loader2, 
  ChevronDown, Quote, Check, CheckCircle2,
  Timer, FileSearch, ShieldCheck, Search, X,
  Plus, Building2, Activity, AlertCircle,
  FileBadge, Briefcase, DollarSign
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
  { label: 'Parecer Jurídico', text: 'Remeto os autos à Procuradoria Setorial para emissão de parecer jurídico acerca da viabilidade do repasse pretendido.' }
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [sectorSearch, setSectorSearch] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<SectorConfig[]>([]);
  const [newStatus, setNewStatus] = useState<string>(amendment.status);
  const [remarks, setRemarks] = useState('');
  const [showDestList, setShowDestList] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const slaInfo = useMemo(() => {
    const lastMov = amendment.movements[amendment.movements.length - 1];
    if (!lastMov) return null;
    const today = new Date();
    const deadline = new Date(lastMov.deadline);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      days: diffDays,
      status: diffDays < 0 ? 'Excedido' : diffDays <= 2 ? 'Crítico' : 'No Prazo',
      color: diffDays < 0 ? 'text-red-600' : diffDays <= 2 ? 'text-amber-600' : 'text-emerald-600',
      bg: diffDays < 0 ? 'bg-red-50' : diffDays <= 2 ? 'bg-amber-50' : 'bg-emerald-50',
      border: diffDays < 0 ? 'border-red-100' : diffDays <= 2 ? 'border-amber-100' : 'border-emerald-100',
      icon: diffDays < 0 ? AlertCircle : diffDays <= 2 ? Clock : ShieldCheck
    };
  }, [amendment]);

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const result = await analyzeAmendment(amendment);
      setAiResult(result);
      notify('success', 'Análise Concluída', 'O motor Gemini processou o dossiê com sucesso.');
    } catch (e) {
      notify('error', 'Erro na IA', 'Não foi possível gerar o insight preditivo.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredDestSectors = useMemo(() => {
    const searchLower = sectorSearch.toLowerCase();
    return sectors.filter(s => 
      s.name.toLowerCase().includes(searchLower) && 
      s.name !== amendment.currentSector
    ).slice(0, 5);
  }, [sectors, sectorSearch, amendment.currentSector]);

  const handleFinalMove = () => {
    if (selectedDestinations.length === 0) {
      notify('warning', 'Atenção', 'Selecione uma unidade de destino.');
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
    notify('success', 'Tramitação Efetivada', `Processo enviado para ${selectedDestinations.map(d => d.name).join(', ')}.`);
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div className="flex items-center gap-6">
            <button 
                onClick={onBack}
                className="p-4 bg-white border border-slate-200 rounded-2xl text-[#0d457a] hover:bg-blue-50 transition-all shadow-sm"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">{amendment.seiNumber}</h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-100">{amendment.type}</span>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <FileBadge size={14} className="text-emerald-500" /> Dossiê Digital de Emenda Parlamentar v2.9
              </p>
            </div>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={handleAiAnalysis}
                disabled={isAiLoading}
                className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50"
            >
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Análise Preditiva IA
            </button>
            <button 
                onClick={() => window.print()}
                className="flex items-center gap-3 bg-white border border-slate-200 text-slate-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"
            >
                <Download size={16} /> Exportar Dossiê
            </button>
        </div>
      </div>

      {/* SLA Health */}
      {slaInfo && (
        <div className={`p-8 rounded-[40px] border-2 ${slaInfo.bg} ${slaInfo.border} flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm`}>
            <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm border ${slaInfo.color}`}>
                   <slaInfo.icon size={32} />
                </div>
                <div>
                   <h4 className={`text-xl font-black uppercase tracking-tight ${slaInfo.color}`}>Status do Trâmite: {slaInfo.status}</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Monitoramento ativo de temporalidade administrativa SES-GO</p>
                </div>
            </div>
            <div className="flex items-center gap-10">
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Saldo de Dias</p>
                    <p className={`text-3xl font-black ${slaInfo.color}`}>{slaInfo.days}</p>
                </div>
                <div className="h-12 w-px bg-slate-200 hidden md:block"></div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Prazo Final</p>
                    <p className="text-base font-black text-slate-600">
                        {new Date(amendment.movements[amendment.movements.length-1].deadline).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Informações da Emenda */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div>
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={14} className="text-emerald-500"/> Beneficiário</h5>
                    <p className="text-lg font-black text-[#0d457a] uppercase leading-tight">{amendment.municipality}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{amendment.beneficiaryUnit || 'Prefeitura / FMS'}</p>
                 </div>
                 <div>
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={14} className="text-blue-500"/> Objeto do Processo</h5>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed uppercase bg-slate-50 p-6 rounded-2xl border border-slate-100">{amendment.object}</p>
                 </div>
              </div>
              <div className="space-y-8">
                 <div className="p-8 bg-[#0d457a] rounded-[32px] text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={80}/></div>
                    <h5 className="text-[9px] font-black text-blue-200 uppercase mb-3">Valor Alocado</h5>
                    <p className="text-3xl font-black">{formatBRL(amendment.value)}</p>
                    <div className="mt-6 flex items-center gap-2">
                        <UserCheck size={14} className="text-blue-200"/>
                        <span className="text-[9px] font-black text-blue-100 uppercase">{amendment.deputyName}</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Ano</p>
                        <p className="text-lg font-black text-blue-700">{amendment.year}</p>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">GESA ID</p>
                        <p className="text-lg font-black text-emerald-700">{amendment.code}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Histórico de Movimentações */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                <History size={18} className="text-blue-500" /> Trilha de Rastreabilidade SEI
            </h3>
            <div className="space-y-0 relative">
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100"></div>
                {amendment.movements.length > 0 ? [...amendment.movements].reverse().map((mov, idx) => (
                  <div key={mov.id} className="relative pl-12 pb-12 last:pb-0 group">
                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center z-10 ${mov.dateOut ? 'bg-slate-100 text-slate-400' : 'bg-[#0d457a] text-white ring-4 ring-blue-50 animate-pulse'}`}>
                        {mov.dateOut ? <Check size={20} /> : <Timer size={20} />}
                    </div>
                    <div className={`p-8 rounded-[32px] border transition-all ${mov.dateOut ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                            <div>
                                <span className="text-[9px] font-black text-blue-500 uppercase block mb-1">Setor: {mov.toSector}</span>
                                <h4 className="text-base font-black text-[#0d457a] uppercase">{mov.analysisType || 'Análise de Fluxo'}</h4>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-1 justify-end">
                                    <Calendar size={12} className="text-slate-300" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">In: {new Date(mov.dateIn).toLocaleDateString('pt-BR')}</span>
                                </div>
                                {mov.dateOut && (
                                    <div className="flex items-center gap-2 justify-end">
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase">Out: {new Date(mov.dateOut).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {mov.remarks && (
                            <div className="p-5 bg-white/50 rounded-2xl border border-slate-200/50 italic text-[12px] text-slate-500 leading-relaxed">
                                "{mov.remarks}"
                            </div>
                        )}
                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Responsável: {mov.handledBy}</span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                                <Timer size={12} className="text-slate-300" />
                                <span className="text-[9px] font-black text-slate-400 uppercase">SLA: {new Date(mov.deadline).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-30">
                     <FileSearch size={48} className="mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase">Nenhuma movimentação registrada no GESA.</p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Tramitação */}
        <div className="space-y-8 no-print">
          <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform"><ArrowRightLeft size={120} /></div>
            <div className="relative z-10 space-y-8">
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                 <Send size={24} className="text-blue-300" /> Tramitar Processo
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest block mb-3 ml-1">Unidade Técnica Destino</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all font-bold text-[11px] uppercase text-white placeholder:text-white/20"
                      placeholder="PESQUISAR UNIDADE..."
                      value={sectorSearch}
                      onChange={(e) => { setSectorSearch(e.target.value); setShowDestList(true); }}
                    />
                    {showDestList && filteredDestSectors.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-100">
                        {filteredDestSectors.map(s => (
                          <button 
                            key={s.id}
                            onClick={() => { setSelectedDestinations([s]); setShowDestList(false); }}
                            className="w-full px-5 py-4 text-left hover:bg-blue-50 transition-colors flex justify-between items-center group/item"
                          >
                            <span className="text-[10px] font-black text-[#0d457a] uppercase">{s.name}</span>
                            <Plus size={14} className="text-slate-200 group-hover/item:text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedDestinations.map(d => (
                      <span key={d.id} className="px-3 py-1.5 bg-blue-400/30 text-blue-50 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 border border-white/10">
                        {d.name}
                        <button onClick={() => setSelectedDestinations([])}><X size={12}/></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest block mb-3 ml-1">Novo Status</label>
                  <div className="relative">
                     <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none font-bold text-[11px] uppercase text-white appearance-none cursor-pointer"
                    >
                        {statuses.map(s => <option key={s.id} value={s.name} className="text-slate-900 font-bold">{s.name}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 ml-1">
                     <label className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Despacho Oficial</label>
                     <button 
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-[8px] font-black text-blue-300 uppercase hover:text-white"
                     >
                        Templates
                     </button>
                  </div>
                  {showTemplates && (
                    <div className="grid grid-cols-1 gap-1.5 mb-3">
                        {DISPATCH_TEMPLATES.map((t, i) => (
                            <button 
                                key={i} 
                                onClick={() => { setRemarks(t.text); setShowTemplates(false); }}
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] text-blue-200 text-left hover:bg-white/10 transition-all"
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                  )}
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-5 bg-white/10 border border-white/20 rounded-3xl outline-none h-40 font-medium text-[11px] text-white placeholder:text-white/20 resize-none uppercase"
                    placeholder="DIGITE O DESPACHO SEI..."
                  />
                </div>

                <button 
                  onClick={handleFinalMove}
                  className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="flex items-center gap-3"><Send size={18} /> Efetivar Trâmite</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI View */}
          {aiResult && (
            <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden border border-white/10 animate-in zoom-in-95">
                <div className="absolute top-0 right-0 p-12 opacity-10"><Sparkles size={160} /></div>
                <div className="relative z-10 space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 flex items-center gap-3">
                        <Sparkles size={20} /> Análise Gemini Pro
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <p className="text-[9px] font-black text-blue-300 uppercase mb-2">Resumo Executivo</p>
                            <p className="text-xs text-blue-100/80 leading-relaxed font-medium">{aiResult.summary}</p>
                        </div>
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                            <p className="text-[9px] font-black text-red-400 uppercase mb-2">Gargalo Identificado</p>
                            <p className="text-xs text-red-100/80 font-black uppercase">{aiResult.bottleneck}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Risco</p>
                                <p className="text-xl font-black text-emerald-400">{aiResult.riskScore}%</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Sucesso</p>
                                <p className="text-xl font-black text-blue-400">{(aiResult.completionProbability * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
