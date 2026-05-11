'use client';

// Usage:
//   <Loader />        — centered in a full dark screen
//   <Loader inline /> — just the spinner, no wrapper (embed anywhere)
export default function Loader({ inline = false }) {
  const animation = <div className="gg-spinner" />;

  if (inline) return animation;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
      {animation}
    </div>
  );
}
