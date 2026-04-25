from werkzeug.security import check_password_hash, generate_password_hash

from src.database.session import SessionLocal
import math
from datetime import datetime
from src.database.session import SessionLocal
from src.models import WorkoutLog

def calculate_calories(self, workout_name, weight, duration_mins):
        """기획서 기반 MET 공식 적용 칼로리 계산"""
        met_map = {
            "벤치프레스": 6.0, "스쿼트": 8.0, "런닝머신": 7.0, 
            "플랭크": 3.0, "푸시업": 4.0, "데드리프트": 6.0
        }
        met = met_map.get(workout_name, 4.0) # 기본값 4.0
        # 공식: MET * 체중 * (운동시간/60) * 1.05
        kcal = met * weight * (duration_mins / 60) * 1.05
        return int(kcal)

def get_today_analysis(self, user_id, today_date):
    """실제 데이터를 쿼리하여 점수 및 통계 산출"""
    with SessionLocal() as session:
        # 1. 오늘 운동 기록 가져오기
        logs = session.query(WorkoutLog).filter_by(user_id=user_id).all() 
        # (실제로는 날짜 필터링 추가: WorkoutLog.date.cast(Date) == today_date)

        if not logs:
            return self.get_empty_analysis()

        # 2. 기본 통계 계산
        total_minutes = sum(log.duration_minutes for log in logs)
        total_kcal = sum(log.calories_burned for log in logs)
        
        # 3. 레이더 차트 6개 지표 점수 산출 (기획서 로직 예시)
        # 지속시간: (실제시간 / 목표시간 60분) * 100
        score_time = min(100, int((total_minutes / 60) * 100))
        # 칼로리: (실제kcal / 목표 500kcal) * 100
        score_kcal = min(100, int((total_kcal / 500) * 100))
        # 나머지 지표(강도, 운동량 등)는 운동 종류 수나 세트 수로 가중치 부여
        score_intensity = min(100, len(logs) * 20) 
        score_volume = min(100, sum(log.sets for log in logs) * 5)
        score_focus = 85 # 집중도는 추후 알고리즘 적용
        score_goal = 90  # 달성률

        radar_scores = [score_time, score_kcal, score_intensity, score_volume, score_focus, score_goal]

        # 4. 상위 % 계산 (전체 평균 데이터와 비교 로직 - 여기선 가중치 계산)
        avg_score = sum(radar_scores) / 6
        top_percent = max(1, int(100 - (avg_score * 0.9))) # 점수가 높을수록 상위% 낮아짐

        # 5. 분석 문구 생성 (가장 높은 지표와 낮은 지표 추출)
        labels = ['지속시간', '칼로리', '강도', '운동량', '집중도', '달성률']
        max_idx = radar_scores.index(max(radar_scores))
        min_idx = radar_scores.index(min(radar_scores))
        
        analysis_summary = (
            f"내 목표 대비 <b>{score_goal}%</b> 달성했어요.<br>"
            f"오늘 {total_kcal}kcal를 소모하며 <b>{labels[max_idx]}</b> 부문에서 우수한 성적을 거뒀습니다.<br>"
            f"다만, {labels[min_idx]} 지표가 상대적으로 낮으니 보완이 필요해요."
        )

        return {
            "stats": {
                "time": f"{total_minutes // 60:02}H {total_minutes % 60:02}M",
                "kcal": f"{total_kcal:04}kcal"
            },
            "radarScores": radar_scores,
            "topPercent": top_percent,
            "analysisSummary": analysis_summary
        }

def get_empty_analysis(self):
    """데이터가 없을 때 초기값"""
    return {
        "stats": {"time": "00H 00M", "kcal": "0000kcal"},
        "radarScores": [0, 0, 0, 0, 0, 0],
        "topPercent": "--",
        "analysisSummary": "오늘 등록된 운동이 없습니다. 운동을 시작해보세요!"
    }