from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# APIエンドポイントのルーターをインポート
from app.api import auth, events, attendances

# FastAPIアプリケーションのインスタンスを作成
# titleとversionはOpenAPIドキュメントに表示される
app = FastAPI(title="Attendance App API", version="1.0.0")

# CORSミドルウェアを追加
# クロスオリジンリクエストを許可するための設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # 許可するオリジン（フロントエンドのURL）
    allow_credentials=True, # クッキーなどの資格情報を許可
    allow_methods=["*"], # すべてのHTTPメソッドを許可
    allow_headers=["*"], # すべてのHTTPヘッダーを許可
)

# 各APIルーターをアプリケーションにインクルード
# prefix: 各ルーターのパスの前に付加されるプレフィックス
# tags: OpenAPIドキュメントでのグループ化に使用されるタグ
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(attendances.router, prefix="/attendances", tags=["attendances"])


# ルートエンドポイントの定義
@app.get("/")
def read_root():
    """APIのルートエンドポイント。"""
    return {"message": "Attendance App API"}