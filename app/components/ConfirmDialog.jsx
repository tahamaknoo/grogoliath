"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ConfirmContext = createContext(null);

/**
 * App-wide promise-based confirm dialog.
 *
 *   const confirm = useConfirm();
 *   const ok = await confirm({
 *     title: 'Delete this kit?',
 *     message: '"Acme" and all its data will be permanently removed.',
 *     confirmLabel: 'Delete kit',
 *     cancelLabel: 'Cancel',
 *     variant: 'danger',         // 'default' | 'danger'
 *   });
 *   if (!ok) return;
 *
 * Esc closes (cancel), Enter triggers the confirm action.
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // null | { ...opts, resolve }
  const [closing, setClosing] = useState(false);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setClosing(false);
      setState({
        title: opts?.title || "Are you sure?",
        message: opts?.message || "",
        confirmLabel: opts?.confirmLabel || "Confirm",
        cancelLabel: opts?.cancelLabel || "Cancel",
        variant: opts?.variant || "default",
        resolve,
      });
    });
  }, []);

  const close = (value) => {
    if (!state) return;
    state.resolve(value);
    setClosing(true);
    setTimeout(() => {
      setState(null);
      setClosing(false);
    }, 120);
  };

  // Keyboard: Esc cancels, Enter confirms.
  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        close(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center p-6 transition-opacity duration-150 ${closing ? "opacity-0" : "opacity-100"}`}
          onClick={() => close(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

          {/* Dialog card */}
          <div
            className={`relative bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-[0_30px_80px_rgba(0,0,0,0.4)] max-w-md w-full p-6 transition-transform duration-200 ${closing ? "scale-95" : "scale-100 animate-scale-in"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              {state.variant === "danger" ? (
                <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-[#075056]/10 dark:bg-[#5eead4]/10 text-[#075056] dark:text-[#5eead4] flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <h3
                  id="confirm-title"
                  className="text-lg font-black text-[#262626] dark:text-white tracking-tight mb-1.5"
                >
                  {state.title}
                </h3>
                {state.message && (
                  <p className="text-sm text-[#555555] dark:text-[#bbbbbb] leading-relaxed whitespace-pre-line">
                    {state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => close(false)}
                className="px-5 py-2.5 text-[#555555] dark:text-[#bbbbbb] hover:text-[#262626] dark:hover:text-white text-sm font-semibold rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#262626] transition-all"
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => close(true)}
                autoFocus
                className={`flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all ${
                  state.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30"
                    : "bg-[#075056] hover:bg-[#064548] hover:shadow-lg hover:shadow-[#075056]/30"
                }`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    // Graceful degradation: if no provider, fall back to native confirm.
    // Means the app still works even if a component is rendered outside the tree.
    return async ({ title, message }) => {
      if (typeof window === "undefined") return false;
      const text = [title, message].filter(Boolean).join("\n\n");
      return window.confirm(text);
    };
  }
  return ctx;
}
