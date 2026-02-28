import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const socket = io(URL, {
    autoConnect: false,
    transports: ['polling', 'websocket'], // polling first — more reliable on Railway/Vercel
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 20000,
});

// Debug logging in development
if (import.meta.env.DEV) {
    socket.on('connect', () => console.log('[socket] connected:', socket.id, '→', URL));
    socket.on('disconnect', (reason) => console.log('[socket] disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[socket] connect error:', err.message));
}
