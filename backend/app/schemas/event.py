from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel

from .user import User


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None


class Event(EventBase):
    id: UUID
    creator_id: UUID
    created_at: datetime
    updated_at: datetime
    creator: User

    class Config:
        from_attributes = True


class EventWithAttendances(Event):
    attendances: List["AttendanceWithUser"] = []

    class Config:
        from_attributes = True