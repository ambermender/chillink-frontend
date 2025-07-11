import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import type {
  User,
  Room,
  AuthResponse,
  CreateRoomData,
  JoinRoomData,
  LoginData,
  RegisterData,
  ApiError,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status !== 422) {
      // Don't show toast for validation errors (422)
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },
};

// Rooms API
export const roomsApi = {
  getRooms: async (): Promise<Room[]> => {
    const response = await api.get<Room[]>('/rooms');
    return response.data;
  },

  getRoom: async (id: string): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  getRoomByInviteCode: async (inviteCode: string): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/invite/${inviteCode}`);
    return response.data;
  },

  createRoom: async (data: CreateRoomData): Promise<Room> => {
    const response = await api.post<Room>('/rooms', data);
    return response.data;
  },

  joinRoom: async (data: JoinRoomData): Promise<Room> => {
    const response = await api.post<Room>('/rooms/join', data);
    return response.data;
  },

  leaveRoom: async (roomId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/rooms/${roomId}/leave`);
    return response.data;
  },

  deleteRoom: async (roomId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/rooms/${roomId}`);
    return response.data;
  },
};

// Health API
export const healthApi = {
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;