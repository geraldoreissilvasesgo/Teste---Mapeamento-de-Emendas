
import React from 'react';
import { 
  Smartphone, Download, Share, PlusSquare, 
  CheckCircle2, Info, ArrowRight, Apple, 
  Smartphone as Android, LayoutDashboard,
  ShieldCheck, Zap, Globe
} from 'lucide-react';

export const MobileAppGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Aplicativo Móvel</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <Smartphone size={16} className="text-blue-500" /> Instalação do GESA Cloud no Celular
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card de Benefícios */}
        <div className="bg-[#0d457a] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Smartphone size={200} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <Zap size={24} className="text-emerald-400" /> Por que instalar?
          </h3>
          <ul className="space-y-5 relative z-10">
            {[
              'Acesso rápido via ícone na tela inicial',
              'Interface otimizada para telas menores',
              'Navegação fluida sem barras de navegador',
              'Segurança biométrica do próprio dispositivo',
              'Sincronização em tempo real de trâmites'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-4 text-xs font-bold uppercase tracking-wide text-blue-100">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Card de Tecnologia PWA */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col justify-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tight">Tecnologia PWA</h3>
          <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase">
            O GESA Cloud utiliza a tecnologia **Progressive Web App (PWA)**. Isso significa que você não precisa baixar um arquivo pesado da loja de aplicativos. O sistema é instalado diretamente do seu navegador, garantindo que você sempre tenha a versão mais atualizada sem ocupar espaço desnecessário.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-xs font-black text-[#0d457a] uppercase tracking-[0.2em] flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center shadow-inner"><Download size={20} /></div>
          Passo a Passo para Instalação
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guia iOS */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 border-t-8 border-slate-400">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-600"><Apple size={32} /></div>
              <h4 className="text-lg font-black text-[#0d457a] uppercase tracking-tight">iPhone (iOS)</h4>
            </div>
            <div className="space-y-6">
              {[
                { step: 1, text: 'Abra o sistema no navegador Safari.', icon: <Globe size={16}/> },
                { step: 2, text: 'Toque no botão de "Compartilhar" (ícone de quadrado com seta para cima).', icon: <Share size={16}/> },
                { step: 3, text: 'Role a lista e toque em "Adicionar à Tela de Início".', icon: <PlusSquare size={16}/> },
                { step: 4, text: 'Confirme clicando em "Adicionar" no canto superior direito.', icon: <CheckCircle2 size={16}/> }
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#0d457a] flex items-center justify-center font-black text-sm border border-slate-100 group-hover:bg-[#0d457a] group-hover:text-white transition-all">
                    {item.step}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300">{item.icon}</span>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guia Android */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 border-t-8 border-emerald-500">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600"><Android size={32} /></div>
              <h4 className="text-lg font-black text-[#0d457a] uppercase tracking-tight">Android</h4>
            </div>
            <div className="space-y-6">
              {[
                { step: 1, text: 'Abra o sistema no Google Chrome.', icon: <Globe size={16}/> },
                { step: 2, text: 'Toque nos três pontos (menu) no canto superior direito.', icon: <Info size={16}/> },
                { step: 3, text: 'Toque em "Instalar Aplicativo" ou "Adicionar à Tela Inicial".', icon: <Download size={16}/> },
                { step: 4, text: 'Confirme a instalação no pop-up que aparecer.', icon: <CheckCircle2 size={16}/> }
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#0d457a] flex items-center justify-center font-black text-sm border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    {item.step}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300">{item.icon}</span>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-8 rounded-[36px] border border-blue-100 flex items-center gap-6">
        <div className="p-4 bg-white rounded-2xl text-blue-600 shadow-sm"><Info size={24} /></div>
        <p className="text-[10px] font-bold text-blue-700 uppercase leading-relaxed">
          Após a instalação, o ícone do **GESA Cloud** aparecerá na sua lista de aplicativos. Você poderá acessá-lo sem precisar digitar o endereço no navegador todas as vezes.
        </p>
      </div>
    </div>
  );
};
