import os

import psycopg


DEFAULT_DB_CONFIG = {
    'host': os.getenv('PGHOST', 'localhost'),
    'port': os.getenv('PGPORT', '5432'),
    'dbname': os.getenv('PGDATABASE', 'Fito_db'),
    'user': os.getenv('PGUSER', 'Fito_admin'),
    'password': os.getenv('PGPASSWORD', 'fito2026!'),
}


def get_database_url() -> str:
    if os.getenv('DATABASE_URL'):
        return os.getenv('DATABASE_URL')

    return (
        f"postgresql://{DEFAULT_DB_CONFIG['user']}:{DEFAULT_DB_CONFIG['password']}"
        f"@{DEFAULT_DB_CONFIG['host']}:{DEFAULT_DB_CONFIG['port']}/{DEFAULT_DB_CONFIG['dbname']}"
    )


def check_db_connection(database_url: str) -> tuple[bool, str]:
    try:
        with psycopg.connect(database_url, connect_timeout=3) as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT 1')
                cur.fetchone()
        return True, 'PostgreSQL connection successful'
    except Exception as exc:
        return False, f'PostgreSQL connection failed: {exc}'
