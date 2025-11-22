// src/components/ui/ToastProvider.jsx
import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ToastCtx } from "./ToastContext";

export default function ToastProvider({ children, direction = "ltr" }) {
  const [toasts, setToasts] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // create a toast - use useCallback to prevent recreation on every render
  const pushToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);

    // auto dismiss after duration (default: 4s)
    const duration = toast.duration || 4000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []); // Empty dependency array - this function never changes

  // manual dismiss (X button)
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastStyles = (type) => {
    const baseStyles = "flex flex-col gap-1 rounded-xl p-4 text-sm shadow-lg ring-1 backdrop-blur-sm transition-all duration-300 transform animate-in slide-in-from-right-full";
    
    const typeStyles = {
      success: "bg-emerald-50 text-emerald-800 ring-emerald-200 border-l-4 border-l-emerald-500",
      error: "bg-rose-50 text-rose-800 ring-rose-200 border-l-4 border-l-rose-500",
      warning: "bg-amber-50 text-amber-800 ring-amber-200 border-l-4 border-l-amber-500",
      info: "bg-blue-50 text-blue-800 ring-blue-200 border-l-4 border-l-blue-500",
      default: "bg-white text-slate-800 ring-slate-200 border-l-4 border-l-slate-500"
    };

    return `${baseStyles} ${typeStyles[type] || typeStyles.default}`;
  };

  const getToastIcon = (type) => {
    const icons = {
      success: (
        <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      error: (
        <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/>
        </svg>
      ),
      info: (
        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
      default: (
        <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )
    };

    return icons[type] || icons.default;
  };

  const isRTL = direction === "rtl";
  const positionClass = isRTL 
    ? "fixed top-4 left-4 z-[200] flex w-[90%] max-w-xs flex-col gap-3 sm:max-w-sm"
    : "fixed top-4 right-4 z-[200] flex w-[90%] max-w-xs flex-col gap-3 sm:max-w-sm";

  return (
    <ToastCtx.Provider value={{ pushToast }}>
      {children}

      {/* Toasts portal so it floats above everything */}
      {isClient && createPortal(
        <div className={positionClass} dir={direction}>
          {toasts.map((t) => (
            <div
              key={t.id}
              className={getToastStyles(t.type)}
              style={{ 
                borderLeftWidth: isRTL ? "0" : "4px",
                borderRightWidth: isRTL ? "4px" : "0",
                borderLeftStyle: isRTL ? "none" : "solid",
                borderRightStyle: isRTL ? "solid" : "none"
              }}
            >
              <div className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="shrink-0 mt-0.5">
                  {getToastIcon(t.type)}
                </div>
                
                <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
                  {t.title && (
                    <div className="text-[15px] font-semibold leading-tight mb-1">
                      {t.title}
                    </div>
                  )}
                  {t.desc && (
                    <div className="text-[14px] leading-snug text-opacity-90">
                      {t.desc}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={`shrink-0 text-slate-400 hover:text-slate-600 transition-colors ${isRTL ? "mr-auto" : "ml-auto"}`}
                  onClick={() => dismissToast(t.id)}
                  aria-label={isRTL ? "إغلاق الإشعار" : "Close notification"}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="toast-progress-bar h-1 rounded-full bg-current opacity-30"
                  style={{ 
                    animationDuration: `${t.duration || 4000}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}