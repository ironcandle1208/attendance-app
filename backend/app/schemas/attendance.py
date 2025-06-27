from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel # PydanticのBaseModelをインポート

from app.models.attendance import AttendanceStatus # 出欠ステータスEnumをインポート
from .user import User # ユーザーモデルのスキーマをインポート
from .event import Event # イベントモデルのスキーマをインポート


# 出欠のベーススキーマ
class AttendanceBase(BaseModel):
    status: AttendanceStatus # 出欠ステータス
    comment: Optional[str] = None # コメント（任意）


# 出欠作成リクエストのスキーマ
class AttendanceCreate(AttendanceBase):
    event_id: UUID # イベントID


# 出欠更新リクエストのスキーマ
class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None # 出欠ステータス（任意）
    comment: Optional[str] = None # コメント（任意）


# 出欠のレスポンススキーマ
class Attendance(AttendanceBase):
    id: UUID
    event_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # ORMモードを有効にする


# ユーザー情報を含む出欠のレスポンススキーマ
class AttendanceWithUser(Attendance):
    user: User # ユーザー情報

    class Config:
        from_attributes = True


# イベント情報を含む出欠のレスポンススキーマ
class AttendanceWithEvent(Attendance):
    event: Event # イベント情報

    class Config:
        from_attributes = True