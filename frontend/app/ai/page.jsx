'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AIPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const next = [...messages, { role: 'user', content: input }];
    setMessages(next);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: next })
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Talk to AI</h1>
        <Link href="/" className="rounded-lg border border-border px-3 py-1 text-sm">Back</Link>
      </div>
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`rounded-xl px-3 py-2 ${msg.role === 'assistant' ? 'bg-surface2' : 'ml-auto max-w-[85%] bg-accent/30'}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-2" placeholder="Ask anything..." />
        <button className="rounded-lg bg-accent px-4 py-2">Send</button>
      </form>
    </div>
  );
}
