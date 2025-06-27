import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey # SQLAlchemyのデータ型とカラム定義をインポート
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL固有のUUID型をインポート
from sqlalchemy.orm import relationship # リレーションシップ定義をインポート

from app.core.database import Base # データベースのベースクラスをインポート


# イベントモデル（データベーステーブルに対応）
class Event(Base):
    __tablename__ = "events" # テーブル名を指定

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # 主キー、UUID型、デフォルトで新しいUUIDを生成
    title = Column(String, nullable=False) # イベントタイトル（文字列、必須）
    description = Column(Text) # イベント説明（テキスト型、任意）
    event_date = Column(DateTime, nullable=False) # イベント開催日時（日時型、必須）
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False) # 作成者ID（外部キー、必須）
    created_at = Column(DateTime, default=datetime.utcnow) # 作成日時（デフォルトで現在時刻）
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # 更新日時（更新時に現在時刻に自動更新）

    # リレーションシップの定義
    # "User"モデルとの多対一の関係（Eventは一つのUserによって作成される）
    creator = relationship("User", back_populates="created_events")
    # "Attendance"モデルとの一対多の関係（Eventは複数のAttendanceを持つ）
    attendances = relationship("Attendance", back_populates="event")