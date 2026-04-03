'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DonateModal from '@/components/DonateModal';

export default function LandingPage() {
  const router = useRouter();
  const [joinOpen, setJoinOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const join = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/rooms/${roomCode.toUpperCase()}`);
    if (!res.ok) return setError('Room not found or closed.');
    localStorage.setItem('shadowroom-name', displayName || 'Anonymous');
    router.push(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="absolute h-[450px] w-[450px] rounded-full bg-accent/30 blur-[140px]" />
      <div className="relative z-10 w-full max-w-4xl">
        <h1 className="text-center text-5xl font-bold">ShadowRoom</h1>
        <p className="mb-12 text-center font-mono text-sm text-muted">// talk. vanish. repeat.</p>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['🔐', 'Create Room', '/create'],
            ['🚪', 'Join Room', null],
            ['🤖', 'Talk to AI', '/ai']
          ].map(([icon, title, href]) => (
            <button
              key={title}
              onClick={() => href ? router.push(href) : setJoinOpen(true)}
              className="glass rounded-2xl p-8 text-left transition hover:-translate-y-1"
            >
              <p className="mb-4 text-3xl">{icon}</p>
              <p className="text-xl font-semibold">{title}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => setDonateOpen(true)} className="rounded-full border border-border bg-white/5 px-4 py-2 text-sm text-muted hover:text-text">
            ☕ support the project
          </button>
        </div>
      </div>

      {joinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={join} className="glass w-full max-w-md space-y-3 rounded-2xl p-6">
            <h2 className="text-xl font-semibold">Join Room</h2>
            <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} placeholder="Room Code" className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono" required />
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display Name" className="w-full rounded-lg border border-border bg-surface2 px-3 py-2" required />
            {error && <p className="text-sm text-red">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setJoinOpen(false)} className="rounded-lg px-3 py-2">Cancel</button>
              <button className="rounded-lg bg-accent px-4 py-2">Join →</button>
            </div>
          </form>
        </div>
      )}

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />
    </div>
  );
}
