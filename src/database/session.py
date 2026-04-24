from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from src.db import get_database_url


class Base(DeclarativeBase):
    pass


def get_sqlalchemy_url() -> str:
    database_url = get_database_url()
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


engine = create_engine(get_sqlalchemy_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def init_db() -> None:
    import src.models.user  # noqa: F401

    Base.metadata.create_all(bind=engine)
