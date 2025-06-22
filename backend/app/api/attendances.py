from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.schemas import AttendanceCreate, AttendanceUpdate, AttendanceWithUser, AttendanceWithEvent
from app.services.attendance import get_event_attendances, get_user_attendances, create_attendance, update_attendance, get_attendance
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/events/{event_id}", response_model=List[AttendanceWithUser])
def read_event_attendances(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attendances = get_event_attendances(db, event_id=event_id)
    return attendances


@router.get("/my", response_model=List[AttendanceWithEvent])
def read_my_attendances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attendances = get_user_attendances(db, user_id=current_user.id)
    return attendances


@router.post("/", response_model=AttendanceWithEvent)
def create_attendance_endpoint(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_attendance(db=db, attendance=attendance, user_id=current_user.id)


@router.put("/{attendance_id}", response_model=AttendanceWithEvent)
def update_attendance_endpoint(
    attendance_id: UUID,
    attendance: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_attendance = get_attendance(db, attendance_id=attendance_id)
    if db_attendance is None:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    if db_attendance.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return update_attendance(db=db, attendance_id=attendance_id, attendance=attendance)