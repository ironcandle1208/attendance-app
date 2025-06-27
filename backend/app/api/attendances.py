from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# データベースセッション、モデル、スキーマ、サービス、認証ヘルパーをインポート
from app.core.database import get_db
from app.models import User
from app.schemas import AttendanceCreate, AttendanceUpdate, AttendanceWithUser, AttendanceWithEvent
from app.services.attendance import get_event_attendances, get_user_attendances, create_attendance, update_attendance, get_attendance
from app.api.auth import get_current_user

# APIRouterインスタンスを作成
router = APIRouter()


@router.get("/events/{event_id}", response_model=List[AttendanceWithUser])
def read_event_attendances(
    event_id: UUID, # パスパラメータからイベントIDを取得
    db: Session = Depends(get_db), # データベースセッションの依存性注入
    current_user: User = Depends(get_current_user) # 現在のユーザー情報の依存性注入
):
    """指定されたイベントの出欠リストを取得します。"""
    attendances = get_event_attendances(db, event_id=event_id)
    return attendances


@router.get("/my", response_model=List[AttendanceWithEvent])
def read_my_attendances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """現在のユーザーの出欠リストを取得します。"""
    attendances = get_user_attendances(db, user_id=current_user.id)
    return attendances


@router.post("/", response_model=AttendanceWithEvent)
def create_attendance_endpoint(
    attendance: AttendanceCreate, # リクエストボディから出欠作成データを取得
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """新しい出欠を登録します。"""
    return create_attendance(db=db, attendance=attendance, user_id=current_user.id)


@router.put("/{attendance_id}", response_model=AttendanceWithEvent)
def update_attendance_endpoint(
    attendance_id: UUID, # パスパラメータから出欠IDを取得
    attendance: AttendanceUpdate, # リクエストボディから出欠更新データを取得
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """指定された出欠を更新します。出欠の所有者のみが更新できます。"""
    db_attendance = get_attendance(db, attendance_id=attendance_id)
    if db_attendance is None:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    # 出欠の所有者であるかを確認
    if db_attendance.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return update_attendance(db=db, attendance_id=attendance_id, attendance=attendance)