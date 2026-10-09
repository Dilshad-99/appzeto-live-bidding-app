import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = (token) => {
  if (socket) {
    socket.disconnect();
  }

  // Connect to backend URL based on environment or Vite dev server
  const serverUrl =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '') ||
    (window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin);

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server ID:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected from server');
  });

  socket.on('connect_error', (err) => {
    console.log('[Socket Error]', err.message);
  });

  return socket;
};

export const getSocket = () => socket;
