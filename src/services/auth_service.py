from werkzeug.security import check_password_hash, generate_password_hash

from src.database.session import SessionLocal
from src.models import User
from src.repositories import UserRepository
import math
from datetime import datetime
from src.database.session import SessionLocal
from src.models import WorkoutLog

class AuthService:
    def find_user_by_username(self, username: str) -> dict | None:
        with SessionLocal() as session:
            user = UserRepository(session).find_by_username(username)
            return self._user_to_auth_dict(user) if user else None

    def username_exists(self, username: str) -> bool:
        return self.find_user_by_username(username) is not None

    def create_user(self, user_data: dict) -> dict:
        with SessionLocal() as session:
            repository = UserRepository(session)
            user = User(
                name=user_data["name"],
                contact=user_data["contact"],
                username=user_data["username"],
                password_hash=generate_password_hash(user_data["password"]),
                member_type=user_data["memberType"],
                nickname=user_data["nickname"],
            )
            return repository.create(user).to_dict()

    def verify_password(self, user: dict, password: str) -> bool:
        return check_password_hash(user["password_hash"], password)

    @staticmethod
    def _user_to_auth_dict(user: User) -> dict:
        data = user.to_dict()
        data["password_hash"] = user.password_hash
        return data

    