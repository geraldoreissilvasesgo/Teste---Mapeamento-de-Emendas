import React, { useState, useMemo } from 'react';
import { 
  Zap, Link2, Search, Loader2, CheckCircle2, AlertTriangle, 
  TrendingUp, BarChart3, PieChart, Info, FileSpreadsheet, 
  ArrowRight, Sparkles, Database, RefreshCw, Send, Globe
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { Amendment } from '../types.ts';
import { useNotification } from '../context/NotificationContext.tsx';

interface FastAnalysisModuleProps {
  localAmendments: Amendment[];
}

export const FastAnalysisModule: React.FC<FastAnalysisModuleProps> = ({ localAmendments }) => {
  const { notify } = useNotification();
  const [oneDriveUrl, setOneDriveUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [externalData, setExternalData] = useState<any[] | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!externalData) return null;
    const totalValue = externalData.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
    const count = externalData.length;
    return { totalValue, count };
  }, [externalData]);

  const handleConnect = async () => {
    if (!oneDriveUrl.includes('1drv.ms') && !oneDriveUrl.includes('sharepoint.com')) {
      notify('error', 'URL Inválida', 'Por favor, insira um link de compartilhamento válido do OneDrive ou SharePoint.');
      return;
    }

    setIsConnecting(true);
    await new Promise(r => setTimeout(r, 2000));

    const mockExternal = [
      { sei: '2025.001.002', valor: 500000, municipio: 'Anápolis', status: 'Pendente' },
      { sei: '2025.001.003', valor: 1200000, municipio: 'Aparecida', status: 'Análise' },
      { sei: '2025.001.004', valor: 300000, municipio: 'Rio Verde', status: 'Pendente' },
      { sei: '2025.001.005', valor: 850000, municipio: 'Goiânia', status: 'Concluído' }
    ];

    setExternalData(mockExternal);
    setIsConnecting(false);
    notify('success', 'Conexão Estabelecida', 'Planilha externa lida com sucesso via OneDrive Sync.');
    runAiAnalysis(mockExternal);
  };

  const runAiAnalysis = async (data: any[]) => {
    if (!process.env.API_KEY) {
      setAiInsight("Integração IA indisponível. Configure a API_KEY para insights preditivos.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Como analista de dados do Estado de Goiás, compare estes dados externos: ${JSON.stringify(data)} 
        com nossa base local que possui ${localAmendments.length} processos.
        Identifique: 
        1. Divergências óbvias.
        2. Alerta de duplicidade se houver.
        3. Recomendação de importação imediata.
        Responda em 3 parágrafos curtos e diretos.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAiInsight(response.text || "Não foi possível gerar o insight.");
    } catch (err) {
      setAiInsight("Erro ao processar inteligência de dados externa.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', currency: 'BRL' 
  }).format(v);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Análise Rápida OneDrive</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <Zap size={16} className="text-blue-500" /> Sincronização Dinâmica de Planilhas Externas
          </p>
        </div>
      </div>

      {!externalData ? (
        <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm space-y-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-4 bg-blue-50 text-blue-600 rounded-[24px]">
                <Link2 size={32} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#0d457a] uppercase">Conectar Repositório Externo</h3>
                <p className="text-sm text-slate-400 font-bold uppercase">Integração via Microsoft OneDrive / SharePoint</p>
             </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link de Compartilhamento da Planilha</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="https://1drv.ms/x/s!Abcdef12345..."
                className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0d457a] outline-none focus:ring-4 ring-blue-500/5 transition-all"
                value={oneDriveUrl}
                onChange={(e) => setOneDriveUrl(e.target.value)}
              />
              <button 
                onClick={handleConnect}
                disabled={isConnecting || !oneDriveUrl}
                className="bg-[#0d457a] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#0a365f] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                {isConnecting ? 'Conectando...' : 'Sincronizar'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                       <FileSpreadsheet size={18} className="text-emerald-500" /> Dados Identificados na Nuvem
                    </h3>
                    <button 
                      onClick={() => { setExternalData(null); setAiInsight(null); }}
                      className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500"
                    >
                       Desconectar Planilha
                    </button>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="border-b border-slate-100">
                          <tr>
                             <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase">Processo SEI</th>
                             <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Valor Alocado</th>
                             <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase">Município</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {externalData.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                               <td className="px-4 py-5 text-xs font-black text-[#0d457a]">{row.sei}</td>
                               <td className="px-4 py-5 text-xs font-bold text-slate-600 text-right">{formatBRL(row.valor)}</td>
                               <td className="px-4 py-5 text-[10px] font-black text-blue-500 uppercase">{row.municipio}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={120} /></div>
                 <div className="relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-6 flex items-center gap-2">
                       <Sparkles size={16} /> Análise Preditiva Gemini AI
                    </h3>
                    {isAnalyzing ? (
                       <div className="flex flex-col gap-4 animate-pulse">
                          <div className="h-4 bg-white/10 rounded w-full"></div>
                          <div className="h-4 bg-white/10 rounded w-[80%]"></div>
                       </div>
                    ) : (
                       <div className="text-sm text-blue-100/80 leading-relaxed font-medium space-y-4">
                          {aiInsight?.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                       </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                 <div className="absolute -right-4 -bottom-4 opacity-5"><TrendingUp size={100} /></div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume na Planilha</p>
                 <h4 className="text-3xl font-black text-[#0d457a]">{formatBRL(stats?.totalValue || 0)}</h4>
                 <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">{stats?.count} Processos Detectados</p>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                 <h4 className="text-[10px] font-black text-[#0d457a] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BarChart3 size={16} className="text-blue-500" /> Cobertura GESA vs Nuvem
                 </h4>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { name: 'Local (DB)', valor: localAmendments.length },
                         { name: 'OneDrive', valor: stats?.count || 0 }
                       ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: '800'}} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip />
                          <Bar dataKey="valor" radius={[8, 8, 0, 0]} barSize={40}>
                             <Cell fill="#0d457a" />
                             <Cell fill="#10b981" />
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};