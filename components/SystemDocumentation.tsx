import React, { useState } from 'react';
import { 
  Book, ShieldCheck, Cpu, Database, Info, Printer, Layers, 
  Network, Lock, Sparkles, Terminal, Code2, Rocket, Globe, 
  HardDrive, Key, UserCheck, Workflow, GitPullRequest, Binary, 
  ShieldX, Building2, ChevronRight, FileCode, Search, Activity,
  RefreshCw, Braces, CpuChip, Layout, Boxes
} from 'lucide-react';

export const SystemDocumentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('architecture');

  const sections = [
    { id: 'architecture', label: 'Arquitetura de Camadas', icon: Layers },
    { id: 'stack', label: 'Stack Tecnológica', icon: Code2 },
    { id: 'data', label: 'Engenharia de Dados', icon: Database },
    { id: 'security', label: 'Segurança & RLS', icon: Lock },
    { id: 'ai', label: 'Inteligência Artificial', icon: Sparkles },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Dossiê do Sistema</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <Book size={16} className="text-blue-500" /> Documentação Técnica de Engenharia GESA Cloud
          </p>
        </div>
        <button onClick={() => window.print()} className="bg-white text-[#0d457a] border border-slate-200 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm no-print">
          <Printer size={18} /> Exportar Dossiê
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Navegação da Wiki */}
        <div className="space-y-2 no-print">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border ${
                activeSection === section.id 
                ? 'bg-[#0d457a] text-white border-[#0d457a] shadow-xl' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <section.icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">{section.label}</span>
              </div>
              <ChevronRight size={14} className={activeSection === section.id ? 'opacity-100' : 'opacity-20'} />
            </button>
          ))}
        </div>

        {/* Conteúdo Principal da Documentação */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm p-10 lg:p-16 min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-[#0d457a]">
               {activeSection === 'architecture' && <Layers size={300} />}
               {activeSection === 'stack' && <Braces size={300} />}
               {activeSection === 'data' && <Database size={300} />}
               {activeSection === 'security' && <Lock size={300} />}
               {activeSection === 'ai' && <Sparkles size={300} />}
            </div>

            {activeSection === 'architecture' && (
              <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Arquitetura GESA Cloud</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    O sistema foi construído seguindo o padrão de <strong>Clean Architecture</strong>, adaptado para o ambiente de nuvem do Estado de Goiás. A estrutura é dividida em 4 camadas fundamentais que garantem escalabilidade e facilidade de auditoria.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Cpu size={24} />
                    </div>
                    <h4 className="text-sm font-black text-[#0d457a] uppercase mb-4 tracking-widest">Camada de Orquestração (Core)</h4>
                    <p className="text-[11px] text-slate-500 uppercase leading-loose font-bold">
                      Gerenciada pelo <code className="text-blue-600 bg-blue-50 px-1">App.tsx</code>, responsável pelo roteamento reativo, controle de sessões JWT e sincronização de estado global entre o banco de dados e a interface.
                    </p>
                  </div>
                  <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                      <Building2 size={24} />
                    </div>
                    <h4 className="text-sm font-black text-emerald-900 uppercase mb-4 tracking-widest">Camada de Negócio (Business)</h4>
                    <p className="text-[11px] text-emerald-700 uppercase leading-loose font-bold">
                      Implementa as regras do Decreto 10.634/2025. Inclui o motor de cálculo de SLAs e os fluxos de tramitação intersetorial entre SES, GESA e SUBIPEI.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'stack' && (
              <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Linguagem e Stack Tecnológica</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    A fundação tecnológica do sistema foi selecionada para garantir máxima <strong>segurança de tipos</strong> e <strong>performance em tempo real</strong>, padrões exigidos para sistemas de alta criticidade governamental.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'TypeScript (ES6+)', icon: Braces, color: 'text-blue-500', desc: 'Linguagem base com tipagem estática para evitar erros financeiros.' },
                    { label: 'React 19', icon: Layout, color: 'text-sky-500', desc: 'Framework de interface reativa de última geração.' },
                    { label: 'Tailwind CSS', icon: Boxes, color: 'text-emerald-500', desc: 'Design System utilitário para interfaces leves e responsivas.' }
                  ].map((tech, i) => (
                    <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px]">
                      <tech.icon size={32} className={`${tech.color} mb-4`} />
                      <h4 className="text-[11px] font-black text-[#0d457a] uppercase tracking-widest mb-2">{tech.label}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">{tech.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-slate-900 rounded-[40px] text-white">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-emerald-400">
                    <Terminal size={18} /> Engenharia de Software
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[10px] font-medium uppercase text-blue-100/60">
                    <p>O sistema utiliza módulos ES6 nativos, aproveitando o motor de build <strong>Vite</strong> para garantir que o tempo de carregamento em redes governamentais seja inferior a 1.2 segundos.</p>
                    <p>A escrita do código segue o padrão <strong>ESLint Governamental</strong>, focando em acessibilidade (ARIA) e internacionalização para termos técnicos da administração pública de Goiás.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Dicionário e Engenharia de Dados</h3>
                
                <div className="space-y-6">
                  <div className="overflow-hidden border border-slate-100 rounded-[32px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidade</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Técnica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-[10px] font-bold uppercase text-slate-600">
                        <tr>
                          <td className="px-8 py-5 text-blue-600">Amendment</td>
                          <td className="px-8 py-5 font-mono">Table (Cloud)</td>
                          <td className="px-8 py-5">Registro central da emenda impositiva. Armazena valores, objeto e status atual.</td>
                        </tr>
                        <tr>
                          <td className="px-8 py-5 text-blue-600">Movement</td>
                          <td className="px-8 py-5 font-mono">JSONB Array</td>
                          <td className="px-8 py-5">Trilha de auditoria interna. Registra cada entrada/saída de unidade técnica.</td>
                        </tr>
                        <tr>
                          <td className="px-8 py-5 text-blue-600">AuditLog</td>
                          <td className="px-8 py-5 font-mono">Immutable Table</td>
                          <td className="px-8 py-5">Logs de segurança. Nenhuma linha pode ser alterada após a inserção (Audit-Only).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-8 bg-blue-900 rounded-[40px] text-white">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                      <HardDrive size={18} className="text-blue-300" /> Multi-tenancy Isolation
                    </h4>
                    <p className="text-xs text-blue-100/60 leading-relaxed font-medium uppercase">
                      A engenharia de dados utiliza o campo <code className="text-emerald-400">tenantId</code> em todas as tabelas. Isso garante que os dados da Secretaria da Saúde (SES) jamais se misturem com outras secretarias do estado, mesmo compartilhando a mesma infraestrutura de banco de dados.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Framework de Segurança Governamental</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Row Level Security (RLS)', icon: Lock, desc: 'Acesso controlado no nível da linha do banco via políticas SQL.' },
                    { label: 'RBAC Hierárquico', icon: UserCheck, desc: '5 níveis de permissões definidos em types.ts para governança.' },
                    { label: 'MFA Enforced', icon: Key, desc: 'Autenticação de dois fatores obrigatória para perfis administrativos.' }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-4">
                        <item.icon size={24} />
                      </div>
                      <h5 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest mb-2">{item.label}</h5>
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-8 border-2 border-dashed border-slate-200 rounded-[40px]">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                     <Binary size={18} /> Diretrizes de Criptografia
                   </h4>
                   <p className="text-xs text-slate-500 font-medium leading-loose">
                     Todos os dados sensíveis (E-mails e Identidades) são criptografados em trânsito via <strong>TLS 1.3</strong> e em repouso utilizando o algoritmo <strong>AES-256</strong> fornecido pela infraestrutura Supabase Cloud.
                   </p>
                </div>
              </div>
            )}

            {activeSection === 'ai' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Motor de Inteligência Artificial</h3>
                
                <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-12 rounded-[48px] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10"><Sparkles size={160} /></div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-2xl"><Activity size={28} className="text-emerald-400" /></div>
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tight">Google Gemini 3 Pro</h4>
                        <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">Análise Preditiva de Gargalos</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-100/60 leading-relaxed font-medium uppercase max-w-xl">
                      A IA processa o contexto semântico do objeto da emenda e o histórico de trâmites para prever a probabilidade de conclusão financeira (Liquidação) e identificar atrasos burocráticos baseados no manual de fluxos GESA.
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                  <h5 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest mb-4">Prompt Engineering Governamental</h5>
                  <pre className="text-[9px] font-mono text-blue-600 bg-white p-6 rounded-2xl border border-slate-200 overflow-x-auto">
                    {`"Analise o processo SEI {seiNumber} sob a ótica do Decreto 10.634/2025. 
Identifique riscos de atraso na unidade {currentSector}..."`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
