from datetime import datetime
from sqlalchemy import DateTime, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from src.database.session import Base


class QuestionAnswerLike(Base):
    """답변 좋아요. 복합 PK로 중복 방지."""
    __tablename__ = "question_answer_likes"

    answer_id  : Mapped[int]      = mapped_column(ForeignKey("question_answers.id", ondelete="CASCADE"), primary_key=True)
    user_id    : Mapped[int]      = mapped_column(Integer, primary_key=True)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)