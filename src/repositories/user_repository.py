from sqlalchemy import select
from sqlalchemy.orm import Session

from src.models import User


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def find_by_username(self, username: str) -> User | None:
        statement = select(User).where(User.username.ilike(username.strip()))
        return self.session.scalar(statement)

    def create(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
