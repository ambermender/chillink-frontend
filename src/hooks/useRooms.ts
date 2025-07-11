import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { roomsApi } from '@/lib/api';
import type { Room, CreateRoomData, JoinRoomData } from '@/types';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getRooms();
      setRooms(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch rooms';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (data: CreateRoomData): Promise<Room | null> => {
    try {
      const newRoom = await roomsApi.createRoom(data);
      setRooms(prev => [newRoom, ...prev]);
      toast.success('Room created successfully!');
      return newRoom;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create room';
      toast.error(message);
      return null;
    }
  };

  const joinRoom = async (data: JoinRoomData): Promise<Room | null> => {
    try {
      const room = await roomsApi.joinRoom(data);
      // Update rooms list if the room is not already in it
      setRooms(prev => {
        const exists = prev.find(r => r.id === room.id);
        if (exists) {
          return prev.map(r => r.id === room.id ? room : r);
        }
        return [room, ...prev];
      });
      toast.success('Joined room successfully!');
      return room;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to join room';
      toast.error(message);
      return null;
    }
  };

  const leaveRoom = async (roomId: string): Promise<boolean> => {
    try {
      await roomsApi.leaveRoom(roomId);
      setRooms(prev => prev.filter(room => room.id !== roomId));
      toast.success('Left room successfully');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to leave room';
      toast.error(message);
      return false;
    }
  };

  const deleteRoom = async (roomId: string): Promise<boolean> => {
    try {
      await roomsApi.deleteRoom(roomId);
      setRooms(prev => prev.filter(room => room.id !== roomId));
      toast.success('Room deleted successfully');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete room';
      toast.error(message);
      return false;
    }
  };

  const refreshRooms = () => {
    fetchRooms();
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    refreshRooms,
  };
}

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getRoom(roomId);
      setRoom(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch room';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshRoom = () => {
    fetchRoom();
  };

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  return {
    room,
    loading,
    error,
    refreshRoom,
  };
}

export function useRoomByInviteCode(inviteCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomByInviteCode = async () => {
    if (!inviteCode) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getRoomByInviteCode(inviteCode);
      setRoom(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Room not found';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomByInviteCode();
  }, [inviteCode]);

  return {
    room,
    loading,
    error,
  };
}