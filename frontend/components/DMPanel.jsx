'use client';

import { Send, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function DMPanel({ open, target, messages, input, setInput, onClose, onSend }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  if (!open || !target) return null;

  return (
    <section className="flex h-full w-full flex-col border-l border-border bg-surface/90 md:w-[280px]">
      <header className="border-b border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">🔐 {target.name}</p>
            <p className="text-xs text-muted">private — only you two see this</p>
          </div>
          <button onClick={onClose}><X size={16} /></button>
        </div>
      </header>
      <div ref={ref} className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`rounded-xl px-3 py-2 text-sm ${msg.mine ? 'ml-auto max-w-[85%] bg-accent/30' : 'max-w-[85%] bg-surface2'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="flex gap-2 border-t border-border p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-2" placeholder="Private message" />
        <button className="rounded-lg bg-accent px-3"><Send size={14} /></button>
      </form>
    </section>
  );
}
