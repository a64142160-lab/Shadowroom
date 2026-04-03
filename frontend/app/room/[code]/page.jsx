'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ChatMain from '@/components/ChatMain';
import DMPanel from '@/components/DMPanel';
import RoomClosingOverlay from '@/components/RoomClosingOverlay';
import SettingsPanel from '@/components/SettingsPanel';
import Sidebar from '@/components/Sidebar';
import { getSocket } from '@/lib/socket';

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code || '').toUpperCase();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingMembers, setTypingMembers] = useState([]);
  const [input, setInput] = useState('');
  const [dmTarget, setDmTarget] = useState(null);
  const [dmInput, setDmInput] = useState('');
  const [dmMessages, setDmMessages] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [closing, setClosing] = useState(false);
  const [contextMember, setContextMember] = useState(null);

  const socket = useMemo(() => getSocket(), []);
  const myName = typeof window !== 'undefined' ? localStorage.getItem('shadowroom-name') || 'Anonymous' : 'Anonymous';

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', { code, name: myName });

    socket.on('room-joined', ({ room: serverRoom, messages: existing, myId }) => {
      setRoom({ ...serverRoom, amHost: serverRoom.hostId === myId, myId });
      setMessages(existing || []);
    });

    socket.on('member-joined', ({ name }) => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), type: 'system', text: `${name} joined the room` }]);
    });

    socket.on('member-left', ({ name }) => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), type: 'system', text: `${name} left the room` }]);
    });

    socket.on('room-state', (serverRoom) => {
      setRoom((prev) => ({ ...prev, ...serverRoom, amHost: serverRoom.hostId === prev?.myId }));
    });

    socket.on('new-message', (message) => {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !(m.pending && m.clientId && m.clientId === message.clientId));
        return [...filtered, message];
      });
    });

    socket.on('new-private', (message) => {
      setDmMessages((prev) => [...prev, { ...message, mine: message.senderId === room?.myId }]);
    });

    socket.on('typing', ({ memberId, active }) => {
      setTypingMembers((prev) => active ? [...new Set([...prev, memberId])] : prev.filter((id) => id !== memberId));
    });

    socket.on('member-kicked', () => {
      alert('You were removed from the room');
      router.push('/');
    });

    socket.on('room-closing', () => {
      setClosing(true);
      let c = 3;
      setCountdown(c);
      const i = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(i);
          router.push('/');
        }
      }, 1000);
    });

    return () => {
      socket.emit('leave-room', { code });
      socket.off();
      socket.disconnect();
    };
  }, [code, myName, router, socket, room?.myId]);

  const send = () => {
    if (!input.trim() || !room) return;
    const clientId = crypto.randomUUID();
    const optimistic = {
      id: clientId,
      clientId,
      text: input,
      senderId: room.myId,
      senderName: myName,
      createdAt: Date.now(),
      pending: true
    };
    setMessages((prev) => [...prev, optimistic]);
    socket.emit('send-message', { code, text: input, clientId });
    setInput('');
    socket.emit('typing-stop', { code });
  };

  const sendPrivate = () => {
    if (!dmInput.trim() || !dmTarget) return;
    socket.emit('send-private', { code, targetId: dmTarget.id, text: dmInput });
    setDmMessages((prev) => [...prev, { id: crypto.randomUUID(), text: dmInput, mine: true }]);
    setDmInput('');
  };

  const canSettings = room?.amHost || room?.allowMemberSettings;
  const typingText = typingMembers.length ? `${room?.members?.find((m) => m.id === typingMembers[0])?.name || 'Someone'} is typing` : '';

  const actOnMember = (action, member) => {
    if (!room?.amHost || !member || member.id === room.myId) return;
    if (action === 'host') socket.emit('transfer-host', { code, targetId: member.id });
    if (action === 'kick') socket.emit('kick-member', { code, targetId: member.id });
    if (action === 'restrict') socket.emit('restrict-member', { code, targetId: member.id });
    setContextMember(null);
  };

  const leave = () => {
    if (room?.amHost && (room?.members?.length || 0) > 1) {
      const shouldClose = confirm('You are the host. Transfer host to someone or close the room for everyone. Press OK to close room, Cancel to stay.');
      if (shouldClose) socket.emit('close-room', { code });
      return;
    }
    socket.emit('leave-room', { code });
    router.push('/');
  };

  return (
    <div className="relative flex h-screen w-full flex-col md:flex-row">
      <Sidebar
        room={room}
        myId={room?.myId}
        typingMembers={typingMembers}
        onOpenSettings={() => setSettingsOpen(true)}
        onLeave={leave}
        onCopyInvite={() => navigator.clipboard.writeText(`${window.location.origin}/room/${code}`)}
        onMemberSelect={(member) => setDmTarget(member)}
        onContextAction={(member) => setContextMember(member)}
      />

      <ChatMain
        room={room}
        myId={room?.myId}
        messages={messages}
        input={input}
        setInput={setInput}
        onSend={send}
        onStartTyping={() => socket.emit('typing-start', { code })}
        onStopTyping={() => socket.emit('typing-stop', { code })}
        typingText={typingText}
        onOpenDM={() => room?.members?.[0] && setDmTarget(room.members.find((m) => m.id !== room.myId) || null)}
        onToggleLock={() => canSettings && socket.emit('update-settings', { code, settings: { locked: !room?.locked } })}
        onCloseRoom={() => socket.emit('close-room', { code })}
      />

      <DMPanel
        open={Boolean(dmTarget)}
        target={dmTarget}
        messages={dmMessages}
        input={dmInput}
        setInput={setDmInput}
        onClose={() => setDmTarget(null)}
        onSend={sendPrivate}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={room || {}}
        canEdit={canSettings}
        onUpdate={(settings) => socket.emit('update-settings', { code, settings })}
      />

      {contextMember && room?.amHost && (
        <div className="fixed right-3 top-20 z-50 space-y-1 rounded-lg border border-border bg-surface2 p-2 text-sm">
          <button onClick={() => actOnMember('host', contextMember)} className="block w-full rounded px-3 py-1 text-left hover:bg-white/10">Make Host</button>
          <button onClick={() => actOnMember('restrict', contextMember)} className="block w-full rounded px-3 py-1 text-left hover:bg-white/10">Restrict Messaging</button>
          <button onClick={() => actOnMember('kick', contextMember)} className="block w-full rounded px-3 py-1 text-left text-red hover:bg-red/20">Kick Member</button>
        </div>
      )}

      <RoomClosingOverlay open={closing} countdown={countdown} />
    </div>
  );
}
