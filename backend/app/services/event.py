from uuid import UUID
from sqlalchemy.orm import Session

from app.models import Event # Eventモデルをインポート
from app.schemas import EventCreate, EventUpdate # Event関連のスキーマをインポート


# イベントのリストを取得
def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Event).offset(skip).limit(limit).all()


# 指定されたIDのイベントを取得
def get_event(db: Session, event_id: UUID):
    return db.query(Event).filter(Event.id == event_id).first()


# 新しいイベントを作成
def create_event(db: Session, event: EventCreate, user_id: UUID):
    # Eventモデルのインスタンスを作成
    db_event = Event(
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        creator_id=user_id # イベント作成者のIDを設定
    )
    db.add(db_event) # データベースに追加
    db.commit() # コミットして変更を保存
    db.refresh(db_event) # データベースから最新の情報を取得してオブジェクトを更新
    return db_event


# 既存のイベントを更新
def update_event(db: Session, event_id: UUID, event: EventUpdate):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if db_event: # イベントが存在する場合
        # 更新データからNoneでないフィールドのみを抽出
        update_data = event.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_event, field, value) # 各フィールドを更新
        db.commit() # コミットして変更を保存
        db.refresh(db_event) # データベースから最新の情報を取得してオブジェクトを更新
    return db_event


# イベントを削除
def delete_event(db: Session, event_id: UUID):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if db_event: # イベントが存在する場合
        db.delete(db_event) # データベースから削除
        db.commit() # コミットして変更を保存
    return db_event