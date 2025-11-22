// src/components/ui/Modal.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, title, children, footer }) {
  const [mounted, setMounted] = useState(false);

  // handle Escape key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  // we only portal after we're sure `document` exists (avoids SSR warnings)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open) return null;
  if (!mounted) return null;

  return createPortal(
    (
      <div className="fixed inset-0 z-[90]">
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={onClose}
        />

        {/* dialog */}
        <div className="absolute inset-0 grid place-items-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* header */}
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>
            </div>

            {/* body */}
            <div className="px-5 py-4 text-sm text-slate-700">
              {children}
            </div>

            {/* footer */}
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              {footer}
            </div>
          </div>
        </div>
      </div>
    ),
    document.body
  );
}
