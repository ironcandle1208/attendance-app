from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError # 未使用だが、一般的なインポート
from fastapi import HTTPException

from app.models import Attendance # Attendanceモデルをインポート
from app.schemas import AttendanceCreate, AttendanceUpdate # Attendance関連のスキーマをインポート


# 指定されたイベントの出欠リストを取得
def get_event_attendances(db: Session, event_id: UUID):
    return db.query(Attendance).filter(Attendance.event_id == event_id).all()


# 指定されたユーザーの出欠リストを取得
def get_user_attendances(db: Session, user_id: UUID):
    return db.query(Attendance).filter(Attendance.user_id == user_id).all()


# 指定されたIDの出欠を取得
def get_attendance(db: Session, attendance_id: UUID):
    return db.query(Attendance).filter(Attendance.id == attendance_id).first()


# 指定されたユーザーとイベントの出欠を取得
def get_user_event_attendance(db: Session, user_id: UUID, event_id: UUID):
    return db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.event_id == event_id
    ).first()


# 新しい出欠を作成
def create_attendance(db: Session, attendance: AttendanceCreate, user_id: UUID):
    # 既に同じイベントにユーザーが出欠登録しているか確認
    existing_attendance = get_user_event_attendance(db, user_id, attendance.event_id)
    if existing_attendance:
        raise HTTPException(
            status_code=400,
            detail="Attendance already exists for this event" # 既に存在する場合はエラー
        )
    
    # Attendanceモデルのインスタンスを作成
    db_attendance = Attendance(
        event_id=attendance.event_id,
        user_id=user_id,
        status=attendance.status,
        comment=attendance.comment
    )
    db.add(db_attendance) # データベースに追加
    db.commit() # コミットして変更を保存
    db.refresh(db_attendance) # データベースから最新の情報を取得してオブジェクトを更新
    return db_attendance


# 既存の出欠を更新
def update_attendance(db: Session, attendance_id: UUID, attendance: AttendanceUpdate):
    db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if db_attendance: # 出欠が存在する場合
        # 更新データからNoneでないフィールドのみを抽出
        update_data = attendance.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_attendance, field, value) # 各フィールドを更新
        db.commit() # コミットして変更を保存
        db.refresh(db_attendance) # データベースから最新の情報を取得してオブジェクトを更新
    return db_attendance