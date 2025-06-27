// HTTPクライアントライブラリaxiosをインポート
import axios from 'axios';
// アプリケーション内で使用する型定義をインポート
import { LoginRequest, RegisterRequest, Token, User, Event, EventCreate, EventWithAttendances, AttendanceCreate, AttendanceWithUser, AttendanceWithEvent } from '../types';

// APIのベースURLを定義
const API_BASE_URL = 'http://localhost:8000';

// axiosインスタンスを作成し、ベースURLを設定
const api = axios.create({
  baseURL: API_BASE_URL,
});

// リクエストインターセプター：リクエストが送信される前に実行される
api.interceptors.request.use((config) => {
  // ローカルストレージからアクセストークンを取得
  const token = localStorage.getItem('access_token');
  // トークンが存在すれば、AuthorizationヘッダーにBearerトークンを追加
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター：レスポンスがアプリケーションに渡される前に実行される
api.interceptors.response.use(
  (response) => response, // 成功レスポンスはそのまま返す
  (error) => {
    // エラーレスポンスの処理
    // ステータスコードが401（認証エラー）の場合
    if (error.response?.status === 401) {
      // アクセストークンを削除し、ログインページにリダイレクト
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error); // その他のエラーは拒否
  }
);

// 認証関連のAPIサービス
export const authApi = {
  // ログインAPI
  login: async (credentials: LoginRequest): Promise<Token> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // 新規登録API
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // 現在のユーザー情報取得API
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// イベント関連のAPIサービス
export const eventsApi = {
  // イベント一覧取得API
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events/');
    return response.data;
  },

  // 特定のイベント詳細取得API
  getEvent: async (eventId: string): Promise<EventWithAttendances> => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  // イベント作成API
  createEvent: async (event: EventCreate): Promise<Event> => {
    const response = await api.post('/events/', event);
    return response.data;
  },

  // イベント更新API
  updateEvent: async (eventId: string, event: Partial<EventCreate>): Promise<Event> => {
    const response = await api.put(`/events/${eventId}`, event);
    return response.data;
  },

  // イベント削除API
  deleteEvent: async (eventId: string): Promise<void> => {
    await api.delete(`/events/${eventId}`);
  },
};

// 出欠関連のAPIサービス
export const attendancesApi = {
  // 特定のイベントの出欠一覧取得API
  getEventAttendances: async (eventId: string): Promise<AttendanceWithUser[]> => {
    const response = await api.get(`/attendances/events/${eventId}`);
    return response.data;
  },

  // 自分の出欠一覧取得API
  getMyAttendances: async (): Promise<AttendanceWithEvent[]> => {
    const response = await api.get('/attendances/my');
    return response.data;
  },

  // 出欠登録API
  createAttendance: async (attendance: AttendanceCreate): Promise<AttendanceWithEvent> => {
    const response = await api.post('/attendances/', attendance);
    return response.data;
  },

  // 出欠更新API
  updateAttendance: async (attendanceId: string, attendance: Partial<AttendanceCreate>): Promise<AttendanceWithEvent> => {
    const response = await api.put(`/attendances/${attendanceId}`, attendance);
    return response.data;
  },
};

export default api;