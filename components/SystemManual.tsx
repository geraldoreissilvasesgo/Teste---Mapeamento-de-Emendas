
import React from 'react';
import { FileCode, Book, ShieldCheck, Cpu, Database, Info, Printer, ArrowLeft } from 'lucide-react';

interface SystemManualProps {
  onBack: () => void;
}

export const SystemManual: React.FC<SystemManualProps> = ({ onBack }) => {
  const files = [
    {
      name: 'types.ts',
      desc: 'Dicionário de dados central. Define todas as interfaces, enums e tipos do sistema, garantindo a integridade dos dados e o isolamento de tenants (SaaS).',
      category: 'Core'
    },
    {
      name: 'App.tsx',
      desc: 'Orquestrador principal da aplicação. Gerencia o estado global, roteamento interno de módulos, autenticação Supabase e sincronização de dados resiliente.',
      category: 'Core'
    },
    {
      name: 'services/supabase.ts',
      desc: 'Camada de persistência. Abstrai a comunicação com o banco de dados PostgreSQL, gerencia Row Level Security (RLS) e autenticação JWT.',
      category: 'Services'
    },
    {
      name: 'services/geminiService.ts',
      desc: 'Motor de Inteligência Artificial. Integra o Google Gemini Pro para análise técnica preditiva e identificação automática de gargalos burocráticos.',
      category: 'AI/ML'
    },
    {
      name: 'components/AuditModule.tsx',
      desc: 'Módulo de Compliance. Exibe a trilha de auditoria imutável, status do pipeline CI/CD e logs de segurança para fins de fiscalização.',
      category: 'Governance'
    },
    {
      name: 'components/SecurityModule.tsx',
      desc: 'Gestão de acesso (RBAC). Permite administrar perfis de usuários e monitorar a conformidade com a LGPD e o isolamento de dados.',
      category: 'Security'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Cabeçalho de Navegação (Escondido na Impressão) */}
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#0d457a] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Voltar ao Sistema
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-[#0d457a] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-[#0a365f] transition-all flex items-center gap-3"
        >
          <Printer size={18} /> Gerar PDF do Código
        </button>
      </div>

      {/* Capa do Dossiê Técnico */}
      <div className="bg-white p-20 rounded-[60px] border border-slate-200 shadow-sm text-center space-y-8 print:border-none print:shadow-none print:p-0 print:mb-20">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-[#0d457a] rounded-[32px] text-white shadow-2xl mb-4">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-5xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Dossiê Técnico de Engenharia</h1>
        <p className="text-slate-400 text-sm font-black uppercase tracking-[0.4em]">GESA Cloud - Plataforma de Rastreabilidade</p>
        
        <div className="grid grid-cols-3 gap-10 pt-12 border-t border-slate-100 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Versão</p>
            <p className="text-lg font-black text-[#0d457a]">2.7.2-PROD</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Data de Emissão</p>
            <p className="text-lg font-black text-[#0d457a]">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Classificação</p>
            <p className="text-lg font-black text-emerald-600">CONFIDENCIAL</p>
          </div>
        </div>
      </div>

      {/* Visão Geral da Arquitetura */}
      <div className="bg-[#0d457a] p-16 rounded-[60px] text-white shadow-2xl space-y-10 print:bg-white print:text-[#0d457a] print:border print:border-slate-200">
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
          <Cpu size={32} /> Arquitetura e Tecnologia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed opacity-90 print:opacity-100">
          <div className="space-y-4">
            <h3 className="font-black uppercase text-blue-300 print:text-[#0d457a]">Isolamento SaaS (Multi-Tenant)</h3>
            <p>O sistema opera sob uma arquitetura de isolamento lógico por <code>tenantId</code>. Cada secretaria (SES, SEDUC, GOINFRA) possui sua própria base filtrada via RLS (Row Level Security) diretamente no banco de dados, impedindo o vazamento de informações entre pastas orçamentárias.</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-black uppercase text-blue-300 print:text-[#0d457a]">Inteligência Artificial</h3>
            <p>Utiliza-se o motor <strong>Google Gemini 3.0 Pro</strong> para análise de trâmites. A IA identifica gargalos em setores específicos, calcula o risco de não liquidação e sugere ações corretivas baseadas no histórico de movimentações do processo SEI.</p>
          </div>
        </div>
      </div>

      {/* Listagem de Arquivos e Código (Simulado para o PDF) */}
      <div className="space-y-16">
        <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter no-print">Módulos e Código-Fonte</h2>
        
        {files.map((file, idx) => (
          <div key={idx} className="space-y-6 print:page-break-before-always">
            <div className="flex items-center justify-between border-b-2 border-[#0d457a] pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 text-[#0d457a] rounded-xl"><FileCode size={24}/></div>
                <div>
                  <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tight">{file.name}</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{file.category}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Responsabilidade Técnica</p>
              <p className="text-sm text-slate-600 leading-relaxed">{file.desc}</p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-inner">
               <pre className="text-[11px] font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`/**
 * @file ${file.name}
 * DOCUMENTAÇÃO DE CÓDIGO FONTE - GESA CLOUD
 * Gerado em: ${new Date().toISOString()}
 */

// O código fonte completo deste arquivo está incluído no repositório Git do projeto.
// Esta seção no PDF serve como referência para o Auditor Técnico.
// Para visualizar o código real em execução, utilize o ambiente de desenvolvimento.

// [CÓDIGO FONTE OCULTADO NESTA VISÃO DE DEMONSTRAÇÃO]
// [SOLICITE O ACESSO AO REPOSITÓRIO PRIVADO PARA AUDITORIA COMPLETA]`}
               </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé de Encerramento */}
      <div className="text-center pt-20 border-t border-slate-200 text-slate-400 print:pt-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Gerência de Suporte Administrativo - GESA/SUBIPEI</p>
        <p className="text-[8px] font-bold mt-2 uppercase">Documento Gerado Automaticamente pelo Sistema GESA Cloud v2.7.2</p>
      </div>
    </div>
  );
};
