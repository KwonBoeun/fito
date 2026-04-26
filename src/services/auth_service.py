import hashlib
from pathlib import Path

from werkzeug.security import check_password_hash, generate_password_hash

from src.database.session import SessionLocal
from src.models import User
from src.repositories import UserRepository
import math
from datetime import datetime
from src.database.session import SessionLocal
from src.models import WorkoutLog

class AuthService:
    def find_user_by_id(self, user_id: int) -> dict | None:
        with SessionLocal() as session:
            user = UserRepository(session).find_by_id(user_id)
            return self._user_to_auth_dict(user) if user else None

    def find_user_by_username(self, username: str) -> dict | None:
        with SessionLocal() as session:
            user = UserRepository(session).find_by_username(username)
            return self._user_to_auth_dict(user) if user else None

    def username_exists(self, username: str) -> bool:
        return self.find_user_by_username(username) is not None

    def create_user(self, user_data: dict) -> dict:
        with SessionLocal() as session:
            repository = UserRepository(session)
            profile_image_url = self._ensure_default_profile_image(
                username=user_data["username"],
                nickname=user_data["nickname"],
            )
            user = User(
                name=user_data["name"],
                contact=user_data["contact"],
                username=user_data["username"],
                password_hash=generate_password_hash(user_data["password"]),
                member_type=user_data["memberType"],
                nickname=user_data["nickname"],
                profile_image_url=profile_image_url,
            )
            return repository.create(user).to_dict()

    def verify_password(self, user: dict, password: str) -> bool:
        return check_password_hash(user["password_hash"], password)

    @staticmethod
    def _user_to_auth_dict(user: User) -> dict:
        data = user.to_dict()
        data["password_hash"] = user.password_hash
        return data

    @staticmethod
    def _ensure_default_profile_image(username: str, nickname: str) -> str:
        uploads_dir = Path(__file__).resolve().parents[2] / "static" / "uploads" / "profiles"
        uploads_dir.mkdir(parents=True, exist_ok=True)

        seed = f"{username}:{nickname}".encode("utf-8")
        digest = hashlib.sha256(seed).hexdigest()
        filename = f"default_{digest[:16]}.svg"
        file_path = uploads_dir / filename

        if not file_path.exists():
            palette = [
                ("#F97316", "#FED7AA"),
                ("#0F766E", "#99F6E4"),
                ("#1D4ED8", "#BFDBFE"),
                ("#7C3AED", "#DDD6FE"),
                ("#BE123C", "#FECDD3"),
                ("#15803D", "#BBF7D0"),
                ("#B45309", "#FDE68A"),
                ("#4338CA", "#C7D2FE"),
            ]
            palette_index = int(digest[:2], 16) % len(palette)
            background, accent = palette[palette_index]
            initial = (nickname.strip() or username.strip() or "?")[0].upper()
            svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="{nickname}">
  <defs>
    <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="{background}" />
      <stop offset="100%" stop-color="{accent}" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="80" fill="url(#bg)" />
  <circle cx="196" cy="60" r="20" fill="rgba(255,255,255,0.25)" />
  <circle cx="72" cy="196" r="28" fill="rgba(255,255,255,0.18)" />
  <text x="128" y="145" text-anchor="middle" font-size="108" font-family="Arial, Apple SD Gothic Neo, Malgun Gothic, sans-serif" font-weight="700" fill="#FFFFFF">{initial}</text>
</svg>
"""
            file_path.write_text(svg, encoding="utf-8")

        return f"/static/uploads/profiles/{filename}"

    
