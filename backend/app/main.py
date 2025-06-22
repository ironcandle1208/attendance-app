from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, events, attendances

app = FastAPI(title="Attendance App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(attendances.router, prefix="/attendances", tags=["attendances"])


@app.get("/")
def read_root():
    return {"message": "Attendance App API"}