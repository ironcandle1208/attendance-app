// React Routerのコンポーネントをインポート
import { Routes, Route } from 'react-router-dom'
// 認証状態を管理するカスタムフック（AuthProvider）をインポート
import { AuthProvider } from './hooks/useAuth'
// 各ページのコンポーネントをインポート
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EventDetail from './pages/EventDetail'
import CreateEvent from './pages/CreateEvent'
// 認証が必要なルートを保護するためのコンポーネントをインポート
import ProtectedRoute from './components/ProtectedRoute'

// アプリケーションのメインコンポーネント
function App() {
  return (
    // AuthProviderでアプリケーション全体をラップし、どこからでも認証状態にアクセスできるようにする
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Routesコンポーネントでルーティングを定義 */}
        <Routes>
          {/* /loginパスにLoginコンポーネントを割り当て */}
          <Route path="/login" element={<Login />} />
          {/* /registerパスにRegisterコンポーネントを割り当て */}
          <Route path="/register" element={<Register />} />
          {/* ルートパス（/）には、認証済みの場合のみDashboardコンポーネントを表示 */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* /events/:idパスには、認証済みの場合のみEventDetailコンポーネントを表示 */}
          <Route path="/events/:id" element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          } />
          {/* /create-eventパスには、認証済みの場合のみCreateEventコンポーネントを表示 */}
          <Route path="/create-event" element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App