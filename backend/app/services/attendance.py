from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.models import Attendance
from app.schemas import AttendanceCreate, AttendanceUpdate


def get_event_attendances(db: Session, event_id: UUID):
    return db.query(Attendance).filter(Attendance.event_id == event_id).all()


def get_user_attendances(db: Session, user_id: UUID):
    return db.query(Attendance).filter(Attendance.user_id == user_id).all()


def get_attendance(db: Session, attendance_id: UUID):
    return db.query(Attendance).filter(Attendance.id == attendance_id).first()


def get_user_event_attendance(db: Session, user_id: UUID, event_id: UUID):
    return db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.event_id == event_id
    ).first()


def create_attendance(db: Session, attendance: AttendanceCreate, user_id: UUID):
    existing_attendance = get_user_event_attendance(db, user_id, attendance.event_id)
    if existing_attendance:
        raise HTTPException(
            status_code=400,
            detail="Attendance already exists for this event"
        )
    
    db_attendance = Attendance(
        event_id=attendance.event_id,
        user_id=user_id,
        status=attendance.status,
        comment=attendance.comment
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


def update_attendance(db: Session, attendance_id: UUID, attendance: AttendanceUpdate):
    db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if db_attendance:
        update_data = attendance.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_attendance, field, value)
        db.commit()
        db.refresh(db_attendance)
    return db_attendance