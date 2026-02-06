
import React, { useState, useMemo } from 'react';
import { Amendment, StatusConfig, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, MapPin, ChevronLeft, ChevronRight, FileText, 
  X, User, DollarSign, Calendar, Info, ArrowRight, Save, Loader2,
  LayoutGrid, Briefcase, FileSignature, Landmark, TrendingUp,
  Filter, AlertCircle, Clock
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
  statuses,
  onSelect,
  onCreate
}) => {
  const { notify } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    seiNumber: '',
    year: new Date().getFullYear(),
    type: AmendmentType.IMPOSITIVA,
    deputyName: '',
    municipality: '',
    object: '',
    value: '',
    transferMode: TransferMode.FUNDO_A_FUNDO,
    gnd: GNDType.INVESTIMENTO
  });

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL'
  }).format(v);

  const filteredAmendments = useMemo(() => {
    return amendments.filter(a => 
      !searchTerm || 
      a.seiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.deputyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.municipality.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [amendments, searchTerm]);

  const paginatedData = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seiNumber || !formData.deputyName || !formData.municipality || !formData.object || !formData.value) {
      notify('warning', 'Campos Obrigatórios', 'Por favor, preencha todos os campos marcados com *');
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
        type: formData.type,
        deputyName: formData.deputyName,
        municipality: formData.municipality,
        object: formData.object,
        value: cleanValue,
        status: 'Análise da Documentação',
        currentSector: sectors[0]?.name || 'SES/CEP-20903',
        createdAt: new Date().toISOString(),
        transferMode: formData.transferMode,
        gnd: formData.gnd,
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
          remarks: 'Carga inicial do processo via formulário manual.',
          analysisType: 'Análise da Documentação'
        }]
      };

      await onCreate(newAmendment);
      setIsCreateModalOpen(false);
      setFormData({
        seiNumber: '',
        year: new Date().getFullYear(),
        type: AmendmentType.IMPOSITIVA,
        deputyName: '',
        municipality: '',
        object: '',
        value: '',
        transferMode: TransferMode.FUNDO_A_FUNDO,
        gnd: GNDType.INVESTIMENTO
      });
      notify('success', 'Processo Registrado', `SEI ${formData.seiNumber} incluído com sucesso.`);
    } catch (err) {
      notify('error', 'Falha no Cadastro', 'Ocorreu um erro ao persistir o registro.');
    } finally {
      setIsSubmitting(false);
    }
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
              placeholder="PESQUISAR SEI, AUTOR OU CIDADE..."
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
            {/* Header do Card */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{amendment.type}</span>
                <h3 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                  {amendment.seiNumber}
                </h3>
              </div>
              <div className="p-3 bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 rounded-2xl transition-all">
                <ArrowRight size={20} />
              </div>
            </div>

            {/* Objeto */}
            <div className="flex-1 space-y-4">
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-white transition-all">
                <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed line-clamp-3">
                  {amendment.object}
                </p>
              </div>

              {/* Autor e Município */}
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

            {/* Footer do Card */}
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

            {/* Indicador de Status Lateral (Hover) */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/10 group-hover:bg-blue-500 transition-colors" />
          </div>
        ))}

        {paginatedData.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-30">
            <Search size={64} className="text-slate-300 mb-6" />
            <p className="text-slate-400 font-black uppercase text-sm tracking-[0.4em]">Nenhum registro localizado no sistema.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
           <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-5 bg-white border border-slate-200 rounded-[24px] text-[#0d457a] disabled:opacity-30 shadow-sm hover:bg-blue-50 transition-all"><ChevronLeft size={24} /></button>
           <span className="text-[11px] font-black uppercase tracking-widest bg-white px-8 py-5 rounded-[24px] shadow-sm border border-slate-200">Página {currentPage} de {totalPages}</span>
           <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-5 bg-white border border-slate-200 rounded-[24px] text-[#0d457a] disabled:opacity-30 shadow-sm hover:bg-blue-50 transition-all"><ChevronRight size={24} /></button>
        </div>
      )}

      {/* MODAL DE CADASTRO DE EMENDA */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#0d457a] text-white rounded-3xl shadow-xl">
                     <FileSignature size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Novo Registro SEI</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Ingestão de Emenda Parlamentar v2.9</p>
                  </div>
               </div>
               <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} className="text-slate-400" />
               </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lado Esquerdo: Identificação */}
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Número do Processo SEI *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase outline-none focus:ring-8 ring-blue-500/5 transition-all"
                        placeholder="EX: 2026.0001.000XXX"
                        value={formData.seiNumber}
                        onChange={(e) => setFormData({...formData, seiNumber: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Exercício *</label>
                        <input 
                          type="number" 
                          required
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] outline-none"
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Tipo *</label>
                        <select 
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as AmendmentType})}
                        >
                          {Object.values(AmendmentType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Deputado Autor *</label>
                      <select 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none"
                        value={formData.deputyName}
                        onChange={(e) => setFormData({...formData, deputyName: e.target.value})}
                      >
                        <option value="">Selecione o Parlamentar...</option>
                        {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Município Beneficiário *</label>
                      <select 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none"
                        value={formData.municipality}
                        onChange={(e) => setFormData({...formData, municipality: e.target.value})}
                      >
                        <option value="">Selecione a Cidade...</option>
                        {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                {/* Lado Direito: Objeto e Valores */}
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Objeto do Repasse *</label>
                      <textarea 
                        required
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[32px] font-medium text-slate-600 uppercase outline-none focus:ring-8 ring-blue-500/5 transition-all h-40 resize-none text-[11px] leading-relaxed"
                        placeholder="DESCREVA O OBJETO CONFORME PLANILHA..."
                        value={formData.object}
                        onChange={(e) => setFormData({...formData, object: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Valor do Processo (R$) *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                          type="text" 
                          required
                          className="w-full pl-16 pr-6 py-5 bg-[#0d457a] text-white rounded-3xl font-black text-2xl outline-none shadow-inner border-none"
                          placeholder="0,00"
                          value={formData.value}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            val = (Number(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                            setFormData({...formData, value: val});
                          }}
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">GND</label>
                        <select 
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none"
                          value={formData.gnd}
                          onChange={(e) => setFormData({...formData, gnd: e.target.value as GNDType})}
                        >
                          {Object.values(GNDType).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Modalidade</label>
                        <select 
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none"
                          value={formData.transferMode}
                          onChange={(e) => setFormData({...formData, transferMode: e.target.value as TransferMode})}
                        >
                          {Object.values(TransferMode).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-4 text-slate-400">
                    <Info size={20} className="text-blue-500" />
                    <p className="text-[9px] font-bold uppercase max-w-sm leading-relaxed">
                      Ao salvar, o processo será automaticamente endereçado para a unidade <span className="text-[#0d457a] font-black">{sectors[0]?.name || 'SES/CEP'}</span> com SLA padrão de 5 dias.
                    </p>
                 </div>
                 <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 md:flex-none px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0d457a] transition-all"
                    >
                       Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 md:flex-none bg-emerald-500 text-white px-12 py-5 rounded-[28px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      Efetivar na Base Cloud
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
