import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, AlertCircle, CheckCircle2, FileText, ArrowRight,
  Info, Filter, MapPin, DollarSign, Scale, Server, Activity,
  Gavel, FileCheck, Landmark
} from 'lucide-react';
import { Amendment, Status } from '../types';

interface CalendarViewProps {
  amendments: Amendment[];
  onSelectAmendment: (amendment: Amendment) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ amendments, onSelectAmendment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const year = currentDate.getFullYear();

  /**
   * Retorna o ícone representativo baseado no status/etapa atual do processo
   */
  const getStatusIcon = (statusName: string) => {
    const s = statusName.toLowerCase();
    if (s.includes('documentação') || s.includes('análise')) return FileText;
    if (s.includes('tramitação') || s.includes('técnica')) return Server;
    if (s.includes('diligência')) return AlertCircle;
    if (s.includes('jurídico') || s.includes('parecer')) return Scale;
    if (s.includes('empenho') || s.includes('liquidação')) return DollarSign;
    if (s.includes('liquidado') || s.includes('pago')) return CheckCircle2;
    if (s.includes('arquivado')) return FileCheck;
    return Activity;
  };

  /**
   * Calcula o nível de urgência do SLA para um evento individual
   */
  const getSlaUrgency = (deadline: string) => {
    const today = new Date();
    const limit = new Date(deadline);
    const diffTime = limit.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Vencido', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
    if (diffDays <= 2) return { label: 'Crítico', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { label: 'No Prazo', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
  };

  // Mapear emendas por data de deadline do último movimento
  const eventsByDate = useMemo(() => {
    const map: Record<string, Amendment[]> = {};
    amendments.forEach(a => {
      if (a.status === Status.CONCLUDED || a.status === Status.ARCHIVED) return;
      
      const lastMovement = a.movements[a.movements.length - 1];
      if (lastMovement && lastMovement.deadline) {
        const date = new Date(lastMovement.deadline);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
    });
    return map;
  }, [amendments]);

  const getDayStatus = (day: number) => {
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    const events = eventsByDate[key] || [];
    if (events.length === 0) return null;

    const today = new Date();
    const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (eventDate < today && events.some(e => e.status !== Status.CONCLUDED)) return 'overdue';
    if ((eventDate.getTime() - today.getTime()) < (86400000 * 2)) return 'critical';
    return 'normal';
  };

  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDay}`;
    return eventsByDate[key] || [];
  }, [selectedDay, currentDate, eventsByDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Calendário de Prazos</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <CalendarIcon size={16} className="text-blue-500" /> Planejamento Cronológico de SLAs
          </p>
        </div>
        
        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 gap-4">
           <div className="flex items-center gap-2 px-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase">Vencidos</span>
           </div>
           <div className="flex items-center gap-2 px-3">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase">Críticos</span>
           </div>
           <div className="flex items-center gap-2 px-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase">No Prazo</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Calendário Grid */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[48px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-[#0d457a] uppercase tracking-tighter">
                {monthName} <span className="text-slate-300 ml-2">{year}</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                  <ChevronLeft size={20} className="text-[#0d457a]" />
                </button>
                <button onClick={handleNextMonth} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                  <ChevronRight size={20} className="text-[#0d457a]" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-7 mb-6">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24" />
                ))}
                
                {Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                  const day = i + 1;
                  const status = getDayStatus(day);
                  const isSelected = selectedDay === day;
                  const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                  return (
                    <button 
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`h-24 rounded-3xl border-2 transition-all p-3 relative flex flex-col justify-between group ${
                        isSelected ? 'border-[#0d457a] bg-blue-50/50' : 'border-slate-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <span className={`text-xs font-black ${isToday ? 'text-blue-600' : 'text-slate-400'} ${isSelected ? 'scale-110' : ''}`}>
                        {day}
                      </span>
                      
                      {status && (
                        <div className="flex justify-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            status === 'overdue' ? 'bg-red-500 animate-pulse' : 
                            status === 'critical' ? 'bg-amber-500' : 
                            'bg-blue-500'
                          }`} />
                        </div>
                      )}

                      {isToday && (
                        <div className="absolute top-3 right-3">
                           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes do Dia */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm sticky top-8">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-50 text-[#0d457a] rounded-2xl">
                   <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0d457a] uppercase tracking-widest">
                    {selectedDay ? `${selectedDay} de ${monthName}` : 'Selecione um dia'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {selectedDayEvents.length} Processos Agendados
                  </p>
                </div>
             </div>

             <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {selectedDayEvents.map(event => {
                  const lastMov = event.movements[event.movements.length - 1];
                  const urgency = getSlaUrgency(lastMov?.deadline || new Date().toISOString());
                  const StatusIcon = getStatusIcon(event.status);
                  
                  return (
                    <div 
                      key={event.id}
                      onClick={() => onSelectAmendment(event)}
                      className={`p-5 bg-slate-50 border rounded-[28px] hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group ${urgency.border}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl shrink-0 ${urgency.bg} ${urgency.color} shadow-sm group-hover:scale-110 transition-transform`}>
                               <StatusIcon size={16} />
                            </div>
                            <div className="min-w-0">
                               <span className="text-[10px] font-black text-[#0d457a] uppercase tracking-tighter truncate block">{event.seiNumber}</span>
                               <span className={`text-[7px] font-black uppercase tracking-widest ${urgency.color}`}>{urgency.label}</span>
                            </div>
                         </div>
                         <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </div>
                      
                      <p className="text-[9px] font-bold text-slate-400 uppercase line-clamp-2 mb-4 leading-relaxed">
                        {event.object}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                         <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin size={10} className="text-emerald-500 shrink-0" />
                            <span className="text-[8px] font-black text-slate-500 uppercase truncate">{event.municipality}</span>
                         </div>
                         <span className="text-[9px] font-black text-[#0d457a] whitespace-nowrap ml-2">
                            R$ {event.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </span>
                      </div>
                    </div>
                  );
                })}

                {selectedDayEvents.length === 0 && (
                  <div className="py-20 text-center space-y-4 opacity-30">
                     <Info size={40} className="mx-auto text-slate-400" />
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nenhuma entrega prevista para este dia.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};