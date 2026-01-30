
/**
 * MODAL DE CONSENTIMENTO LGPD
 * 
 * Este componente é exibido no primeiro acesso de um usuário ao sistema.
 * Sua finalidade é informar o usuário sobre quais dados pessoais são coletados
 * e para qual finalidade, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
 * 
 * O sistema só é liberado para uso após o usuário clicar no botão "Aceitar e Continuar".
 * A aceitação é registrada no `localStorage` do navegador para não ser exibida novamente.
 */
import React from 'react';
import { APP_VERSION } from '../constants';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

// Define a estrutura das props que o componente espera receber.
interface LGPDModalProps {
  userName: string; // Nome do usuário para personalizar a saudação.
  onAccept: () => void; // Callback a ser executado quando o usuário aceita o termo.
}

export const LGPDModal: React.FC<LGPDModalProps> = ({ userName, onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-md p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Cabeçalho do Modal */}
        <div className="p-10 text-center border-b border-slate-100 bg-slate-50">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0d457a] rounded-3xl text-white mb-6 shadow-xl ring-8 ring-blue-50">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Termo de Privacidade e Proteção de Dados</h2>
          <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest">GESA / SUBIPEI - v{APP_VERSION}</p>
        </div>

        {/* Corpo com o texto informativo */}
        <div className="p-10 max-h-[40vh] overflow-y-auto custom-scrollbar space-y-6">
          <div className="flex gap-4">
            <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl h-fit">
              <Eye size={20} />
            </div>
            <div>
              <h4 className="font-black text-[#0d457a] uppercase text-xs mb-1">Finalidade da Coleta</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Olá, <span className="font-bold">{userName}</span>. Para garantir a segurança institucional e a integridade das tramitações SEI, coletamos seu <strong>Nome, E-mail Corporativo e Endereço IP</strong> durante o uso deste sistema em conformidade com as diretrizes da versão {APP_VERSION}.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl h-fit">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="font-black text-[#0d457a] uppercase text-xs mb-1">Segurança e Proteção</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Seus dados são protegidos por políticas rigorosas de acesso e criptografia, garantindo que o uso do sistema v{APP_VERSION} seja seguro e auditável.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé com o botão de aceite */}
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest leading-relaxed">
            Ao clicar em aceitar, você declara estar ciente do tratamento dos seus dados para as finalidades de gestão pública descritas acima no sistema v{APP_VERSION}.
          </p>
          <button 
            onClick={onAccept}
            className="w-full py-5 bg-[#0d457a] text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-[#0a365f] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Aceitar e Continuar <CheckCircle2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
