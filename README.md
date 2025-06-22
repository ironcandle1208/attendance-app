# 出欠確認Webアプリケーション

React + FastAPI + PostgreSQLで構築された出欠管理システムです。

## 機能

- ユーザー認証（ログイン・登録）
- イベント作成・管理
- 出欠登録・確認
- 出欠者一覧表示

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Hook Form

### バックエンド
- Python 3.11
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT認証

### 開発環境
- Docker & Docker Compose

## セットアップ

### 前提条件
- Docker & Docker Compose

### 起動手順

1. プロジェクトをクローン
```bash
git clone <repository-url>
cd attendance-app
```

2. Docker環境を起動
```bash
docker-compose up -d
```

3. データベースマイグレーション実行
```bash
cd backend
docker-compose exec backend alembic upgrade head
```

### アクセス先

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8000
- API文書: http://localhost:8000/docs

### 開発用コマンド

```bash
# バックエンド開発
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# フロントエンド開発
cd frontend
npm install
npm run dev

# データベースマイグレーション
cd backend
alembic revision --autogenerate -m "migration message"
alembic upgrade head
```

## プロジェクト構造

```
attendance-app/
├── frontend/                 # React フロントエンド
│   ├── src/
│   │   ├── components/      # 再利用可能コンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── services/       # API通信
│   │   ├── types/          # TypeScript型定義
│   │   └── utils/          # ユーティリティ関数
│   └── package.json
├── backend/                 # FastAPI バックエンド
│   ├── app/
│   │   ├── api/            # API エンドポイント
│   │   ├── core/           # 設定・セキュリティ
│   │   ├── models/         # SQLAlchemy モデル
│   │   ├── schemas/        # Pydantic スキーマ
│   │   └── services/       # ビジネスロジック
│   └── requirements.txt
└── docker-compose.yml       # 開発環境用
```