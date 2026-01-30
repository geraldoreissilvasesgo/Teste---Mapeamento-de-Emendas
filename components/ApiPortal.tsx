
import React, { useState } from 'react';
import { 
  Code2, Key, Globe, Copy, Check, Server, 
  ExternalLink, Braces, ShieldCheck, Zap, 
  Database, RefreshCw, FileJson, Link, Box
} from 'lucide-react';

export const ApiPortal: React.FC = () => {
  const [apiKey] = useState('gesa_live_k8s_928374615243546');
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    { method: 'GET', path: '/v1/processes', desc: 'Lista todos os processos ativos na base GESA.', auth: 'Bearer Token' },
    { method: 'GET', path: '/v1/processes/:sei', desc: 'Retorna o status completo e histórico de um SEI.', auth: 'Bearer Token' },
    { method: 'POST', path: '/v1/external/callback', desc: 'Webhook para recebimento de atualizações externas.', auth: 'API Key' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Portal de Integração (API)</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <Braces size={16} className="text-blue-500" /> Gateway Governamental de Dados (REST)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Key size={120}/></div>
            <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
              <Key size={18} className="text-amber-500" /> Autenticação de Sistema Externo
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Utilize a chave abaixo para autenticar requisições originadas de sistemas externos autorizados (Sefaz, Casa Civil, ALEGO). 
              <strong> Nunca compartilhe esta chave publicamente.</strong>
            </p>
            <div className="flex items-center gap-4 p-5 bg-slate-900 rounded-[24px] group">
              <code className="flex-1 font-mono text-blue-400 text-xs truncate">{apiKey}</code>
              <button 
                onClick={copyKey}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
             <h3 className="text-sm font-black text-[#0d457a] uppercase tracking-widest mb-8 flex items-center gap-3">
              <Globe size={18} className="text-blue-500" /> Endpoints Disponíveis
            </h3>
            <div className="space-y-4">
              {endpoints.map((ep, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${ep.method === 'GET' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {ep.method}
                      </span>
                      <code className="text-xs font-mono font-bold text-[#0d457a]">{ep.path}</code>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ep.auth}</span>
                  </div>
                  <p className="text-xs text-slate-500">{ep.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white/50">Saúde da Integração</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase">Requisições (24h)</span>
                  <span className="text-lg font-black">12.4k</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase">Latência Média</span>
                  <span className="text-lg font-black text-emerald-400">42ms</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-8">
                  <div className="h-full bg-blue-400 w-3/4"></div>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Box size={32} />
              </div>
              <h4 className="text-xs font-black text-[#0d457a] uppercase mb-2">Sandbox Environment</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">Ambiente de Testes para Desenvolvedores</p>
              <button className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                Abrir Playground API
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
