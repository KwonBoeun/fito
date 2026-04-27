from datetime import datetime
from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column
from src.database.session import Base

class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(nullable=False)  # User.id와 연결
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    workout_name: Mapped[str] = mapped_column(String(100), nullable=False)
    workout_code: Mapped[str] = mapped_column(String(20), nullable=True) # BK001 등 [cite: 2]
    sets: Mapped[int] = mapped_column(nullable=True, default=0)
    reps: Mapped[int] = mapped_column(nullable=True, default=0)
    weight: Mapped[float] = mapped_column(nullable=True, default=0.0) # 무게형 [cite: 277]
    duration_minutes: Mapped[int] = mapped_column(nullable=True, default=0) # 시간형 [cite: 277]
    calories_burned: Mapped[int] = mapped_column(nullable=False, default=0) # 산출 로직 적용 결과 [cite: 197]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    order_index: Mapped[int] = mapped_column(nullable=True, default=0)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "workoutName": self.workout_name,
            "workoutCode": self.workout_code,
            "sets": self.sets,
            "reps": self.reps,
            "weight": self.weight,
            "durationMinutes": self.duration_minutes,
            "caloriesBurned": self.calories_burned,
            "date": self.date.isoformat(),
        }