
import React, { useState, useMemo } from 'react';
import { Amendment, StatusConfig, Role, AmendmentType, TransferMode, SectorConfig, SystemMode, GNDType } from '../types';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';
import { 
  Plus, Search, Filter, MapPin, Pencil, User, Send, ChevronDown, 
  Landmark, XCircle, ChevronLeft, ChevronRight, FileText, 
  X, ArrowRightLeft, Building2, Edit3, Tag, DollarSign, Calendar, Info, Layers, Zap, HardDrive, Settings2,
  ArrowRight, Lock
} from 'lucide-react';

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
}

const ITEMS_PER_PAGE = 12;

export const AmendmentList: React.FC<AmendmentListProps> = ({ 
  amendments, 
  sectors,
  statuses,
  userRole, 
  systemMode,
  onSelect,
  onCreate,
  onUpdate,
  onInactivate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deputyFilter, setDeputyFilter] = useState<string>('all');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState: Partial<Amendment> = {
    code: '',
    year: new Date().getFullYear(),
    type: AmendmentType.IMPOSITIVA,
    status: 'Análise da Documentação',
    object: '',
    municipality: '',
    deputyName: 'Executivo Estadual',
    seiNumber: '',
    value: 0,
    suinfra: false,
    sutis: false,
    transferMode: TransferMode.FUNDO_A_FUNDO,
    gnd: GNDType.CUSTEIO,
    entryDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Amendment>>(initialFormState);

  const filteredAmendments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return amendments.filter(a => {
      const matchesSearch = !term ||
        (a.seiNumber?.toLowerCase().includes(term)) ||
        (a.deputyName?.toLowerCase().includes(term)) ||
        (a.municipality?.toLowerCase().includes(term)) ||
        (a.object?.toLowerCase().includes(term));
      
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesDeputy = deputyFilter === 'all' || a.deputyName === deputyFilter;
      const matchesMunicipality = municipalityFilter === 'all' || a.municipality === municipalityFilter;

      return matchesSearch && matchesStatus && matchesDeputy && matchesMunicipality;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [amendments, searchTerm, statusFilter, deputyFilter, municipalityFilter]);

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE);
  const paginatedAmendments = filteredAmendments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusStyle = (statusName: string) => {
    const config = statuses.find(s => s.name === statusName);
    if (!config) return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    return { 
      bg: `${config.color}08`, 
      text: config.color, 
      border: `${config.color}20`,
      isFinal: config.isFinal
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Amendment);
    } else {
      onCreate({ 
        ...formData, 
        id: `temp-${Math.random().toString(36).substr(2, 9)}`, 
        createdAt: new Date().toISOString(), 
        currentSector: 'SES/CEP-20903',
        movements: [] 
      } as Amendment);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Gestão de Processos</h2>
          <p className="text-slate-500 text-xs font-bold uppercase mt-1 flex items-center gap-2">Base Cloud GESA</p>
        </div>
        <button
            onClick={() => { setFormData(initialFormState); setEditingId(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-[#0d457a] text-white px-6 py-3 rounded-2xl hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[10px] font-black tracking-widest"
        >
            <Plus size={18} /> Novo Registro
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                value={searchTerm}
                placeholder="Pesquisar por SEI, Parlamentar ou Município..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 uppercase text-xs"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
              value={statusFilter}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-[10px] text-[#0d457a] uppercase tracking-widest"
              onChange={(e) => setStatusFilter(e.target.value)}
          >
              <option value="all">Status: Todos</option>
              {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>

          <select
              value={deputyFilter}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-[10px] text-[#0d457a] uppercase tracking-widest"
              onChange={(e) => setDeputyFilter(e.target.value)}
          >
              <option value="all">Autor: Todos</option>
              {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
              value={municipalityFilter}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-[10px] text-[#0d457a] uppercase tracking-widest"
              onChange={(e) => setMunicipalityFilter(e.target.value)}
          >
              <option value="all">Município: Todos</option>
              {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedAmendments.map(amendment => {
          const style = getStatusStyle(amendment.status);
          return (
            <div key={amendment.id} className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-black text-white bg-[#0d457a] px-3 py-1.5 rounded-full uppercase">SEI {amendment.seiNumber}</span>
                    </div>

                    <h3 className="font-black text-base text-[#0d457a] mb-4 leading-tight flex-1 uppercase">{amendment.object}</h3>

                    <div className="mb-6">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit" 
                            style={{ color: style.text, backgroundColor: style.bg, borderColor: style.border }}>
                          {style.isFinal ? <Lock size={10} /> : <Tag size={10} />}
                          {amendment.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                        <p className="text-[11px] font-black text-[#0d457a] uppercase truncate flex items-center gap-2">
                           <MapPin size={14} className="text-emerald-500" /> {amendment.municipality}
                        </p>
                        <p className="text-[11px] font-black text-slate-400 uppercase truncate flex items-center gap-2">
                           <Building2 size={14} /> {amendment.currentSector}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-auto">
                        <p className="font-black text-[#0d457a] text-lg tracking-tighter">R$ {amendment.value.toLocaleString('pt-BR')}</p>
                        <button onClick={() => onSelect(amendment)} className="p-2.5 bg-[#0d457a] text-white rounded-xl hover:bg-[#0a365f] transition-all">
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
