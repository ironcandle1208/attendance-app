export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  creator: User;
}

export interface EventWithAttendances extends Event {
  attendances: AttendanceWithUser[];
}

export interface Attendance {
  id: string;
  event_id: string;
  user_id: string;
  status: 'attending' | 'not_attending' | 'maybe';
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceWithUser extends Attendance {
  user: User;
}

export interface AttendanceWithEvent extends Attendance {
  event: Event;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  event_date: string;
}

export interface AttendanceCreate {
  event_id: string;
  status: 'attending' | 'not_attending' | 'maybe';
  comment?: string;
}