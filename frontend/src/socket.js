import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const socket = io(URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'], // try websocket first, fall back to polling
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
});

// Debug logging in development
if (import.meta.env.DEV) {
    socket.on('connect', () => console.log('[socket] connected:', socket.id, '→', URL));
    socket.on('disconnect', (reason) => console.log('[socket] disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[socket] connect error:', err.message));
}
