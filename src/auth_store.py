import psycopg
from psycopg.rows import dict_row
from werkzeug.security import check_password_hash, generate_password_hash

from src.db import get_database_url


def _connect():
    return psycopg.connect(get_database_url(), row_factory=dict_row)


def ensure_users_table() -> None:
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id BIGSERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    contact TEXT NOT NULL,
                    username TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    member_type TEXT NOT NULL,
                    nickname TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )


def find_user_by_username(username: str) -> dict | None:
    ensure_users_table()
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    id,
                    name,
                    contact,
                    username,
                    password_hash,
                    member_type AS "memberType",
                    nickname,
                    created_at AS "createdAt"
                FROM users
                WHERE lower(username) = lower(%s)
                """,
                (username.strip(),),
            )
            return cur.fetchone()


def create_user(user_data: dict) -> dict:
    ensure_users_table()
    password_hash = generate_password_hash(user_data["password"])

    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (
                    name,
                    contact,
                    username,
                    password_hash,
                    member_type,
                    nickname
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING
                    id,
                    name,
                    contact,
                    username,
                    member_type AS "memberType",
                    nickname,
                    created_at AS "createdAt"
                """,
                (
                    user_data["name"],
                    user_data["contact"],
                    user_data["username"],
                    password_hash,
                    user_data["memberType"],
                    user_data["nickname"],
                ),
            )
            return cur.fetchone()


def verify_user_password(user: dict, password: str) -> bool:
    return check_password_hash(user["password_hash"], password)
