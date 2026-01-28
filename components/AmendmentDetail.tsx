import React, { useState } from 'react';
import { Amendment, Sector, Status, User, Role, AIAnalysisResult } from '../types';
import { ArrowLeft, Send, Sparkles, MapPin, Calendar, Clock, AlertTriangle, CheckCircle, FileText, Building2, HardHat, MonitorCheck, Trash2 } from 'lucide-react';
import { analyzeAmendment } from '../services/geminiService';

interface AmendmentDetailProps {
  amendment: Amendment;
  currentUser: User;
  onBack: () => void;
  onMove: (amendmentId: string, toSector: Sector) => void;
  onStatusChange: (amendmentId: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export const AmendmentDetail: React.FC<AmendmentDetailProps> = ({ 
  amendment, 
  currentUser, 
  onBack, 
  onMove, 
  onStatusChange,
  onDelete
}) => {
  const [targetSector, setTargetSector] = useState<Sector>(Sector.PROTOCOL);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const handleMove = () => {
    if (targetSector !== amendment.currentSector) {
      onMove(amendment.id, targetSector);
    }
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
        "ATENÇÃO: A exclusão desta emenda é IRREVERSÍVEL!\n\nTem certeza que deseja apagar permanentemente este registro?\n\nEssa ação será registrada na auditoria."
    );
    if (confirmDelete) {
        onDelete(amendment.id);
    }
  };

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    const result = await analyzeAmendment(amendment);
    setAiResult(result);
    setIsAiLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-900 transition-colors font-medium"
        >
            <ArrowLeft size={20} />
            Voltar para a lista
        </button>

        {currentUser.role !== Role.VIEWER && (
            <button 
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md transition-colors border border-transparent hover:border-red-100"
            title="Excluir Permanentemente"
            >
            <Trash2 size={18} />
            <span className="text-sm font-bold uppercase">Excluir Emenda</span>
            </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-slate-800">{amendment.code}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold
                ${amendment.status === Status.CONCLUDED ? 'bg-green-100 text-green-700' : 
                  amendment.status === Status.APPROVED ? 'bg-green-100 text-green-700' :
                  amendment.status.includes('diligência') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                {amendment.statusDescription || amendment.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 mb-2">
               <FileText size={16} className="text-blue-700" />
               <span className="font-medium">Processo SEI: {amendment.seiNumber}</span>
            </div>
            <h3 className="text-xl text-slate-700 font-medium mt-2">{amendment.object}</h3>
          </div>
          <div className="text-right bg-slate-50 p-4 rounded-lg border border-slate-100">
             <p className="text-xs text-slate-500 uppercase tracking-wide">Valor Total</p>
             <p className="text-2xl font-bold text-blue-900">R$ {amendment.value.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Technical Data from Spreadsheet */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           <div className={`p-4 rounded-lg border flex items-center gap-3 ${amendment.suinfra ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
              <HardHat size={20} className={amendment.suinfra ? 'text-orange-600' : 'text-slate-400'} />
              <div>
                 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">SUINFRA</p>
                 <p className={`font-bold ${amendment.suinfra ? 'text-orange-700' : 'text-slate-600'}`}>
                   {amendment.suinfra ? 'SIM (Envolve Obra)' : 'NÃO'}
                 </p>
              </div>
           </div>
           
           <div className={`p-4 rounded-lg border flex items-center gap-3 ${amendment.sutis ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
              <MonitorCheck size={20} className={amendment.sutis ? 'text-indigo-600' : 'text-slate-400'} />
              <div>
                 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">SUTIS</p>
                 <p className={`font-bold ${amendment.sutis ? 'text-indigo-700' : 'text-slate-600'}`}>
                   {amendment.sutis ? 'SIM (TI/Equip)' : 'NÃO'}
                 </p>
              </div>
           </div>

           <div className="p-4 rounded-lg border border-slate-100 bg-slate-50">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Data de Entrada</p>
              <div className="flex items-center gap-2 text-slate-700">
                 <Calendar size={16} />
                 <span className="font-mono font-medium">{amendment.entryDate ? new Date(amendment.entryDate).toLocaleDateString() : 'N/A'}</span>
              </div>
           </div>

           <div className="p-4 rounded-lg border border-slate-100 bg-slate-50">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Data de Saída</p>
              <div className="flex items-center gap-2 text-slate-700">
                 <Calendar size={16} />
                 <span className="font-mono font-medium">{amendment.exitDate ? new Date(amendment.exitDate).toLocaleDateString() : 'Em andamento'}</span>
              </div>
           </div>
        </div>

        {amendment.notes && (
           <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-8">
              <p className="text-xs font-bold text-yellow-700 uppercase mb-1 flex items-center gap-1">
                 <AlertTriangle size={12} /> Observações Importantes
              </p>
              <p className="text-sm text-yellow-900">{amendment.notes}</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Município</p>
            <div className="flex items-center gap-2">
               <MapPin size={16} className="text-slate-400" />
               <p className="font-medium text-slate-700">{amendment.municipality}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Unidade de Saúde</p>
            <div className="flex items-center gap-2">
               <Building2 size={16} className="text-slate-400" />
               <p className="font-medium text-slate-700 text-sm">{amendment.healthUnit}</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Setor Atual</p>
            <p className="font-bold text-blue-900">{amendment.currentSector}</p>
          </div>
        </div>

        {/* Operational Module: Move Amendment */}
        {currentUser.role !== Role.VIEWER && (
           <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
             <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Send size={18} className="text-blue-600" />
               Módulo Operacional - Tramitação
             </h4>
             <div className="flex flex-col md:flex-row gap-4 items-end">
               <div className="flex-1 w-full">
                 <label className="block text-sm font-medium text-slate-600 mb-1">Encaminhar para:</label>
                 <select 
                   className="w-full border border-slate-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                   value={targetSector}
                   onChange={e => setTargetSector(e.target.value as Sector)}
                 >
                   {Object.values(Sector).map(s => (
                     <option key={s} value={s} disabled={s === amendment.currentSector}>
                       {s}
                     </option>
                   ))}
                 </select>
               </div>
               <button 
                 onClick={handleMove}
                 disabled={targetSector === amendment.currentSector}
                 className="w-full md:w-auto px-6 py-2.5 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
               >
                 Registrar Tramitação
               </button>
               {currentUser.role === Role.ADMIN && (
                 <button 
                    onClick={() => onStatusChange(amendment.id, Status.APPROVED)}
                    className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium transition-colors ml-auto shadow-sm"
                 >
                    Aprovar Final
                 </button>
               )}
             </div>
           </div>
        )}

        {/* AI Helper */}
        <div className="mb-8">
           {!aiResult ? (
             <button 
               onClick={runAiAnalysis}
               disabled={isAiLoading}
               className="flex items-center gap-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors border border-indigo-200"
             >
               <Sparkles size={18} />
               {isAiLoading ? 'Analisando histórico com IA...' : 'Analisar Gargalos com IA'}
             </button>
           ) : (
             <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-lg p-6">
               <div className="flex items-center gap-2 text-indigo-800 font-bold mb-3">
                 <Sparkles size={20} />
                 Análise Inteligente
               </div>
               <div className="space-y-3 text-sm text-slate-700">
                 <p><strong className="text-indigo-900">Resumo:</strong> {aiResult.summary}</p>
                 <p className="flex items-start gap-2">
                   <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                   <span><strong className="text-amber-700">Gargalo:</strong> {aiResult.bottleneck}</span>
                 </p>
                 <p className="flex items-start gap-2">
                   <CheckCircle size={16} className="text-emerald-600 mt-0.5" />
                   <span><strong className="text-emerald-800">Recomendação:</strong> {aiResult.recommendation}</span>
                 </p>
               </div>
             </div>
           )}
        </div>

        {/* Timeline Tracking */}
        <div className="relative border-l-2 border-slate-200 ml-3 md:ml-6 space-y-8">
          {amendment.movements.slice().reverse().map((movement, idx) => (
            <div key={movement.id} className="relative pl-8">
              {/* Dot */}
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 
                ${idx === 0 ? 'bg-blue-600 border-blue-200' : 'bg-slate-300 border-slate-100'}`}>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-800">{movement.toSector}</h4>
                   <span className="text-xs text-slate-500 flex items-center gap-1">
                     <Calendar size={12} />
                     {new Date(movement.dateIn).toLocaleDateString()}
                   </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600">
                   {movement.dateOut ? (
                     <div className="flex items-center gap-1">
                       <Clock size={14} className="text-slate-500" />
                       <span>Permaneceu por <span className="font-semibold">{movement.daysSpent} dias</span></span>
                     </div>
                   ) : (
                     <span className="text-blue-700 font-medium px-2 py-0.5 bg-blue-100 rounded text-xs">Atualmente neste setor</span>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};