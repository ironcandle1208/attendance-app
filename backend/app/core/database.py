from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# アプリケーション設定をインポート
from .config import settings

# データベースエンジンを作成
# settings.database_urlからデータベース接続文字列を取得
engine = create_engine(settings.database_url)

# データベースセッションクラスを作成
# autocommit=False: トランザクションを手動でコミットする必要がある
# autoflush=False: クエリ実行時に自動的にフラッシュしない
# bind=engine: 作成したエンジンにバインド
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# データベースモデルのベースクラスを作成
# このBaseクラスを継承して、データベーステーブルに対応するPythonクラスを定義する
Base = declarative_base()


# データベースセッションを取得するための依存性注入関数
# FastAPIのDependsで使用される
def get_db():
    db = SessionLocal() # 新しいセッションを作成
    try:
        yield db # セッションを呼び出し元に提供
    finally:
        db.close() # セッションを閉じる（リソース解放）