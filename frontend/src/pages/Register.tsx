// Reactのフック、React Routerのコンポーネントをインポート
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
// フォーム管理ライブラリReact Hook Formをインポート
import { useForm } from 'react-hook-form';
// Zodと連携させるためのリゾルバーをインポート
import { zodResolver } from '@hookform/resolvers/zod';
// スキーマ定義・バリデーションライブラリZodをインポート
import { z } from 'zod';
// 認証フックと型定義をインポート
import { useAuth } from '../hooks/useAuth';
import { RegisterRequest } from '../types';

// Zodを使用して新規登録フォームのバリデーションスキーマを定義
const registerSchema = z.object({
  name: z.string().min(1, '名前を入力してください'), // 名前は必須
  email: z.string().email('有効なメールアドレスを入力してください'), // メールアドレス形式のバリデーション
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'), // パスワードの最小文字数バリデーション
});

// 新規登録ページコンポーネント
const Register = () => {
  const { user, register: registerUser } = useAuth(); // 認証情報（ユーザー情報と新規登録関数）を取得
  const [error, setError] = useState(''); // エラーメッセージの状態
  const [loading, setLoading] = useState(false); // ローディング状態

  // React Hook Formの初期化
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema), // Zodスキーマをバリデーションリゾルバーとして使用
  });

  // 既にログインしている場合はダッシュボードにリダイレクト
  if (user) {
    return <Navigate to="/" replace />;
  }

  // フォームの送信処理
  const onSubmit = async (data: RegisterRequest) => {
    try {
      setLoading(true); // ローディング開始
      setError(''); // エラーメッセージをクリア
      await registerUser(data); // 新規登録処理を実行
    } catch (err: any) {
      // 登録失敗時：エラーメッセージをセット
      setError(err.response?.data?.detail || 'アカウント作成に失敗しました');
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウント作成
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* エラーメッセージ表示 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            {/* 名前入力欄 */}
            <div>
              <input
                {...register('name')}
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="名前"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            {/* メールアドレス入力欄 */}
            <div>
              <input
                {...register('email')}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            {/* パスワード入力欄 */}
            <div>
              <input
                {...register('password')}
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            {/* アカウント作成ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '作成中...' : 'アカウント作成'}
            </button>
          </div>

          {/* ログインページへのリンク */}
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;