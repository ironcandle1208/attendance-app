from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt # JWT（JSON Web Token）のエンコード・デコード用ライブラリ
from passlib.context import CryptContext # パスワードハッシュ化ライブラリ

from .config import settings # アプリケーション設定をインポート

# パスワードハッシュ化のコンテキストを設定
# bcryptスキームを使用し、非推奨のハッシュは自動的に処理
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# 平文パスワードとハッシュ化されたパスワードを比較して検証
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# 平文パスワードをハッシュ化
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# アクセストークンを作成
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    # 有効期限が指定されていればそれを使用、なければ15分後に設定
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire}) # ペイロードに有効期限を追加
    # JWTをエンコード
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


# トークンを検証し、ペイロードからメールアドレスを抽出
def verify_token(token: str) -> Optional[str]:
    try:
        # JWTをデコード
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub") # "sub"クレームからメールアドレスを取得
        if email is None:
            return None # メールアドレスがペイロードにない場合
        return email
    except JWTError:
        return None # JWTの検証に失敗した場合