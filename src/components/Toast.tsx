import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-50 max-w-sm w-full"
        >
          <div
            className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500 text-white'
                : toast.type === 'error'
                ? 'bg-rose-900 border-rose-500 text-white'
                : 'bg-slate-900 border-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="text-xs sm:text-sm font-bold">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
