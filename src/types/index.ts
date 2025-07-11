export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  maxMembers: number;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  memberCount?: number;
  members?: RoomMember[];
}

export interface RoomMember {
  id: string;
  joinedAt: string;
  isActive: boolean;
  user: User;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  password?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}

export interface JoinRoomData {
  roomId: string;
  password?: string;
  inviteCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface VoiceUser {
  id: string;
  username: string;
  email: string;
}

export interface VoiceRoomState {
  roomId: string;
  users: VoiceUser[];
  isConnected: boolean;
  isMuted: boolean;
}

export interface SocketEvents {
  // Client events
  'join-voice-room': (data: { roomId: string }) => void;
  'leave-voice-room': (data: { roomId: string }) => void;
  'voice-signal': (data: { roomId: string; signal: any; targetUserId?: string }) => void;
  'mute-status': (data: { roomId: string; isMuted: boolean }) => void;
  
  // Server events
  connected: (data: { message: string; user: VoiceUser }) => void;
  'joined-voice-room': (data: { roomId: string; users: VoiceUser[] }) => void;
  'left-voice-room': (data: { roomId: string }) => void;
  'user-joined-voice': (data: { userId: string; username: string }) => void;
  'user-left-voice': (data: { userId: string; username: string }) => void;
  'room-users-updated': (data: { roomId: string; users: VoiceUser[] }) => void;
  'voice-signal': (data: { signal: any; fromUserId: string; fromUsername: string }) => void;
  'user-mute-status': (data: { userId: string; username: string; isMuted: boolean }) => void;
  error: (data: { message: string; error?: string }) => void;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}