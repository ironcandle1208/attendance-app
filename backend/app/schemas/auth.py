from pydantic import BaseModel, EmailStr # PydanticのBaseModelとEmailStr型をインポート


# トークン情報のスキーマ
class Token(BaseModel):
    access_token: str # アクセストークン文字列
    token_type: str # トークンのタイプ（例: "bearer"）


# トークンデータ（JWTペイロード）のスキーマ
class TokenData(BaseModel):
    email: str | None = None # ユーザーのメールアドレス（サブジェクト）


# ログインリクエストのスキーマ
class LoginRequest(BaseModel):
    email: EmailStr # メールアドレス（EmailStr型でメール形式をバリデーション）
    password: str # パスワード