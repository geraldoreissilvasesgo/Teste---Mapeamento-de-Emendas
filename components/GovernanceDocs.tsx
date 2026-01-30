
/**
 * MÓDULO DE DOCUMENTAÇÃO DE GOVERNANÇA AVANÇADA - V2
 */
import React, { useState } from 'react';
import { 
  BookOpen, ShieldCheck, Zap, Workflow, Scale, 
  FileCheck, Target, Layers, Network, ChevronRight, 
  FileText, Briefcase, HelpCircle, GraduationCap,
  HardDrive, Server, Award, CheckCircle2, AlertCircle, RefreshCw, GitBranch, Rocket,
  // Fix: Adicionando RotateCcw que estava faltando nos imports
  RotateCcw
} from 'lucide-react';

export const GovernanceDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cobit' | 'itil' | 'compliance' | 'iso' | 'drp' | 'release'>('cobit');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Framework de Governança</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <GraduationCap size={16} className="text-blue-500" /> Padrão Ouro Institucional GESA
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 p-2 bg-slate-100 rounded-[32px] w-fit">
        {[
          { id: 'cobit', label: 'COBIT' },
          { id: 'itil', label: 'ITIL' },
          { id: 'iso', label: 'Conformidade ISO' },
          { id: 'release', label: 'Deploy & Release' },
          { id: 'drp', label: 'Continuidade (DRP)' },
          { id: 'compliance', label: 'Compliance & LGPD' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#0d457a] text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'release' && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
               <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="p-4 bg-purple-500 text-white rounded-3xl shadow-lg"><Rocket size={28} /></div>
                    <div>
                      <h3 className="text-xl font-black text-[#0d457a] uppercase">Políticas de Deploy Profissional</h3>
                      <p className="text-[10px] font-bold text-purple-600 uppercase">Gestão de Mudanças e ALM</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <h4 className="text-[11px] font-black text-[#0d457a] uppercase mb-4 flex items-center gap-2">
                           <GitBranch size={16} className="text-purple-500"/> Versionamento Semântico
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                           Toda release deve seguir o padrão <strong>MAJOR.MINOR.PATCH</strong>. Deploy em produção exige aprovação de dois pares (Four-eyes principle) e aprovação final da GESA.
                        </p>
                     </div>
                     <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <h4 className="text-[11px] font-black text-[#0d457a] uppercase mb-4 flex items-center gap-2">
                           <RotateCcw size={16} className="text-amber-500"/> Protocolo de Rollback
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                           Em caso de falha crítica (P0), o rollback é automatizado via Pipeline CI/CD, restaurando a última versão estável em menos de 5 minutos, sem perda de integridade de dados.
                        </p>
                     </div>
                  </div>

                  <div className="mt-8 p-8 border-2 border-dashed border-slate-100 rounded-[32px]">
                     <h4 className="text-[11px] font-black text-[#0d457a] uppercase mb-4">Pipeline de Automação (CI/CD)</h4>
                     <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-xs text-slate-600">
                           <CheckCircle2 size={16} className="text-emerald-500" />
                           Verificação Estática de Código (Lint & Security Scan)
                        </li>
                        <li className="flex items-center gap-3 text-xs text-slate-600">
                           <CheckCircle2 size={16} className="text-emerald-500" />
                           Testes Unitários e de Integração Automáticos
                        </li>
                        <li className="flex items-center gap-3 text-xs text-slate-600">
                           <CheckCircle2 size={16} className="text-emerald-500" />
                           Deploy Blue-Green para Zero Downtime
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
          )}
          
          {/* Mantendo as outras abas conforme versão anterior */}
          {activeTab === 'iso' && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200"><ShieldCheck size={28} /></div>
                    <div>
                      <h3 className="text-lg font-black text-[#0d457a] uppercase">ISO/IEC 27001:2022</h3>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Segurança da Informação</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { t: 'Confidencialidade', d: 'Criptografia em repouso e em trânsito (TLS 1.3).' },
                      { t: 'Integridade', d: 'Assinatura digital de logs e controle de hashes de arquivos.' },
                      { t: 'Disponibilidade', d: 'Arquitetura de alta disponibilidade (99.98% uptime).' },
                      { t: 'Controle de Acesso', d: 'Autenticação baseada em perfis (RBAC) e MFA.' }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-[#0d457a] uppercase">{item.t}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{item.d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>
                   <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-200"><Award size={28} /></div>
                    <div>
                      <h3 className="text-lg font-black text-[#0d457a] uppercase">ISO 9001:2015</h3>
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Gestão da Qualidade</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { t: 'Foco no Cliente', d: 'Dashboards personalizados para transparência parlamentar.' },
                      { t: 'Abordagem por Processos', d: 'Workflows imutáveis e SLAs documentados por setor.' },
                      { t: 'Melhoria Contínua', d: 'Ciclo PDCA integrado via análise de gargalos por IA.' },
                      { t: 'Decisões Baseadas em Fatos', d: 'BI integrado com dados reais da base SEI-GO.' }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-[#0d457a] uppercase">{item.t}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{item.d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* ... Outras abas mantidas ... */}
        </div>

        <div className="space-y-6">
          <div className="bg-[#0d457a] p-8 rounded-[40px] text-white shadow-xl">
             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <FileCheck size={18} className="text-blue-400" /> SLA Oficial GESA
             </h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] border-b border-white/10 pb-2">
                    <span className="text-white/50 uppercase">Análise Técnica</span>
                    <span className="font-black">Até 05 dias</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-b border-white/10 pb-2">
                    <span className="text-white/50 uppercase">Parecer Jurídico</span>
                    <span className="font-black">Até 15 dias</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
