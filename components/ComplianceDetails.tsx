import React from 'react';
import { Scale, ShieldCheck, FileText, Lock, CheckCircle, AlertTriangle, Info, Gavel, ScrollText, Users, Eye, ExternalLink } from 'lucide-react';

export const ComplianceDetails: React.FC = () => {
  const laws = [
    { 
      title: "DECRETO Nº 10.634, DE 31 DE JANEIRO DE 2025", 
      description: "Dispõe sobre os procedimentos e normas para a execução de emendas parlamentares impositivas e transferências especiais no âmbito do Estado de Goiás.",
      url: "https://legisla.casacivil.go.gov.br/pesquisa_legislacao/110418/decreto-10634"
    },
    { 
      title: "Lei Geral de Proteção de Dados (LGPD)", 
      description: "Garante a privacidade e segurança dos dados dos servidores e cidadãos envolvidos nos processos.",
      url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
    },
    { 
      title: "Lei Estadual nº 13.800, de 18 de janeiro de 2001", 
      description: "Regula o processo administrativo no âmbito da Administração Pública do Estado de Goiás, estabelecendo normas fundamentais sobre deveres, direitos e procedimentos.",
      url: "https://legisla.casacivil.go.gov.br/pesquisa_legislacao/81441/lei-13800"
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Detalhes de Conformidade</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Marco Regulatório e Governança de Dados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Scale size={180} /></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-blue-50 text-[#0d457a] rounded-3xl shadow-sm">
                <Gavel size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tight">Base Legal de Operação</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Normativas que regem o GESA Cloud</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              {laws.map((law, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-[#0d457a]/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="mt-1"><ScrollText size={20} className="text-blue-500" /></div>
                    <div>
                      <a 
                        href={law.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-black text-[#0d457a] uppercase text-sm mb-2 hover:text-blue-600 transition-colors flex items-center gap-2 group/link"
                      >
                        {law.title}
                        <ExternalLink size={14} className="opacity-40 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{law.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 p-12 opacity-10"><ShieldCheck size={200} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white/10 text-emerald-400 rounded-3xl border border-white/5">
                  <Lock size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">Proteção de Dados (LGPD)</h3>
                  <p className="text-xs text-blue-200/50 font-bold uppercase tracking-widest">Diretrizes de Privacidade Ativas</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye size={18} className="text-emerald-300" />
                    <h5 className="text-[11px] font-black uppercase tracking-widest">Transparência Ativa</h5>
                  </div>
                  <p className="text-[10px] text-blue-100/60 leading-relaxed font-bold uppercase">
                    Dados coletados destinam-se exclusivamente ao controle de prazos e integridade dos trâmites administrativos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" /> Selos de Conformidade
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Cloud Security AES-256', status: 'Ativo', icon: CheckCircle, color: 'text-emerald-500' },
                { label: 'Logs Imutáveis', status: 'Sync ON', icon: CheckCircle, color: 'text-emerald-500' },
                { label: 'Varredura Vulnerabilidades', status: 'Em Dia', icon: CheckCircle, color: 'text-emerald-500' }
              ].map((badge, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-[#0d457a] uppercase">{badge.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{badge.status}</span>
                    <badge.icon size={16} className={badge.color} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
