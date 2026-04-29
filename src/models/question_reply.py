from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database.session import Base


class QuestionReply(Base):
    """대댓글. 답변 삭제 시 CASCADE DELETE."""
    __tablename__ = "question_replies"

    id         : Mapped[int]      = mapped_column(primary_key=True)
    answer_id  : Mapped[int]      = mapped_column(ForeignKey("question_answers.id", ondelete="CASCADE"), nullable=False)
    user_id    : Mapped[int|None] = mapped_column(Integer, nullable=True)   # FK 제거
    body       : Mapped[str]      = mapped_column(String(1000), nullable=False)
    is_deleted : Mapped[bool]     = mapped_column(Boolean, nullable=False, default=False)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    answer = relationship("QuestionAnswer", back_populates="replies")
    user   = relationship("User", foreign_keys="[QuestionReply.user_id]",
                          primaryjoin="QuestionReply.user_id == User.id", lazy="joined")