// ユーザー情報のインターフェース
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// イベント情報のインターフェース
export interface Event {
  id: string;
  title: string;
  description?: string; // オプション
  event_date: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  creator: User; // イベント作成者のユーザー情報
}

// 出欠情報を含むイベント情報のインターフェース
export interface EventWithAttendances extends Event {
  attendances: AttendanceWithUser[]; // イベントに関連する出欠情報リスト
}

// 出欠情報のインターフェース
export interface Attendance {
  id: string;
  event_id: string;
  user_id: string;
  status: 'attending' | 'not_attending' | 'maybe'; // 出欠ステータス
  comment?: string; // オプション
  created_at: string;
  updated_at: string;
}

// ユーザー情報を含む出欠情報のインターフェース
export interface AttendanceWithUser extends Attendance {
  user: User; // 出欠登録者のユーザー情報
}

// イベント情報を含む出欠情報のインターフェース
export interface AttendanceWithEvent extends Attendance {
  event: Event; // 関連するイベント情報
}

// ログインリクエストのインターフェース
export interface LoginRequest {
  email: string;
  password: string;
}

// 新規登録リクエストのインターフェース
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// トークン情報のインターフェース
export interface Token {
  access_token: string;
  token_type: string;
}

// イベント作成リクエストのインターフェース
export interface EventCreate {
  title: string;
  description?: string;
  event_date: string;
}

// 出欠作成リクエストのインターフェース
export interface AttendanceCreate {
  event_id: string;
  status: 'attending' | 'not_attending' | 'maybe';
  comment?: string;
}