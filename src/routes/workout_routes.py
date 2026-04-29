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
    user_id    = 1
    period     = request.args.get("period", "today")
    start_str  = request.args.get("start")
    end_str    = request.args.get("end")
    today_date = datetime.now().date()

    from datetime import timedelta
    from sqlalchemy import cast, Date as SADate

    # 직접 날짜 범위가 오면 우선 사용
    if start_str and end_str:
        start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
        end_date   = datetime.strptime(end_str,   "%Y-%m-%d").date()
    else:
        delta_map = {"today": 0, "week": 6, "month": 29, "3month": 89}
        start_date = today_date - timedelta(days=delta_map.get(period, 0))
        end_date   = today_date

    with SessionLocal() as session:
        logs = session.query(WorkoutLog).filter(
            WorkoutLog.user_id == user_id,
            cast(WorkoutLog.date, SADate) >= start_date,
            cast(WorkoutLog.date, SADate) <= end_date
        ).order_by(WorkoutLog.order_index).all()

        workout_list = [log.to_dict() for log in logs]
        analysis     = workout_service.get_today_analysis(user_id, end_date, start_date)

        if not analysis:
            analysis = {
                "stats": {"time": "00H 00M", "kcal": "0000kcal"},
                "radarScores": [0,0,0,0,0,0],
                "topPercent": "--",
                "analysisSummary": "등록된 운동이 없습니다."
            }

    return jsonify({"ok": True, "data": {**analysis, "workouts": workout_list}})


@workout_bp.get("/api/workout/summary")
def get_summary_api():
    user_id = 1
    data = workout_service.get_summary(user_id)
    return jsonify({"ok": True, "data": data})

# workout_routes.py 에 추가

@workout_bp.post("/api/weight/add")
def add_weight_api():
    """체중 기록 저장 API"""
    payload = request.get_json()
    user_id = 1  # 테스트용 고정 ID
    
    # 필요한 모델 임포트 (함수 내부에서 실행하거나 파일 상단에 추가)
    from src.models import WeightLog
    from datetime import datetime

    weight_val = payload.get("weight")
    date_str = payload.get("date")

    if not weight_val or not date_str:
        return jsonify({"ok": False, "message": "데이터가 부족합니다."}), 400

    try:
        with SessionLocal() as session:
            # 해당 날짜에 이미 기록이 있는지 확인 (있다면 업데이트, 없으면 신규 생성)
            target_date = datetime.strptime(date_str, "%Y-%m-%d")
            
            # 날짜만 비교하기 위해 cast 사용 (선택 사항)
            existing = session.query(WeightLog).filter(
                WeightLog.user_id == user_id,
                func.date(WeightLog.date) == target_date.date()
            ).first()

            if existing:
                existing.weight = float(weight_val)
            else:
                new_log = WeightLog(
                    user_id=user_id,
                    date=target_date,
                    weight=float(weight_val)
                )
                session.add(new_log)
            
            session.commit()
        return jsonify({"ok": True})
    except Exception as e:
        print(f"체중 저장 오류: {e}")
        return jsonify({"ok": False, "message": str(e)}), 500
    
@workout_bp.get("/api/workout/history")
def get_history_api():
    user_id   = 1
    period    = request.args.get("period", "week")
    start_str = request.args.get("start")
    end_str   = request.args.get("end")

    from datetime import timedelta
    from sqlalchemy import cast, Date as SADate

    today = datetime.now().date()

    if start_str and end_str:
        start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
        end_date   = datetime.strptime(end_str,   "%Y-%m-%d").date()
    else:
        delta_map  = {"week": 6, "month": 29, "3month": 89, "6month": 179, "year": 364}
        # URL 파라미터에 'week:1' 같은 오타가 들어올 경우를 대비해 기본값 6 설정
        clean_period = period.split(':')[0] if ':' in period else period
        start_date = today - timedelta(days=delta_map.get(clean_period, 6))
        end_date   = today

    # WorkoutService.get_history에서 이제 weights 배열도 함께 리턴합니다.
    data = workout_service.get_history(user_id, clean_period, start_date, end_date)
    return jsonify({"ok": True, "data": data})

@workout_bp.get("/api/weight/history")
def get_weight_history_api():
    return get_history_api()

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


@workout_bp.get("/api/workout/active-dates")
def get_active_dates():
    """캘린더에서 운동 기록 있는 날짜 반환"""
    user_id = 1
    year  = request.args.get("year",  type=int, default=datetime.now().year)
    month = request.args.get("month", type=int, default=datetime.now().month)

    from sqlalchemy import cast, Date as SADate, extract
    with SessionLocal() as session:
        logs = session.query(WorkoutLog.date).filter(
            WorkoutLog.user_id == user_id,
            extract('year',  WorkoutLog.date) == year,
            extract('month', WorkoutLog.date) == month,
        ).distinct().all()

    dates = [log.date.strftime("%Y-%m-%d") if hasattr(log.date, 'strftime')
            else str(log.date)[:10] for log in logs]
    return jsonify({"ok": True, "dates": dates})
    

def register_workout_routes(app) -> None:
    if "workout" not in app.blueprints:
        app.register_blueprint(workout_bp)