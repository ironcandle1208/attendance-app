// Reactのフック、React Routerのコンポーネントをインポート
import { useState } from 'react'; // 未使用だが、一般的なフックとしてインポートされている可能性
import { Link } from 'react-router-dom';
// データフェッチライブラリReact Queryのフックをインポート
import { useQuery } from 'react-query';
// 日付フォーマットライブラリdate-fnsをインポート
import { format } from 'date-fns';
// 認証フック、APIサービス、型定義をインポート
import { useAuth } from '../hooks/useAuth';
import { eventsApi } from '../services/api';
import { Event } from '../types';

// ダッシュボードページコンポーネント
const Dashboard = () => {
  // 認証情報（ユーザー情報とログアウト関数）を取得
  const { user, logout } = useAuth();
  // React QueryのuseQueryを使用してイベント一覧データをフェッチ
  // 'events'はクエリキー、eventsApi.getEventsはデータを取得する関数
  const { data: events, isLoading, error } = useQuery('events', eventsApi.getEvents);

  // データ読み込み中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // エラー発生時の表示
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">イベントの読み込みに失敗しました</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">出欠管理アプリ</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">こんにちは、{user?.name}さん</span>
              <button
                onClick={logout} // ログアウトボタン
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">イベント一覧</h2>
            <Link
              to="/create-event" // イベント作成ページへのリンク
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              新しいイベントを作成
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {/* イベントが存在する場合 */}
            {events && events.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {events.map((event: Event) => (
                  <li key={event.id}>
                    <Link
                      to={`/events/${event.id}`} // イベント詳細ページへのリンク
                      className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(event.event_date), 'yyyy/MM/dd HH:mm')}
                          </p>
                          {event.description && (
                            <p className="text-sm text-gray-700 mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-sm text-gray-500">
                            作成者: {event.creator.name}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              // イベントが存在しない場合
              <div className="text-center py-12">
                <p className="text-gray-500">イベントがありません</p>
                <Link
                  to="/create-event"
                  className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  最初のイベントを作成
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;