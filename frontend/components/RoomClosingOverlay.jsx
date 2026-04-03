'use client';

import { useMemo } from 'react';

export default function RoomClosingOverlay({ open, countdown }) {
  const dots = useMemo(() => ['.', '.', '.'], []);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 text-center">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-red">ephemeral purge protocol</p>
      <h2 className="mb-4 text-3xl font-semibold md:text-5xl">This room is being destroyed</h2>
      <p className="mb-8 font-mono text-4xl text-accent md:text-6xl">{countdown}</p>
      <div className="flex gap-1">
        {dots.map((d, i) => (
          <span key={i} className="h-2 w-2 animate-pulseDot rounded-full bg-accent" style={{ animationDelay: `${i * 0.2}s` }}>
            {d === '_' ? '_' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
