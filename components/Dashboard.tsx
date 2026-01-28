import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Amendment, Status, Sector } from '../types';
import { TrendingUp, Clock, FileCheck, AlertCircle, Building2 } from 'lucide-react';

interface DashboardProps {
  amendments: Amendment[];
}

// GO.GOV Palette: Navy updated to #0d457a
const COLORS = ['#0d457a', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#0d457a'];

export const Dashboard: React.FC<DashboardProps> = ({ amendments }) => {
  // Stats Calculation
  const totalValue = amendments.reduce((acc, curr) => acc + curr.value, 0);
  const totalCount = amendments.length;
  const approvedCount = amendments.filter(a => a.status === Status.APPROVED || a.status === Status.PAID).length;
  const processingCount = amendments.filter(a => a.status === Status.PROCESSING).length;
  
  // Data for Charts
  const statusData = Object.values(Status).map(status => ({
    name: status,
    count: amendments.filter(a => a.status === status).length
  }));

  const sectorData = Object.values(Sector).map(sector => ({
    name: sector.split(' ')[0], // Shorten name
    count: amendments.filter(a => a.currentSector === sector).length
  }));

  const StatCard = ({ title, value, icon: Icon, colorClass, subtext }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-bold text-[#0d457a]">{value}</h3>
        {subtext && <p className="text-xs text-emerald-600 mt-2 font-medium">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight">Painel de Controle</h2>
        <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 uppercase font-bold tracking-wider">
          Atualizado em: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Montante Alocado" 
          value={`R$ ${totalValue.toLocaleString('pt-BR')}`} 
          icon={TrendingUp} 
          colorClass="bg-[#0d457a]" 
        />
        <StatCard 
          title="Total de Emendas" 
          value={totalCount} 
          icon={FileCheck} 
          colorClass="bg-[#0a365f]" 
        />
        <StatCard 
          title="Concluídas" 
          value={approvedCount} 
          icon={CheckCircle} 
          colorClass="bg-emerald-500"
          subtext={`${((approvedCount/totalCount)*100).toFixed(1)}% de eficácia`} 
        />
        <StatCard 
          title="Em Tramitação" 
          value={processingCount} 
          icon={Clock} 
          colorClass="bg-amber-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-[#0d457a] mb-6 border-b border-slate-100 pb-2 uppercase tracking-wide">Distribuição por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Inter', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-[#0d457a] mb-6 border-b border-slate-100 pb-2 uppercase tracking-wide">Gargalos por Setor</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0d457a" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

function CheckCircle(props: any) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={props.size} 
            height={props.size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={props.className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
}