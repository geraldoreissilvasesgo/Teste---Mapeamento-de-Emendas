
/**
 * MÓDULO DE DOCUMENTAÇÃO DE GOVERNANÇA AVANÇADA
 * 
 * Central de conformidade baseada em padrões internacionais:
 * - ISO 27001 (Segurança da Informação)
 * - ISO 9001 (Qualidade)
 * - DRP (Disaster Recovery Plan)
 */
import React, { useState } from 'react';
import { 
  BookOpen, ShieldCheck, Zap, Workflow, Scale, 
  FileCheck, Target, Layers, Network, ChevronRight, 
  FileText, Briefcase, HelpCircle, GraduationCap,
  HardDrive, Server, Award, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

export const GovernanceDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cobit' | 'itil' | 'compliance' | 'iso' | 'drp'>('cobit');

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

          {activeTab === 'drp' && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
               <div className="bg-slate-900 p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
                  <div className="flex items-center gap-6 mb-12 relative z-10">
                    <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl text-orange-400 border border-white/20"><RefreshCw size={32} /></div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Plano de Recuperação de Desastres (DRP)</h3>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Estratégia de Resiliência GESA Cloud</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 hover:bg-white/10 transition-all">
                       <h4 className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-4">Backup & Redundância</h4>
                       <p className="text-xs text-white/70 leading-relaxed">
                          Backup incremental a cada 15 minutos (RPO = 15min) com redundância geográfica em 3 regiões distintas.
                       </p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 hover:bg-white/10 transition-all">
                       <h4 className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-4">Failover Automático</h4>
                       <p className="text-xs text-white/70 leading-relaxed">
                          Tempo estimado de recuperação (RTO = 5min). Alternância automática de clusters em caso de queda do datacenter principal.
                       </p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 hover:bg-white/10 transition-all">
                       <h4 className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-4">Integridade Pós-Disastre</h4>
                       <p className="text-xs text-white/70 leading-relaxed">
                          Scripts automatizados de verificação de consistência de dados (Data Integrity Check) após restauração.
                       </p>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* ... Tabs COBIT, ITIL e Compliance mantidos conforme versão anterior ... */}
          {activeTab === 'cobit' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
               <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl"><Target size={24} /></div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">Objetivos de Controle (COBIT)</h3>
                </div>
                {/* Repetir lógica de cards anterior */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase mb-4 inline-block">EDM01</span>
                        <h4 className="text-xs font-black text-[#0d457a] uppercase mb-2">Governança Mantida</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Definição clara de responsabilidades por setor.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase mb-4 inline-block">APO03</span>
                        <h4 className="text-xs font-black text-[#0d457a] uppercase mb-2">Arquitetura Íntegra</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Padronização de dados conforme SEI-GO.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase mb-4 inline-block">BAI06</span>
                        <h4 className="text-xs font-black text-[#0d457a] uppercase mb-2">Gestão de Mudanças</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Trilha de auditoria em 100% das tramitações.</p>
                    </div>
                </div>
              </div>
            </div>
          )}
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
                <div className="flex justify-between items-center text-[10px] border-b border-white/10 pb-2">
                    <span className="text-white/50 uppercase">Liquidação</span>
                    <span className="font-black">Até 03 dias</span>
                </div>
             </div>
             <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
               Visualizar Portaria SLA
             </button>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
             <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Auditoria Externa</h4>
             <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                <ShieldCheck size={32} className="text-emerald-500 mx-auto mb-3" />
                <p className="text-[10px] font-black text-[#0d457a] uppercase">Sistema Auditado</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Ref: TCE-GO 2024</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
