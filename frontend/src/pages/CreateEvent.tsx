// Reactのフック、React Routerのコンポーネントをインポート
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// フォーム管理ライブラリReact Hook Formをインポート
import { useForm } from 'react-hook-form';
// Zodと連携させるためのリゾルバーをインポート
import { zodResolver } from '@hookform/resolvers/zod';
// スキーマ定義・バリデーションライブラリZodをインポート
import { z } from 'zod';
// データフェッチライブラリReact Queryのフックをインポート
import { useMutation, useQueryClient } from 'react-query';
// 日付フォーマットライブラリdate-fnsをインポート
import { format } from 'date-fns';
// 認証フック、APIサービス、型定義をインポート
import { useAuth } from '../hooks/useAuth';
import { eventsApi } from '../services/api';
import { EventCreate } from '../types';

// Zodを使用してイベント作成フォームのバリデーションスキーマを定義
const eventSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'), // タイトルは必須
  description: z.string().optional(), // 説明は任意
  event_date: z.string().min(1, '日時を入力してください'), // 日時は必須
}).refine((data) => {
  // 日時が未来であるかをカスタムバリデーション
  const eventDate = new Date(data.event_date);
  const now = new Date();
  return eventDate > now;
}, {
  message: '未来の日時を選択してください',
  path: ['event_date'], // エラーメッセージをevent_dateフィールドに関連付ける
});

// イベント作成ページコンポーネント
const CreateEvent = () => {
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const navigate = useNavigate(); // ページ遷移用のフック
  const queryClient = useQueryClient(); // React Queryのクライアントインスタンス
  const [error, setError] = useState(''); // APIエラーメッセージの状態

  // React Hook Formの初期化
  const {
    register, // 各フォーム要素を登録
    handleSubmit, // フォーム送信時の処理
    formState: { errors }, // バリデーションエラー
    watch, // フォームの値の変更を監視
  } = useForm<EventCreate>({
    resolver: zodResolver(eventSchema), // Zodスキーマをバリデーションリゾルバーとして使用
    defaultValues: {
      title: '',
      description: '',
      event_date: '',
    },
  });

  // React QueryのuseMutationを使用してイベント作成処理を定義
  const createEventMutation = useMutation(eventsApi.createEvent, {
    onSuccess: (data) => {
      // 成功時：イベント一覧のキャッシュを無効化し、最新の状態に更新
      queryClient.invalidateQueries('events');
      // 作成されたイベントの詳細ページに遷移
      navigate(`/events/${data.id}`);
    },
    onError: (err: any) => {
      // 失敗時：エラーメッセージをセット
      setError(err.response?.data?.detail || 'イベントの作成に失敗しました');
    },
  });

  // フォームの送信処理
  const onSubmit = async (data: EventCreate) => {
    setError(''); // エラーメッセージをリセット
    createEventMutation.mutate(data); // イベント作成APIを呼び出し
  };

  const watchedValues = watch(); // フォームの値を監視してプレビューに反映
  const previewDate = watchedValues.event_date ? new Date(watchedValues.event_date) : null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                出欠管理アプリ
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}さん</span>
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900"
              >
                ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">新しいイベントを作成</h1>
            <p className="mt-2 text-gray-600">イベントの詳細を入力して、メンバーに出欠を募ってみましょう。</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* イベント情報入力フォーム */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">イベント情報</h2>
                
                {/* APIエラー表示 */}
                {error && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* イベントタイトル */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      イベントタイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      id="title"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="例: 月例会議"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* 説明 */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      説明
                    </label>
                    <textarea
                      {...register('description')}
                      id="description"
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="イベントの詳細や注意事項など..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* 開催日時 */}
                  <div>
                    <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">
                      開催日時 <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('event_date')}
                      type="datetime-local"
                      id="event_date"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {errors.event_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.event_date.message}</p>
                    )}
                  </div>

                  {/* 送信・キャンセルボタン */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={createEventMutation.isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createEventMutation.isLoading ? '作成中...' : 'イベントを作成'}
                    </button>
                    <Link
                      to="/"
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium text-center"
                    >
                      キャンセル
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* 入力内容のリアルタイムプレビュー */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">プレビュー</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {watchedValues.title || 'イベントタイトル'}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {previewDate ? (
                      <span>{format(previewDate, 'yyyy年MM月dd日 HH:mm')}</span>
                    ) : (
                      <span className="text-gray-400">日時を選択してください</span>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>作成者: {user?.name}</span>
                  </div>

                  {watchedValues.description && (
                    <div className="mt-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {watchedValues.description}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">出欠状況</h4>
                    <div className="text-sm text-gray-500">
                      イベント作成後、メンバーが出欠登録できます。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;