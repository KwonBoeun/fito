# src/models/__init__.py

if __name__ == "__main__":
    raise SystemExit("이 파일은 직접 실행하지 말고 프로젝트 루트에서 app.py를 실행하세요.")

from .user import User
from .workout_logs import WorkoutLog

__all__ = ["User", "WorkoutLog"]
