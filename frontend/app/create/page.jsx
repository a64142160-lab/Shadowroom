'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateRoomPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [created, setCreated] = useState(null);

  const create = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName })
    });
    const data = await res.json();
    localStorage.setItem('shadowroom-name', displayName || 'Anonymous');
    setCreated(data);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center p-6">
      <div className="glass w-full rounded-2xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Create Room</h1>
        {!created ? (
          <form onSubmit={create} className="space-y-3">
            <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room Name" required className="w-full rounded-lg border border-border bg-surface2 px-3 py-2" />
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="anything — stay anonymous" required className="w-full rounded-lg border border-border bg-surface2 px-3 py-2" />
            <button className="w-full rounded-lg bg-accent px-4 py-3">Generate Room →</button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="font-mono text-4xl font-bold tracking-wider">{created.code}</p>
            <div className="rounded-lg border border-border bg-surface2 p-3">
              <p className="font-mono text-xs text-muted">Invite link</p>
              <p className="font-mono text-sm">shadowroom.vercel.app/join/{created.code}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(`shadowroom.vercel.app/join/${created.code}`)} className="rounded-lg border border-border px-4 py-2">Copy Invite</button>
            <button onClick={() => router.push(`/room/${created.code}`)} className="block w-full rounded-lg bg-accent px-4 py-3 text-center">Enter Room →</button>
          </div>
        )}
      </div>
    </div>
  );
}
