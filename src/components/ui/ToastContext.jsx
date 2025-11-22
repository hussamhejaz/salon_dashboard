// src/components/ui/ToastContext.js
import { createContext } from "react";

// We expose this so both the provider and the hook can share it.
export const ToastCtx = createContext(null);