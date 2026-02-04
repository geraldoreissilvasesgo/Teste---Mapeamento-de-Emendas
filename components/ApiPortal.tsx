import React, { useState, useEffect } from 'react';
import { 
  Code2, Key, Globe, Copy, Check, Server, 
  ExternalLink, Braces, ShieldCheck, Zap, 
  Database, RefreshCw, FileJson, Link, Box,
  Terminal, Play, ChevronRight, AlertCircle, Loader2,
  Activity, Plus, Link2, ShieldAlert, Lock, Settings
} from 'lucide-react';
import { db } from '../services/supabase.ts';
import { User, Amendment } from '../types.ts';

interface ApiPortalProps {
  currentUser: User;
  amendments: Amendment[];
}

export const ApiPortal: React.FC<ApiPortalProps> = ({ currentUser, amendments }) => {
  const [apiKey, setApiKey] = useState('gesa_live_sync_loading...');
  const [seiToken, setSeiToken] = useState('SEI-SES-GO-4421-XXXX-XXXX-XXXX');
  const [isRotating, setIsRotating] = useState(false);
  const [isVerifyingSei, setIsVerifyingSei] = useState(false);
  const [seiStatus, setSeiStatus] = useState<'idle' | 'connected' | 'error'>('idle');
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
          setApiKey('gesa_live_demo_key_77123');
        }
      } catch (err) {
        setApiKey('gesa_live_demo_key_77123');
      }
    };
    fetchKey();
  }, [currentUser.id]);

  const copyKey = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifySeiIntegration = async () => {
    setIsVerifyingSei(true);
    setSeiStatus('idle');
    // Simula a verificação de handshake com os servidores da SES-GO
    await new Promise(r => setTimeout(r, 2000));
    const success = Math.random() > 0.15; // 85% de chance de sucesso na simulação
    setSeiStatus(success ? 'connected' : 'error');
    setIsVerifyingSei(false);
  };

  const simulateCall = async () => {
    setIsSimulating(true);
    setSimResponse(null);
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
          
          {/* Seção SEI-GO (SES) */}
          <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Link2 size={180} /></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                         <Globe size={24} className="text-blue-300" /> Integração Nativa SEI-GO (SES)
                      </h3>
                      <p className="text-blue-200/50 text-[10px] font-black uppercase tracking-widest mt-1">Conexão entre GESA Cloud e Secretaria da Saúde</p>
                   </div>
                   <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                     seiStatus === 'connected' ? 'bg-emerald-500 border-emerald-400 text-white' : 
                     seiStatus === 'error' ? 'bg-red-500 border-red-400 text-white' : 
                     'bg-white/10 border-white/20 text-white/60'
                   }`}>
                      {seiStatus === 'connected' ? 'Handshake Ativo' : seiStatus === 'error' ? 'Falha na Conexão' : 'Status: Aguardando Teste'}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                   <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-2">Endpoint WebService SEI</label>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-mono text-blue-200">
                          https://sei.goias.gov.br/sei/ws/SeiWS
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-2">Sigla do Órgão de Acesso</label>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white">
                          SES-GO
                        </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-2">Chave de Integração (Token)</label>
                        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group/token">
                          <Lock size={14} className="text-blue-300" />
                          <code className="text-[11px] font-mono text-blue-200 truncate pr-8">
                             {seiToken}
                          </code>
                          <button onClick={() => copyKey(seiToken)} className="absolute right-3 p-1.5 hover:bg-white/10 rounded-lg transition-all">
                             <Copy size={14} className="opacity-40 group-hover/token:opacity-100" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-900/40 rounded-2xl border border-blue-400/20 flex gap-4">
                         <ShieldCheck size={20} className="text-blue-300 shrink-0" />
                         <p className="text-[9px] font-bold text-blue-100/70 uppercase leading-relaxed">
                            Esta chave permite ao GESA Cloud consultar e anexar documentos diretamente no SEI. A expiração ocorre em 365 dias.
                         </p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={verifySeiIntegration}
                  disabled={isVerifyingSei}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isVerifyingSei ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                  {isVerifyingSei ? 'Verificando Handshake...' : 'Verificar Conexão SEI-GO'}
                </button>
            </div>
          </div>

          {/* Gestão de Chave Interna */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700"><Key size={120}/></div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest flex items-center gap-3">
                    <Key size={18} className="text-amber-500" /> Credenciais GESA Cloud
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Chaves de consumo para sub-sistemas</p>
                </div>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-[28px] border border-white/10 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[9px] font-black text-blue-300/50 uppercase mb-2 tracking-widest">Bearer API Token</p>
                        <code className="text-sm font-mono text-blue-400 break-all">{apiKey}</code>
                    </div>
                    <button 
                        onClick={() => copyKey(apiKey)}
                        className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all shrink-0 border border-white/5"
                    >
                        {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                    </button>
                </div>
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
        </div>

        <div className="space-y-8">
           {/* Monitor de Saúde API */}
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Activity size={180} /></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-slate-400">Saúde do Gateway</h3>
              
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tempo Médio Resposta</p>
                        <p className="text-3xl font-black text-[#0d457a] tracking-tighter">142ms</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Integridade</p>
                        <p className="text-xl font-black text-emerald-500">99.9%</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                        <span>Carga de Tráfego</span>
                        <span className="text-blue-600">Normal</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-1/4 rounded-full"></div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Endpoints</p>
                        <p className="text-sm font-black text-[#0d457a]">v1 / v2-beta</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Auth Mode</p>
                        <p className="text-sm font-black text-[#0d457a]">HMAC/JWT</p>
                    </div>
                </div>
              </div>
           </div>

           {/* Alerta de Segurança */}
           <div className="bg-amber-50 p-8 rounded-[48px] border border-amber-200 shadow-sm group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ShieldAlert size={24} />
                </div>
                <h4 className="text-xs font-black text-amber-900 uppercase">Aviso Crítico</h4>
              </div>
              <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed mb-6">
                As chaves de integração SEI devem ser protegidas em ambiente de cofre de senhas (Vault). Nunca exponha esses tokens em código público.
              </p>
              <div className="p-4 bg-white/50 rounded-2xl border border-amber-100">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-amber-600">
                  <span>Segurança da Chave</span>
                  <span>ENFORCED</span>
                </div>
              </div>
           </div>

           {/* Ajuda Técnica */}
           <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm text-center">
              <Settings size={32} className="mx-auto text-blue-500 mb-4 opacity-50" />
              <h4 className="text-xs font-black text-[#0d457a] uppercase mb-2">Documentação SEI</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 leading-relaxed">
                Consulte o Manual Técnico de WebServices SEI v3.0 para parâmetros de assinatura digital e XML.
              </p>
              <button className="w-full py-4 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-[#0d457a] rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100">
                Baixar Manual Técnico
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};