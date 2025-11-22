// src/components/ui/useToast.js
import { useContext } from "react";
import { ToastCtx } from "./ToastContext";

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx; // { pushToast }
}