import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime # SQLAlchemyのデータ型とカラム定義をインポート
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL固有のUUID型をインポート
from sqlalchemy.orm import relationship # リレーションシップ定義をインポート

from app.core.database import Base # データベースのベースクラスをインポート


# ユーザーモデル（データベーステーブルに対応）
class User(Base):
    __tablename__ = "users" # テーブル名を指定

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # 主キー、UUID型、デフォルトで新しいUUIDを生成
    email = Column(String, unique=True, index=True, nullable=False) # メールアドレス（文字列、ユニーク、インデックス付き、必須）
    password_hash = Column(String, nullable=False) # パスワードハッシュ（文字列、必須）
    name = Column(String, nullable=False) # 名前（文字列、必須）
    created_at = Column(DateTime, default=datetime.utcnow) # 作成日時（デフォルトで現在時刻）
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # 更新日時（更新時に現在時刻に自動更新）

    # リレーションシップの定義
    # "Event"モデルとの一対多の関係（Userは複数のEventを作成できる）
    created_events = relationship("Event", back_populates="creator")
    # "Attendance"モデルとの一対多の関係（Userは複数のAttendanceを持つ）
    attendances = relationship("Attendance", back_populates="user")