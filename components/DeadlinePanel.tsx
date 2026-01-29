/**
 * PAINEL DE MONITORAMENTO DE PRAZOS (SLA)
 * 
 * Este componente fornece uma visão focada exclusivamente nos prazos de Service Level Agreement (SLA)
 * de todos os processos que estão atualmente em tramitação. Ele ajuda os gestores a identificar
 * rapidamente quais processos estão próximos do vencimento ou já atrasados.
 * 
 * Funcionalidades:
 * - Filtra e exibe apenas os processos com status que não sejam 'Concluído'.
 * - Para cada processo, calcula o status do SLA (Atrasado, Crítico, No Prazo).
 * - Exibe uma tabela clara com informações essenciais: SEI, setor atual, data limite e status do SLA.
 * - Permite clicar em um processo para navegar diretamente para sua tela de detalhes.
 */
import React from 'react';
import { Amendment, Status } from '../types';
import { AlertCircle, Clock, CheckCircle2, Search } from 'lucide-react';

// Define a estrutura das props que o componente espera receber.
interface DeadlinePanelProps {
  amendments: Amendment[];        // A lista completa de todos os processos.
  onSelect: (a: Amendment) => void; // Callback para navegar para os detalhes de um processo.
}

export const DeadlinePanel: React.FC<DeadlinePanelProps> = ({ amendments, onSelect }) => {
  // Filtra apenas os processos que estão em andamento (não concluídos ou arquivados).
  const activeProcesses = amendments.filter(a => a.status !== Status.CONCLUDED && a.status !== Status.ARCHIVED);

  /**
   * Calcula o status do SLA com base na data de hoje e na data limite do processo.
   * @param deadline A data limite (deadline) do último movimento do processo.
   * @returns Um objeto contendo a etiqueta de status, a classe de cor e o ícone correspondente.
   */
  const getSlaStatus = (deadline: string) => {
    const today = new Date();
    const limit = new Date(deadline);
    // Calcula a diferença de dias entre a data limite e hoje.
    const diffDays = Math.ceil((limit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'ATRASADO', color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle };
    if (diffDays <= 2) return { label: 'CRÍTICO', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Clock };
    return { label: 'NO PRAZO', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div>
        <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight">Monitoramento de Prazos</h2>
        <p className="text-slate-500 text-sm">Acompanhamento em tempo real dos SLAs por processo.</p>
      </div>

      {/* Tabela de Prazos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Processo SEI</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Setor Atual</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Data Limite</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Status SLA</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeProcesses.map(a => {
              // Pega o último movimento para obter a data de deadline atual.
              const lastMovement = a.movements[a.movements.length - 1];
              const sla = getSlaStatus(lastMovement?.deadline || new Date().toISOString());
              const SlaIcon = sla.icon;

              return (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#0d457a]">{a.seiNumber}</div>
                    <div className="text-[10px] text-slate-400 uppercase truncate max-w-[200px]">{a.object}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{a.currentSector}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-500">{new Date(lastMovement?.deadline).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${sla.color}`}>
                      <SlaIcon size={12} />
                      {sla.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onSelect(a)} className="p-2 hover:bg-blue-50 rounded-full text-[#0d457a] transition-colors">
                      <Search size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {activeProcesses.length === 0 && (
          <div className="p-12 text-center text-slate-400 italic">Nenhum processo em tramitação ativa.</div>
        )}
      </div>
    </div>
  );
};
