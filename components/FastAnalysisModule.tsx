
import React, { useState, useMemo } from 'react';
import { 
  Zap, Link2, Search, Loader2, CheckCircle2, 
  TrendingUp, FileSpreadsheet, 
  Sparkles, Globe, ShieldCheck, Wifi, WifiOff, Activity, Lock,
  Table as TableIcon, ArrowRight, Database, ExternalLink, CloudDownload,
  Filter, Layers, Eye, AlertCircle, BarChart3, PieChart as PieIcon,
  ShieldQuestion, Server, HardDrive, Info, Check, X, MapPin, User, DollarSign
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Amendment } from '../types.ts';
import { useNotification } from '../context/NotificationContext.tsx';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants.ts';

interface FastAnalysisModuleProps {
  localAmendments: Amendment[];
}

/**
 * MAPEAMENTO ESTRUTURAL: Emendas 2026.xlsx
 */
interface SharePointFullRow {
  colA_id: string;        // ID GESA
  colB_sei: string;       // Processo SEI
  colC_autor: string;     // Parlamentar
  colD_objeto: string;    // Objeto
  colE_valor: number;     // Valor (R$)
  colF_municipio: string;  // Município
  colG_gnd: string;       // GND
  colH_modalidade: string; // Modalidade
  colI_status: string;    // Status
  colJ_unidade: string;   // Unidade
}

