from datetime import datetime, date, timedelta
from collections import defaultdict
from sqlalchemy import cast, Date as SADate
from src.database.session import SessionLocal
from src.models import WorkoutLog
from werkzeug.security import check_password_hash, generate_password_hash

PART_MAP = {
    "벤치프레스": "상체", "인클라인 벤치프레스": "상체", "숄더 프레스": "상체",
    "푸시업": "상체", "데드리프트": "상체", "풀업": "상체", "랫풀다운": "상체",
    "스쿼트": "하체", "런지": "하체", "레그프레스": "하체", "레그컬": "하체",
    "런닝머신": "유산소", "자전거": "유산소", "줄넘기": "유산소", "러닝": "유산소",
    "플랭크": "코어", "크런치": "코어", "레그레이즈": "코어",
}

MET_MAP = {
    "벤치프레스": 6.0, "스쿼트": 8.0, "런닝머신": 7.0,
    "플랭크": 3.0, "푸시업": 4.0, "데드리프트": 6.0,
}

def _get_range(period: str):
    today = date.today()
    delta = {"week": 6, "month": 29, "3month": 89, "6month": 179, "year": 364}
    return today - timedelta(days=delta.get(period, 6)), today


class WorkoutService:

    # ── 회원 관련 (기존) ──────────────────────────
    def username_exists(self, username: str) -> bool:
        from src.models.user import User
        with SessionLocal() as s:
            return s.query(User).filter_by(username=username).first() is not None

    def create_user(self, data: dict):
        from src.models.user import User
        with SessionLocal() as s:
            user = User(
                name=data["name"], contact=data["contact"],
                username=data["username"],
                password_hash=generate_password_hash(data["password"]),
                member_type=data["memberType"], nickname=data["nickname"],
            )
            s.add(user); s.commit()

    def find_user_by_username(self, username: str):
        from src.models.user import User
        with SessionLocal() as s:
            u = s.query(User).filter_by(username=username).first()
            return u.to_dict() if u else None

    def find_user_by_id(self, user_id: int):
        from src.models.user import User
        with SessionLocal() as s:
            u = s.query(User).filter_by(id=user_id).first()
            return u.to_dict() if u else None

    def verify_password(self, user: dict, password: str) -> bool:
        return check_password_hash(user["passwordHash"], password)

    # ── 칼로리 계산 ──────────────────────────────
    def calculate_calories(self, workout_name: str, weight: int, duration_mins: int) -> int:
        met = MET_MAP.get(workout_name, 4.0)
        return int(met * weight * (duration_mins / 60) * 1.05)

    # ── 오늘 분석 (운동 분석 화면) ────────────────
    def get_today_analysis(self, user_id: int, today_date, start_date=None):
        if isinstance(today_date, str):
            today_date = datetime.strptime(today_date, "%Y-%m-%d").date()
        if start_date is None:
            start_date = today_date

        with SessionLocal() as session:
            logs = session.query(WorkoutLog).filter(
                WorkoutLog.user_id == user_id,
                cast(WorkoutLog.date, SADate) >= start_date,
                cast(WorkoutLog.date, SADate) <= today_date
            ).order_by(WorkoutLog.order_index).all()

            if not logs:
                return self.get_empty_analysis()
            total_minutes = sum(log.duration_minutes or 0 for log in logs)
            total_kcal    = sum(log.calories_burned  or 0 for log in logs)

            score_time      = min(100, int((total_minutes / 60) * 100))
            score_kcal      = min(100, int((total_kcal / 500) * 100))
            score_intensity = min(100, len(logs) * 20)
            score_volume    = min(100, sum(log.sets or 0 for log in logs) * 5)
            score_focus     = 85
            score_goal      = 90
            radar = [score_time, score_kcal, score_intensity, score_volume, score_focus, score_goal]

            labels  = ['지속시간','칼로리','강도','운동량','집중도','달성률']
            max_idx = radar.index(max(radar))
            min_idx = radar.index(min(radar))
            avg     = sum(radar) / 6
            top_pct = max(1, int(100 - avg * 0.9))

            return {
                "stats": {
                    "time": f"{total_minutes//60:02}H {total_minutes%60:02}M",
                    "kcal": f"{total_kcal:04}kcal"
                },
                "radarScores":     radar,
                "topPercent":      top_pct,
                "analysisSummary": (
                    f"내 목표 대비 <b>{score_goal}%</b> 달성했어요.<br>"
                    f"오늘 {total_kcal}kcal를 소모하며 <b>{labels[max_idx]}</b> 부문이 우수합니다.<br>"
                    f"다만 {labels[min_idx]} 지표가 낮으니 보완이 필요해요."
                )
            }

    def get_empty_analysis(self):
        return {
            "stats": {"time": "00H 00M", "kcal": "0000kcal"},
            "radarScores": [0,0,0,0,0,0],
            "topPercent": "--",
            "analysisSummary": "오늘 등록된 운동이 없습니다. 운동을 시작해보세요!"
        }

    # ── 기록분석 메인 요약 ────────────────────────
    def get_summary(self, user_id: int) -> dict:
        today = date.today()
        with SessionLocal() as session:
            logs = session.query(WorkoutLog).filter(
                WorkoutLog.user_id == user_id,
                cast(WorkoutLog.date, SADate) == today
            ).all()

            if not logs:
                return {
                    "stats": {"time": "00H 00M", "kcal": "0000kcal"},
                    "radarScores": [0,0,0,0,0,0],
                    "workoutSummaryText": "오늘 운동 기록이 없어요",
                    "balance": {"upper":0,"lower":0,"core":0,"cardio":0},
                    "balanceMsg": "운동을 추가하면 균형도가 표시됩니다.",
                    "strengthText": "데이터가 쌓이면 분석이 시작됩니다.",
                    "weaknessText": "운동을 기록해보세요."
                }

            total_minutes = sum(log.duration_minutes or 0 for log in logs)
            total_kcal    = sum(log.calories_burned  or 0 for log in logs)

            score_time      = min(100, int((total_minutes / 60) * 100))
            score_kcal      = min(100, int((total_kcal / 500) * 100))
            score_intensity = min(100, len(logs) * 20)
            score_volume    = min(100, sum(log.sets or 0 for log in logs) * 5)
            radar = [score_time, score_kcal, score_intensity, score_volume, 85, 90]

            part_time = defaultdict(int)
            for log in logs:
                part = PART_MAP.get(log.workout_name, "기타")
                part_time[part] += log.duration_minutes or 0
            total_t = sum(part_time.values()) or 1

            balance = {
                "upper":  int(part_time["상체"]  / total_t * 100),
                "lower":  int(part_time["하체"]  / total_t * 100),
                "core":   int(part_time["코어"]   / total_t * 100),
                "cardio": int(part_time["유산소"] / total_t * 100),
            }

            labels  = ['지속시간','칼로리','강도','운동량','집중도','달성률']
            max_idx = radar.index(max(radar))
            min_idx = radar.index(min(radar))

            return {
                "stats": {
                    "time": f"{total_minutes//60:02}H {total_minutes%60:02}M",
                    "kcal": f"{total_kcal:04}kcal"
                },
                "radarScores":       radar,
                "workoutSummaryText": f"{labels[max_idx]}은 최고지만, {labels[min_idx]}가 낮아요.",
                "balance":           balance,
                "balanceMsg":        "균형이 잘 잡힌 루틴입니다!" if (max(balance.values()) - min(balance.values())) < 50
                                     else "운동 부위 균형을 맞춰보세요!",
                "strengthText": f"{labels[max_idx]} 지표가 우수합니다. 꾸준히 유지하세요.",
                "weaknessText": f"{labels[min_idx]} 지표가 낮습니다. 보완이 필요해요."
            }

    # ── 기록 변화 (시간/칼로리 차트) ─────────────
    def get_history(self, user_id, period, start_date=None, end_date=None) -> dict:
        # 1. 기간 설정 (타입 보정)
        if start_date and end_date:
            # 외부에서 들어온 날짜가 문자열이면 date 객체로 변환
            start = start_date if isinstance(start_date, date) else start_date
            end = end_date if isinstance(end_date, date) else end_date
        else:
            start, end = _get_range(period)
        
        from src.models import WorkoutLog, WeightLog 
        from sqlalchemy import cast, Date as SADate

        with SessionLocal() as session:
            # 2. 운동 및 체중 데이터 조회 (날짜 캐스팅 강화)
            workout_logs = session.query(WorkoutLog).filter(
                WorkoutLog.user_id == user_id,
                cast(WorkoutLog.date, SADate) >= start,
                cast(WorkoutLog.date, SADate) <= end
            ).all()

            weight_logs = session.query(WeightLog).filter(
                WeightLog.user_id == user_id,
                cast(WeightLog.date, SADate) >= start,
                cast(WeightLog.date, SADate) <= end
            ).all()

            # 3. 데이터 병합용 딕셔너리 (초기값 보장)
            by_date = defaultdict(lambda: {"time": 0, "kcal": 0, "weight": 0})

            for log in workout_logs:
                # DB 날짜를 확실히 date 객체로 추출
                d = log.date.date() if hasattr(log.date, 'date') else log.date
                by_date[d]["time"] += (log.duration_minutes or 0)
                by_date[d]["kcal"] += (log.calories_burned or 0)

            for w_log in weight_logs:
                wd = w_log.date.date() if hasattr(w_log.date, 'date') else w_log.date
                # 체중은 그날의 마지막 기록 혹은 대표값 하나만 사용
                by_date[wd]["weight"] = w_log.weight

            labels, times, kcals, weights = [], [], [], []

            # 4. 기간별 루프 (날짜를 하루씩 증가시키며 데이터 매칭)
            curr = start
            if period == "week":
                for _ in range(7):
                    labels.append(curr.strftime("%m.%d"))
                    times.append(by_date[curr]["time"])
                    kcals.append(by_date[curr]["kcal"])
                    weights.append(by_date[curr]["weight"])
                    curr += timedelta(days=1)
            
            elif period == "month":
                # 30일치를 5일 간격으로 샘플링
                for i in range(0, 31, 5):
                    d = start + timedelta(days=i)
                    if d > end: break
                    labels.append(d.strftime("%m.%d"))
                    times.append(by_date[d]["time"])
                    kcals.append(by_date[d]["kcal"])
                    weights.append(by_date[d]["weight"])
            
            else:
                # 월별 합산 (3개월, 6개월, 1년 등)
                monthly = defaultdict(lambda: {"time": 0, "kcal": 0, "w_sum": 0, "w_cnt": 0})
                for d_key, v in by_date.items():
                    mk = d_key.strftime("%Y.%m")
                    monthly[mk]["time"] += v["time"]
                    monthly[mk]["kcal"] += v["kcal"]
                    if v["weight"] > 0:
                        monthly[mk]["w_sum"] += v["weight"]
                        monthly[mk]["w_cnt"] += 1
                
                for mk in sorted(monthly.keys()):
                    labels.append(mk[5:]) # "05" 형태
                    times.append(monthly[mk]["time"])
                    kcals.append(monthly[mk]["kcal"])
                    avg_w = monthly[mk]["w_sum"] / monthly[mk]["w_cnt"] if monthly[mk]["w_cnt"] > 0 else 0
                    weights.append(round(avg_w, 1))

            # 최종 데이터 반환 (프론트엔드 키 이름 확인 필수)
            return {
                "labels": labels, 
                "time": times, 
                "kcal": kcals, 
                "weights": weights
            }

    # ── 운동 균형도 ───────────────────────────────
    def get_balance(self, user_id: int, period: str) -> dict:
        start, end = _get_range(period)
        with SessionLocal() as session:
            logs = session.query(WorkoutLog).filter(
                WorkoutLog.user_id == user_id,
                cast(WorkoutLog.date, SADate) >= start,
                cast(WorkoutLog.date, SADate) <= end
            ).all()

            part_time  = defaultdict(int)
            part_sets  = defaultdict(int)
            part_count = defaultdict(int)
            for log in logs:
                part = PART_MAP.get(log.workout_name, "기타")
                part_time[part]  += log.duration_minutes or 0
                part_sets[part]  += log.sets or 0
                part_count[part] += 1

            total_t = sum(part_time.values()) or 1
            def pct(p): return int(part_time[p] / total_t * 100)

            upper  = pct("상체")
            lower  = pct("하체")
            core   = pct("코어")
            cardio = pct("유산소")
            diff   = max(upper, lower, core, cardio) - min(upper, lower, core, cardio)

            return {
                "upper": upper, "lower": lower, "core": core, "cardio": cardio,
                "donut":   [upper, lower, core, cardio],
                "freq":    [part_count["상체"], part_count["하체"], part_count["코어"], part_count["유산소"]],
                "fatigue": [
                    min(100, part_sets["상체"]    * 8),
                    min(100, part_sets["하체"]    * 8),
                    min(100, part_sets["코어"]    * 6),
                    min(100, part_count["유산소"] * 15),
                ],
                "balanced": diff < 50,
                "balMsg": "균형이 아주 잘 잡힌 건강한 루틴입니다!" if diff < 50
                          else "운동 부위 균형을 맞춰보세요!"
            }

    # ── 강점/취약점 분석 ──────────────────────────
    def get_strength(self, user_id: int, period: str) -> dict:
        start, end = _get_range(period)
        with SessionLocal() as session:
            logs = session.query(WorkoutLog).filter(
                WorkoutLog.user_id == user_id,
                cast(WorkoutLog.date, SADate) >= start,
                cast(WorkoutLog.date, SADate) <= end
            ).all()

            if not logs:
                return {
                    "strengthTitle": "데이터가 부족합니다",
                    "weaknessTitle": "운동을 기록해주세요",
                    "sScore": 0, "wScore": 0,
                    "strengthPct": "상위 --%", "weaknessPct": "하위 --%",
                    "strengthInterpret": "운동을 기록하면 분석이 시작됩니다.",
                    "weaknessInterpret": "운동을 기록하면 분석이 시작됩니다.",
                }

            days_in_period = (end - start).days + 1
            total_minutes  = sum(log.duration_minutes or 0 for log in logs)
            total_kcal     = sum(log.calories_burned  or 0 for log in logs)
            total_sets     = sum(log.sets or 0 for log in logs)
            days_active    = len(set(
                (log.date.date() if hasattr(log.date, 'date') else log.date)
                for log in logs
            ))

            scores = {
                "운동 빈도": min(100, int(days_active / days_in_period * 200)),
                "지속시간":  min(100, int(total_minutes / (days_in_period * 60) * 100)),
                "칼로리":    min(100, int(total_kcal / (days_in_period * 500) * 100)),
                "운동량":    min(100, total_sets * 3),
                "강도":      min(100, len(logs) * 10),
                "집중도":    85,
            }

            best  = max(scores, key=scores.get)
            worst = min(scores, key=scores.get)
            s_score, w_score = scores[best], scores[worst]

            return {
                "strengthTitle":     f"나의 강점은 {best}이에요",
                "weaknessTitle":     f"나의 취약점은 {worst}이에요",
                "sScore":            s_score,
                "wScore":            w_score,
                "strengthPct":       f"상위 {max(1, int(100 - s_score * 0.9))}%",
                "weaknessPct":       f"하위 {max(1, w_score)}%",
                "strengthInterpret": f"{best} 지표가 우수합니다. 상위 {max(1, int(100 - s_score * 0.9))}%에 해당해요.",
                "weaknessInterpret": f"{worst} 지표가 낮습니다. 집중적인 보완이 필요해요.",
            }