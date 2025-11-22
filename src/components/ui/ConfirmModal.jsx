// src/components/ui/ConfirmModal.jsx
import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title,
  desc,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
  icon,
  showCloseButton = true,
  size = "md", // sm, md, lg
  confirmVariant = "primary",
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.keyCode === 27 && !loading) {
        onCancel?.();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg"
  };

  const getVariantClasses = () => {
    if (danger) {
      return {
        button: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
        icon: "bg-red-100 text-red-600"
      };
    }
    
    const variants = {
      primary: {
        button: "bg-[#E39B34] hover:bg-[#d18c2b] focus:ring-[#E39B34] text-white",
        icon: "bg-[#FEF6E8] text-[#E39B34]"
      },
      success: {
        button: "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white",
        icon: "bg-green-100 text-green-600"
      },
      danger: {
        button: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
        icon: "bg-red-100 text-red-600"
      }
    };
    
    return variants[confirmVariant] || variants.primary;
  };

  const variantClasses = getVariantClasses();

  const getDefaultIcon = () => {
    if (icon) return icon;
    if (danger || confirmVariant === 'danger') {
      return (
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${variantClasses.icon} mb-4`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      );
    }
    return (
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${variantClasses.icon} mb-4`}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => {
          if (!loading) onCancel?.();
        }}
      />
      
      {/* Modal Card */}
      <div 
        className={`relative w-full ${sizeClasses[size]} transform transition-all`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4">
            {showCloseButton && (
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Icon */}
            {getDefaultIcon()}
            
            {/* Title & Description */}
            <div className="text-center">
              <h3 
                id="modal-title"
                className="text-lg font-semibold text-gray-900 mb-3"
              >
                {title}
              </h3>
              
              {desc && (
                <p 
                  id="modal-description"
                  className="text-gray-600 leading-relaxed"
                >
                  {desc}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              {cancelLabel && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={onCancel}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex-1"
                >
                  {cancelLabel}
                </button>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors flex-1 ${variantClasses.button}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Usage examples:
/*
// Basic confirmation
<ConfirmModal
  open={deleteModalOpen}
  title="Delete Booking"
  desc="Are you sure you want to delete this booking? This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={handleDelete}
  onCancel={handleCancel}
  danger={true}
/>

// Success confirmation
<ConfirmModal
  open={successModalOpen}
  title="Success!"
  desc="The booking has been created successfully."
  confirmLabel="OK"
  cancelLabel={null}
  onConfirm={handleClose}
  confirmVariant="success"
  showCloseButton={false}
/>

// Custom icon
<ConfirmModal
  open={customModalOpen}
  title="Special Offer"
  desc="This offer is available for a limited time only."
  icon={
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    </div>
  }
  confirmLabel="Confirm"
  onConfirm={handleConfirm}
  size="md"
/>
*/