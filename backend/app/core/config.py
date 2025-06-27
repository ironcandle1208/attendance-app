from pydantic_settings import BaseSettings


# アプリケーションの設定を管理するクラス
class Settings(BaseSettings):
    # データベース接続URL
    # 環境変数 DATABASE_URL が設定されていなければデフォルト値を使用
    database_url: str = "postgresql://postgres:password@localhost:5432/attendance_db"
    # JWTの署名に使用される秘密鍵
    # 環境変数 SECRET_KEY が設定されていなければデフォルト値を使用
    secret_key: str = "your-secret-key-change-in-production"
    # JWTの署名アルゴリズム
    # 環境変数 ALGORITHM が設定されていなければデフォルト値を使用
    algorithm: str = "HS256"
    # アクセストークンの有効期限（分）
    # 環境変数 ACCESS_TOKEN_EXPIRE_MINUTES が設定されていなければデフォルト値を使用
    access_token_expire_minutes: int = 30

    class Config:
        # .envファイルから環境変数を読み込む設定
        env_file = ".env"


# Settingsクラスのインスタンスを作成
# これにより、アプリケーション全体で設定値にアクセスできるようになる
settings = Settings()