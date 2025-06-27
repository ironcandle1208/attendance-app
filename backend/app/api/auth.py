from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# 設定、データベース、セキュリティヘルパー、モデル、スキーマ、ユーザーサービスをインポート
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
from app.models import User
from app.schemas import UserCreate, User as UserSchema, Token, LoginRequest
from app.services.user import get_user_by_email, create_user

# APIRouterインスタンスを作成
router = APIRouter()
# OAuth2PasswordBearerを初期化し、トークンURLを指定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


# 現在のユーザーを取得するための依存性注入関数
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], # OAuth2スキームからトークンを取得
    db: Session = Depends(get_db) # データベースセッションの依存性注入
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # トークンを検証し、メールアドレスを取得
    email = verify_token(token)
    if email is None:
        raise credentials_exception
    
    # メールアドレスからユーザーを取得
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


# ユーザー認証関数
def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False # ユーザーが見つからない場合
    if not verify_password(password, user.password_hash):
        return False # パスワードが一致しない場合
    return user # 認証成功


@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """新しいユーザーを登録します。"""
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered" # メールアドレスが既に登録されている場合
        )
    return create_user(db=db, user=user)


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], # フォームデータからユーザー名とパスワードを取得
    db: Session = Depends(get_db)
):
    """OAuth2パスワードフローを使用してアクセストークンを発行します。"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # アクセストークンの有効期限を設定
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    # アクセストークンを作成
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    """ユーザーのメールアドレスとパスワードを使用してログインし、アクセストークンを発行します。"""
    user = authenticate_user(db, login_request.email, login_request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    # アクセストークンの有効期限を設定
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    # アクセストークンを作成
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    """現在の認証済みユーザーの情報を取得します。"""
    return current_user