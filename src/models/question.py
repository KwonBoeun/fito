from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database.session import Base


class Question(Base):
    __tablename__ = "questions"

    id                 : Mapped[int]      = mapped_column(primary_key=True)
    user_id            : Mapped[int|None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title              : Mapped[str]      = mapped_column(String(50), nullable=False)
    body               : Mapped[str]      = mapped_column(String(500), nullable=False)
    like_count         : Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    answer_count       : Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    bookmark_count     : Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    view_count         : Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    is_anon            : Mapped[bool]     = mapped_column(Boolean, nullable=False, default=True)
    is_profile_visible : Mapped[bool]     = mapped_column(Boolean, nullable=False, default=False)
    reward             : Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    is_deleted         : Mapped[bool]     = mapped_column(Boolean, nullable=False, default=False)
    created_at         : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at         : Mapped[datetime|None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    # 관계
    user      = relationship("User",            foreign_keys=[user_id], lazy="joined")
    images    = relationship("QuestionImage",   back_populates="question", cascade="all, delete-orphan", order_by="QuestionImage.order")
    hashtags  = relationship("QuestionHashtag", cascade="all, delete-orphan", order_by="QuestionHashtag.order")
    answers   = relationship("QuestionAnswer",  back_populates="question", cascade="all, delete-orphan", order_by="QuestionAnswer.created_at")
    likes     = relationship("QuestionLike",    cascade="all, delete-orphan")
    bookmarks = relationship("QuestionBookmark",cascade="all, delete-orphan")
    reports   = relationship("QuestionReport",  cascade="all, delete-orphan")