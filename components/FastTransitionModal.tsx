import React, { useState, useMemo } from 'react';
import { Amendment, AmendmentMovement, SectorConfig, StatusConfig, Status } from '../types';
import { 
  X, Calendar, Clock, Save, Plus, Trash2, 
  CheckCircle2, ArrowRight, Building2, AlertTriangle,
  RotateCcw, Zap, Lock, CalendarArrowDown, CalendarArrowUp
} from 'lucide-react';

interface FastTransitionModalProps {
  amendment: Amendment;
  sectors: SectorConfig[];
  statuses: StatusConfig[];
  onClose: () => void;
  onSave: (updatedAmendment: Amendment) => void;
}

export const FastTransitionModal: React.FC<FastTransitionModalProps> = ({ 
  amendment, sectors, statuses, onClose, onSave 
}) => {
  const [editedMovements, setEditedMovements] = useState<AmendmentMovement[]>([...amendment.movements]);
  const [finalStatus, setFinalStatus] = useState<string>(amendment.status);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const finalStatuses = useMemo(() => statuses.filter(s => s.isFinal), [statuses]);

  const handleUpdateMovement = (index: number, field: keyof AmendmentMovement, value: any) => {
    const newMovs = [...editedMovements];
    const mov = { ...newMovs[index], [field]: value };

    // Se houver data de entrada e saída, calcula a permanência
    if (field === 'dateIn' || field === 'dateOut') {
      if (mov.dateIn && mov.dateOut) {
        const d1 = new Date(mov.dateIn);
        const d2 = new Date(mov.dateOut);
        const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        mov.daysSpent = Math.max(0, diff);
      }
    }

    newMovs[index] = mov;
    setEditedMovements(newMovs);
  };

  const handleAddMovement = () => {
    const lastMov = editedMovements[editedMovements.length - 1];
    const nextIn = lastMov?.dateOut || new Date().toISOString().split('T')[0];
    
    const newMov: AmendmentMovement = {
      id: `mov-fast-${Date.now()}`,
      amendmentId: amendment.id,
      fromSector: lastMov?.toSector || 'Protocolo',
      toSector: sectors[0]?.name || 'SES/CEP-20903',
      dateIn: nextIn,
      dateOut: null,
      deadline: new Date(new Date(nextIn).getTime() + 5 * 86400000).toISOString().split('T')[0],
      daysSpent: 0,
      handledBy: 'Ajuste Rápido',
      analysisType: 'Tramitação Manual'
    };
    setEditedMovements([...editedMovements, newMov]);
  };

  const handleRemoveMovement = (index: number) => {
    if (editedMovements.length <= 1) return;
    setEditedMovements(editedMovements.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const lastMov = editedMovements[editedMovements.length - 1];
    const newStatusVal = isFinalizing ? finalStatus : (lastMov?.analysisType || amendment.status);
    
    // Verificação de Lock rigorosa
    const isSettingFinal = newStatusVal === Status.COMMITMENT_LIQUIDATION || finalStatuses.some(s => s.name === newStatusVal);
    
    if (isSettingFinal) {
      if (!window.confirm("⚠️ ALERTA DE IMUTABILIDADE: Ao salvar com este status, o processo será BLOQUEADO para novas edições permanentemente. Confirma a finalização deste SEI?")) {
        return;
      }
    }

    const updated: Amendment = {
      ...amendment,
      movements: editedMovements.map(m => ({
        ...m,
        dateIn: m.dateIn ? new Date(m.dateIn).toISOString() : m.dateIn,
        dateOut: m.dateOut ? new Date(m.dateOut).toISOString() : null,
        deadline: m.deadline ? new Date(m.deadline).toISOString() : m.deadline
      })),
      currentSector: lastMov?.toSector || amendment.currentSector,
      status: newStatusVal,
      updatedAt: new Date().toISOString()
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0d457a]/90 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[48px] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-amber-500 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Editor Cronológico de Fluxo</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Ajuste de Datas e Unidades Técnicas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
            <AlertTriangle size={20} className="text-blue-500 shrink-0 mt-1" />
            <p className="text-[10px] text-blue-700 font-bold uppercase leading-relaxed">
              O sistema permite ajustar retroativamente as datas de entrada e saída. Ao definir um status final, o registro será **congelado** conforme o Decreto Estadual nº 10.634/2025.
            </p>
          </div>

          <div className="space-y-4">
            {editedMovements.map((mov, idx) => (
              <div key={mov.id} className="relative flex gap-6 group animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0d457a] flex items-center justify-center font-black text-xs shadow-sm border border-slate-200">
                    {idx + 1}
                  </div>
                  {idx < editedMovements.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-2"></div>}
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-blue-200 transition-all grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Unidade Técnica</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-[#0d457a] outline-none"
                      value={mov.toSector}
                      onChange={(e) => handleUpdateMovement(idx, 'toSector', e.target.value)}
                    >
                      {sectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Entrada</label>
                    <div className="relative">
                      <input 
                        type="date"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black text-[#0d457a] outline-none"
                        value={mov.dateIn ? mov.dateIn.substring(0, 10) : ''}
                        onChange={(e) => handleUpdateMovement(idx, 'dateIn', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Saída</label>
                    <div className="relative">
                      <input 
                        type="date"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black text-[#0d457a] outline-none"
                        value={mov.dateOut ? mov.dateOut.substring(0, 10) : ''}
                        onChange={(e) => handleUpdateMovement(idx, 'dateOut', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">SLA Gasto</label>
                    <div className="flex items-center gap-2 h-10 px-4 bg-blue-50 rounded-xl border border-blue-100">
                      <Clock size={14} className="text-blue-400" />
                      <span className="text-xs font-black text-blue-700">{mov.daysSpent}d</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-end">
                    <button 
                      onClick={() => handleRemoveMovement(idx)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Remover Etapa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={handleAddMovement}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-[#0d457a] hover:text-[#0d457a] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Plus size={16} /> Inserir Nova Etapa no Histórico
            </button>
          </div>

          <div className="pt-10 border-t border-slate-100">
            <div className={`p-8 rounded-[40px] border-2 transition-all ${isFinalizing ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${isFinalizing ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                    {isFinalizing ? <Lock size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0d457a] uppercase tracking-tight">Status Final de Liquidação</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aciona o bloqueio de segurança GESA</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isFinalizing} onChange={e => setIsFinalizing(e.target.checked)} className="sr-only peer" />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isFinalizing && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">Selecione o Estado de Baixa</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {statuses.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setFinalStatus(s.name)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all ${finalStatus === s.name ? 'border-blue-600 bg-white shadow-md' : 'border-blue-100 bg-white/50 opacity-60'}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase text-blue-900">{s.name}</span>
                          {(s.isFinal || s.name === Status.COMMITMENT_LIQUIDATION) && <Lock size={12} className="text-blue-400" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descartar</button>
          <button 
            onClick={handleSave}
            className="bg-[#0d457a] text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#0a365f] transition-all flex items-center gap-3 active:scale-95"
          >
            <Save size={18} /> Efetivar e Bloquear Histórico
          </button>
        </div>
      </div>
    </div>
  );
};