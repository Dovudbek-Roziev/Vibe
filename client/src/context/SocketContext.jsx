import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);