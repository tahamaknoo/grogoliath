"use client";
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

// Small "?" button that reveals a popover with longer-form help text.
// The popover is portaled to <body> with a fixed position calculated from the
// icon's bounding rect, so it escapes any modal/dialog overflow clipping.
// Click outside or hit Escape to dismiss.
//
// Props:
//   align: 'left' | 'center' | 'right' — popover anchor relative to the icon.
//          Default 'right'.
export default function HelpIcon({ children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Recompute the popover's screen position whenever it opens / the user
  // scrolls / the window resizes. Using fixed positioning keeps it visible
  // even when the trigger lives inside an overflow:hidden modal.
  const recompute = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320; // matches Tailwind w-80 below
    const gap = 8;
    let left;
    if (align === 'left') {
      left = rect.left;
    } else if (align === 'center') {
      left = rect.left + rect.width / 2 - popoverWidth / 2;
    } else {
      left = rect.right - popoverWidth;
    }
    // Clamp inside the viewport so the popover never spills off-screen.
    const maxLeft = window.innerWidth - popoverWidth - 8;
    left = Math.max(8, Math.min(left, maxLeft));
    setPos({ top: rect.bottom + gap, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    recompute();
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => recompute();
    const onDown = (e) => {
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
      if (triggerRef.current && triggerRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        aria-label="More info"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10.5px] font-bold bg-slate-200 dark:bg-[#333333] text-slate-500 dark:text-[#aaaaaa] hover:bg-slate-300 dark:hover:bg-[#404040] transition-colors align-middle"
      >
        ?
      </button>
      {mounted && open && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 320 }}
          className="z-[9999] p-4 rounded-lg shadow-xl bg-slate-900 dark:bg-[#1f1f1f] border border-slate-700 dark:border-[#404040] text-[13px] text-slate-100 leading-relaxed normal-case font-normal tracking-normal text-left font-sans"
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
