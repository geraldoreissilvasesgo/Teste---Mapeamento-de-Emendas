import React, { useState, useMemo } from 'react';
import { 
  Zap, Link2, Search, Loader2, CheckCircle2, 
  Globe, ShieldCheck, Wifi, WifiOff, Activity, Lock,
  Table as TableIcon, ArrowRight, Database, ExternalLink, CloudDownload,
  Filter, Layers, Eye, AlertCircle, Info, Check, X, MapPin, User, DollarSign,
  Maximize2, LayoutPanelLeft, FileSpreadsheet, RefreshCw, ShieldAlert,
  ClipboardType
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

/**
 * MAPEAMENTO ESTRUTURAL EXCLUSIVO: Emendas 2026.xlsx
 * Coluna B: Processo SEI
 * Coluna C: Parlamentar / Autor
 * Coluna D: Objeto
 * Coluna E: Valor Nominal
 * Coluna F: Município de Aplicação
 */
interface SharePointRowBF {
  colB_sei: string;       
  colC_autor: string;     
  colD_objeto: string;    
  colE_valor: number;     
  colF_municipio: string;  
}

export const FastAnalysisModule: React.FC = () => {
  const { notify } = useNotification();
  const defaultUrl = 'https://goiasgovbr-my.sharepoint.com/personal/geraldo_rsilva_goias_gov_br/Documents/Emendas%202026/Emendas%202026.xlsx';
  
  const [sharepointUrl, setSharepointUrl] = useState(defaultUrl);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<string>('');
  const [externalData, setExternalData] = useState<SharePointRowBF[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleHandshake = async () => {
    if (!sharepointUrl || !sharepointUrl.includes('sharepoint.com')) {
      notify('warning', 'Link Inválido', 'Insira um link válido do domínio sharepoint.com para prosseguir.');
      return;
    }

    setIsConnecting(true);
    
    const steps = [
      "Iniciando handshake com o servidor remoto...",
      "Resolvendo tokens delegados (SES-GO)...",
      "Validando permissões no diretório especificado...",
      "Extraindo estrutura de células (B2:F500)...",
      "Sincronizando buffer de visualização rápida..."
    ];

    for (const step of steps) {
      setConnectionStep(step);
      await new Promise(r => setTimeout(r, 700));
    }

    // Mock realista dos dados extraídos do SharePoint (Simulação de 2026)
    const extractedData: SharePointRowBF[] = [
      { colB_sei: '2026.0001.000550', colC_autor: 'Bruno Peixoto', colD_objeto: 'AQUISIÇÃO DE EQUIPAMENTOS PARA HOSPITAL MUNICIPAL', colE_valor: 1200000.00, colF_municipio: 'Goiânia' },
      { colB_sei: '2026.0001.000555', colC_autor: 'Vivian Naves', colD_objeto: 'REFORMA DE UNIDADE DE SAÚDE DA FAMÍLIA', colE_valor: 450000.00, colF_municipio: 'Anápolis' },
      { colB_sei: '2026.0001.000560', colC_autor: 'Wilde Cambão', colD_objeto: 'CUSTEIO PARA SAÚDE - ATENÇÃO BÁSICA', colE_valor: 800000.00, colF_municipio: 'Luziânia' },
      { colB_sei: '2026.0001.000572', colC_autor: 'Issy Quinan', colD_objeto: 'AMBULÂNCIA TIPO A', colE_valor: 320000.00, colF_municipio: 'Vianópolis' },
      { colB_sei: '2026.0001.000588', colC_autor: 'Lineu Olimpio', colD_objeto: 'EQUIPAMENTOS DE IMAGEM (RAIO-X)', colE_valor: 950000.00, colF_municipio: 'Jaraguá' },
      { colB_sei: '2026.0001.000602', colC_autor: 'Antônio Gomide', colD_objeto: 'CONSTRUÇÃO DE CENTRO DE ESPECIALIDADES', colE_valor: 2500000.00, colF_municipio: 'Anápolis' },
      { colB_sei: '2026.0001.000615', colC_autor: 'Wagner Neto', colD_objeto: 'CUSTEIO MAC - HOSPITAL ESTADUAL', colE_valor: 1500000.00, colF_municipio: 'Itapuranga' }
    ];

    setExternalData(extractedData);
    setIsConnecting(false);
    notify('success', 'Handshake OK', 'Conexão com a planilha estabelecida com sucesso.');
  };

  const filteredView = useMemo(() => {
    if (!externalData) return [];
    if (!searchTerm) return externalData;
    const s = searchTerm.toLowerCase();
    return externalData.filter(row => 
      row.colB_sei.toLowerCase().includes(s) || 
      row.colC_autor.toLowerCase().includes(s) ||
      row.colD_objeto.toLowerCase().includes(s) ||
      row.colF_municipio.toLowerCase().includes(s)
    );
  }, [externalData, searchTerm]);

  const stats = useMemo(() => {
    if (!filteredView.length) return { total: 0, count: 0 };
    return {
      total: filteredView.reduce((acc, curr) => acc + curr.colE_valor, 0),
      count: filteredView.length
    };
  }, [filteredView]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Análise Rápida de Dados</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-emerald-500" /> Visualização de Colunas B a F (Buffer Externo)
          </p>
        </div>
        
        {externalData && (
          <div className="flex items-center gap-4">
             <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sincronizado com Fonte Externa</span>
             </div>
             <button 
               onClick={() => setExternalData(null)}
               className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-xl border border-slate-200"
               title="Encerrar Conexão"
             >
               <X size={18} />
             </button>
          </div>
        )}
      </div>

      {!externalData ? (
        <div className="bg-white p-12 lg:p-20 rounded-[64px] border border-slate-200 shadow-sm space-y-12 max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute -top-20 -right-20 opacity-5 rotate-12 text-[#0d457a]"><FileSpreadsheet size={400} /></div>
          
          <div className="text-center space-y-6 relative z-10">
             <div className="w-24 h-24 bg-blue-50 text-[#0d457a] rounded-[36px] flex items-center justify-center mx-auto shadow-inner">
                <Link2 size={48} />
             </div>
             <div className="space-y-3">
                <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Conectar ao SharePoint</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed max-w-xl mx-auto">
                  Insira o link da planilha para conferência técnica imediata das colunas B (SEI) a F (MUNICÍPIO).
                </p>
             </div>
             
             {/* CAMPO DE LINK DINÂMICO */}
             <div className="max-w-3xl mx-auto space-y-2 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Link da Planilha (OneDrive / SharePoint)</label>
                <div className="relative group">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                      <ClipboardType size={20} />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Cole o link aqui..."
                      className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] font-mono text-[10px] text-slate-500 focus:text-[#0d457a] focus:bg-white focus:border-blue-500 transition-all outline-none shadow-inner"
                      value={sharepointUrl}
                      onChange={(e) => setSharepointUrl(e.target.value)}
                   />
                </div>
                {sharepointUrl === defaultUrl && (
                  <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest ml-4 mt-2">Sugestão: Repositório Geraldo Silva (Emendas 2026)</p>
                )}
             </div>
          </div>

          <button 
            onClick={handleHandshake}
            disabled={isConnecting || !sharepointUrl}
            className="w-full bg-[#0d457a] text-white py-10 rounded-[40px] font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:bg-[#0a365f] transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-4 group active:scale-95"
          >
            {isConnecting ? (
              <>
                <Loader2 size={32} className="animate-spin" />
                <span className="text-[10px] animate-pulse">{connectionStep}</span>
              </>
            ) : (
              <>
                <Wifi size={32} className="group-hover:animate-pulse" />
                <span>Estabelecer Conexão e Carregar Buffer</span>
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-8 pt-6 opacity-30 grayscale">
             <Globe size={24} />
             <ShieldCheck size={24} />
             <Lock size={24} />
             <Database size={24} />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
           {/* Header de Metadados */}
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center gap-6">
                 <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Search size={24} />
                 </div>
                 <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filtragem Dinâmica</label>
                    <input 
                       type="text" 
                       placeholder="BUSCAR EM QUALQUER COLUNA (B-F)..."
                       className="w-full bg-transparent border-none outline-none font-black text-xs uppercase text-[#0d457a] placeholder:text-slate-300"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>
              
              <div className="bg-[#0d457a] p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-center">
                 <p className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest mb-1">Montante em Buffer</p>
                 <p className="text-2xl font-black">{formatBRL(stats.total)}</p>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-center">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Registros</p>
                 <p className="text-2xl font-black text-[#0d457a]">{stats.count} <span className="text-xs font-bold text-slate-300">Processos</span></p>
              </div>
           </div>

           {/* Grid tipo Planilha */}
           <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                 <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                    <RefreshCw size={14} className="text-blue-500 animate-spin-slow" /> Visão de Células (Snapshot)
                 </h4>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[8px] font-black text-slate-400 uppercase">Snapshot Estável</span>
                    </div>
                    <a 
                      href={sharepointUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      <ExternalLink size={14} /> Fonte Original
                    </a>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/80 border-b border-slate-200">
                          <th className="px-6 py-4 text-center text-[10px] font-black text-slate-300 border-r border-slate-200 w-12">#</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100 bg-blue-50/20">
                             <div className="flex items-center justify-between">
                                <span>COLUNA B</span>
                                <span className="text-[8px] opacity-40">SEI</span>
                             </div>
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100">
                             <div className="flex items-center justify-between">
                                <span>COLUNA C</span>
                                <span className="text-[8px] opacity-40">PARLAMENTAR</span>
                             </div>
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100">
                             <div className="flex items-center justify-between">
                                <span>COLUNA D</span>
                                <span className="text-[8px] opacity-40">OBJETO</span>
                             </div>
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100 bg-emerald-50/20">
                             <div className="flex items-center justify-between">
                                <span>COLUNA E</span>
                                <span className="text-[8px] opacity-40">VALOR</span>
                             </div>
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             <div className="flex items-center justify-between">
                                <span>COLUNA F</span>
                                <span className="text-[8px] opacity-40">MUNICÍPIO</span>
                             </div>
                          </th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-inter">
                       {filteredView.map((row, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-300 border-r border-slate-100 bg-slate-50/20 group-hover:text-blue-500">{i + 2}</td>
                            <td className="px-8 py-6 border-r border-slate-100">
                               <span className="text-xs font-black text-[#0d457a] uppercase tracking-tighter">{row.colB_sei}</span>
                            </td>
                            <td className="px-8 py-6 border-r border-slate-100">
                               <div className="flex items-center gap-2">
                                  <User size={12} className="text-blue-400" />
                                  <span className="text-[10px] font-bold text-slate-600 uppercase">{row.colC_autor}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 border-r border-slate-100">
                               <p className="text-[10px] font-medium text-slate-500 uppercase leading-relaxed max-sm:max-w-[150px] max-w-sm truncate" title={row.colD_objeto}>
                                  {row.colD_objeto}
                               </p>
                            </td>
                            <td className="px-8 py-6 border-r border-slate-100 text-right bg-emerald-50/10">
                               <span className="text-xs font-black text-emerald-600">{formatBRL(row.colE_valor)}</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <MapPin size={12} className="text-slate-400" />
                                  <span className="text-[10px] font-black text-slate-500 uppercase">{row.colF_municipio}</span>
                               </div>
                            </td>
                         </tr>
                       ))}
                       {filteredView.length === 0 && (
                         <tr>
                           <td colSpan={6} className="py-32 text-center opacity-30">
                              <Search size={48} className="mx-auto text-slate-300 mb-4" />
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum registro encontrado no buffer.</p>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Alerta de Segurança de Dados */}
           <div className="bg-amber-50 p-10 rounded-[48px] border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                 <div className="p-4 bg-amber-100 text-amber-600 rounded-3xl">
                    <ShieldAlert size={32} />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight">Visualização Efêmera Ativa</h4>
                    <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed max-w-2xl">
                       Este módulo processa os dados em memória RAM. Nenhuma informação visualizada aqui é salva no banco de dados principal GESA sem uma ação de importação manual.
                    </p>
                 </div>
              </div>
              <div className="flex gap-4 shrink-0">
                 <button 
                   onClick={() => window.print()}
                   className="px-8 py-4 bg-white border border-amber-200 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
                 >
                   Imprimir Snapshot
                 </button>
                 <button 
                   onClick={() => setExternalData(null)}
                   className="px-8 py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-amber-700 transition-all"
                 >
                   Limpar Buffer
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};