from datetime import datetime
from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column
from src.database.session import Base

class WeightLog(Base):
    __tablename__ = "weight_logs"

    id:      Mapped[int]      = mapped_column(primary_key=True)
    user_id: Mapped[int]      = mapped_column(nullable=False)
    date:    Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    weight:  Mapped[float]    = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default="now()"
    )

    def to_dict(self):
        return {
            "id":     self.id,
            "date":   self.date.strftime("%Y-%m-%d"),
            "weight": self.weight,
        }