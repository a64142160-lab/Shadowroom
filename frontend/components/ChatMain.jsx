'use client';

import { Lock, Send, ShieldClose, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ChatMain({
  room,
  myId,
  messages,
  input,
  setInput,
  onSend,
  onStartTyping,
  onStopTyping,
  typingText,
  onOpenDM,
  onToggleLock,
  onCloseRoom
}) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, typingText]);

  return (
    <main className="flex h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface/60 p-4">
        <div>
          <h1 className="text-lg font-semibold">{room?.name}</h1>
          <p className="text-xs text-muted">{room?.members?.length || 0} members • messages vanish on exit</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleLock} className="rounded-lg border border-border p-2 hover:bg-white/5"><Lock size={16} /></button>
          {room?.amHost && <button onClick={onCloseRoom} className="rounded-lg border border-red/30 bg-red/10 p-2 text-red hover:bg-red/20"><ShieldClose size={16} /></button>}
        </div>
      </header>

      <div ref={listRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          if (msg.type === 'system') {
            return <p key={msg.id} className="animate-slideUpFade text-center text-xs text-muted">{msg.text}</p>;
          }

          const mine = msg.senderId === myId;
          return (
            <div key={msg.id} className={`animate-slideUpFade ${mine ? 'ml-auto max-w-[80%] text-right' : 'max-w-[80%]'}`}>
              {msg.private && <p className="mb-1 text-xs text-yellow">🔐 private msg from {msg.senderName}</p>}
              <p className="mb-1 font-mono text-[11px] text-muted">{msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}</p>
              <div className={`rounded-2xl px-4 py-2 ${mine ? 'bg-accent/30' : 'bg-surface2'} ${msg.pending ? 'opacity-60' : ''}`}>{msg.text}</div>
            </div>
          );
        })}
        {typingText && <p className="text-sm text-muted">{typingText} <span className="inline-flex gap-1">●●●</span></p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex gap-2 border-t border-border bg-surface/80 p-3"
      >
        <button type="button" className="rounded-lg bg-white/5 px-3">🙂</button>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onStartTyping();
          }}
          onBlur={onStopTyping}
          placeholder="Speak into the shadows..."
          className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-2 outline-none focus:border-accent"
        />
        <button type="button" onClick={onOpenDM} className="rounded-lg bg-yellow/10 px-3 text-yellow">🔐</button>
        <button type="submit" className="rounded-lg bg-accent px-4 text-white"><Send size={16} /></button>
      </form>
    </main>
  );
}
