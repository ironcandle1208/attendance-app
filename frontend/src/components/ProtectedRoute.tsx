// React RouterのNavigateコンポーネントをインポート（リダイレクト用）
import { Navigate } from 'react-router-dom';
// 認証状態を取得するためのカスタムフックをインポート
import { useAuth } from '../hooks/useAuth';
// Reactの型をインポート
import { ReactNode } from 'react';

// ProtectedRouteコンポーネントのpropsの型定義
interface ProtectedRouteProps {
  children: ReactNode; // 子コンポーネントを受け取る
}

// 認証が必要なルートを保護するコンポーネント
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // useAuthフックからユーザー情報とローディング状態を取得
  const { user, loading } = useAuth();

  // 認証状態の確認中はローディングスピナーを表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ユーザーが認証されていない（ログインしていない）場合、ログインページにリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ユーザーが認証されている場合、子コンポーネントをレンダリング
  return <>{children}</>;
};

export default ProtectedRoute;