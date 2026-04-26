from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.session import Base


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    visibility: Mapped[str] = mapped_column(String(20), nullable=False, default="public")
    profile_image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    banner_image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    invite_code: Mapped[str | None] = mapped_column(String(32), nullable=True, unique=True)
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    live_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    chat_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    creator = relationship("User", backref="created_groups")
    tags = relationship("GroupTag", back_populates="group", cascade="all, delete-orphan")
    memberships = relationship("GroupMembership", back_populates="group", cascade="all, delete-orphan")


class GroupTag(Base):
    __tablename__ = "group_tags"
    __table_args__ = (UniqueConstraint("group_id", "name", name="uq_group_tag_name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(30), nullable=False, index=True)

    group = relationship("Group", back_populates="tags")


class GroupMembership(Base):
    __tablename__ = "group_memberships"
    __table_args__ = (UniqueConstraint("group_id", "user_id", name="uq_group_membership_user"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="member")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    group = relationship("Group", back_populates="memberships")
    user = relationship("User", backref="group_memberships")
