from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel # PydanticのBaseModelをインポート

from .user import User # ユーザーモデルのスキーマをインポート
# AttendanceWithUserは後で定義されるため、文字列として参照
# from .attendance import AttendanceWithUser # 循環参照を避けるため、直接インポートしない


# イベントのベーススキーマ
class EventBase(BaseModel):
    title: str # イベントタイトル
    description: Optional[str] = None # 説明（任意）
    event_date: datetime # 開催日時


# イベント作成リクエストのスキーマ
class EventCreate(EventBase):
    pass # EventBaseをそのまま使用


# イベント更新リクエストのスキーマ
class EventUpdate(BaseModel):
    title: Optional[str] = None # タイトル（任意）
    description: Optional[str] = None # 説明（任意）
    event_date: Optional[datetime] = None # 開催日時（任意）


# イベントのレスポンススキーマ
class Event(EventBase):
    id: UUID # イベントID
    creator_id: UUID # 作成者ID
    created_at: datetime # 作成日時
    updated_at: datetime # 更新日時
    creator: User # 作成者情報

    class Config:
        from_attributes = True # ORMモードを有効にする


# 出欠情報を含むイベントのレスポンススキーマ
class EventWithAttendances(Event):
    # 出欠リスト。循環参照を避けるため、forwardrefで型を指定
    attendances: List['AttendanceWithUser'] = []

    class Config:
        from_attributes = True