'use client';

import { Copy, DoorOpen, Lock, Settings } from 'lucide-react';

const avatarColors = ['bg-violet-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500'];

export default function Sidebar({
  room,
  myId,
  typingMembers,
  onOpenSettings,
  onLeave,
  onCopyInvite,
  onMemberSelect,
  onContextAction
}) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-surface/80 md:w-[240px]">
      <div className="border-b border-border p-4">
        <p className="mb-2 flex items-center gap-2 text-lg font-semibold"><Lock size={16} />{room?.name}</p>
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface2 px-2 py-1 font-mono text-xs">
          <span>{room?.code}</span>
          <button onClick={onCopyInvite} className="rounded p-1 hover:bg-white/10"><Copy size={13} /></button>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {(room?.members || []).map((member, idx) => {
          const initials = member.name.slice(0, 2).toUpperCase();
          const isTyping = typingMembers.includes(member.id);
          return (
            <button
              key={member.id}
              onClick={() => onMemberSelect(member)}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextAction(member);
              }}
              className="animate-slideUpFade flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-white/5"
            >
              <div className={`grid h-8 w-8 place-items-center rounded-full text-xs text-white ${avatarColors[idx % avatarColors.length]}`}>{initials}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{member.name} {room.hostId === member.id && <span className="ml-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] text-accent">HOST</span>}</p>
                <p className="text-xs text-muted">{isTyping ? 'typing...' : 'online'}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-green" />
            </button>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-border p-3 text-sm">
        <button onClick={onOpenSettings} className="flex w-full items-center gap-2 rounded-lg bg-white/5 px-3 py-2 hover:bg-white/10"><Settings size={16} />Room Settings</button>
        <button onClick={onCopyInvite} className="flex w-full items-center gap-2 rounded-lg bg-white/5 px-3 py-2 hover:bg-white/10"><Copy size={16} />Copy Invite</button>
        <button onClick={onLeave} className="flex w-full items-center gap-2 rounded-lg bg-red/20 px-3 py-2 text-red hover:bg-red/30"><DoorOpen size={16} />Leave Room</button>
      </div>
    </aside>
  );
}
