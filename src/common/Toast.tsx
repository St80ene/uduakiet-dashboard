import type { IToastProps } from '@/interfaces/business.interface';
import { CheckCircle2, Info } from 'lucide-react';
import type { FC } from 'react';

const Toast: FC<IToastProps> = ({ message, type, onClose }) => {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
        type === 'success'
          ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
          : type === 'error'
            ? 'bg-red-950/90 text-red-200 border-red-500/40'
            : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/40'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <Info className="w-5 h-5 text-cyan-400 shrink-0" />
      )}
      <span className="text-xs font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-xs opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
