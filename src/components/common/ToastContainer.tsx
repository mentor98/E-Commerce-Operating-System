import React from 'react';
import { useNotification, Toast } from '../../context/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderClass = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 dark:border-emerald-500/20';
      case 'warning':
        return 'border-amber-500/30 dark:border-amber-500/20';
      case 'error':
        return 'border-rose-500/30 dark:border-rose-500/20';
      default:
        return 'border-blue-500/30 dark:border-blue-500/20';
    }
  };

  return (
    <div id="toast-container-root" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            id={`toast-item-${toast.id}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border shadow-lg shadow-black/5 dark:shadow-black/30 backdrop-blur-md ${getBorderClass(toast.type)}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 text-sm">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{toast.title}</h4>
              {toast.message && (
                <p className="mt-0.5 text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              id={`toast-close-btn-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
