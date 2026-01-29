
/**
 * MÓDULO DE DOCUMENTAÇÃO DE GOVERNANÇA (COBIT / ITIL)
 * 
 * Central de conformidade estratégica que descreve como o sistema GESA
 * se alinha aos melhores frameworks de gestão de TI do mundo.
 */
import React, { useState } from 'react';
import { 
  BookOpen, ShieldCheck, Zap, Workflow, Scale, 
  FileCheck, Target, Layers, Network, ChevronRight, 
  FileText, Briefcase, HelpCircle, GraduationCap
} from 'lucide-react';

export const GovernanceDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cobit' | 'itil' | 'compliance'>('cobit');

  const cobitObjectives = [
    { 
      domain: 'EDM01 (Avaliar, Direcionar e Monitorar)', 
      objective: 'Garantir a definição e manutenção da governança.',
      implementation: 'Conselho de TI da GESA define prioridades e monitora a entrega de valor das emendas.'
    },
    { 
      domain: 'APO03 (Gerenciar Arquitetura)', 
      objective: 'Manter a arquitetura de dados e sistemas íntegra.',
      implementation: 'Uso de schemas rigorosos em TypeScript e barramento de dados centralizado.'
    },
    { 
      domain: 'BAI06 (Gerenciar Mudanças)', 
      objective: 'Minimizar impactos de mudanças no ambiente operacional.',
      implementation: 'Trilha de auditoria completa para cada alteração de status ou tramitação.'
    }
  ];

  const itilPractices = [
    {
      practice: 'Gestão de Nível de Serviço (SLA)',
      description: 'Monitoramento contínuo dos tempos de resposta de cada setor técnico.',
      benefit: 'Redução de gargalos e previsibilidade na liquidação dos processos.'
    },
    {
      practice: 'Gestão de Configuração (SACM)',
      description: 'Mapeamento das dependências entre os setores e tipos de emenda.',
      benefit: 'Visão clara do fluxo de valor (Value Stream Mapping).'
    },
    {
      practice: 'Gestão de Incidentes',
      description: 'Workflow para tramitação e retorno de processos em diligência.',
      benefit: 'Resolução ágil de pendências documentais.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Diretrizes de Governança</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <GraduationCap size={16} className="text-blue-500" /> Alinhamento Estratégico COBIT & ITIL
          </p>
        </div>
      </div>

      <div className="flex gap-4 p-1.5 bg-slate-100 rounded-[24px] w-fit">
        <button 
          onClick={() => setActiveTab('cobit')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cobit' ? 'bg-[#0d457a] text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          COBIT 2019
        </button>
        <button 
          onClick={() => setActiveTab('itil')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'itil' ? 'bg-[#0d457a] text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          ITIL v4
        </button>
        <button 
          onClick={() => setActiveTab('compliance')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'compliance' ? 'bg-[#0d457a] text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          Compliance & LGPD
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'cobit' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
              <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl"><Target size={24} /></div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Objetivos de Controle (COBIT)</h3>
                </div>
                <div className="space-y-6">
                  {cobitObjectives.map((obj, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest">{obj.domain}</span>
                      </div>
                      <h4 className="text-sm font-black text-[#0d457a] uppercase mb-2">{obj.objective}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed"><span className="font-bold text-slate-700 uppercase">Aplicação GESA:</span> {obj.implementation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'itil' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
              <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Workflow size={24} /></div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Práticas de Serviço (ITIL)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {itilPractices.map((prac, i) => (
                    <div key={i} className="p-8 border border-slate-100 rounded-[32px] hover:shadow-xl transition-all">
                      <h4 className="text-sm font-black text-[#0d457a] uppercase mb-4 border-b border-slate-50 pb-4">{prac.practice}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{prac.description}</p>
                      <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                        <Zap size={14} /> Valor: {prac.benefit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
              <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><ShieldCheck size={24} /></div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Matriz de Compliance & Auditoria</h3>
                </div>
                <div className="space-y-6">
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-200">
                    <h4 className="text-sm font-black text-[#0d457a] uppercase mb-4">Conformidade LGPD (Privacy by Design)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      O sistema GESA utiliza mascaramento de dados (data masking) para usuários com perfil de consulta e armazena logs detalhados de acesso conforme exigido pelos Artigos 46 e 47 da LGPD.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-2xl text-center border border-slate-100 shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 block uppercase">Logs</span>
                        <span className="text-xs font-black text-[#0d457a]">Imutáveis</span>
                      </div>
                      <div className="p-4 bg-white rounded-2xl text-center border border-slate-100 shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 block uppercase">Acesso</span>
                        <span className="text-xs font-black text-[#0d457a]">RBAC</span>
                      </div>
                      <div className="p-4 bg-white rounded-2xl text-center border border-slate-100 shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 block uppercase">Dados</span>
                        <span className="text-xs font-black text-[#0d457a]">Criptografados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra Lateral Informativa */}
        <div className="space-y-6">
          <div className="bg-[#0d457a] p-8 rounded-[40px] text-white shadow-xl">
             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <FileText size={18} className="text-blue-400" /> Notas Técnicas
             </h4>
             <p className="text-[11px] text-white/60 leading-relaxed font-bold">
               Esta documentação é atualizada trimestralmente pela Gerência de Suporte Administrativo para refletir os novos fluxos e normativas do Estado de Goiás.
             </p>
             <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
               Download PDF Completo
             </button>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
             <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Links Rápidos</h4>
             <ul className="space-y-4">
               {['Política de Segurança', 'Manual de Tramitação', 'Regimento Interno', 'Glossário de Termos'].map((item, idx) => (
                 <li key={idx} className="flex items-center justify-between text-[11px] font-black text-[#0d457a] uppercase group cursor-pointer hover:text-blue-600 transition-colors">
                    {item}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
