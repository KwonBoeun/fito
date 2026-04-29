from datetime import datetime
from sqlalchemy import DateTime, Integer, String, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from src.database.session import Base


class QuestionLike(Base):
    """좋아요. 복합 PK로 중복 방지.
    user_id: FK 제거 → users 테이블 없어도 동작 (개발 단계)
    """
    __tablename__ = "question_likes"

    question_id : Mapped[int]      = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True)
    user_id     : Mapped[int]      = mapped_column(Integer, primary_key=True)  # FK 제거
    created_at  : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class QuestionBookmark(Base):
    """북마크. 복합 PK로 중복 방지."""
    __tablename__ = "question_bookmarks"

    question_id : Mapped[int]      = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True)
    user_id     : Mapped[int]      = mapped_column(Integer, primary_key=True)  # FK 제거
    created_at  : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class QuestionReport(Base):
    """신고. 유저당 1회 제한."""
    __tablename__ = "question_reports"

    id          : Mapped[int]      = mapped_column(primary_key=True)
    question_id : Mapped[int]      = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    user_id     : Mapped[int]      = mapped_column(Integer, nullable=False)   # FK 제거
    reason      : Mapped[str]      = mapped_column(String(20), nullable=False)
    created_at  : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("question_id", "user_id", name="uq_report_user_question"),
    )