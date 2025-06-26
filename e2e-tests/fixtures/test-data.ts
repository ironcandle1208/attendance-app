export const testUsers = {
  user1: {
    name: 'テストユーザー1',
    email: 'test1@example.com',
    password: 'password123',
  },
  user2: {
    name: 'テストユーザー2',
    email: 'test2@example.com',
    password: 'password123',
  },
  admin: {
    name: '管理者',
    email: 'admin@example.com',
    password: 'admin123',
  },
};

export const testEvents = {
  event1: {
    title: 'テストイベント1',
    description: 'これはテスト用のイベントです',
    event_date: '2025-12-31T18:00',
  },
  event2: {
    title: '月例会議',
    description: '定期的な月例会議です',
    event_date: '2025-12-25T10:00',
  },
  pastEvent: {
    title: '過去のイベント',
    description: '過去の日時のイベント（バリデーションテスト用）',
    event_date: '2020-01-01T10:00',
  },
};

export const attendanceStatuses = {
  attending: 'attending',
  notAttending: 'not_attending',
  maybe: 'maybe',
} as const;