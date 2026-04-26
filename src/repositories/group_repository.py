from sqlalchemy import select
from sqlalchemy.orm import Session

from src.models import Group


class GroupRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, group: Group) -> Group:
        self.session.add(group)
        self.session.commit()
        self.session.refresh(group)
        return group

    def find_by_id(self, group_id: int) -> Group | None:
        statement = select(Group).where(Group.id == group_id)
        return self.session.scalar(statement)
