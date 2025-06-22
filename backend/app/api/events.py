from typing import List, Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, Event
from app.schemas import EventCreate, EventUpdate, Event as EventSchema, EventWithAttendances
from app.services.event import get_events, get_event, create_event, update_event, delete_event
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[EventSchema])
def read_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = get_events(db, skip=skip, limit=limit)
    return events


@router.get("/{event_id}", response_model=EventWithAttendances)
def read_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = get_event(db, event_id=event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/", response_model=EventSchema)
def create_event_endpoint(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_event(db=db, event=event, user_id=current_user.id)


@router.put("/{event_id}", response_model=EventSchema)
def update_event_endpoint(
    event_id: UUID,
    event: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_event = get_event(db, event_id=event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if db_event.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return update_event(db=db, event_id=event_id, event=event)


@router.delete("/{event_id}")
def delete_event_endpoint(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_event = get_event(db, event_id=event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if db_event.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    delete_event(db=db, event_id=event_id)
    return {"message": "Event deleted successfully"}