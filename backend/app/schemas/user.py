from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr # PydanticのBaseModelとEmailStr型をインポート


# ユーザーのベーススキーマ
class UserBase(BaseModel):
    email: EmailStr # メールアドレス
    name: str # 名前


# ユーザー作成リクエストのスキーマ
class UserCreate(UserBase):
    password: str # パスワード


# ユーザー更新リクエストのスキーマ
class UserUpdate(BaseModel):
    name: Optional[str] = None # 名前（任意）
    password: Optional[str] = None # パスワード（任意）


# ユーザーのレスポンススキーマ
class User(UserBase):
    id: UUID # ユーザーID
    created_at: datetime # 作成日時
    updated_at: datetime # 更新日時

    class Config:
        from_attributes = True # ORMモードを有効にする


# データベースから取得したユーザー情報のスキーマ（パスワードハッシュを含む）
class UserInDB(User):
    password_hash: str # パスワードハッシュ