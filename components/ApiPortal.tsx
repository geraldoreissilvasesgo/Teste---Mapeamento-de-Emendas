import React, { useState, useEffect } from 'react';
import { 
  Code2, Key, Globe, Copy, Check, Server, 
  ExternalLink, Braces, ShieldCheck, Zap, 
  Database, RefreshCw, FileJson, Link, Box,
  Terminal, Play, ChevronRight, AlertCircle, Loader2,
  Activity, Plus
} from 'lucide-react';
import { db } from '../services/supabase';
import { User, Amendment } from '../types';

interface ApiPortalProps {
  currentUser: User;
  amendments: Amendment[];
}

export const ApiPortal: React.FC<ApiPortalProps> = ({ currentUser, amendments }) => {
  const [apiKey, setApiKey] = useState('gesa_live_sync_loading...');
  const [isRotating, setIsRotating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<'bash' | 'js' | 'python'>('bash');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResponse, setSimResponse] = useState<any>(null);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const profile = await db.profiles.get(currentUser.id);
        if (profile?.api_key) {
          setApiKey(profile.api_key);
        } else {
          // Se não tiver, gera a primeira
          const newKey = await db.profiles.rotateApiKey(currentUser.id);
          setApiKey(newKey);
        }
      } catch (err) {
        setApiKey('gesa_live_demo_key_77123');
      }
    };
    fetchKey();
  }, [currentUser.id]);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rotateKey = async () => {
    if (!window.confirm("Atenção: A chave atual será invalidada imediatamente e todos os sistemas integrados perderão o acesso. Deseja continuar?")) return;
    setIsRotating(true);
    try {
      const newKey = await db.profiles.rotateApiKey(currentUser.id);
      setApiKey(newKey);
      await db.audit.log({
        action: 'Segurança',
        details: 'API Key rotacionada via Portal',
        severity: 'WARN'
      });
    } catch (err) {
      alert("Erro ao rotacionar chave.");
    } finally {
      setIsRotating(false);
    }
  };

  const simulateCall = async () => {
    setIsSimulating(true);
    setSimResponse(null);
    // Simula latência de rede governamental
    await new Promise(r => setTimeout(r, 1200));
    setSimResponse({
      status: 200,
      timestamp: new Date().toISOString(),
      tenant: "SECRETARIA DA SAUDE - SES",
      data: amendments.slice(0, 2).map(a => ({
        id: a.id,
        sei: a.seiNumber,
        valor: a.value,
        status: a.status,
        localizacao: a.currentSector
      })),
      meta: {
        total_records: amendments.length,
        version: "v1.4.2",
        ratelimit_limit: 1000,
        ratelimit_remaining: 998
      }
    });
    setIsSimulating(false);
  };

  const snippets = {
    bash: `curl -X GET "https://api.gesa.go.gov.br/v1/processes" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`,
    js: `const response = await fetch('https://api.gesa.go.gov.br/v1/processes', {
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);`,
    python: `import requests

url = "https://api.gesa.go.gov.br/v1/processes"
headers = {
    "Authorization": f"Bearer ${apiKey}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Portal de Integração (API)</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <Braces size={16} className="text-blue-500" /> Gateway Governamental de Dados (REST)
          </p>
        </div>
        <div className="flex gap-2">
            <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> API LIVE
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Gestão de Chave */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700"><Key size={120}/></div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                    <Key size={18} className="text-amber-500" /> Credenciais de Acesso
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Ambiente de Produção (Live)</p>
                </div>
                <button 
                    onClick={rotateKey}
                    disabled={isRotating}
                    className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase hover:bg-red-50 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                    {isRotating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} 
                    Rotacionar Chave
                </button>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-[28px] border border-white/10 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[9px] font-black text-blue-300/50 uppercase mb-2 tracking-widest">Bearer API Token</p>
                        <code className="text-sm font-mono text-blue-400 break-all">{apiKey}</code>
                    </div>
                    <button 
                        onClick={copyKey}
                        className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all shrink-0 border border-white/5"
                    >
                        {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                    </button>
                </div>
            </div>
            <div className="mt-6 flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <AlertCircle size={18} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-blue-700 font-bold uppercase leading-relaxed">
                    Esta chave concede acesso total aos dados de emendas parlamentares do seu tenant. Não a utilize no lado do cliente (Frontend).
                </p>
            </div>
          </div>

          {/* Playground / Simulator */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                    <Terminal size={18} className="text-blue-500" /> API Playground
                </h3>
                <button 
                    onClick={simulateCall}
                    disabled={isSimulating}
                    className="flex items-center gap-2 bg-[#0d457a] text-white px-6 py-2.5 rounded-xl hover:bg-[#0a365f] transition-all text-[10px] font-black uppercase shadow-lg disabled:opacity-50"
                >
                    {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    Testar Requisição
                </button>
             </div>

             <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
                <div className="p-4 bg-slate-800/50 border-b border-white/5 flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                </div>
                <div className="p-6 font-mono text-[11px] h-64 overflow-y-auto custom-scrollbar">
                    {isSimulating ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader2 className="text-blue-400 animate-spin" size={32} />
                            <p className="text-blue-400/50 uppercase tracking-widest animate-pulse">Estabelecendo Handshake v1...</p>
                        </div>
                    ) : simResponse ? (
                        <pre className="text-emerald-400 leading-relaxed animate-in fade-in duration-500">
                            {JSON.stringify(simResponse, null, 2)}
                        </pre>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                            <Terminal size={48} className="mb-4 text-white" />
                            <p className="text-white uppercase font-black tracking-widest">Aguardando Execução</p>
                        </div>
                    )}
                </div>
             </div>
          </div>

          {/* Documentação / Snippets */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                    <FileJson size={18} className="text-blue-500" /> Exemplos de Implementação
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['bash', 'js', 'python'] as const).map(lang => (
                        <button 
                            key={lang}
                            onClick={() => setActiveLang(lang)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeLang === lang ? 'bg-white text-[#0d457a] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {lang === 'js' ? 'JavaScript' : lang}
                        </button>
                    ))}
                </div>
             </div>

             <div className="bg-[#0b0e14] p-8 rounded-[32px] relative group overflow-hidden border border-white/5">
                <code className="block whitespace-pre-wrap font-mono text-xs text-blue-300 leading-relaxed">
                    {snippets[activeLang]}
                </code>
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(snippets[activeLang]);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="absolute top-4 right-4 p-3 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* Monitor de Saúde API */}
           <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><Activity size={180} /></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-white/50">Métricas do Gateway</h3>
              
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Registros Acessíveis</p>
                        <p className="text-3xl font-black tracking-tighter">{amendments.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Integridade</p>
                        <p className="text-xl font-black text-emerald-400">99.9%</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                        <span>Carga de Tráfego</span>
                        <span>Normal</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 w-1/4 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[8px] font-black text-white/30 uppercase mb-1">Endpoints</p>
                        <p className="text-sm font-black text-blue-300">v1 / v2-beta</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-white/30 uppercase mb-1">Auth Mode</p>
                        <p className="text-sm font-black text-emerald-300">HMAC/JWT</p>
                    </div>
                </div>
              </div>
           </div>

           {/* Webhooks Section */}
           <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Link size={20} /></div>
                <h4 className="text-xs font-black text-[#0d457a] uppercase tracking-widest">Webhooks (Eventos)</h4>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 leading-relaxed">
                Configure URLs para receber notificações automáticas sobre novos trâmites e liquidações.
              </p>
              <button className="w-full py-4 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-[#0d457a] rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100 flex items-center justify-center gap-2">
                <Plus size={14} /> Configurar Webhook
              </button>
           </div>

           {/* SDKs Section */}
           <div className="bg-white p-8 rounded-[48px] border-2 border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Box size={32} />
              </div>
              <h4 className="text-xs font-black text-[#0d457a] uppercase mb-2">GESA Client SDK</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">Bibliotecas oficiais para Node.js, PHP e C#</p>
              <button className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                Acessar Documentação SDK
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};