from uuid import UUID
from sqlalchemy.orm import Session

from app.models import Event
from app.schemas import EventCreate, EventUpdate


def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Event).offset(skip).limit(limit).all()


def get_event(db: Session, event_id: UUID):
    return db.query(Event).filter(Event.id == event_id).first()


def create_event(db: Session, event: EventCreate, user_id: UUID):
    db_event = Event(
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        creator_id=user_id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, event_id: UUID, event: EventUpdate):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if db_event:
        update_data = event.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_event, field, value)
        db.commit()
        db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: UUID):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event