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

_verification_codes: dict[str, str] = {}
_verified_contacts: set[str] = set()


def _normalize_contact(contact: str) -> str:
    return contact.strip().lower()


def _is_valid_contact(contact: str) -> bool:
    normalized = contact.strip()
    phone_pattern = re.compile(r"^\d{10,11}$")
    email_pattern = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    digits_only = re.sub(r"\D", "", normalized)
    return bool(phone_pattern.match(digits_only) or email_pattern.match(normalized))


def _validate_signup_payload(payload: dict) -> dict[str, str]:
    errors: dict[str, str] = {}

    name = payload.get("name", "").strip()
    contact = payload.get("contact", "").strip()
    normalized_contact = _normalize_contact(contact)
    username = payload.get("username", "").strip()
    password = payload.get("password", "")
    password_confirm = payload.get("passwordConfirm", "")
    member_type = payload.get("memberType", "").strip()
    nickname = payload.get("nickname", "").strip()

    if len(name) < 2:
        errors["name"] = "이름은 2자 이상 입력해 주세요."

    if not _is_valid_contact(contact):
        errors["contact"] = "전화번호 또는 이메일 형식이 올바르지 않습니다."
    elif normalized_contact not in _verified_contacts:
        errors["verificationCode"] = "본인 인증을 완료해 주세요."

    if not re.fullmatch(r"[a-zA-Z0-9_]{4,20}", username):
        errors["username"] = "아이디는 영문, 숫자, 밑줄 조합 4~20자여야 합니다."
    elif auth_service.username_exists(username):
        errors["username"] = "이미 사용 중인 아이디입니다."

    if len(password) < 8:
        errors["password"] = "비밀번호는 8자 이상이어야 합니다."
    elif not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        errors["password"] = "비밀번호는 영문과 숫자를 모두 포함해야 합니다."

    if password != password_confirm:
        errors["passwordConfirm"] = "비밀번호 확인이 일치하지 않습니다."

    if member_type not in {"일반 회원", "트레이너", "기업 회원"}:
        errors["memberType"] = "회원 유형을 선택해 주세요."

    if len(nickname) < 2:
        errors["nickname"] = "닉네임은 2자 이상 입력해 주세요."

    return errors


@auth_bp.get("/signup")
def signup_page():
    return render_template("signup.html")


@auth_bp.get("/signup/complete")
def signup_complete_page():
    return render_template("signup_complete.html")


@auth_bp.post("/api/auth/send-code")
def send_verification_code():
    payload = request.get_json(silent=True) or {}
    contact = payload.get("contact", "").strip()

    if not _is_valid_contact(contact):
        return jsonify({"ok": False, "message": "먼저 올바른 전화번호 또는 이메일을 입력해 주세요."}), 400

    normalized_contact = _normalize_contact(contact)
    code = f"{secrets.randbelow(900000) + 100000}"
    _verification_codes[normalized_contact] = code
    _verified_contacts.discard(normalized_contact)

    return jsonify(
        {
            "ok": True,
            "message": "인증번호를 발송했습니다. 데모에서는 화면에 코드를 표시합니다.",
            "code": code,
        }
    )


@auth_bp.post("/api/auth/verify-code")
def verify_code():
    payload = request.get_json(silent=True) or {}
    contact = payload.get("contact", "").strip()
    code = payload.get("verificationCode", "").strip()
    normalized_contact = _normalize_contact(contact)

    if not _is_valid_contact(contact):
        return jsonify({"ok": False, "message": "전화번호 또는 이메일을 먼저 확인해 주세요."}), 400

    if not code:
        return jsonify({"ok": False, "message": "인증번호를 입력해 주세요."}), 400

    stored_code = _verification_codes.get(normalized_contact)
    if not stored_code or stored_code != code:
        return jsonify({"ok": False, "message": "인증번호가 올바르지 않습니다."}), 400

    _verified_contacts.add(normalized_contact)
    return jsonify({"ok": True, "message": "인증이 완료되었습니다."})


@auth_bp.post("/api/auth/check-username")
def check_username():
    payload = request.get_json(silent=True) or {}
    username = payload.get("username", "").strip()

    if not re.fullmatch(r"[a-zA-Z0-9_]{4,20}", username):
        return jsonify({"ok": False, "message": "아이디 형식을 확인해 주세요."}), 400

    exists = auth_service.username_exists(username)
    return jsonify(
        {
            "ok": not exists,
            "message": "사용 가능한 아이디입니다." if not exists else "이미 사용 중인 아이디입니다.",
        }
    )


@auth_bp.post("/api/auth/signup")
def signup_api():
    payload = request.get_json(silent=True) or {}
    errors = _validate_signup_payload(payload)

    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    auth_service.create_user(
        {
            "name": payload["name"].strip(),
            "contact": payload["contact"].strip(),
            "username": payload["username"].strip(),
            "password": payload["password"],
            "memberType": payload["memberType"].strip(),
            "nickname": payload["nickname"].strip(),
        }
    )

    normalized_contact = _normalize_contact(payload["contact"])
    _verification_codes.pop(normalized_contact, None)
    _verified_contacts.discard(normalized_contact)

    return jsonify({"ok": True, "redirectUrl": "/signup/complete"})


@auth_bp.post("/api/auth/login")
def login_api():
    payload = request.get_json(silent=True) or {}
    username = payload.get("username", "").strip()
    password = payload.get("password", "")

    user = auth_service.find_user_by_username(username)
    if not user or not auth_service.verify_password(user, password):
        return jsonify({"ok": False, "message": "아이디 또는 비밀번호가 올바르지 않습니다."}), 401

    return jsonify({"ok": True, "message": f"{user['nickname']}님 환영합니다.", "redirectUrl": "/home"})


def register_auth_routes(app) -> None:
    if "auth" not in app.blueprints:
        app.register_blueprint(auth_bp)


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