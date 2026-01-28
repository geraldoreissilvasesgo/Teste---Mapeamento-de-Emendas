
import React, { useState } from 'react';
import { SectorConfig, AnalysisType } from '../types';
import { Settings, Plus, Clock, ShieldCheck, RotateCcw, Trash2 } from 'lucide-react';

interface SectorManagementProps {
  sectors: SectorConfig[];
  onAdd: (sector: SectorConfig) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}

export const SectorManagement: React.FC<SectorManagementProps> = ({ sectors, onAdd, onDelete, onReset }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSector, setNewSector] = useState<Partial<SectorConfig>>({
    name: '',
    defaultSlaDays: 5,
    analysisType: AnalysisType.TECHNICAL
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSector.name) {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        name: newSector.name,
        defaultSlaDays: newSector.defaultSlaDays || 5,
        analysisType: newSector.analysisType || AnalysisType.TECHNICAL
      } as SectorConfig);
      setIsModalOpen(false);
      setNewSector({ name: '', defaultSlaDays: 5, analysisType: AnalysisType.TECHNICAL });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Gestão de Setores Técnicos</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Configuração de Fluxos, Departamentos e Tempos de Resposta (SLA).</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="bg-white text-slate-500 border border-slate-200 px-4 py-2 rounded-xl font-black flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-50 transition-all"
          >
            <RotateCcw size={14} /> Resetar Base
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0d457a] text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#0a365f] transition-all"
          >
            <Plus size={16} /> Novo Setor Técnico
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map(sector => (
          <div key={sector.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[#0d457a] uppercase truncate pr-4 text-sm tracking-tight">{sector.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{sector.id}</p>
              </div>
              <button 
                onClick={() => {
                  if(window.confirm(`Excluir o setor ${sector.name}?`)) onDelete(sector.id);
                }}
                className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SLA Padrão</p>
                  <p className="text-xs font-black text-slate-700 uppercase">{sector.defaultSlaDays} Dias Úteis</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tipo de Análise</p>
                  <p className="text-xs font-black text-slate-700 uppercase">{sector.analysisType}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {sectors.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center">
             <Settings size={48} className="text-slate-200 mb-4 animate-spin-slow" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum setor técnico configurado.</p>
             <p className="text-[10px] text-slate-400 uppercase mt-1">Inicie o cadastro para definir os fluxos do sistema.</p>
             <button onClick={() => setIsModalOpen(true)} className="mt-6 bg-white border border-slate-200 px-6 py-2 rounded-xl text-[#0d457a] font-black text-[10px] uppercase shadow-sm hover:shadow-md transition-all">Começar Cadastro</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Novo Setor GESA</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Definição de Parâmetros Operacionais</p>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome do Setor / Gerência</label>
                <input 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] focus:bg-white outline-none transition-all font-bold text-slate-700"
                  value={newSector.name}
                  onChange={e => setNewSector({...newSector, name: e.target.value})}
                  placeholder="Ex: Gerência de Compras"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">SLA Padrão (Dias)</label>
                  <input 
                    type="number"
                    required 
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0d457a] focus:bg-white outline-none transition-all font-bold text-slate-700"
                    value={newSector.defaultSlaDays}
                    onChange={e => setNewSector({...newSector, defaultSlaDays: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipo de Análise</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 text-xs uppercase"
                    value={newSector.analysisType}
                    onChange={e => setNewSector({...newSector, analysisType: e.target.value as AnalysisType})}
                  >
                    {Object.values(AnalysisType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Cancelar</button>
                <button type="submit" className="flex-[2] py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-[#0a365f] transition-all">Salvar Setor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
