// Reactのコア機能と型をインポート
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// アプリケーション内で使用する型定義をインポート
import { User, LoginRequest, RegisterRequest } from '../types';
// 認証関連のAPIリクエストを行うためのモジュールをインポート
import { authApi } from '../services/api';

// AuthContextの型定義
interface AuthContextType {
  user: User | null; // 現在のユーザー情報、または未ログインの場合はnull
  login: (credentials: LoginRequest) => Promise<void>; // ログイン関数
  register: (userData: RegisterRequest) => Promise<void>; // 新規登録関数
  logout: () => void; // ログアウト関数
  loading: boolean; // 認証状態の読み込み中フラグ
}

// 認証状態を保持するためのReact Contextを作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthContextを簡単に利用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // AuthProviderの外部でuseAuthが呼び出された場合にエラーをスロー
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProviderのpropsの型定義
interface AuthProviderProps {
  children: ReactNode; // 子コンポーネント
}

// アプリケーションに認証機能を提供するコンポーネント
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // ユーザー情報の状態管理
  const [loading, setLoading] = useState(true); // ローディング状態の管理

  // コンポーネントのマウント時に、ローカルストレージのトークンを確認してユーザー情報を取得
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // トークンがあれば、現在のユーザー情報をAPIから取得
      authApi.getCurrentUser()
        .then(setUser) // 成功すればユーザー情報をセット
        .catch(() => {
          // 失敗すれば（トークンが無効など）、トークンを削除
          localStorage.removeItem('access_token');
        })
        .finally(() => setLoading(false)); // いずれの場合もローディングを終了
    } else {
      setLoading(false); // トークンがなければローディングを終了
    }
  }, []);

  // ログイン処理
  const login = async (credentials: LoginRequest) => {
    const tokenData = await authApi.login(credentials);
    localStorage.setItem('access_token', tokenData.access_token); // トークンを保存
    const userData = await authApi.getCurrentUser();
    setUser(userData); // ユーザー情報をセット
  };

  // 新規登録処理
  const register = async (userData: RegisterRequest) => {
    const user = await authApi.register(userData);
    // 登録後、自動的にログイン
    const tokenData = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    localStorage.setItem('access_token', tokenData.access_token);
    setUser(user);
  };

  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('access_token'); // トークンを削除
    setUser(null); // ユーザー情報をクリア
  };

  // Contextに渡す値
  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  // AuthContext.Providerで子コンポーネントをラップし、認証機能を提供
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};