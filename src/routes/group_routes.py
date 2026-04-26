from flask import Blueprint, current_app, jsonify, request, session

from src.services import GroupService


group_bp = Blueprint("group_api", __name__)


def _group_service() -> GroupService:
    upload_root = current_app.config["UPLOAD_FOLDER"]
    return GroupService(upload_root)


def _current_user_id() -> int | None:
    value = session.get("user_id")
    return int(value) if value else None


def _unauthorized_response():
    return jsonify({"ok": False, "message": "로그인이 필요합니다.", "redirectUrl": "/"}), 401


@group_bp.get("/api/groups")
def list_groups():
    user_id = _current_user_id()
    if not user_id:
        return _unauthorized_response()

    try:
        data = _group_service().list_groups_for_user(user_id)
    except ValueError as exc:
        return jsonify({"ok": False, "message": str(exc)}), 400
    return jsonify({"ok": True, **data})


@group_bp.get("/api/groups/search")
def search_groups():
    user_id = _current_user_id()
    if not user_id:
        return _unauthorized_response()

    query = request.args.get("query", "")
    sort = request.args.get("sort", "activity")
    try:
        data = _group_service().search_groups(user_id, query, sort)
    except ValueError as exc:
        return jsonify({"ok": False, "message": str(exc)}), 400
    return jsonify({"ok": True, **data})


@group_bp.post("/api/groups")
def create_group():
    user_id = _current_user_id()
    if not user_id:
        return _unauthorized_response()

    payload = request.get_json(silent=True) or {}
    try:
        group = _group_service().create_group(user_id, payload)
    except ValueError as exc:
        return jsonify({"ok": False, "message": str(exc)}), 400
    return jsonify({"ok": True, "group": group}), 201


def register_group_routes(app) -> None:
    if "group_api" not in app.blueprints:
        app.register_blueprint(group_bp)
