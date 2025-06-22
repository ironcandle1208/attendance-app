import axios from 'axios';
import { LoginRequest, RegisterRequest, Token, User, Event, EventCreate, EventWithAttendances, AttendanceCreate, AttendanceWithUser, AttendanceWithEvent } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<Token> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events/');
    return response.data;
  },

  getEvent: async (eventId: string): Promise<EventWithAttendances> => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  createEvent: async (event: EventCreate): Promise<Event> => {
    const response = await api.post('/events/', event);
    return response.data;
  },

  updateEvent: async (eventId: string, event: Partial<EventCreate>): Promise<Event> => {
    const response = await api.put(`/events/${eventId}`, event);
    return response.data;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await api.delete(`/events/${eventId}`);
  },
};

export const attendancesApi = {
  getEventAttendances: async (eventId: string): Promise<AttendanceWithUser[]> => {
    const response = await api.get(`/attendances/events/${eventId}`);
    return response.data;
  },

  getMyAttendances: async (): Promise<AttendanceWithEvent[]> => {
    const response = await api.get('/attendances/my');
    return response.data;
  },

  createAttendance: async (attendance: AttendanceCreate): Promise<AttendanceWithEvent> => {
    const response = await api.post('/attendances/', attendance);
    return response.data;
  },

  updateAttendance: async (attendanceId: string, attendance: Partial<AttendanceCreate>): Promise<AttendanceWithEvent> => {
    const response = await api.put(`/attendances/${attendanceId}`, attendance);
    return response.data;
  },
};

export default api;