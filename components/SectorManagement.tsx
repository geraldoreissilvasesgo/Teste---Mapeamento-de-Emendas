
import React, { useState, useMemo } from 'react';
import { SectorConfig, StatusConfig } from '../types';
import { 
  Plus, Clock, X, Building2, Save, Pencil, ShieldAlert,
  Loader2, Edit2, CheckCircle2
} from 'lucide-react';

interface SectorManagementProps {
  sectors: SectorConfig[];
  statuses: StatusConfig[];
  onAdd: (sector: SectorConfig) => void;
  onBatchAdd: (sectors: any[]) => void;
  onUpdateSla: (id: string, newSla: number) => void;
  error?: string | null;
}

export const SectorManagement: React.FC<SectorManagementProps> = ({ 
  sectors, statuses, onAdd, onBatchAdd, onUpdateSla, error 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditSlaModalOpen, setIsEditSlaModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<SectorConfig | null>(null);
  const [newSlaValue, setNewSlaValue] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState('');

  const [newSector, setNewSector] = useState<Partial<SectorConfig>>({
    name: '',
    defaultSlaDays: 5,
    analysisType: statuses.length > 0 ? statuses[0].name : ''
  });

  const filteredSectors = useMemo(() => {
    return sectors.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sectors, searchTerm]);

  const handleOpenEditSla = (sector: SectorConfig) => {
    setEditingSector(sector);
    setNewSlaValue(sector.defaultSlaDays);
    setIsEditSlaModalOpen(true);
  };

  const handleSaveSla = () => {
    if (editingSector) {
      onUpdateSla(editingSector.id, newSlaValue);
      setIsEditSlaModalOpen(false);
      setEditingSector(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSector.name) {
      onAdd({
        name: newSector.name.toUpperCase(),
        defaultSlaDays: newSector.defaultSlaDays || 5,
        analysisType: newSector.analysisType || (statuses.length > 0 ? statuses[0].name : '')
      } as SectorConfig);
      setIsModalOpen(false);
      setNewSector({ name: '', defaultSlaDays: 5, analysisType: statuses.length > 0 ? statuses[0].name : '' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Unidades Técnicas</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <Building2 size={14} className="text-blue-500" /> Gestão de Prazos e SLAs SES-GO
          </p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-[20px] hover:bg-[#0a365f] transition-all shadow-lg uppercase text-[11px] font-black tracking-[0.2em]"
            >
                <Plus size={18} /> Novo Setor
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm mb-6">
        <input 
          type="text"
          placeholder="FILTRAR UNIDADE TÉCNICA..."
          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSectors.map(sector => (
          <div key={sector.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 shadow-inner flex items-center justify-center">
                  <Building2 size={24} />
               </div>
               <button 
                onClick={() => handleOpenEditSla(sector)}
                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100"
                title="Ajustar SLA"
               >
                 <Edit2 size={16} />
               </button>
            </div>
            <h3 className="font-black text-base text-[#0d457a] uppercase leading-tight mb-2">{sector.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sector.analysisType || 'Análise Geral'}</p>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-xs font-black text-slate-600 uppercase">SLA Padrão: {sector.defaultSlaDays} Dias</span>
               </div>
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição de SLA */}
      {isEditSlaModalOpen && editingSector && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
               <div>
                  <h3 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter">Ajustar SLA de Unidade</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{editingSector.name}</p>
               </div>
               <button onClick={() => setIsEditSlaModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
               </button>
            </div>
            <div className="p-10 space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Novo Prazo (Dias Corridos)</label>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setNewSlaValue(Math.max(1, newSlaValue - 1))}
                      className="w-14 h-14 bg-slate-100 text-[#0d457a] rounded-2xl font-black text-xl hover:bg-slate-200 transition-all shadow-sm"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center py-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                       <span className="text-3xl font-black text-[#0d457a]">{newSlaValue}</span>
                       <span className="text-[9px] font-black text-blue-400 uppercase block">Dias</span>
                    </div>
                    <button 
                      onClick={() => setNewSlaValue(newSlaValue + 1)}
                      className="w-14 h-14 bg-[#0d457a] text-white rounded-2xl font-black text-xl hover:bg-blue-900 transition-all shadow-lg"
                    >
                      +
                    </button>
                  </div>
               </div>
               <button 
                  onClick={handleSaveSla}
                  className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
               >
                 <Save size={18} /> Salvar Configuração
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Setor (Simplificado) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
               <h3 className="text-lg font-black text-[#0d457a] uppercase tracking-tighter">Cadastrar Nova Unidade</h3>
               <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
               </button>
            </div>
            <div className="p-10 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Unidade *</label>
                  <input 
                    type="text" required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase outline-none focus:ring-4 ring-blue-500/5 transition-all text-xs"
                    value={newSector.name}
                    onChange={(e) => setNewSector({...newSector, name: e.target.value})}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SLA Padrão</label>
                    <input 
                      type="number" required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] outline-none text-xs"
                      value={newSector.defaultSlaDays}
                      onChange={(e) => setNewSector({...newSector, defaultSlaDays: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Análise</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[#0d457a] uppercase text-[10px] outline-none"
                      value={newSector.analysisType}
                      onChange={(e) => setNewSector({...newSector, analysisType: e.target.value})}
                    >
                      {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
               </div>
               <button 
                  type="submit"
                  className="w-full mt-4 py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all flex items-center justify-center gap-3"
               >
                 <Save size={18} /> Efetivar Unidade
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
