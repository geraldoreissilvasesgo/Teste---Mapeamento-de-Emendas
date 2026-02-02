import React, { useState } from 'react';
import { 
  FileCode, Book, ShieldCheck, Cpu, Database, Info, Printer, ArrowLeft, 
  Layers, Network, Share2, GitMerge, Lock, Sparkles, Terminal, BarChart3, 
  Map as MapIcon, ChevronRight, Activity, Box, Search, ShieldAlert, Loader2, Download
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
      filename: `Dossie_Mapeamento_GESA_${new Date().getFullYear()}.pdf`,
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
      title: "Core Engine (Orquestração)",
      icon: Cpu,
      color: "text-blue-500",
      bg: "bg-blue-50",
      files: ["App.tsx", "types.ts", "constants.ts", "index.tsx"],
      description: "Gerencia o estado global via React Hooks, roteamento de módulos e o contexto de autenticação centralizado."
    },
    {
      title: "Data & Service Layer",
      icon: Database,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      files: ["supabase.ts", "geminiService.ts", "apiService.ts"],
      description: "Camada de persistência (PostgreSQL), isolamento SaaS (RLS) e Inteligência Artificial preditiva (Gemini)."
    },
    {
      title: "Operational Modules",
      icon: Layers,
      color: "text-amber-500",
      bg: "bg-amber-50",
      files: ["AmendmentList.tsx", "AmendmentDetail.tsx", "Dashboard.tsx", "Repository.tsx"],
      description: "Interface de usuário para gestão de processos, trâmites em tempo real e visualização analítica de dados."
    },
    {
      title: "Governance & DevTools",
      icon: ShieldCheck,
      color: "text-purple-500",
      bg: "bg-purple-50",
      files: ["DebugConsole.tsx", "AuditModule.tsx", "SecurityModule.tsx", "TestingPanel.tsx"],
      description: "Ferramentas de auditoria imutável, telemetria de rede, depuração de estado e compliance LGPD/COBIT."
    }
  ];

  const dataFlowSteps = [
    { step: "01", title: "Ingestão", desc: "Cadastro manual ou importação CSV de processos SEI.", icon: Search },
    { step: "02", title: "IA Preview", desc: "Análise preditiva Gemini identifica riscos e gargalos.", icon: Sparkles },
    { step: "03", title: "Tramitação", desc: "Movimentação entre setores com controle estrito de SLA.", icon: GitMerge },
    { step: "04", title: "Auditoria", desc: "Cada ação é gravada permanentemente com hash de segurança.", icon: ShieldAlert },
    { step: "05", title: "Liquidação", desc: "Status final 'Pago' bloqueia edições para integridade fiscal.", icon: Lock }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#0d457a] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Voltar ao Sistema
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
                {isExporting ? 'Processando...' : 'Salvar Dossiê (PDF)'}
            </button>
        </div>
      </div>

      <div id="manual-pdf-content" className="space-y-12 bg-white p-8 rounded-[40px] print:p-0">
          <div className="p-20 rounded-[60px] border border-slate-200 shadow-sm text-center space-y-8 print:border-none print:shadow-none print:p-0 pdf-avoid-break">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[#0d457a] rounded-[32px] text-white shadow-2xl mb-4">
              <MapIcon size={48} />
            </div>
            <h1 className="text-5xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Mapeamento Sistêmico GESA Cloud</h1>
            <p className="text-slate-400 text-sm font-black uppercase tracking-[0.4em]">Arquitetura Multi-Secretaria & Cloud Native</p>
            
            <div className="flex justify-center gap-4 pt-8 print:hidden">
               <span className="px-4 py-2 bg-blue-50 text-[#0d457a] rounded-full text-[10px] font-black uppercase border border-blue-100">PostgreSQL / Supabase</span>
               <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase border border-purple-100">Google Gemini 3.0 Pro</span>
               <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">React 19 / TypeScript</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-4 pdf-avoid-break">
               <div className="p-3 bg-blue-50 text-[#0d457a] rounded-2xl"><Network size={24}/></div>
               <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">01. Arquitetura de Camadas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {architecturalLayers.map((layer, idx) => (
                 <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm transition-all group pdf-avoid-break">
                    <div className="flex items-start justify-between mb-6">
                       <div className={`p-4 rounded-2xl ${layer.bg} ${layer.color} shadow-sm group-hover:scale-110 transition-transform`}>
                          <layer.icon size={28} />
                       </div>
                    </div>
                    <h3 className="text-lg font-black text-[#0d457a] uppercase mb-3">{layer.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{layer.description}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-[#0d457a] p-16 rounded-[60px] text-white shadow-2xl space-y-12 print:bg-white print:text-[#0d457a] print:border print:border-slate-200 pdf-avoid-break">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 text-white rounded-2xl print:bg-slate-100 print:text-[#0d457a]"><Share2 size={24}/></div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">02. Fluxo de Trabalho</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
                   {dataFlowSteps.map((s, idx) => (
                     <div key={idx} className="bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/10 group print:bg-slate-50 print:border-slate-200 print:text-[#0d457a]">
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-2xl font-black text-blue-300/30 print:text-slate-300">{s.step}</span>
                           <div className="p-3 bg-white/10 rounded-xl print:bg-slate-200"><s.icon size={20}/></div>
                        </div>
                        <h4 className="text-xs font-black uppercase mb-2 tracking-widest">{s.title}</h4>
                        <p className="text-[10px] text-blue-100/60 leading-relaxed font-medium uppercase print:text-slate-500">{s.desc}</p>
                     </div>
                   ))}
             </div>
          </div>
          
          <div className="text-center pt-20 border-t border-slate-200 text-slate-400 pdf-avoid-break">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Gerência de Suporte Administrativo - GESA/SUBIPEI</p>
            <p className="text-[8px] font-bold mt-2 uppercase">Dossiê de Mapeamento Técnico Gerado pelo Sistema v2.8.4</p>
          </div>
      </div>
    </div>
  );
};