import { io } from 'socket.io-client';

// For local development, assume backend is on port 3000
// In production, this should be an env variable
const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const socket = io(URL, {
    autoConnect: false
});
