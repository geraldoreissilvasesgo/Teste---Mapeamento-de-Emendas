
import React, { useState, useEffect } from 'react';
import { 
  Code2, Key, Globe, Copy, Check, Server, 
  ExternalLink, Braces, ShieldCheck, Zap, 
  Database, RefreshCw, FileJson, Link, Box,
  Terminal, Play, ChevronRight, AlertCircle, Loader2,
  Activity, Plus, Link2, ShieldAlert, Lock, Settings
} from 'lucide-react';
import { db } from '../services/supabase';
import { User, Amendment } from '../types';

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
    await new Promise(r => setTimeout(r, 2000));
    const success = Math.random() > 0.15; 
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
          {/* Seção SEI-GO (SES) */}
          <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Link2 size={180} /></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                         <Globe size={24} className="text-blue-300" /> Integração Nativa SEI-GO (SES)
                      </h3>
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
        </div>
      </div>
    </div>
  );
};
