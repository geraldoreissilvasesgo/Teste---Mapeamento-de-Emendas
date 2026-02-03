
import React, { useEffect, useState } from 'react';
import { useNotification, NotificationType } from '../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons: Record<NotificationType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles: Record<NotificationType, string> = {
  success: 'bg-emerald-50/90 border-emerald-200 text-emerald-800 shadow-emerald-900/10',
  error: 'bg-red-50/90 border-red-200 text-red-800 shadow-red-900/10',
  info: 'bg-blue-50/90 border-blue-200 text-blue-800 shadow-blue-900/10',
  warning: 'bg-amber-50/90 border-amber-200 text-amber-800 shadow-amber-900/10',
};

const iconColors: Record<NotificationType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
};

const progressColors: Record<NotificationType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
};

export const PlushNotificationContainer: React.FC = () => {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 w-full max-w-[400px] pointer-events-none px-4 md:px-0">
      {notifications.map((notification) => (
        <PlushToast key={notification.id} {...notification} />
      ))}
    </div>
  );
};

const PlushToast: React.FC<{
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}> = ({ id, type, title, message, duration = 5000 }) => {
  const { removeNotification } = useNotification();
  const Icon = icons[type];
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === Infinity) return;
    
    const interval = 10;
    const step = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div 
      className={`pointer-events-auto relative overflow-hidden flex flex-col w-full rounded-[24px] border backdrop-blur-md animate-in slide-in-from-right-full duration-300 shadow-2xl ${styles[type]}`}
      role="alert"
    >
      <div className="flex items-start p-5 gap-4">
        <div className={`shrink-0 p-2.5 bg-white rounded-xl shadow-sm ${iconColors[type]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-black uppercase tracking-widest leading-none mb-1.5">{title}</h4>
          <p className="text-[10px] font-bold opacity-80 leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={() => removeNotification(id)}
          className="shrink-0 p-1.5 hover:bg-black/5 rounded-lg transition-colors"
        >
          <X size={16} className="opacity-40" />
        </button>
      </div>
      
      {duration !== Infinity && (
        <div className="h-1 w-full bg-black/5">
          <div 
            className={`h-full transition-all linear ${progressColors[type]}`}
            style={{ width: `${progress}%`, transitionDuration: '10ms' }}
          />
        </div>
      )}
    </div>
  );
};
