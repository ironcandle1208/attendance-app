// ReactとReactDOMライブラリをインポート
import React from 'react'
import ReactDOM from 'react-dom/client'
// React Routerをインポートし、クライアントサイドのルーティングを可能にする
import { BrowserRouter } from 'react-router-dom'
// React Queryをインポートし、サーバーの状態管理（データフェッチ、キャッシュなど）を容易にする
import { QueryClient, QueryClientProvider } from 'react-query'
// メインのAppコンポーネントをインポート
import App from './App.tsx'
// グローバルなスタイルシートをインポート
import './index.css'

// React Queryのクライアントインスタンスを作成
// このクライアントは、クエリのキャッシュと設定を管理する
const queryClient = new QueryClient()

// ReactアプリケーションをDOMにレンダリング
// 'root'というIDを持つDOM要素を取得し、そこにアプリケーションを描画する
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictModeは、アプリケーション内の潜在的な問題を検知するための開発者向けツール
  <React.StrictMode>
    {/* QueryClientProviderは、アプリケーション全体でReact Queryの機能を提供 */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouterは、HTML5のHistory APIを使用してUIとURLを同期させる */}
      <BrowserRouter>
        {/* Appコンポーネントがアプリケーションのエントリーポイント */}
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)