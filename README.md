# ShadowRoom

Anonymous ephemeral real-time chat app.

## Structure

- `frontend/` Next.js 14 app for Vercel.
- `backend/` Express + Socket.io server for Railway.

## Environment Variables

### Frontend

- `NEXT_PUBLIC_SOCKET_URL=https://your-railway-backend.railway.app`
- `GROQ_API_KEY=your_groq_key`

### Backend

- `PORT=3001`
- `FRONTEND_URL=https://your-app.vercel.app`

## Run locally

```bash
cd backend && npm i && npm run dev
cd frontend && npm i && npm run dev
```
