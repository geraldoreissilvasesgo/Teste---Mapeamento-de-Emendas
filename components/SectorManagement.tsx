
import React, { useState } from 'react';
import { SectorConfig, AnalysisType } from '../types';
import { Settings, Plus, Trash2, Clock, ShieldCheck } from 'lucide-react';

interface SectorManagementProps {
  sectors: SectorConfig[];
  onAdd: (sector: SectorConfig) => void;
  onDelete: (id: string) => void;
}

export const SectorManagement: React.FC<SectorManagementProps> = ({ sectors, onAdd, onDelete }) => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight">Gestão de Setores</h2>
          <p className="text-slate-500 text-sm">Configure departamentos e tempos de resposta (SLA).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0d457a] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 uppercase text-xs shadow-md"
        >
          <Plus size={16} /> Novo Setor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map(sector => (
          <div key={sector.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-[#0d457a] uppercase truncate pr-4">{sector.name}</h3>
              <button onClick={() => onDelete(sector.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={14} className="text-blue-500" />
                <span className="font-bold">SLA:</span> {sector.defaultSlaDays} dias úteis
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="font-bold">Análise:</span> {sector.analysisType}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d457a]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8">
            <h3 className="text-xl font-bold text-[#0d457a] mb-6 uppercase">Configurar Novo Setor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Setor</label>
                <input 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0d457a]"
                  value={newSector.name}
                  onChange={e => setNewSector({...newSector, name: e.target.value})}
                  placeholder="Ex: Gerência de Compras"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SLA Padrão (Dias)</label>
                  <input 
                    type="number"
                    required 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0d457a]"
                    value={newSector.defaultSlaDays}
                    onChange={e => setNewSector({...newSector, defaultSlaDays: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Análise</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none bg-white"
                    value={newSector.analysisType}
                    onChange={e => setNewSector({...newSector, analysisType: e.target.value as AnalysisType})}
                  >
                    {Object.values(AnalysisType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500 font-bold uppercase text-xs">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-[#0d457a] text-white rounded-lg font-bold uppercase text-xs shadow-md">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
