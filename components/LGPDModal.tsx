
import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface LGPDModalProps {
  userName: string;
  onAccept: () => void;
}

export const LGPDModal: React.FC<LGPDModalProps> = ({ userName, onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d457a]/95 backdrop-blur-md p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center border-b border-slate-100 bg-slate-50">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0d457a] rounded-3xl text-white mb-6 shadow-xl ring-8 ring-blue-50">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Termo de Privacidade e Proteção de Dados</h2>
          <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest">GESA / SUBIPEI - ESTADO DE GOIÁS</p>
        </div>

        <div className="p-10 max-h-[40vh] overflow-y-auto custom-scrollbar space-y-6">
          <div className="flex gap-4">
            <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl h-fit">
              <Eye size={20} />
            </div>
            <div>
              <h4 className="font-black text-[#0d457a] uppercase text-xs mb-1">Finalidade da Coleta</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Olá, <span className="font-bold">{userName}</span>. Para garantir a segurança institucional e a integridade das tramitações SEI, coletamos seu <strong>Nome, E-mail Corporativo e Endereço IP</strong> durante o uso deste sistema.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl h-fit">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="font-black text-emerald-700 uppercase text-xs mb-1">Seus Direitos (LGPD)</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Em conformidade com a Lei 13.709/2018, você tem direito ao acesso simplificado aos seus dados pessoais armazenados e à transparência sobre como eles são utilizados em logs de auditoria interna.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl h-fit">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-black text-amber-700 uppercase text-xs mb-1">Retenção de Dados</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Os registros de auditoria (quem acessou, o que alterou e de onde) são mantidos por tempo indeterminado para fins de conformidade legal e fiscalização pelos órgãos de controle do Estado.
              </p>
            </div>
          </div>
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest leading-relaxed">
            Ao clicar em aceitar, você declara estar ciente do tratamento dos seus dados para as finalidades de gestão pública descritas acima.
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