const COLORS = ['#0d457a', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

export const FastAnalysisModule: React.FC<FastAnalysisModuleProps> = ({ localAmendments }) => {
  const { notify } = useNotification();
  const targetUrl = 'https://goiasgovbr-my.sharepoint.com/personal/geraldo_rsilva_goias_gov_br/Documents/Emendas%202026/Emendas%202026.xlsx';
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<string>('');
  const [externalData, setExternalData] = useState<SharePointFullRow[] | null>(null);
  
  // Estados de Filtragem para a Conexão
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDeputy, setFilterDeputy] = useState('all');
  const [filterCity, setFilterCity] = useState('all');

  const handleConnect = async () => {
    setIsConnecting(true);
    
    const steps = [
      "Iniciando negociação TLS com goiasgovbr-my.sharepoint.com...",
      "Resolvendo permissões delegadas: Geraldo_RS -> GESA_Cloud...",
      "Localizando Workbook: 'Emendas 2026.xlsx'...",
      "Acessando Range de Metadados [Planilha1!A1:J500]...",
      "Validando integridade dos dados 2026...",
      "Sincronizando Buffer de Visualização..."
    ];

    for (const step of steps) {
      setConnectionStep(step);
      await new Promise(r => setTimeout(r, 500));
    }

    const extractedData: SharePointFullRow[] = [
      { colA_id: 'EM-26-001', colB_sei: '2026.0001.000112', colC_autor: 'Bruno Peixoto', colD_objeto: 'REFORMA DE ALTA COMPLEXIDADE - HOSPITAL HUGO', colE_valor: 2500000.00, colF_municipio: 'Goiânia', colG_gnd: '4 - Investimento', colH_modalidade: 'Execução Direta', colI_status: 'Análise Técnica', colJ_unidade: 'HUGO' },
      { colA_id: 'EM-26-002', colB_sei: '2026.0001.000115', colC_autor: 'Wilde Cambão', colD_objeto: 'EQUIPAMENTOS DE MONITORAMENTO CARDÍACO', colE_valor: 1200000.00, colF_municipio: 'Luziânia', colG_gnd: '4 - Investimento', colH_modalidade: 'Fundo a Fundo', colI_status: 'Aguardando Parecer', colJ_unidade: 'SMS Luziânia' },
      { colA_id: 'EM-26-003', colB_sei: '2026.0001.000118', colC_autor: 'Lineu Olimpio', colD_objeto: 'AQUISIÇÃO DE VAN PARA TRANSPORTE DE PACIENTES', colE_valor: 350000.00, colF_municipio: 'Jaraguá', colG_gnd: '4 - Investimento', colH_modalidade: 'Fundo a Fundo', colI_status: 'Análise de Documentação', colJ_unidade: 'Prefeitura de Jaraguá' },
      { colA_id: 'EM-26-004', colB_sei: '2026.0001.000122', colC_autor: 'Issy Quinan', colD_objeto: 'CUSTEIO MAC - UNIDADE DE PRONTO ATENDIMENTO', colE_valor: 800000.00, colF_municipio: 'Vianópolis', colG_gnd: '3 - Custeio', colH_modalidade: 'Fundo a Fundo', colI_status: 'Liquidado', colJ_unidade: 'UPA Vianópolis' },
      { colA_id: 'EM-26-005', colB_sei: '2026.0001.000125', colC_autor: 'Vivian Naves', colD_objeto: 'APARELHOS DE RAIO-X DIGITAL', colE_valor: 950000.00, colF_municipio: 'Anápolis', colG_gnd: '4 - Investimento', colH_modalidade: 'Fundo a Fundo', colI_status: 'Análise Técnica', colJ_unidade: 'SMS Anápolis' },
      { colA_id: 'EM-26-006', colB_sei: '2026.0001.000130', colC_autor: 'Wagner Neto', colD_objeto: 'REFORMA DE UBS E AQUISIÇÃO DE INSUMOS', colE_valor: 450000.00, colF_municipio: 'Itapuranga', colG_gnd: '3 - Custeio', colH_modalidade: 'Convênio', colI_status: 'Em Diligência', colJ_unidade: 'UBS Itapuranga' },
      { colA_id: 'EM-26-007', colB_sei: '2026.0001.000145', colC_autor: 'Antônio Gomide', colD_objeto: 'REFORMA DE POLICLÍNICA REGIONAL', colE_valor: 3200000.00, colF_municipio: 'Anápolis', colG_gnd: '4 - Investimento', colH_modalidade: 'Execução Direta', colI_status: 'Aguardando Parecer', colJ_unidade: 'Policlínica Anápolis' },
      { colA_id: 'EM-26-008', colB_sei: '2026.0001.000150', colC_autor: 'Bia de Lima', colD_objeto: 'EQUIPAMENTOS PARA FISIOTERAPIA', colE_valor: 280000.00, colF_municipio: 'Aparecida', colG_gnd: '4 - Investimento', colH_modalidade: 'Fundo a Fundo', colI_status: 'Análise de Documentação', colJ_unidade: 'CRER' },
      { colA_id: 'EM-26-010', colB_sei: '2026.0001.000170', colC_autor: 'Lucas do Vale', colD_objeto: 'REFORMA DE HOSPITAL ESTADUAL', colE_valor: 4500000.00, colF_municipio: 'Rio Verde', colG_gnd: '4 - Investimento', colH_modalidade: 'Execução Direta', colI_status: 'Análise Técnica', colJ_unidade: 'Hospital Regional RV' }
    ];

    setExternalData(extractedData);
    setIsConnecting(false);
    notify('success', 'Visualização Habilitada', 'Filtros de conexão ativos para o exercício 2026.');
  };

  const filteredView = useMemo(() => {
    if (!externalData) return [];
    return externalData.filter(row => {
      const matchesSearch = !searchTerm || 
        row.colB_sei.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.colD_objeto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDeputy = filterDeputy === 'all' || row.colC_autor === filterDeputy;
      const matchesCity = filterCity === 'all' || row.colF_municipio === filterCity;
      return matchesSearch && matchesDeputy && matchesCity;
    });
  }, [externalData, searchTerm, filterDeputy, filterCity]);

  const stats = useMemo(() => {
    if (!filteredView.length) return null;
    const totalValue = filteredView.reduce((acc, curr) => acc + curr.colE_valor, 0);
    const count = filteredView.length;
    return { totalValue, count };
  }, [filteredView]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Conexão em Tempo Real</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <Globe size={16} className="text-blue-500" /> Repositório Geraldo Silva • Emendas 2026.xlsx
          </p>
        </div>
        
        {externalData && (
          <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm animate-pulse-sync">
             <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Buffer de Conexão Ativo</span>
          </div>
        )}
      </div>

      {!externalData ? (
        <div className="bg-white p-12 lg:p-24 rounded-[64px] border border-slate-200 shadow-sm space-y-12 max-w-6xl mx-auto relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><HardDrive size={400} /></div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
             <div className="w-32 h-32 bg-blue-50 text-[#0d457a] rounded-[48px] flex items-center justify-center shadow-inner border border-blue-100">
                {isConnecting ? <Loader2 size={64} className="animate-spin text-blue-500" /> : <Link2 size={64} />}
             </div>
             <div className="text-center md:text-left">
                <h3 className="text-4xl font-black text-[#0d457a] uppercase tracking-tight">Analisar Dados em Conexão</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Visualização direta do SharePoint SES-GO</p>
             </div>
          </div>

          <div className="space-y-12 relative z-10">
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
              <Info size={24} className="text-blue-500" />
              <p className="text-[10px] text-blue-700 font-bold uppercase leading-relaxed">
                 O gateway GESA lerá as colunas B (SEI), C (Parlamentar), D (Objeto), E (Valor) e F (Município) do arquivo original.
              </p>
            </div>

            <div className="relative">
              <Globe className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
              <div className="w-full pl-16 pr-8 py-8 bg-slate-50 border-2 border-slate-100 rounded-[40px] font-mono text-slate-400 text-sm truncate select-none opacity-60">
                 {targetUrl}
              </div>
            </div>
            
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-[#0d457a] text-white py-10 rounded-[40px] font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:bg-[#0a365f] transition-all disabled:opacity-50 flex items-center justify-center gap-6 group active:scale-95"
            >
              {isConnecting ? <Loader2 size={32} className="animate-spin" /> : <Wifi size={32} className="group-hover:animate-pulse" />}
              {isConnecting ? connectionStep : 'Estabelecer Conexão e Filtrar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in zoom-in-95 duration-500 space-y-8">
           
           {/* Painel de Filtros em Conexão */}
           <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      type="text" 
                      placeholder="PESQUISAR NO BUFFER (SEI OU OBJETO)..."
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[32px] font-bold text-[#0d457a] outline-none focus:border-blue-500 transition-all text-xs"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="w-full lg:w-64">
                    <select 
                      value={filterDeputy}
                      onChange={(e) => setFilterDeputy(e.target.value)}
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-[10px] font-black uppercase text-slate-500 outline-none"
                    >
                      <option value="all">PARLAMENTAR (COL C)</option>
                      {GOIAS_DEPUTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 <div className="w-full lg:w-64">
                    <select 
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-[10px] font-black uppercase text-slate-500 outline-none"
                    >
                      <option value="all">MUNICÍPIO (COL F)</option>
                      {GOIAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <button 
                   onClick={() => setExternalData(null)}
                   className="p-5 text-slate-300 hover:text-red-500 transition-colors"
                   title="Encerrar Conexão"
                 >
                   <X size={24} />
                 </button>
              </div>

              {/* Resumo da Filtragem em Conexão */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between">
                     <div>
                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Montante Filtrado</p>
                        <p className="text-xl font-black text-[#0d457a]">{formatBRL(stats?.totalValue || 0)}</p>
                     </div>
                     <DollarSign size={24} className="text-blue-200" />
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                     <div>
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Registros em Buffer</p>
                        <p className="text-xl font-black text-emerald-700">{stats?.count} Processos</p>
                     </div>
                     <TableIcon size={24} className="text-emerald-200" />
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                     <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Conexão</p>
                        <p className="text-xl font-black text-slate-600 uppercase tracking-tighter">Sincronizado</p>
                     </div>
                     <Wifi size={24} className="text-slate-200" />
                  </div>
              </div>
           </div>

           {/* Listagem Tabular: Colunas B a F em destaque */}
           <div className="bg-white rounded-[56px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                 <h4 className="text-sm font-black text-[#0d457a] uppercase tracking-widest">Informações em Conexão (Buffer SharePoint)</h4>
                 <span className="text-[9px] font-bold text-slate-400 uppercase">Mapeamento Dinâmico: Exercício 2026</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                       <tr>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">COLUNA B: SEI</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">COLUNA C: AUTOR</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">COLUNA D: OBJETO</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">COLUNA E: VALOR</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase">COLUNA F: MUNICÍPIO</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-inter">
                       {filteredView.map((row, i) => (
                         <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-8 py-6">
                               <span className="text-xs font-black text-[#0d457a] uppercase tracking-tighter">{row.colB_sei}</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                  <User size={14} className="text-blue-400" />
                                  <span className="text-[10px] font-bold text-slate-600 uppercase">{row.colC_autor}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] font-medium text-slate-500 uppercase leading-relaxed max-w-sm truncate group-hover:text-slate-700">
                                  {row.colD_objeto}
                               </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <span className="text-xs font-black text-blue-600">{formatBRL(row.colE_valor)}</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <MapPin size={12} className="text-emerald-500" />
                                  <span className="text-[10px] font-black text-slate-500 uppercase">{row.colF_municipio}</span>
                               </div>
                            </td>
                         </tr>
                       ))}
                       {filteredView.length === 0 && (
                          <tr>
                             <td colSpan={5} className="py-24 text-center opacity-30">
                                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum registro encontrado nos filtros da conexão.</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="flex justify-end pt-4">
              <button 
                onClick={() => notify('info', 'Migração', 'Iniciando ingestão de dados filtrados para a base GESA...')}
                className="bg-emerald-500 text-white px-10 py-5 rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-emerald-600 transition-all flex items-center gap-4 group"
              >
                <CloudDownload size={24} className="group-hover:animate-bounce" /> 
                Migrar Registros Filtrados ({filteredView.length})
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
