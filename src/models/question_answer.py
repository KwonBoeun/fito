from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database.session import Base


class QuestionAnswer(Base):
    """질문 답변. 수정 불가, 삭제 시 replies cascade."""
    __tablename__ = "question_answers"

    id          : Mapped[int]      = mapped_column(primary_key=True)
    question_id : Mapped[int]      = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    user_id     : Mapped[int|None] = mapped_column(Integer, nullable=True)   # FK 제거
    body        : Mapped[str]      = mapped_column(String(1000), nullable=False)
    reply_count : Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    accepted    : Mapped[bool]     = mapped_column(Boolean, nullable=False, default=False)
    is_deleted  : Mapped[bool]     = mapped_column(Boolean, nullable=False, default=False)
    created_at  : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    question = relationship("Question", back_populates="answers")
    user     = relationship("User", foreign_keys="[QuestionAnswer.user_id]",
                            primaryjoin="QuestionAnswer.user_id == User.id", lazy="joined")
    replies  = relationship("QuestionReply", back_populates="answer",
                            cascade="all, delete-orphan", order_by="QuestionReply.created_at")