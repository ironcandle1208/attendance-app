from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.attendance import AttendanceStatus
from .user import User
from .event import Event


class AttendanceBase(BaseModel):
    status: AttendanceStatus
    comment: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    event_id: UUID


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    comment: Optional[str] = None


class Attendance(AttendanceBase):
    id: UUID
    event_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AttendanceWithUser(Attendance):
    user: User

    class Config:
        from_attributes = True


class AttendanceWithEvent(Attendance):
    event: Event

    class Config:
        from_attributes = True