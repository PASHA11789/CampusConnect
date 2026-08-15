import React, { useState, useEffect } from 'react';

/**
 * Triggers a global toast notification from anywhere in the codebase without native browser alerts.
 * @param {string} message - Message to display
 * @param {'error'|'success'|'warning'|'info'} [type='error'] - Toast style variant
 */
export const triggerToast = (message, type = 'error') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app-global-toast', {
        detail: { message, type, id: Date.now() }
      })
    );
  }
};

const ToastNotifier = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      if (!e.detail || !e.detail.message) return;

      const newToast = {
        id: e.detail.id || Date.now(),
        message: e.detail.message,
        type: e.detail.type || 'error'
      };

      setToasts((prev) => [...prev, newToast].slice(-3)); // Keep max 3 active toasts

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('app-global-toast', handleToastEvent);
    return () => {
      window.removeEventListener('app-global-toast', handleToastEvent);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999999 }}
      className="flex flex-col gap-2.5 max-w-[90vw] sm:max-w-md pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-3.5 rounded-2xl shadow-[0_12px_36px_rgba(7,26,53,0.35)] border flex items-center gap-3 font-sans transition-all duration-300 animate-slide-down ${
            toast.type === 'error' || toast.type === 'warning'
              ? 'bg-[#071A35] text-white border-amber-500/70'
              : toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-400'
              : 'bg-[#071A35] text-white border-blue-500/70'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs border ${
              toast.type === 'error' || toast.type === 'warning'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : toast.type === 'success'
                ? 'bg-white/20 text-white border-white/40'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
            }`}
          >
            <i
              className={`fa-solid ${
                toast.type === 'error' || toast.type === 'warning'
                  ? 'fa-triangle-exclamation animate-bounce'
                  : toast.type === 'success'
                  ? 'fa-circle-check'
                  : 'fa-circle-info'
              }`}
            />
          </div>

          <div className="flex flex-col text-left flex-1 min-w-0">
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                toast.type === 'error' || toast.type === 'warning'
                  ? 'text-amber-400'
                  : toast.type === 'success'
                  ? 'text-emerald-200'
                  : 'text-blue-300'
              }`}
            >
              {toast.type === 'error'
                ? 'Upload Warning'
                : toast.type === 'warning'
                ? 'Notice'
                : toast.type === 'success'
                ? 'Success'
                : 'Info'}
            </span>
            <span className="text-[12px] font-bold text-slate-100 leading-snug break-words">
              {toast.message}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer p-1 transition-colors ml-1"
            aria-label="Dismiss toast"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotifier;
