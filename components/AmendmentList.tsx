
import React, { useState, useMemo } from 'react';
import { Amendment, StatusConfig, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, MapPin, ChevronLeft, ChevronRight, FileText, 
  X, User, DollarSign, Calendar, Info, ArrowRight, Save, Loader2,
  LayoutGrid, Briefcase, FileSignature, Landmark, TrendingUp,
  Filter, AlertCircle, Clock, History, Timer, CheckCircle2,
  ChevronRight as ChevronRightSmall, Quote
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
  const [selectedTrailAmendment, setSelectedTrailAmendment] = useState<Amendment | null>(null);
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

  // Lógica de Busca Aprimorada (Multi-Token)
  const filteredAmendments = useMemo(() => {
    if (!searchTerm) return amendments;

    const tokens = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    
    return amendments.filter(a => {
      const sei = a.seiNumber.toLowerCase();
      const obj = a.object.toLowerCase();
      const deputy = (a.deputyName || '').toLowerCase();
      const city = a.municipality.toLowerCase();

      // Para cada token da busca, ele deve estar presente em pelo menos um dos campos principais
      // Isso permite buscas como "Bruno Ambulância" para encontrar emendas do Bruno que tratam de ambulâncias
      return tokens.every(token => 
        sei.includes(token) || 
        obj.includes(token) || 
        deputy.includes(token) ||
        city.includes(token)
      );
    });
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
        type: AmendmentType.IMPOSITIVA,
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
            {/* Header do Card */}
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
                title="Ver Trilha de Rastreabilidade"
              >
                <History size={16} />
                <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Ver Trilha</span>
              </button>
            </div>

            {/* Objeto */}
            <div className="flex-1 space-y-4">
              <div className="p-5 bg-slate-50 rounded-3xl border border