import React, { useState } from 'react';
import { 
  FileCode, Book, ShieldCheck, Cpu, Database, Info, Printer, ArrowLeft, 
  Layers, Network, Share2, GitMerge, Lock, Sparkles, Terminal, BarChart3, 
  Map as MapIcon, ChevronRight, Activity, Box, Search, ShieldAlert, Loader2, Download,
  Fingerprint, ShieldQuestion, Code2, Rocket, Globe, HardDrive, Key, UserCheck, 
  Workflow, GitPullRequest, Binary, ShieldX, Building2
} from 'lucide-react';

interface SystemManualProps {
  onBack: () => void;
}

export const SystemManual: React.FC<SystemManualProps> = ({ onBack }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    const h2p = (window as any).html2pdf;
    if (!h2p) {
      alert("A biblioteca de geração de PDF ainda não foi carregada. Por favor, aguarde.");
      return;
    }

    setIsExporting(true);
    const element = document.getElementById('manual-pdf-content');
    
    const opt = {
      margin: 10,
      filename: `Blueprints_Engenharia_GESA_Cloud_${new Date().getFullYear()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await h2p().set(opt).from(element).save();
    } catch (error) {
      console.error('Erro ao exportar dossiê:', error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const architecturalLayers = [
    {
      title: "01. Motor Principal (Core Engine)",
      icon: Cpu,
      color: "text-blue-500",
      bg: "bg-blue-50",
      components: ["App.tsx", "Types System", "Global Constants", "State Contexts"],
      description: "O coração reativo. Gerencia a orquestração de rotas, controle de estado global e a integridade dos dicionários de dados que alimentam toda a aplicação."
    },
    {
      title: "02. Dados & Serviços (Data & AI)",
      icon: Database,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      components: ["Supabase Real-time", "Google Gemini 3.0 Pro", "Auth Services", "Audit Triggers"],
      description: "Infraestrutura escalável. Combina persistência isolada via Row Level Security (RLS) com inteligência analítica preditiva de processos burocráticos."
    },
    {
      title: "03. Módulos Operacionais (Business)",
      icon: Layers,
      color: "text-amber-500",
      bg: "bg-amber-50",
      components: ["Emendas & SEI", "Dashboard Analítico", "Repositório Central", "Importador de Lote"],
      description: "Interfaces de produtividade. Módulos especializados na gestão do ciclo de vida das emendas, garantindo conformidade com os ritos do Estado de Goiás."
    },
    {
      title: "04. Governança & Dev (Tools)",
      icon: ShieldCheck,
      color: "text-purple-500",
      bg: "bg-purple-50",
      components: ["Audit Module", "IDE Debug Console", "QA Testing Panel", "Compliance Docs"],
      description: "Camada de controle. Ferramentas de transparência imutável, telemetria de performance e frameworks de governança alinhados à LGPD."
    }
  ];

  const lifecycleSteps = [
    { step: "01", title: "Protocolo e Ingestão", desc: "Captura de dados via SEI ou CSV para o Buffer Digital.", icon: Search },
    { step: "02", title: "Análise Preditiva", desc: "IA Gemini identifica riscos e gargalos no trâmite.", icon: Sparkles },
    { step: "03", title: "Tramitação Técnica", desc: "Movimentação intersetorial com controle rigoroso de SLA.", icon: GitMerge },
    { step: "04", title: "Parecer e Validação", desc: "Checkpoints jurídicos e técnicos antes da liquidação.", icon: ShieldCheck },
    { step: "05", title: "Liquidação Financeira", desc: "Pagamento realizado e arquivamento auditável.", icon: Lock }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#0d457a] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
        <div className="flex gap-3">
            <button 
                onClick={() => window.print()} 
                className="bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
            >
                <Printer size={18} /> Imprimir
            </button>
            <button 
                onClick={handleExportPdf} 
                disabled={isExporting}
                className="bg-[#0d457a] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-[#0a365f] transition-all flex items-center gap-3 disabled:opacity-50"
            >
                {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isExporting ? 'Exportando Blueprint...' : 'Exportar Blueprints (PDF)'}
            </button>
        </div>
      </div>

      <div id="manual-pdf-content" className="space-y-16 bg-white p-12 rounded-[60px] shadow-sm border border-slate-100 print:p-0 print:border-none">
          {/* Header Blueprint */}
          <div className="relative p-16 rounded-[48px] bg-slate-50 overflow-hidden border-4 border-dashed border-slate-200 text-center space-y-8 pdf-avoid-break">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500"></div>
             <div className="inline-flex items-center justify-center w-24 h-24 bg-[#0d457a] rounded-[32px] text-white shadow-2xl mb-4 relative z-10">
                <MapIcon size={48} />
             </div>
             <div className="relative z-10">
                <h1 className="text-6xl font-black text-[#0d457a] uppercase tracking-tighter leading-none mb-4">Blueprints de Engenharia</h1>
                <p className="text-slate-400 text-lg font-black uppercase tracking-[0.5em]">GESA Cloud Native System v2.9.6</p>
             </div>
             <div className="flex justify-center gap-6 pt-6 relative z-10 no-print">
                <span className="px-4 py-2 bg-white text-[#0d457a] rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-sm flex items-center gap-2">
                   <ShieldCheck size={14} className="text-emerald-500"/> Governança Ativa
                </span>
                <span className="px-4 py-2 bg-white text-[#0d457a] rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-sm flex items-center gap-2">
                   <Cpu size={14} className="text-blue-500"/> Arquitetura Reativa
                </span>
                <span className="px-4 py-2 bg-white text-[#0d457a] rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-sm flex items-center gap-2">
                   <Sparkles size={14} className="text-purple-500"/> IA Gemini Integrated
                </span>
             </div>
          </div>

          {/* 01. Mapa Visual de 4 Camadas */}
          <div className="space-y-10 pdf-avoid-break">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-50 text-[#0d457a] rounded-3xl"><Layers size={32}/></div>
                <div>
                   <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">01. Mapa do Sistema Visual</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Categorização em Camadas Funcionais</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {architecturalLayers.map((layer, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm hover:border-[#0d457a]/20 transition-all group relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                        <layer.icon size={120} />
                     </div>
                     <div className="flex items-start justify-between mb-8">
                        <div className={`p-4 rounded-2xl ${layer.bg} ${layer.color} shadow-sm group-hover:rotate-6 transition-transform`}>
                           <layer.icon size={28} />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">LAYER {idx + 1}</span>
                     </div>
                     <h3 className="text-xl font-black text-[#0d457a] uppercase mb-4">{layer.title}</h3>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">{layer.description}</p>
                     <div className="flex flex-wrap gap-2">
                        {layer.components.map(comp => (
                          <span key={comp} className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase border border-slate-100 rounded-lg">{comp}</span>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* 02. Matriz de Dados SaaS */}
          <div className="bg-[#0d457a] p-16 rounded-[60px] text-white shadow-2xl relative overflow-hidden pdf-avoid-break">
             <div className="absolute bottom-0 right-0 p-16 opacity-10"><Fingerprint size={240} /></div>
             <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-white/10 text-white rounded-3xl"><Database size={32}/></div>
                   <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">02. Matriz de Dados & Tenant Isolation</h2>
                      <p className="text-blue-200/50 text-xs font-bold uppercase tracking-widest mt-1">Segregação de Secretarias (SES, SEDUC, etc.)</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                         <h4 className="text-sm font-black uppercase mb-4 flex items-center gap-3">
                            <Lock size={18} className="text-blue-300"/> Row Level Security (RLS)
                         </h4>
                         <p className="text-xs text-blue-100/60 leading-relaxed font-medium uppercase">
                            O isolamento de dados é garantido no nível do banco de dados PostgreSQL. Cada registro possui um campo `tenantId`. O middleware do Supabase valida o token JWT do usuário, permitindo que ele visualize e edite apenas processos vinculados à sua Secretaria de origem.
                         </p>
                      </div>
                      <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                         <h4 className="text-sm font-black uppercase mb-4 flex items-center gap-3">
                            <UserCheck size={18} className="text-emerald-300"/> RBAC Hierárquico
                         </h4>
                         <p className="text-xs text-blue-100/60 leading-relaxed font-medium uppercase">
                            A matriz de responsabilidades define 5 níveis de acesso. Administradores de Unidade (ex: Geraldo Silva) possuem soberania total sobre o provisionamento e configurações de SLA de sua respectiva Secretaria.
                         </p>
                      </div>
                   </div>
                   <div className="bg-white/5 rounded-[40px] border border-white/10 p-10 flex flex-col items-center justify-center text-center">
                      <div className="grid grid-cols-2 gap-6 w-full max-w-xs mb-8">
                         <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-500/30 flex flex-col items-center">
                            <Building2 size={24} className="text-blue-400 mb-2"/>
                            <span className="text-[9px] font-black uppercase tracking-widest">TENANT A</span>
                         </div>
                         <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 flex flex-col items-center">
                            <Building2 size={24} className="text-emerald-400 mb-2"/>
                            <span className="text-[9px] font-black uppercase tracking-widest">TENANT B</span>
                         </div>
                      </div>
                      <h5 className="text-xl font-black uppercase tracking-tight mb-4">Isolamento de Base</h5>
                      <p className="text-[10px] text-blue-200/50 font-bold uppercase leading-relaxed">
                         Multi-tenancy via software layer e DB policies. Escalabilidade horizontal sem cruzamento de dados sensíveis.
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* 03. Ciclo de Vida do Processo */}
          <div className="space-y-12 pdf-avoid-break">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl"><Workflow size={32}/></div>
                <div>
                   <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">03. Fluxo de Vida do Processo</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Diagrama de Tramitação GESA (Blueprint Operacional)</p>
                </div>
             </div>

             <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden lg:block"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
                   {lifecycleSteps.map((s, idx) => (
                     <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-200 flex flex-col items-center text-center group hover:border-[#0d457a] hover:shadow-2xl transition-all">
                        <div className="w-16 h-16 bg-slate-50 text-[#0d457a] rounded-[24px] flex items-center justify-center mb-6 group-hover:bg-[#0d457a] group-hover:text-white transition-all shadow-sm">
                           <s.icon size={28} />
                        </div>
                        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">{s.step}</span>
                        <h4 className="text-sm font-black text-[#0d457a] uppercase mb-3">{s.title}</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase">{s.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Rodapé Blueprint */}
          <div className="text-center pt-20 border-t-4 border-dashed border-slate-100 text-slate-400 pdf-avoid-break">
             <div className="flex justify-center gap-10 mb-10 opacity-30 grayscale">
                <Globe size={40}/>
                <ShieldCheck size={40}/>
                <HardDrive size={40}/>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Gerência de Suporte Administrativo • GESA / SUBIPEI</p>
             <p className="text-[9px] font-bold mt-4 uppercase tracking-widest text-slate-300">Dossiê Gerado Digitalmente para Fins de Auditoria e Documentação Técnica • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
      </div>
    </div>
  );
};