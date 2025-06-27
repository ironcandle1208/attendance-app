import uuid
from datetime import datetime
from enum import Enum as PyEnum # PythonのEnumクラスをインポート

from sqlalchemy import Column, Text, DateTime, ForeignKey, Enum # SQLAlchemyのデータ型とカラム定義をインポート
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL固有のUUID型をインポート
from sqlalchemy.orm import relationship # リレーションシップ定義をインポート

from app.core.database import Base # データベースのベースクラスをインポート


# 出欠ステータスを定義するEnumクラス
class AttendanceStatus(PyEnum):
    ATTENDING = "attending" # 参加
    NOT_ATTENDING = "not_attending" # 不参加
    MAYBE = "maybe" # 未定


# 出欠モデル（データベーステーブルに対応）
class Attendance(Base):
    __tablename__ = "attendances" # テーブル名を指定

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # 主キー、UUID型、デフォルトで新しいUUIDを生成
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False) # イベントID（外部キー）
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False) # ユーザーID（外部キー）
    status = Column(Enum(AttendanceStatus), nullable=False) # 出欠ステータス（Enum型）
    comment = Column(Text) # コメント（テキスト型）
    created_at = Column(DateTime, default=datetime.utcnow) # 作成日時（デフォルトで現在時刻）
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # 更新日時（更新時に現在時刻に自動更新）

    # リレーションシップの定義
    # "Event"モデルとの多対一の関係（Attendanceは一つのEventに属する）
    event = relationship("Event", back_populates="attendances")
    # "User"モデルとの多対一の関係（Attendanceは一つのUserに属する）
    user = relationship("User", back_populates="attendances")