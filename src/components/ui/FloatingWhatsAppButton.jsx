import React from "react";

export default function WhatsAppButton() {
  // config: edit phone, label, message
  const phone = "5X XXX XXXX 966+"; // show human-readable phone
  const waLink = "https://wa.me/9665XXXXXXXXX?text=%D8%A3%D8%A8%D9%8A%20%D8%AD%D8%AC%D8%B2"; // update with real phone & default msg

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed z-50
        bottom-6 left-4 rtl:right-4 rtl:left-auto
        flex items-center gap-2
        text-[11px] leading-tight
        font-medium
        text-slate-700
        bg-white
        border border-slate-200
        shadow-xl shadow-black/10
        rounded-full
        pl-3 pr-2 py-2
        hover:shadow-2xl
        transition
      "
      style={{
        // little soft border highlight for consistency with brand vibe
        boxShadow:
          "0 12px 30px -6px rgba(0,0,0,.4), 0 0 0 3px rgba(227,155,52,.12)",
      }}
    >
      {/* label column */}
      <span className="flex flex-col text-right rtl:text-left">
        <span className="text-[10px] text-slate-800">راسلنا على واتساب</span>
        <span className="text-[9px] text-slate-500">{phone}</span>
      </span>

      {/* green circle */}
      <span
        className="
          flex items-center justify-center
          h-9 w-9
          rounded-full
          bg-[#25D366]
          text-white
          shrink-0
          shadow-md
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.78 11.78 0 0012.04 0C5.42 0 .15 5.27.14 11.88A11.87 11.87 0 001.8 18L0 24l6.3-1.65a11.9 11.9 0 005.73 1.46h.01c6.61 0 11.89-5.27 11.9-11.88a11.8 11.8 0 00-3.42-8.45zM12.04 21.3h-.01a9.93 9.93 0 01-5.07-1.4l-.36-.21-3.74.98 1-3.64-.24-.37a9.9 9.9 0 01-1.55-5.35c0-5.48 4.46-9.93 9.95-9.93a9.9 9.9 0 017.04 2.92 9.8 9.8 0 012.91 7.02c0 5.48-4.46 9.98-9.93 9.98zm5.46-7.44c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.94 1.18-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5a9.03 9.03 0 01-1.67-2.08c-.17-.3 0-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.9-2.19-.24-.58-.48-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.48s1.08 2.88 1.22 3.07c.15.2 2.14 3.27 5.2 4.58.73.32 1.3.51 1.75.65.73.23 1.4.2 1.92.12.58-.09 1.78-.73 2.03-1.44.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35z" />
        </svg>
      </span>
    </a>
  );
}
