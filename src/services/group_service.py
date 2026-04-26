import base64
import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from src.database.session import SessionLocal
from src.models import Group, GroupMembership, GroupTag
from src.repositories import GroupRepository, UserRepository

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
HANGUL_RANGE = r"\u3131-\u318E\uAC00-\uD7A3"


class GroupService:
    def __init__(self, upload_root: str):
        self.upload_root = Path(upload_root) / "groups"
        self.upload_root.mkdir(parents=True, exist_ok=True)

    def create_group(self, user_id: int, payload: dict) -> dict:
        name = str(payload.get("name", "")).strip()
        description = str(payload.get("description", "")).strip()
        visibility = str(payload.get("visibility", "public")).strip().lower()
        tags = payload.get("tags", [])

        self._validate_group_payload(name, description, visibility, tags)

        with SessionLocal() as session:
            user = UserRepository(session).find_by_id(user_id)
            if not user:
                raise ValueError("로그인 사용자를 찾을 수 없습니다.")

            profile_image_url = self._save_image(payload.get("profileImg"), "profile")
            banner_image_url = self._save_image(payload.get("bannerImg"), "banner")
            invite_code = secrets.token_urlsafe(8) if visibility == "private" else None

            group = Group(
                name=name,
                description=description,
                visibility=visibility,
                profile_image_url=profile_image_url,
                banner_image_url=banner_image_url,
                invite_code=invite_code,
                creator_id=user.id,
            )
            group.tags = [GroupTag(name=str(tag).strip()) for tag in tags]
            group.memberships = [GroupMembership(user_id=user.id, role="owner", status="active")]

            created_group = GroupRepository(session).create(group)
            loaded_group = self._load_group(session, created_group.id)
            member_counts = {loaded_group.id: 1}
            return self._serialize_group(loaded_group, user.id, member_counts)

    def list_groups_for_user(self, user_id: int) -> dict:
        with SessionLocal() as session:
            user = UserRepository(session).find_by_id(user_id)
            if not user:
                raise ValueError("로그인 사용자를 찾을 수 없습니다.")

            member_counts = self._fetch_member_counts(session)
            joined_groups = self._fetch_joined_groups(session, user_id, member_counts)
            joined_ids = {group.id for group in joined_groups}
            recommended_groups = self._fetch_recommended_groups(session, joined_ids, member_counts)

            return {
                "currentUser": {
                    "id": user.id,
                    "nickname": user.nickname,
                    "username": user.username,
                },
                "joinedGroups": [
                    self._serialize_group(group, user_id, member_counts) for group in joined_groups
                ],
                "recommendGroups": [
                    self._serialize_group(group, user_id, member_counts) for group in recommended_groups
                ],
            }

    def search_groups(self, user_id: int, query: str, sort: str) -> dict:
        cleaned_query = query.strip()
        if not cleaned_query:
            return {"groups": []}

        with SessionLocal() as session:
            member_counts = self._fetch_member_counts(session)
            joined_ids = self._fetch_joined_group_ids(session, user_id)
            statement = (
                select(Group)
                .options(
                    selectinload(Group.tags),
                    selectinload(Group.creator),
                    selectinload(Group.memberships),
                )
                .outerjoin(GroupTag)
                .where(
                    or_(
                        Group.name.ilike(f"%{cleaned_query}%"),
                        GroupTag.name.ilike(f"%{cleaned_query}%"),
                    )
                )
                .distinct()
            )
            groups = list(session.scalars(statement).all())
            visible_groups = [
                group for group in groups if group.id in joined_ids or group.visibility == "public"
            ]
            sorted_groups = self._sort_groups(visible_groups, sort, member_counts)
            return {
                "groups": [
                    self._serialize_group(group, user_id, member_counts) for group in sorted_groups
                ]
            }

    def _fetch_joined_groups(self, session, user_id: int, member_counts: dict[int, int]) -> list[Group]:
        statement = (
            select(Group)
            .join(GroupMembership)
            .options(
                selectinload(Group.tags),
                selectinload(Group.creator),
                selectinload(Group.memberships),
            )
            .where(
                GroupMembership.user_id == user_id,
                GroupMembership.status == "active",
            )
        )
        groups = list(session.scalars(statement).all())
        return self._sort_groups(groups, "activity", member_counts)

    def _fetch_recommended_groups(
        self,
        session,
        joined_ids: set[int],
        member_counts: dict[int, int],
    ) -> list[Group]:
        statement = (
            select(Group)
            .options(
                selectinload(Group.tags),
                selectinload(Group.creator),
                selectinload(Group.memberships),
            )
            .where(
                Group.visibility == "public",
                Group.is_active.is_(True),
            )
            .order_by(Group.created_at.desc())
            .limit(12)
        )
        groups = [group for group in session.scalars(statement).all() if group.id not in joined_ids]
        return self._sort_groups(groups, "popular", member_counts)

    def _fetch_joined_group_ids(self, session, user_id: int) -> set[int]:
        statement = select(GroupMembership.group_id).where(
            GroupMembership.user_id == user_id,
            GroupMembership.status == "active",
        )
        return set(session.scalars(statement).all())

    def _fetch_member_counts(self, session) -> dict[int, int]:
        statement = (
            select(GroupMembership.group_id, func.count(GroupMembership.id))
            .where(GroupMembership.status == "active")
            .group_by(GroupMembership.group_id)
        )
        return {group_id: count for group_id, count in session.execute(statement).all()}

    def _load_group(self, session, group_id: int) -> Group:
        statement = (
            select(Group)
            .options(
                selectinload(Group.tags),
                selectinload(Group.creator),
                selectinload(Group.memberships),
            )
            .where(Group.id == group_id)
        )
        group = session.scalar(statement)
        if not group:
            raise ValueError("생성된 그룹을 불러오지 못했습니다.")
        return group

    def _serialize_group(self, group: Group, user_id: int, member_counts: dict[int, int]) -> dict:
        membership = next(
            (item for item in group.memberships if item.user_id == user_id and item.status == "active"),
            None,
        )
        created_at = (
            group.created_at.astimezone(timezone.utc)
            if group.created_at.tzinfo
            else group.created_at.replace(tzinfo=timezone.utc)
        )
        return {
            "id": group.id,
            "name": group.name,
            "creator": group.creator.nickname,
            "tags": [f"#{tag.name}" for tag in sorted(group.tags, key=lambda item: item.name.lower())],
            "desc": group.description,
            "visibility": group.visibility,
            "createdAt": created_at.date().isoformat(),
            "profileImg": group.profile_image_url or "",
            "bannerImg": group.banner_image_url or "",
            "members": member_counts.get(group.id, 0),
            "liveCnt": group.live_count,
            "chatCnt": group.chat_count,
            "hasLive": group.live_count > 0,
            "liveViewers": 0,
            "inactive": self._is_inactive(group),
            "joined": membership is not None,
            "myRole": membership.role if membership else "none",
            "inviteCode": group.invite_code,
        }

    def _sort_groups(self, groups: list[Group], sort: str, member_counts: dict[int, int]) -> list[Group]:
        if sort == "latest":
            return sorted(groups, key=lambda group: group.created_at, reverse=True)
        if sort in {"popular", "members"}:
            return sorted(
                groups,
                key=lambda group: (member_counts.get(group.id, 0), group.created_at),
                reverse=True,
            )
        return sorted(
            groups,
            key=lambda group: (
                self._is_inactive(group),
                -(group.live_count + group.chat_count),
                -member_counts.get(group.id, 0),
                group.name.lower(),
            ),
        )

    def _is_inactive(self, group: Group) -> bool:
        if group.live_count > 0 or group.chat_count > 0:
            return False
        threshold = datetime.now(timezone.utc) - timedelta(days=30)
        created_at = (
            group.created_at.astimezone(timezone.utc)
            if group.created_at.tzinfo
            else group.created_at.replace(tzinfo=timezone.utc)
        )
        return created_at <= threshold

    def _validate_group_payload(
        self,
        name: str,
        description: str,
        visibility: str,
        tags: list[str],
    ) -> None:
        allowed_text = re.compile(rf"^[A-Za-z0-9{HANGUL_RANGE}\s]+$")
        allowed_tag = re.compile(rf"^[A-Za-z0-9{HANGUL_RANGE}_\s]+$")

        if not name or len(name) > 50 or not allowed_text.fullmatch(name):
            raise ValueError("그룹명은 50자 이하의 한글, 영문, 숫자만 입력할 수 있습니다.")
        if len(description) > 400 or (description and not allowed_text.fullmatch(description)):
            raise ValueError("그룹 설명은 400자 이하의 한글, 영문, 숫자만 입력할 수 있습니다.")
        if visibility not in {"public", "private"}:
            raise ValueError("그룹 공개 설정이 올바르지 않습니다.")
        if not isinstance(tags, list) or len(tags) > 20:
            raise ValueError("해시태그는 최대 20개까지 등록할 수 있습니다.")

        normalized_tags: set[str] = set()
        for raw_tag in tags:
            tag = str(raw_tag).strip()
            if not tag or len(tag) > 30 or not allowed_tag.fullmatch(tag):
                raise ValueError("해시태그는 30자 이하의 한글, 영문, 숫자, 언더바만 사용할 수 있습니다.")
            key = tag.lower()
            if key in normalized_tags:
                raise ValueError("중복된 해시태그는 등록할 수 없습니다.")
            normalized_tags.add(key)

    def _save_image(self, data_url: str | None, prefix: str) -> str | None:
        if not data_url:
            return None

        match = re.fullmatch(r"data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)", data_url)
        if not match:
            raise ValueError("이미지 형식이 올바르지 않습니다.")

        mime_type = match.group(1)
        encoded = match.group(2)
        extension = ALLOWED_IMAGE_TYPES.get(mime_type)
        if not extension:
            raise ValueError("지원하지 않는 이미지 형식입니다.")

        try:
            binary = base64.b64decode(encoded, validate=True)
        except ValueError as exc:
            raise ValueError("이미지를 저장할 수 없습니다.") from exc

        filename = f"{prefix}_{uuid.uuid4().hex}{extension}"
        path = self.upload_root / filename
        path.write_bytes(binary)
        return f"/static/uploads/groups/{filename}"
