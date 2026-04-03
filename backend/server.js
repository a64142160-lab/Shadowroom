const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] }
});

const rooms = new Map();
const socketToRoom = new Map();
const roomMessages = new Map();

const genCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const chunk = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${chunk()}-${chunk()}`;
};

const serializeRoom = (room) => ({
  code: room.code,
  name: room.name,
  hostId: room.hostId,
  members: Array.from(room.members.values()),
  locked: room.locked,
  onlyHostCanMessage: room.onlyHostCanMessage,
  allowMemberSettings: room.allowMemberSettings,
  createdAt: room.createdAt
});

app.get('/health', (_, res) => res.json({ ok: true }));

app.post('/rooms', (req, res) => {
  const roomName = (req.body.roomName || 'Shadow Room').trim();
  let code = genCode();
  while (rooms.has(code)) code = genCode();

  rooms.set(code, {
    code,
    name: roomName,
    hostId: null,
    members: new Map(),
    locked: false,
    onlyHostCanMessage: false,
    allowMemberSettings: false,
    createdAt: Date.now()
  });

  roomMessages.set(code, [{ id: `sys-${Date.now()}`, type: 'system', text: 'Room created', createdAt: Date.now() }]);
  return res.status(201).json({ code, name: roomName });
});

app.get('/rooms/:code', (req, res) => {
  const room = rooms.get((req.params.code || '').toUpperCase());
  if (!room || room.locked) return res.status(404).json({ error: 'Room unavailable' });
  return res.json({ code: room.code, name: room.name });
});

const closeRoom = (code, reason = 'closed') => {
  io.to(code).emit('room-closing', { reason });
  setTimeout(() => {
    rooms.delete(code);
    roomMessages.delete(code);
  }, 3000);
};

io.on('connection', (socket) => {
  socket.on('join-room', ({ code, name }) => {
    const room = rooms.get((code || '').toUpperCase());
    if (!room || room.locked) {
      socket.emit('member-kicked');
      return;
    }

    const member = { id: socket.id, name: (name || 'Anonymous').slice(0, 24), restricted: false };
    if (!room.hostId) room.hostId = socket.id;
    room.members.set(socket.id, member);
    socket.join(room.code);
    socketToRoom.set(socket.id, room.code);

    socket.emit('room-joined', { room: serializeRoom(room), messages: roomMessages.get(room.code) || [], myId: socket.id });
    socket.to(room.code).emit('member-joined', { id: socket.id, name: member.name });
    io.to(room.code).emit('room-state', serializeRoom(room));
  });

  socket.on('send-message', ({ code, text, clientId }) => {
    const room = rooms.get(code);
    const member = room?.members.get(socket.id);
    if (!room || !member || member.restricted) return;
    if (room.onlyHostCanMessage && socket.id !== room.hostId) return;

    const message = {
      id: crypto.randomUUID(),
      clientId,
      text: String(text).slice(0, 1000),
      senderId: socket.id,
      senderName: member.name,
      createdAt: Date.now()
    };

    roomMessages.set(code, [...(roomMessages.get(code) || []), message].slice(-500));
    io.to(code).emit('new-message', message);
  });

  socket.on('send-private', ({ code, targetId, text }) => {
    const room = rooms.get(code);
    const sender = room?.members.get(socket.id);
    if (!room || !sender || !room.members.has(targetId)) return;

    const message = {
      id: crypto.randomUUID(),
      text: String(text).slice(0, 1000),
      senderId: socket.id,
      senderName: sender.name,
      targetId,
      private: true,
      createdAt: Date.now()
    };

    socket.to(targetId).emit('new-private', message);
    socket.emit('new-private', message);
  });

  socket.on('typing-start', ({ code }) => socket.to(code).emit('typing', { memberId: socket.id, active: true }));
  socket.on('typing-stop', ({ code }) => socket.to(code).emit('typing', { memberId: socket.id, active: false }));

  socket.on('kick-member', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || socket.id !== room.hostId) return;
    io.to(targetId).emit('member-kicked');
    io.sockets.sockets.get(targetId)?.leave(code);
    room.members.delete(targetId);
    io.to(code).emit('room-state', serializeRoom(room));
  });

  socket.on('transfer-host', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || socket.id !== room.hostId || !room.members.has(targetId)) return;
    room.hostId = targetId;
    io.to(code).emit('host-changed', { hostId: targetId });
    io.to(code).emit('room-state', serializeRoom(room));
  });

  socket.on('restrict-member', ({ code, targetId }) => {
    const room = rooms.get(code);
    const target = room?.members.get(targetId);
    if (!room || socket.id !== room.hostId || !target) return;
    target.restricted = !target.restricted;
    io.to(code).emit('member-restricted', { targetId, restricted: target.restricted });
    io.to(code).emit('room-state', serializeRoom(room));
  });

  socket.on('update-settings', ({ code, settings }) => {
    const room = rooms.get(code);
    if (!room) return;

    const canEdit = socket.id === room.hostId || room.allowMemberSettings;
    if (!canEdit) return;

    room.locked = settings.locked ?? room.locked;
    room.onlyHostCanMessage = settings.onlyHostCanMessage ?? room.onlyHostCanMessage;
    room.allowMemberSettings = settings.allowMemberSettings ?? room.allowMemberSettings;

    io.to(code).emit('settings-updated', {
      locked: room.locked,
      onlyHostCanMessage: room.onlyHostCanMessage,
      allowMemberSettings: room.allowMemberSettings
    });
    io.to(code).emit('room-state', serializeRoom(room));
  });

  socket.on('leave-room', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;

    const leaver = room.members.get(socket.id);
    room.members.delete(socket.id);
    socket.leave(code);

    if (leaver) socket.to(code).emit('member-left', { id: socket.id, name: leaver.name });

    if (room.members.size === 0) {
      closeRoom(code, 'empty');
      return;
    }

    if (socket.id === room.hostId) {
      room.hostId = room.members.keys().next().value;
      io.to(code).emit('host-changed', { hostId: room.hostId });
    }

    io.to(code).emit('room-state', serializeRoom(room));
  });

  socket.on('close-room', ({ code }) => {
    const room = rooms.get(code);
    if (!room || socket.id !== room.hostId) return;
    closeRoom(code, 'host_closed');
  });

  socket.on('disconnect', () => {
    const code = socketToRoom.get(socket.id);
    if (!code) return;
    socketToRoom.delete(socket.id);

    const room = rooms.get(code);
    if (!room) return;

    const leaver = room.members.get(socket.id);
    room.members.delete(socket.id);
    if (leaver) socket.to(code).emit('member-left', { id: socket.id, name: leaver.name });

    if (room.members.size === 0) {
      closeRoom(code, 'empty');
      return;
    }

    if (socket.id === room.hostId) {
      room.hostId = room.members.keys().next().value;
      io.to(code).emit('host-changed', { hostId: room.hostId });
    }

    io.to(code).emit('room-state', serializeRoom(room));
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`ShadowRoom backend running on ${port}`);
});
