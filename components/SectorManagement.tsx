
/**
 * MÓDULO DE GESTÃO DE SETORES TÉCNICOS (FLUXO MESTRE)
 * 
 * Este componente permite definir a arquitetura permanente do fluxo.
 * Regra de Negócio: Uma vez registrado, o setor é permanente. 
 * Apenas o SLA (prazo) pode ser editado para ajustes operacionais.
 */
import React, { useState, useMemo } from 'react';
import { SectorConfig, AnalysisType } from '../types';
import { 
  Plus, Clock, ShieldCheck, X, Building2, Briefcase, 
  Lock, AlertCircle, Info, CheckCircle2, Search, ArrowRight, Trash2, ShieldAlert, LayoutList, Pencil, Save
} from 'lucide-react';

interface SectorManagementProps {
  sectors: SectorConfig[];
  onAdd: (sector: SectorConfig) => void;
  onReset: () => void;
  onUpdateSla: (id: string, newSla: number) => void;
}

export const SectorManagement: React.FC<SectorManagementProps> = ({ sectors, onAdd, onReset, onUpdateSla }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSlaId, setEditingSlaId] = useState<string | null>(null);
  const [tempSla, setTempSla] = useState<number>(0);

  const [newSector, setNewSector] = useState<Partial<SectorConfig>>({
    name: '',
    defaultSlaDays: 5,
    analysisType: AnalysisType.TECHNICAL
  });

  const filteredSectors = useMemo(() => {
    return sectors.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sectors, searchTerm]);

  const handleReset = () => {
    if (window.confirm("⚠️ ALERTA: Esta ação apagará todos os setores atuais. Esta é uma operação de reset da arquitetura de fluxo. Confirmar?")) {
      onReset();
    }
  };

  const startEditSla = (sector: SectorConfig) => {
    setEditingSlaId(sector.id);
    setTempSla(sector.defaultSlaDays);
  };

  const saveSla = (id: string) => {
    if (tempSla > 0) {
      onUpdateSla(id, tempSla);
      setEditingSlaId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSector.name) {
      const exists = sectors.some(s => s.name.toLowerCase() === newSector.name?.toLowerCase());
      if (exists) {
        alert("Este setor já está registrado.");
        return;
      }

      onAdd({
        id: `SEC-${Date.now()}`,
        name: newSector.name,
        defaultSlaDays: newSector.defaultSlaDays || 5,
        analysisType: newSector.analysisType || AnalysisType.TECHNICAL
      } as SectorConfig);
      
      setIsModalOpen(false);
      setNewSector({ name: '', defaultSlaDays: 5, analysisType: AnalysisType.TECHNICAL });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho de Gestão */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Arquitetura de Fluxo</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <Lock size={14} className="text-amber-500"/> Registro Permanente de Unidades Técnicas GESA
          </p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleReset} 
              className="flex items-center gap-2 bg-white text-red-500 border border-red-100 px-6 py-4 rounded-[20px] hover:bg-red-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest"
            >
                <Trash2 size={16} /> Reset Total
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-3 bg-[#0d457a] text-white px-8 py-4 rounded-[20px] hover:bg-[#0a365f] transition-all shadow-[0_10px_20px_rgba(13,69,122,0.2)] uppercase text-[11px] font-black tracking-[0.2em] group"
            >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
                Registrar Novo Setor
            </button>
        </div>
      </div>

      {/* Alerta de Regra de Negócio */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-2xl flex gap-4 items-start shadow-sm">
         <div className="p-2 bg-blue-500 text-white rounded-lg shadow-md"><ShieldAlert size={20}/></div>
         <div>
            <h4 className="text-blue-800 font-black text-xs uppercase tracking-wider">Protocolo de Imutabilidade Operacional</h4>
            <p className="text-blue-700 text-xs font-medium mt-1 leading-relaxed">
              Para garantir a integridade histórica dos trâmites, os nomes e tipos de análise dos setores são <strong>permanentes</strong> após o registro. 
              Apenas o <strong>prazo (SLA)</strong> pode ser editado para refletir a capacidade produtiva de cada unidade.
            </p>
         </div>
      </div>

      {/* Filtro de Busca */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-3">
         <Search size={20} className="text-slate-300 ml-2" />
         <input 
            type="text" 
            placeholder="Pesquisar setores registrados..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-600 placeholder:text-slate-300 uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
         <div className="px-4 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase border border-slate-100">
            Ativos: {sectors.length}
         </div>
      </div>

      {/* Grid de Setores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSectors.map(sector => (
          <div key={sector.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 hover:shadow-xl hover:border-[#0d457a]/20 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl group-hover:bg-[#0d457a] group-hover:text-white transition-colors duration-300 shadow-sm">
                      <Building2 size={24} />
                   </div>
                   <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-100">
                      <ShieldCheck size={12}/> Registrado
                   </span>
                </div>
                
                <h3 className="font-black text-base text-[#0d457a] uppercase leading-tight mb-2 min-h-[40px]">{sector.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                   <Briefcase size={14} className="text-slate-300" />
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sector.analysisType}</span>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">SLA Operacional</span>
                        
                        {editingSlaId === sector.id ? (
                           <div className="flex items-center gap-2 animate-in zoom-in-95">
                              <input 
                                 type="number" 
                                 value={tempSla} 
                                 onChange={(e) => setTempSla(parseInt(e.target.value))}
                                 className="w-20 px-3 py-2 bg-slate-50 border border-[#0d457a] rounded-lg text-sm font-black text-[#0d457a] outline-none"
                                 autoFocus
                              />
                              <button onClick={() => saveSla(sector.id)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                                 <Save size={14} />
                              </button>
                              <button onClick={() => setEditingSlaId(null)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-colors shadow-sm">
                                 <X size={14} />
                              </button>
                           </div>
                        ) : (
                           <div className="flex items-center justify-between group/sla">
                              <div className="flex items-center gap-2">
                                  <Clock size={16} className="text-amber-500" />
                                  <span className="text-base font-black text-[#0d457a]">{sector.defaultSlaDays} Dias</span>
                              </div>
                              <button 
                                 onClick={() => startEditSla(sector)}
                                 className="opacity-0 group-hover/sla:opacity-100 p-2 text-slate-300 hover:text-[#0d457a] hover:bg-slate-50 rounded-lg transition-all"
                                 title="Editar Prazo"
                              >
                                 <Pencil size={14} />
                              </button>
                           </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        ))}

        {filteredSectors.length === 0 && (
          <div className="col-span-full py-32 text-center bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <LayoutList size={32} className="text-slate-300"/>
             </div>
             <h3 className="text-slate-400 font-black uppercase tracking-widest">Nenhum setor cadastrado</h3>
             <p className="text-slate-300 text-xs font-bold uppercase mt-2">Clique em "Registrar Novo Setor" para iniciar.</p>
          </div>
        )}
      </div>

      {/* Modal de Cadastro Permanente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Registro Permanente</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Goiás em Crescimento - Fluxo Mestre</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="bg-amber-50 p-5 rounded-2xl flex gap-4 items-center border border-amber-100">
                 <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm"><Info size={20}/></div>
                 <p className="text-xs text-amber-800 font-bold leading-tight uppercase tracking-tight">Cuidado: O nome e a atribuição não poderão ser alterados após o registro para manter a integridade dos dados.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Nome da Unidade / Setor</label>
                <div className="relative">
                    <Building2 size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      value={newSector.name} 
                      onChange={(e) => setNewSector({...newSector, name: e.target.value})} 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none transition-all font-bold text-[#0d457a] uppercase placeholder:text-slate-300" 
                      required 
                      placeholder="Ex: GESA - PROTOCOLO" 
                    />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">SLA Inicial (Dias)</label>
                  <div className="relative">
                      <Clock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="number" 
                        value={newSector.defaultSlaDays} 
                        onChange={(e) => setNewSector({...newSector, defaultSlaDays: parseInt(e.target.value)})} 
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none transition-all font-bold" 
                        required 
                        min="1" 
                      />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Atribuição GESA</label>
                  <div className="relative">
                      <Briefcase size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <select 
                        value={newSector.analysisType} 
                        onChange={(e) => setNewSector({...newSector, analysisType: e.target.value as AnalysisType})} 
                        className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0d457a]/10 outline-none transition-all appearance-none font-bold text-slate-600"
                      >
                          {Object.values(AnalysisType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ArrowRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                  <button 
                    type="submit" 
                    className="w-full py-5 bg-[#0d457a] text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-[#0a365f] transition-all flex items-center justify-center gap-4 group"
                  >
                    Efetivar Registro <CheckCircle2 size={22} className="group-hover:scale-110 transition-transform"/>
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
