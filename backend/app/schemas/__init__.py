# 他のスキーマファイルからクラスをインポート
from .user import User, UserCreate, UserUpdate, UserInDB
from .auth import Token, TokenData, LoginRequest
from .event import Event, EventCreate, EventUpdate, EventWithAttendances
from .attendance import Attendance, AttendanceCreate, AttendanceUpdate, AttendanceWithUser, AttendanceWithEvent

# 循環参照を解決するためにmodel_rebuildを呼び出し
EventWithAttendances.model_rebuild()

# このパッケージがインポートされたときに公開されるシンボルを定義
# これにより、`from app.schemas import User`のように直接インポートできるようになる
__all__ = [
    "User", "UserCreate", "UserUpdate", "UserInDB",
    "Token", "TokenData", "LoginRequest",
    "Event", "EventCreate", "EventUpdate", "EventWithAttendances",
    "Attendance", "AttendanceCreate", "AttendanceUpdate", "AttendanceWithUser", "AttendanceWithEvent"
]