"use client";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
