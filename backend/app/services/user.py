from sqlalchemy.orm import Session

from app.core.security import get_password_hash # パスワードハッシュ化関数をインポート
from app.models import User # Userモデルをインポート
from app.schemas import UserCreate # UserCreateスキーマをインポート


# メールアドレスでユーザーを取得
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


# 新しいユーザーを作成
def create_user(db: Session, user: UserCreate):
    # パスワードをハッシュ化
    hashed_password = get_password_hash(user.password)
    # Userモデルのインスタンスを作成
    db_user = User(
        email=user.email,
        name=user.name,
        password_hash=hashed_password # ハッシュ化されたパスワードを保存
    )
    db.add(db_user) # データベースに追加
    db.commit() # コミットして変更を保存
    db.refresh(db_user) # データベースから最新の情報を取得してオブジェクトを更新
    return db_user