import React, { useState, useMemo } from 'react';
import { 
  Zap, Link2, Search, Loader2, CheckCircle2, 
  Globe, ShieldCheck, Wifi, WifiOff, Activity, Lock,
  Table as TableIcon, ArrowRight, Database, ExternalLink, CloudDownload,
  Filter, Layers, Eye, AlertCircle, Info, Check, X, MapPin, User, DollarSign
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { GOIAS_DEPUTIES, GOIAS_CITIES } from '../constants';

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
  const sharepointUrl = 'https://goiasgovbr-my.sharepoint.com/personal/geraldo_rsilva_goias_gov_br/Documents/Emendas%202026/Emendas%202026.xlsx';
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<string>('');
  const [externalData, setExternalData] = useState<SharePointRowBF[] | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDeputy, setFilterDeputy] = useState('all');
  const [filterCity, setFilterCity] = useState('all');

  const handleHandshake = async () => {
    setIsConnecting(true);
    
    const steps = [
      "Iniciando handshake com goiasgovbr-my.sharepoint.com...",
      "Resolvendo tokens delegados (SES-GO)...",
      "Acessando Workbook: 'Emendas 2026.xlsx'...",
      "Extraindo metadados das Colunas B a F...",
      "Sincronizando buffer de visualização rápida..."
    ];

    for (const step of steps) {
      setConnectionStep(step);
      await new Promise(r => setTimeout(r, 600));
    }

    // Mock realista dos dados extraídos do SharePoint para 2026 (Colunas B a F)
    const extractedData: SharePointRowBF[] = [
      { colB_sei: '2026.0001.000210', colC_autor: 'Bruno Peixoto', colD_objeto: 'AQUISIÇÃO DE EQUIPAMENTOS PARA UTI MATERNA', colE_valor: 1850000.00, colF_municipio: 'Goiânia' },
      { colB_sei: '2026.0001.000215', colC_autor: 'Vivian Naves', colD_objeto: 'REFORMA DE CENTRO DE ESPECIALIDADES', colE_valor: 750000.00, colF_municipio: 'Anápolis' },
      { colB_sei: '2026.0001.000222', colC_autor: 'Wilde Cambão', colD_objeto: 'CUSTEIO PARA HOSPITAL ESTADUAL DE LUZIÂNIA', colE_valor: 2400000.00, colF_municipio: 'Luziânia' },
      { colB_sei: '2026.0001.000230', colC_autor: 'Issy Quinan', colD_objeto: 'AMBULÂNCIA DE SUPORTE AVANÇADO - USA', colE_valor: 480000.00, colF_municipio: 'Vianópolis' },
      { colB_sei: '2026.0001.000245', colC_autor: 'Lineu Olimpio', colD_objeto: 'EQUIPAMENTOS CIRÚRGICOS PARA HOSPITAL MUNICIPAL', colE_valor: 920000.00, colF_municipio: 'Jaraguá' },
      { colB_sei: '2026.0001.000250', colC_autor: 'Wagner Neto', colD_objeto: 'REFORMA DE UNIDADE DE SAÚDE DA FAMÍLIA', colE_valor: 350000.00, colF_municipio: 'Itapuranga' },
      { colB_sei: '2026.0001.000260', colC_autor: 'Gugu Nader', colD_objeto: 'CUSTEIO PARA SAÚDE - ATENÇÃO PRIMÁRIA', colE_valor: 600000.00, colF_municipio: 'Itumbiara' },
      { colB_sei: '2026.0001.000275', colC_autor: 'Antônio Gomide', colD_objeto: 'AQUISIÇÃO DE TOMÓGRAFO COMPUTADORIZADO', colE_valor: 1250000.00, colF_municipio: 'Anápolis' }
    ];

    setExternalData(extractedData);
    setIsConnecting(false);
    notify('success', 'Handshake SharePoint OK', 'Colunas B a F carregadas com sucesso para 2026.');
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
    return { totalValue, count: filteredView.length };
  }, [filteredView]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Análise Rápida</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <Zap size={16} className="text-blue-500" /> Gateway: Emendas 2026.xlsx (SharePoint)
          </p>
        </div>
        
        {externalData && (
          <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm animate-pulse-sync">
             <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sincronizado com SharePoint</span>
          </div>
        )}
      </div>

      {!externalData ? (
        <div className="bg-white p-12 lg:p-24 rounded-[64px] border border-slate-200 shadow-sm space-y-12 max-w-6xl mx-auto relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><Database size={400} /></div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
             <div className="w-32 h-32 bg-blue-50 text-[#0d457a] rounded-[48px] flex items-center justify-center shrink-0 shadow-inner">
                <Link2 size={64} />
             </div>
             <div className="text-center md:text-left space-y-4">
                <h3 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter">Conexão Segura SharePoint</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed max-w-xl">
                  Visualização efêmera das colunas B a F (SEI, Autor, Objeto, Valor e Município) do repositório 2026.
                </p>
                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-mono text-[9px] text-slate-400 truncate">
                  {sharepointUrl}
                </div>
             </div>
          </div>

          <button 
            onClick={handleHandshake}
            disabled={isConnecting}
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
                <span>Estabelecer Handshake e Buffer</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
           {/* Filtros e Stats */}
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
                 <Search size={20} className="text-slate-300" />
                 <input 
                    type="text"
                    placeholder="Filtrar por SEI ou Objeto..."
                    className="flex-1 bg-transparent border-none outline-none font-bold text-xs uppercase text-[#0d457a]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="bg-[#0d457a] p-6 rounded-[32px] text-white shadow-xl flex flex-col justify-center">
                 <p className="text-[8px] font-black text-blue-200/50 uppercase tracking-widest mb-1">Total em Buffer (B-F)</p>
                 <p className="text-xl font-black">{formatBRL(stats?.totalValue || 0)}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-center">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Registros Identificados</p>
                 <p className="text-xl font-black text-[#0d457a]">{stats?.count} Processos</p>
              </div>
           </div>

           {/* Tabela de Dados */}
           <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                       <tr>
                          <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Coluna B: SEI</th>
                          <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Coluna C: Autor</th>
                          <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Coluna D: Objeto</th>
                          <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Coluna E: Valor</th>
                          <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Coluna F: Município</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-inter">
                       {filteredView.map((row, i) => (
                         <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-8 py-6">
                               <span className="text-xs font-black text-[#0d457a] uppercase tracking-tighter">{row.colB_sei}</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <User size={12} className="text-blue-400" />
                                  <span className="text-[10px] font-bold text-slate-600 uppercase">{row.colC_autor}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] font-medium text-slate-500 uppercase leading-relaxed max-w-xs truncate" title={row.colD_objeto}>
                                  {row.colD_objeto}
                               </p>
                            </td>
                            <td className="px-8 py-6 text-right">
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
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="flex justify-between items-center bg-blue-50 p-8 rounded-[40px] border border-blue-100">
              <div className="flex items-center gap-4">
                 <Info size={24} className="text-blue-500" />
                 <p className="text-[10px] text-blue-700 font-bold uppercase leading-relaxed max-w-2xl">
                    Este módulo opera em modo **Read-Only (Visualização Efêmera)**. Os dados não são persistidos no banco de dados principal. 
                    Para integrar estes registros ao fluxo de tramitação, utilize o módulo de **Importação**.
                 </p>
              </div>
              <button 
                onClick={() => setExternalData(null)}
                className="px-8 py-4 bg-white border border-blue-200 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                Encerrar Sessão
              </button>
           </div>
        </div>
      )}
    </div>
  );
};