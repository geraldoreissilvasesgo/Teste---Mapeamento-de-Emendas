
import React, { useState, useMemo } from 'react';
import { Amendment, StatusConfig, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, MapPin, ChevronLeft, ChevronRight, FileText, 
  X, User, DollarSign, Calendar, Info, ArrowRight, Save, Loader2,
  LayoutGrid, Briefcase, FileSignature, Landmark, TrendingUp,
  Filter, AlertCircle, Clock, History, Timer, CheckCircle2,
  ChevronRight as ChevronRightSmall, Quote, Building2, HardDrive, 
  Settings, ClipboardList, CalendarDays
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface AmendmentListProps {
  amendments: Amendment[];
  sectors: SectorConfig[];
  statuses: StatusConfig[];
  userRole: Role;
  systemMode: SystemMode;
  onSelect: (amendment: Amendment) => void;
  onCreate: (amendment: Amendment) => void;
  onUpdate: (amendment: Amendment) => void;
  onInactivate: (id: string, justification: string) => void;
  onAddStatus?: (status: StatusConfig) => Promise<StatusConfig>;
  error?: string | null;
}

const ITEMS_PER_PAGE = 12;

export const AmendmentList: React.FC<AmendmentListProps> = ({ 
  amendments, 
  sectors,
  onSelect,
  onCreate
}) => {
  const { notify } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrailAmendment, setSelectedTrailAmendment] = useState<Amendment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    seiNumber: '',
    year: new Date().getFullYear(),
    entryDate: new Date().toISOString().split('T')[0],
    type: AmendmentType.IMPOSITIVA,
    deputyName: '',
    municipality: '',
    beneficiaryUnit: '',
    object: '',
    value: '',
    transferMode: TransferMode.FUNDO_A_FUNDO,
    gnd: GNDType.INVESTIMENTO,
    suinfra: false,
    sutis: false
  });

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL'
  }).format(v);

  const filteredAmendments = useMemo(() => {
    if (!searchTerm) return amendments;
    const tokens = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    return amendments.filter(a => {
      const sei = a.seiNumber.toLowerCase();
      const obj = a.object.toLowerCase();
      const deputy = (a.deputyName || '').toLowerCase();
      const city = a.municipality.toLowerCase();
      return tokens.every(token => 
        sei.includes(token) || obj.includes(token) || deputy.includes(token) || city.includes(token)
      );
    });
  }, [amendments, searchTerm]);

  const paginatedData = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seiNumber || !formData.deputyName || !formData.municipality || !formData.object || !formData.value) {
      notify('warning', 'Campos Obrigatórios', 'Preencha os campos essenciais do processo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanValue = parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.'));
      
      const newAmendment: Amendment = {
        id: '', 
        tenantId: 'GOIAS',
        code: `EM-${formData.year}-${Math.floor(1000 + Math.random() * 9000)}`,
        seiNumber: formData.seiNumber,
        year: formData.year,
        entryDate: formData.entryDate,
        type: formData.type,
        deputyName: formData.deputyName,
        municipality: formData.municipality,
        beneficiaryUnit: formData.beneficiaryUnit,
        object: formData.object,
        value: cleanValue,
        status: 'Análise da Documentação',
        currentSector: sectors[0]?.name || 'SES/CEP-20903',
        createdAt: new Date().toISOString(),
        transferMode: formData.transferMode,
        gnd: formData.gnd,
        suinfra: formData.suinfra,
        sutis: formData.sutis,
        movements: [{
          id: `mov-init-${Date.now()}`,
          amendmentId: '',
          fromSector: 'Protocolo Externo',
          toSector: sectors[0]?.name || 'SES/CEP-20903',
          dateIn: new Date().toISOString(),
          dateOut: null,
          deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
          daysSpent: 0,
          handledBy: 'Sistema GESA',
          remarks: `Carga inicial. Modalidade: ${formData.transferMode}. GND: ${formData.gnd}.`,
          analysisType: 'Análise da Documentação'
        }]
      };

      await onCreate(newAmendment);
      setIsCreateModalOpen(false);
      setFormData({
        seiNumber: '',
        year: new Date().getFullYear(),
        entryDate: new Date().toISOString().split('T')[0],
        type: AmendmentType.IMPOSITIVA,
        deputyName: '',
        municipality: '',
        beneficiaryUnit: '',
        object: '',
        value: '',
        transferMode: TransferMode.FUNDO_A_FUNDO,
        gnd: GNDType.INVESTIMENTO,
        suinfra: false,
        sutis: false
      });
      notify('success', 'Processo Registrado', `SEI ${formData.seiNumber} incluído com sucesso.`);
    } catch (err) {
      notify('error', 'Falha no Cadastro', 'Ocorreu um erro ao persistir o registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTrail = (e: React.MouseEvent, amendment: Amendment) => {
    e.stopPropagation();
    setSelectedTrailAmendment(amendment);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Emendas Impositivas</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
            <LayoutGrid size={16} className="text-blue-500" /> Visualização em Cards: Exercício {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="PESQUISAR SEI, AUTOR OU OBJETO..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-[10px] uppercase text-[#0d457a] shadow-sm focus:ring-4 ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0d457a] text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all flex items-center gap-3 shrink-0 active:scale-95"
          >
            <Plus size={18} /> Novo Registro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedData.map((amendment) => (
          <div 
            key={amendment.id} 
            onClick={() => onSelect(amendment)}
            className="group bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all cursor-pointer flex flex-col p-8 overflow-hidden relative active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{amendment.type}</span>
                <h3 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                  {amendment.seiNumber}
                </h3>
              </div>
              <button 
                onClick={(e) => handleOpenTrail(e, amendment)}
                className="p-3 bg-slate-50 text-[#0d457a] hover:bg-blue-500 hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100 flex items-center gap-2"
                title="Ver Trilha Rápida"
              >
                <History size={16} />
                <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Ver Trilha</span>
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-white transition-all">
                <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed line-clamp-3">
                  {amendment.object}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User size={14} />
                  </div>
                  <span className="text-[10px] font-black text-[#0d457a] uppercase truncate">{amendment.deputyName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin size={14} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase truncate">{amendment.municipality}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Valor do Repasse</span>
                <span className="text-base font-black text-emerald-600 tracking-tight">{formatBRL(amendment.value)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Unidade Atual</span>
                <span className="text-[9px] font-black text-[#0d457a] uppercase bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{amendment.currentSector}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
           <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-5 bg-white border border-slate-200 rounded-[24px] text-[#0d457a] disabled:opacity-30 shadow-sm hover:bg-blue-50 transition-all"><ChevronLeft size={24} /></button>
           <span className="text-[11px] font-black uppercase tracking-widest bg-white px-8 py-5 rounded-[24px] shadow-sm border border-slate-200">Página {currentPage} de {totalPages}</span>
           <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-5 bg-white border border-slate-200 rounded-[24px] text-[#0d457a] disabled:opacity-30 shadow-sm hover:bg-blue-50 transition-all"><ChevronRight size={24} /></button>
        </div>
      )}

      {/* MODAL DE CADASTRO EXPANDIDO - TODOS OS DADOS */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="bg-white rounded-[48px] w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto border border-white/10">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#0d457a] text-white rounded-3xl shadow-xl">
                     <FileSignature size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Ingestão de Processo GESA</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Conformidade com Decreto 10.634/2025</p>
                  </div>
               </div>
               <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} className="text-slate-400" />
               </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* COLUNA 1: DADOS DO PROCESSO */}
                <div className="space-y-6">
                   <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
                      <ClipboardList size={18} className="text-blue-600" />
                      <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Dados Processuais</h4>
                   </div>
                   
                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nº SEI (Completo) *</label>
                      <input type="text" required placeholder="Ex: 2026.0001.XXXXX" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase text-xs outline-none focus:ring-4 ring-blue-500/5 transition-all" value={formData.seiNumber} onChange={(e) => setFormData({...formData, seiNumber: e.target.value})} />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Exercício *</label>
                        <input type="number" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] text-xs outline-none" value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Entrada GESA *</label>
                        <input type="date" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] text-xs outline-none" value={formData.entryDate} onChange={(e) => setFormData({...formData, entryDate: e.target.value})} />
                      </div>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tipo de Emenda *</label>
                      <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase text-[10px] outline-none" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as AmendmentType})}>
                        {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                </div>

                {/* COLUNA 2: FINANCEIRO E CLASSIFICAÇÃO */}
                <div className="space-y-6">
                   <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                      <TrendingUp size={18} className="text-emerald-600" />
                      <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Orçamentário</h4>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">GND (Grupo Despesa)</label>
                      <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase text-[10px] outline-none" value={formData.gnd} onChange={(e) => setFormData({...formData, gnd: e.target.value as GNDType})}>
                        {Object.values(GNDType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Modalidade de Repasse</label>
                      <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase text-[10px] outline-none" value={formData.transferMode} onChange={(e) => setFormData({...formData, transferMode: e.target.value as TransferMode})}>
                        {Object.values(TransferMode).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Valor Nominal (R$) *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="text" required className="w-full pl-12 pr-5 py-4 bg-[#0d457a] text-white rounded-xl font-black text-xl outline-none" placeholder="0,00" value={formData.value} onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            val = (Number(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                            setFormData({...formData, value: val});
                          }}
                        />
                      </div>
                   </div>
                </div>

                {/* COLUNA 3: IDENTIFICAÇÃO E ORIGEM */}
                <div className="space-y-6">
                   <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center gap-3">
                      <MapPin size={18} className="text-purple-600" />
                      <h4 className="text-[10px] font-black text-purple-900 uppercase tracking-widest">Identificação</h4>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Parlamentar Autor *</label>
                      <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase text-[10px] outline-none" value={formData.deputyName} onChange={(e) => setFormData({...formData, deputyName: e.target.value})}>
                        <option value="">SELECIONE...</option>
                        {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Município Beneficiado *</label>
                      <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase text-[10px] outline-none" value={formData.municipality} onChange={(e) => setFormData({...formData, municipality: e.target.value})}>
                        <option value="">SELECIONE...</option>
                        {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>

                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Unidade Beneficiada (Fundo/Hospital)</label>
                      <input type="text" placeholder="Ex: FUNDO MUNICIPAL DE SAÚDE" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0d457a] uppercase text-xs outline-none" value={formData.beneficiaryUnit} onChange={(e) => setFormData({...formData, beneficiaryUnit: e.target.value})} />
                   </div>
                </div>
              </div>

              {/* AREA DE OBJETO E FLAGS TECNICAS */}
              <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Descrição do Objeto *</label>
                    <textarea required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-medium text-slate-600 uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all h-32 resize-none text-[11px] leading-relaxed shadow-inner" placeholder="DESCREVA CONFORME PLANILHA DE ORIGEM..." value={formData.object} onChange={(e) => setFormData({...formData, object: e.target.value})} />
                 </div>

                 <div className="space-y-6">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Tramitação Especial (Vetos/Análises)</label>
                    <div className="grid grid-cols-1 gap-4">
                       <div 
                         onClick={() => setFormData({...formData, suinfra: !formData.suinfra})}
                         className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.suinfra ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                       >
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-xl ${formData.suinfra ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <HardDrive size={20} />
                             </div>
                             <div>
                                <h5 className={`text-[11px] font-black uppercase ${formData.suinfra ? 'text-amber-800' : 'text-slate-500'}`}>Exige Parecer SUINFRA</h5>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Processos de Obras e Engenharia</p>
                             </div>
                          </div>
                          {formData.suinfra && <CheckCircle2 className="text-amber-500" size={20} />}
                       </div>

                       <div 
                         onClick={() => setFormData({...formData, sutis: !formData.sutis})}
                         className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.sutis ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                       >
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-xl ${formData.sutis ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <Settings size={20} />
                             </div>
                             <div>
                                <h5 className={`text-[11px] font-black uppercase ${formData.sutis ? 'text-blue-800' : 'text-slate-500'}`}>Exige Parecer SUTIS</h5>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Aquisição de TI e Software</p>
                             </div>
                          </div>
                          {formData.sutis && <CheckCircle2 className="text-blue-500" size={20} />}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-12 flex justify-end gap-4 pb-4">
                 <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0d457a]">Descartar</button>
                 <button type="submit" disabled={isSubmitting} className="bg-emerald-500 text-white px-16 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 group active:scale-95">
                   {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                   Efetivar Registro no GESA Cloud
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
