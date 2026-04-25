import re
import secrets
from datetime import datetime

from flask import Blueprint, jsonify, render_template, request
from sqlalchemy import func

from src.database.session import SessionLocal 
from src.models import WorkoutLog 
from src.services import AuthService


auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()

@auth_bp.post("/api/workout/add")
def add_workout():
    payload = request.get_json(silent=True) or {}
    user_id = 1 # 데모용 고정 ID
    
    with SessionLocal() as session:
        # 칼로리 계산
        kcal = auth_service.calculate_calories(payload.get("name"), 70, int(payload.get("val", 0)))
        
        new_log = WorkoutLog(
            user_id=user_id,
            date=datetime.strptime(payload.get("date"), "%Y-%m-%d"),
            workout_name=payload.get("name"),
            sets=int(payload.get("sets", 0)),
            duration_minutes=int(payload.get("val", 0)),
            calories_burned=kcal,
            order_index=999 # 기본 순서는 뒤로
        )
        session.add(new_log)
        session.commit()
    return jsonify({"ok": True})

@auth_bp.put("/api/workout/update/<int:workout_id>")
def update_workout(workout_id):
    payload = request.get_json()
    with SessionLocal() as session:
        workout = session.query(WorkoutLog).filter_by(id=workout_id).first()
        if workout:
            workout.workout_name = payload.get("name")
            workout.sets = int(payload.get("sets", 0))
            workout.duration_minutes = int(payload.get("val", 0))
            # 수정 데이터 기반 칼로리 재계산
            workout.calories_burned = auth_service.calculate_calories(workout.workout_name, 70, workout.duration_minutes)
            session.commit()
            return jsonify({"ok": True})
    return jsonify({"ok": False, "message": "기록을 찾을 수 없습니다."}), 404

@auth_bp.delete("/api/workout/reset")
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

@auth_bp.put("/api/workout/reorder")
def reorder_workouts():
    payload = request.get_json()
    orders = payload.get("orders", []) 
    with SessionLocal() as session:
        for item in orders:
            workout = session.query(WorkoutLog).filter_by(id=int(item["id"])).first()
            if workout:
                workout.order_index = item["orderIndex"] 
        session.commit()
    return jsonify({"ok": True})

@auth_bp.get("/api/workout/today-analysis")
def get_today_analysis_api():
    user_id = 1
    today_date = datetime.now().date()
    
    with SessionLocal() as session:
        # 1. 오늘 운동 리스트
        logs = session.query(WorkoutLog).filter(
            WorkoutLog.user_id == user_id,
            func.date(WorkoutLog.date) == today_date
        ).order_by(WorkoutLog.order_index).all()
        
        workout_list = [log.to_dict() for log in logs]
        
        # 2. 분석 요약 데이터 호출
        analysis = auth_service.get_today_analysis(user_id, str(today_date))
        
        # 데이터가 없을 경우를 대비한 기본값 설정
        if not analysis:
            analysis = {
                "stats": {"time": "00H 00M", "kcal": "0000kcal"},
                "radarScores": [0, 0, 0, 0, 0, 0],
                "topPercent": "--",
                "analysisSummary": "오늘 등록된 운동이 없습니다."
            }
        
        return jsonify({
            "ok": True, 
            "data": {
                **analysis,
                "workouts": workout_list
            }
        })