'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import type { VoiceUser, VoiceRoomState, SocketEvents } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  voiceRoomState: VoiceRoomState | null;
  joinVoiceRoom: (roomId: string) => void;
  leaveVoiceRoom: () => void;
  toggleMute: () => void;
  sendVoiceSignal: (signal: any, targetUserId?: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [voiceRoomState, setVoiceRoomState] = useState<VoiceRoomState | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setVoiceRoomState(null);
      }
      return;
    }

    const token = Cookies.get('token');
    if (!token) return;

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    
    const newSocket = io(`${WS_URL}/voice`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to voice server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from voice server');
      setIsConnected(false);
      setVoiceRoomState(null);
    });

    newSocket.on('connected', (data) => {
      console.log('Voice server connection confirmed:', data);
    });

    // Voice room events
    newSocket.on('joined-voice-room', (data) => {
      console.log('Joined voice room:', data);
      setVoiceRoomState({
        roomId: data.roomId,
        users: data.users,
        isConnected: true,
        isMuted: false,
      });
      toast.success('Joined voice room');
    });

    newSocket.on('left-voice-room', (data) => {
      console.log('Left voice room:', data);
      setVoiceRoomState(null);
      toast.success('Left voice room');
    });

    newSocket.on('user-joined-voice', (data) => {
      console.log('User joined voice:', data);
      toast.success(`${data.username} joined the voice room`);
    });

    newSocket.on('user-left-voice', (data) => {
      console.log('User left voice:', data);
      toast(`${data.username} left the voice room`);
    });

    newSocket.on('room-users-updated', (data) => {
      console.log('Room users updated:', data);
      setVoiceRoomState(prev => prev ? {
        ...prev,
        users: data.users,
      } : null);
    });

    newSocket.on('voice-signal', (data) => {
      console.log('Received voice signal from:', data.fromUsername);
      // Handle voice signaling for WebRTC
      // This would be implemented with WebRTC peer connections
    });

    newSocket.on('user-mute-status', (data) => {
      console.log('User mute status:', data);
      toast(`${data.username} ${data.isMuted ? 'muted' : 'unmuted'}`);
    });

    newSocket.on('error', (data) => {
      console.error('Socket error:', data);
      toast.error(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const joinVoiceRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('join-voice-room', { roomId });
    } else {
      toast.error('Not connected to voice server');
    }
  };

  const leaveVoiceRoom = () => {
    if (socket && isConnected && voiceRoomState) {
      socket.emit('leave-voice-room', { roomId: voiceRoomState.roomId });
    }
  };

  const toggleMute = () => {
    if (socket && isConnected && voiceRoomState) {
      const newMutedState = !voiceRoomState.isMuted;
      setVoiceRoomState(prev => prev ? {
        ...prev,
        isMuted: newMutedState,
      } : null);
      
      socket.emit('mute-status', {
        roomId: voiceRoomState.roomId,
        isMuted: newMutedState,
      });
      
      toast.success(newMutedState ? 'Muted' : 'Unmuted');
    }
  };

  const sendVoiceSignal = (signal: any, targetUserId?: string) => {
    if (socket && isConnected && voiceRoomState) {
      socket.emit('voice-signal', {
        roomId: voiceRoomState.roomId,
        signal,
        targetUserId,
      });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    voiceRoomState,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute,
    sendVoiceSignal,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}