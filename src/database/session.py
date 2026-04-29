from sqlalchemy import create_engine, inspect, text
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
    import src.models.group  # noqa: F401
    import src.models.user  # noqa: F401
<<<<<<< HEAD
    import src.models.question         # noqa: F401
    import src.models.question_answer  # noqa: F401
    import src.models.hashtag          # noqa: F401

<<<<<<< HEAD
    import src.models.workout_logs  # noqa: F401
    import src.models.weight_log   # noqa: F401
    
=======
=======
    import src.models.workout_logs  # noqa: F401
    import src.models.weight_log   # noqa: F401
    
>>>>>>> 887d3469e292a3a84c03097ce20ad8e0af28f716
>>>>>>> BoEun
    Base.metadata.create_all(bind=engine)
    _ensure_schema_updates()


def _ensure_schema_updates() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "profile_image_url" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(255)"))

    if "group_memberships" not in inspector.get_table_names():
        return

    membership_columns = {column["name"] for column in inspector.get_columns("group_memberships")}
    if "request_message" not in membership_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE group_memberships ADD COLUMN request_message VARCHAR(100)"))
