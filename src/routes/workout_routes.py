from datetime import datetime

from flask import Blueprint, jsonify, request
from sqlalchemy import func

from src.database.session import SessionLocal
from src.models import WorkoutLog
from src.services.workout_service import WorkoutService

workout_bp = Blueprint("workout", __name__)
workout_service = WorkoutService()


@workout_bp.post("/api/workout/add")
def add_workout():
    payload = request.get_json(silent=True) or {}
    user_id = 1
    with SessionLocal() as session:
        kcal = workout_service.calculate_calories(payload.get("name"), 70, int(payload.get("val", 0)))
        new_log = WorkoutLog(
            user_id=user_id,
            date=datetime.strptime(payload.get("date"), "%Y-%m-%d"),
            workout_name=payload.get("name"),
            sets=int(payload.get("sets", 0)),
            duration_minutes=int(payload.get("val", 0)),
            calories_burned=kcal,
            order_index=999
        )
        session.add(new_log)
        session.commit()
    return jsonify({"ok": True})


@workout_bp.put("/api/workout/update/<int:workout_id>")
def update_workout(workout_id):
    payload = request.get_json()
    with SessionLocal() as session:
        workout = session.query(WorkoutLog).filter_by(id=workout_id).first()
        if workout:
            workout.workout_name = payload.get("name")
            workout.sets = int(payload.get("sets", 0))
            workout.duration_minutes = int(payload.get("val", 0))
            workout.calories_burned = workout_service.calculate_calories(workout.workout_name, 70, workout.duration_minutes)
            session.commit()
            return jsonify({"ok": True})
    return jsonify({"ok": False, "message": "기록을 찾을 수 없습니다."}), 404


@workout_bp.delete("/api/workout/reset")
def reset_workouts():
    user_id = 1
    today = datetime.now().date()
    with SessionLocal() as session:
        session.query(WorkoutLog).filter(
            WorkoutLog.user_id == user_id,
            func.date(WorkoutLog.date) == today
        ).delete()
        session.commit()
    return jsonify({"ok": True})


@workout_bp.put("/api/workout/reorder")
def reorder_workouts():
    orders = request.get_json().get("orders", [])
    with SessionLocal() as session:
        for item in orders:
            workout = session.query(WorkoutLog).filter_by(id=int(item["id"])).first()
            if workout:
                workout.order_index = item["orderIndex"]
        session.commit()
    return jsonify({"ok": True})


@workout_bp.get("/api/workout/today-analysis")
def get_today_analysis_api():
    user_id = 1
    today_date = datetime.now().date()
    with SessionLocal() as session:
        logs = session.query(WorkoutLog).filter(
            WorkoutLog.user_id == user_id,
            func.date(WorkoutLog.date) == today_date
        ).order_by(WorkoutLog.order_index).all()
        workout_list = [log.to_dict() for log in logs]
        analysis = workout_service.get_today_analysis(user_id, str(today_date))
        if not analysis:
            analysis = {
                "stats": {"time": "00H 00M", "kcal": "0000kcal"},
                "radarScores": [0, 0, 0, 0, 0, 0],
                "topPercent": "--",
                "analysisSummary": "오늘 등록된 운동이 없습니다."
            }
    return jsonify({"ok": True, "data": {**analysis, "workouts": workout_list}})


@workout_bp.get("/api/workout/summary")
def get_summary_api():
    user_id = 1
    data = workout_service.get_summary(user_id)
    return jsonify({"ok": True, "data": data})


@workout_bp.get("/api/workout/history")
def get_history_api():
    user_id = 1
    period = request.args.get("period", "week")
    data = workout_service.get_history(user_id, period)
    return jsonify({"ok": True, "data": data})


@workout_bp.get("/api/workout/balance")
def get_balance_api():
    user_id = 1
    period = request.args.get("period", "week")
    data = workout_service.get_balance(user_id, period)
    return jsonify({"ok": True, "data": data})


@workout_bp.get("/api/workout/strength")
def get_strength_api():
    user_id = 1
    period = request.args.get("period", "month")
    data = workout_service.get_strength(user_id, period)
    return jsonify({"ok": True, "data": data})


def register_workout_routes(app) -> None:
    if "workout" not in app.blueprints:
        app.register_blueprint(workout_bp)