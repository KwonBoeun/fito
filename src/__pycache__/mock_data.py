"""
mock_data.py
더미(Mock) 데이터 정의 및 카테고리별 반환 함수.
추후 SQLite DB 연동 시 이 파일의 함수들만 교체하면 됩니다.
"""

import random

# ──────────────────────────────────────────
# 더미 데이터
# ──────────────────────────────────────────

LIVE_DATA = [
    {"id": "l1", "type": "live", "emoji": "🏋️", "bg": "bg-live1",
     "title": "매일 아침 6시! 풀바디 유산소 루틴",
     "author": "핏린이탈출", "viewers": 2400, "tags": ["유산소", "전신운동", "아침루틴"]},
    {"id": "l2", "type": "live", "emoji": "🧘", "bg": "bg-live2",
     "title": "트레이너 지수의 저녁 필라테스",
     "author": "트레이너지수", "viewers": 1800, "tags": ["필라테스", "코어"]},
    {"id": "l3", "type": "live", "emoji": "🏃", "bg": "bg-fits1",
     "title": "같이 달려요! 러닝 30분 챌린지",
     "author": "러닝크루서울", "viewers": 943, "tags": ["러닝", "유산소"]},
    {"id": "l4", "type": "live", "emoji": "💪", "bg": "bg-comm1",
     "title": "그룹 상체 데이 with 친구들",
     "author": "짐버디팀", "viewers": 712, "tags": ["상체", "그룹"]},
    {"id": "l5", "type": "live", "emoji": "🔥", "bg": "bg-vod2",
     "title": "새벽 4시 기상 홈트 루틴 공개",
     "author": "새벽운동러", "viewers": 534, "tags": ["홈트", "새벽"]},
    {"id": "l6", "type": "live", "emoji": "🤸", "bg": "bg-fits2",
     "title": "유연성 향상 스트레칭 라이브",
     "author": "스트레칭마스터", "viewers": 421, "tags": ["스트레칭"]},
    {"id": "l7", "type": "live", "emoji": "🥊", "bg": "bg-fits3",
     "title": "복싱 기초 배우기 - 1회차",
     "author": "복싱갤러리", "viewers": 389, "tags": ["복싱", "유산소"]},
    {"id": "l8", "type": "live", "emoji": "🎯", "bg": "bg-vod1",
     "title": "목표 체중 -10kg 달성 후기",
     "author": "다이어터민지", "viewers": 276, "tags": ["다이어트"]},
    {"id": "l9", "type": "live", "emoji": "⚡", "bg": "bg-live2",
     "title": "HIIT 20분 지옥훈련",
     "author": "운동중독자", "viewers": 198, "tags": ["HIIT", "유산소"]},
]

VOD_DATA = [
    {"id": "v1", "type": "vod", "emoji": "🧘", "bg": "bg-vod1",
     "title": "초보자도 따라하는 하체 스쿼트 30일 챌린지",
     "author": "PT박코치", "views": 98700, "tags": ["하체운동", "스쿼트"], "uploaded": "3일 전"},
    {"id": "v2", "type": "vod", "emoji": "💪", "bg": "bg-vod2",
     "title": "홈트 최강 상체 루틴 (덤벨 없이 가능)",
     "author": "홈트여신", "views": 54200, "tags": ["홈트", "상체"], "uploaded": "5일 전"},
    {"id": "v3", "type": "vod", "emoji": "🔥", "bg": "bg-fits1",
     "title": "3대 500 달성기 6개월 기록",
     "author": "파워리프터김", "views": 32100, "tags": ["벤치프레스"], "uploaded": "1주일 전"},
    {"id": "v4", "type": "vod", "emoji": "🏃", "bg": "bg-comm2",
     "title": "마라톤 완주 준비 12주 플랜",
     "author": "마라톤코치", "views": 28400, "tags": ["러닝", "마라톤"], "uploaded": "1주일 전"},
    {"id": "v5", "type": "vod", "emoji": "🤸", "bg": "bg-fits3",
     "title": "매일 10분 코어 운동 30일 변화",
     "author": "코어여왕", "views": 19800, "tags": ["코어", "복근"], "uploaded": "2주일 전"},
    {"id": "v6", "type": "vod", "emoji": "🥗", "bg": "bg-vod1",
     "title": "근육 키우는 식단 완벽 가이드",
     "author": "영양사이지수", "views": 15300, "tags": ["식단", "단백질"], "uploaded": "2주일 전"},
    {"id": "v7", "type": "vod", "emoji": "🧠", "bg": "bg-live2",
     "title": "운동할 때 꼭 알아야 할 해부학",
     "author": "운동과학박사", "views": 12700, "tags": ["운동과학"], "uploaded": "3주일 전"},
    {"id": "v8", "type": "vod", "emoji": "🏋️", "bg": "bg-vod2",
     "title": "데드리프트 완전 정복 - 기초부터",
     "author": "데드리프터", "views": 10200, "tags": ["데드리프트"], "uploaded": "3주일 전"},
    {"id": "v9", "type": "vod", "emoji": "🎯", "bg": "bg-comm1",
     "title": "체지방 감량 식단 비법 공개",
     "author": "다이어터민지", "views": 8900, "tags": ["다이어트", "식단"], "uploaded": "1달 전"},
    {"id": "v10", "type": "vod", "emoji": "⚡", "bg": "bg-fits2",
     "title": "HIIT vs 유산소 어떤 게 효과적?",
     "author": "트레이너지수", "views": 7400, "tags": ["HIIT", "유산소"], "uploaded": "1달 전"},
    {"id": "v11", "type": "vod", "emoji": "🏄", "bg": "bg-fits1",
     "title": "서핑 기초 체력 훈련 루틴",
     "author": "서핑러너", "views": 5800, "tags": ["서핑", "코어"], "uploaded": "1달 전"},
    {"id": "v12", "type": "vod", "emoji": "🌙", "bg": "bg-live1",
     "title": "저녁 30분 스트레칭 루틴",
     "author": "스트레칭마스터", "views": 4200, "tags": ["스트레칭", "수면"], "uploaded": "2달 전"},
]

FITS_DATA = [
    {"id": "f1", "type": "fits", "emoji": "🤸", "bg": "bg-fits1", "title": "30초 플랭크 챌린지", "author": "핏린이"},
    {"id": "f2", "type": "fits", "emoji": "🏃", "bg": "bg-fits2", "title": "5분 점핑잭 루틴",   "author": "운동짱"},
    {"id": "f3", "type": "fits", "emoji": "💪", "bg": "bg-fits3", "title": "팔굽혀펴기 100개 도전", "author": "홈트여신"},
    {"id": "f4", "type": "fits", "emoji": "🧘", "bg": "bg-vod1",  "title": "1분 스쿼트 루틴",   "author": "PT박코치"},
    {"id": "f5", "type": "fits", "emoji": "🔥", "bg": "bg-comm2", "title": "버피 10개 짧게 끊기", "author": "새벽운동러"},
    {"id": "f6", "type": "fits", "emoji": "⚡", "bg": "bg-live2", "title": "코어 30초 챌린지",   "author": "코어여왕"},
    {"id": "f7", "type": "fits", "emoji": "🎯", "bg": "bg-fits1", "title": "런지 20회 빠르게",   "author": "러닝크루"},
    {"id": "f8", "type": "fits", "emoji": "🏋️", "bg": "bg-vod2",  "title": "어깨 스트레칭 45초", "author": "스트레칭마스터"},
    {"id": "f9", "type": "fits", "emoji": "🌟", "bg": "bg-fits3", "title": "복근 운동 1분",      "author": "복근미녀"},
    {"id": "f10","type": "fits", "emoji": "🚀", "bg": "bg-comm1", "title": "힙업 스쿼트 변형",   "author": "하체퀸"},
]

COMMUNITY_DATA = [
    {"id": "c1", "type": "community", "avatar": "지", "bg": "bg-comm1", "emoji": "💪",
     "name": "운동일기jina", "time": "2시간 전",
     "text": "드디어 100일 운동 달성!! 처음엔 5분도 못했는데 지금은 1시간 거뜬해요 🎉",
     "likes": 1200, "comments": 87, "bookmarks": 234, "tags": ["오운완", "100일챌린지"]},
    {"id": "c2", "type": "community", "avatar": "민", "bg": "bg-comm2", "emoji": "🥗",
     "name": "식단킹민준", "time": "4시간 전",
     "text": "오늘 점심 고단백 식단 공개! 닭가슴살+현미밥+브로콜리의 황금비율을 찾았어요",
     "likes": 876, "comments": 54, "bookmarks": 192, "tags": ["식단관리", "다이어트"]},
    {"id": "c3", "type": "community", "avatar": "수", "bg": "bg-vod1", "emoji": "🏋️",
     "name": "헬린이수진", "time": "6시간 전",
     "text": "처음으로 혼자 헬스장 다녀왔습니다... 너무 긴장했지만 뿌듯해요!",
     "likes": 654, "comments": 43, "bookmarks": 87, "tags": ["헬스입문", "오운완"]},
    {"id": "c4", "type": "community", "avatar": "준", "bg": "bg-fits3", "emoji": "🔥",
     "name": "PT하는준기", "time": "어제",
     "text": "클라이언트 3개월 변화 사진 공유 (허락 받음) 정말 열심히 하셨어요 👏",
     "likes": 2100, "comments": 132, "bookmarks": 445, "tags": ["변신", "PT후기"]},
    {"id": "c5", "type": "community", "avatar": "아", "bg": "bg-live2", "emoji": "🧘",
     "name": "요가여신아린", "time": "어제",
     "text": "오늘 아침 요가 루틴 공유해요~ 일어나자마자 10분만 해도 하루가 달라져요",
     "likes": 543, "comments": 29, "bookmarks": 178, "tags": ["아침요가", "루틴"]},
    {"id": "c6", "type": "community", "avatar": "태", "bg": "bg-comm1", "emoji": "💪",
     "name": "크로스핏태욱", "time": "2일 전",
     "text": "크로스핏 입문 6개월 전/후 비교 진짜 놀랍죠? 포기하지 않길 잘했어요",
     "likes": 3400, "comments": 201, "bookmarks": 678, "tags": ["크로스핏", "변신"]},
    {"id": "c7", "type": "community", "avatar": "혜", "bg": "bg-fits1", "emoji": "🏃",
     "name": "런닝혜리", "time": "2일 전",
     "text": "첫 마라톤 완주!! 42.195km... 정말 꿈같아요 눈물 났어요 ㅠㅠ",
     "likes": 4200, "comments": 287, "bookmarks": 892, "tags": ["마라톤", "완주"]},
    {"id": "c8", "type": "community", "avatar": "동", "bg": "bg-fits2", "emoji": "⚡",
     "name": "축구하는동현", "time": "3일 전",
     "text": "인라인 스케이팅으로 전신 근력 기르는 방법 알려드릴게요!",
     "likes": 321, "comments": 18, "bookmarks": 65, "tags": ["인라인", "전신"]},
]

QUESTION_DATA = [
    {"id": "q1", "type": "question",
     "title": "데드리프트 자세 이게 맞나요?",
     "body": "허리가 자꾸 굽어지는데 어떻게 교정해야 할지 모르겠어요. 영상 올릴게요 봐주세요 🙏",
     "likes": 47, "comments": 23, "bookmarks": 12, "time": "1시간 전", "tags": ["데드리프트", "자세교정"]},
    {"id": "q2", "type": "question",
     "title": "단백질 하루 얼마나 먹어야 하나요?",
     "body": "체중 70kg 기준으로 근육을 늘리려면 단백질을 하루에 얼마나 먹어야 하나요?",
     "likes": 31, "comments": 15, "bookmarks": 8, "time": "3시간 전", "tags": ["단백질", "식단"]},
    {"id": "q3", "type": "question",
     "title": "런닝 초보 페이스 추천해주세요",
     "body": "30대 초보 러너인데 처음 시작할 때 어느 정도 페이스로 달려야 하나요?",
     "likes": 28, "comments": 19, "bookmarks": 5, "time": "5시간 전", "tags": ["러닝", "페이스"]},
    {"id": "q4", "type": "question",
     "title": "헬스장 안 가도 집에서 근육 키울 수 있나요?",
     "body": "집에 덤벨이나 기구가 없어도 맨몸으로만 근육을 키울 수 있을까요?",
     "likes": 22, "comments": 31, "bookmarks": 14, "time": "어제", "tags": ["홈트", "맨몸운동"]},
    {"id": "q5", "type": "question",
     "title": "운동 후 단백질 쉐이크 언제 마셔야?",
     "body": "운동 끝나고 바로? 아니면 샤워하고? 아니면 30분 후? 타이밍이 너무 헷갈려요",
     "likes": 18, "comments": 12, "bookmarks": 6, "time": "어제", "tags": ["단백질쉐이크", "운동후식단"]},
    {"id": "q6", "type": "question",
     "title": "어깨 통증이 있는데 운동해도 되나요?",
     "body": "벤치프레스 하다가 어깨가 아픈데 쉬어야 하는지 다른 운동으로 대체해야 하는지 궁금해요",
     "likes": 15, "comments": 27, "bookmarks": 9, "time": "2일 전", "tags": ["어깨통증", "운동부상"]},
    {"id": "q7", "type": "question",
     "title": "체지방 줄이면서 근육 키우기 가능한가요?",
     "body": "벌크업과 다이어트를 동시에 할 수 있다고 하는데 사실인가요?",
     "likes": 39, "comments": 44, "bookmarks": 21, "time": "2일 전", "tags": ["벌크업", "다이어트"]},
]

SEARCH_KEYWORDS = [
    "스쿼트 자세", "스쿼트 초보", "스쿼트 30일",
    "홈트레이닝 루틴", "홈트레이닝 기초",
    "하체운동 추천", "하체 스트레칭",
    "상체 근력운동", "유산소 운동",
    "PT박코치", "필라테스", "단백질 섭취",
    "식단 관리", "데드리프트", "벤치프레스",
]

# ──────────────────────────────────────────
# 숫자 포맷 유틸
# ──────────────────────────────────────────

def fmt_num(n: int) -> str:
    """1000 → 1.0K, 1000000 → 1.0M"""
    if n >= 1_000_000_000:
        return f"{n/1_000_000_000:.1f}B"
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return str(n)


# ──────────────────────────────────────────
# 공개 함수
# ──────────────────────────────────────────

def get_popular_contents(category: str) -> dict:
    """카테고리별 인기 콘텐츠 반환 (TOP 5)"""
    if category == 'live':
        items = sorted(LIVE_DATA, key=lambda x: x['viewers'], reverse=True)[:5]
        return {'live': _format_live(items)}

    if category == 'vod':
        items = sorted(VOD_DATA, key=lambda x: x['views'], reverse=True)[:5]
        return {'vod': _format_vod(items)}

    if category == 'fits':
        return {'fits': FITS_DATA[:10]}

    if category == 'community':
        items = sorted(COMMUNITY_DATA, key=lambda x: x['likes'], reverse=True)[:5]
        return {'community': _format_community(items)}

    if category == 'question':
        items = sorted(QUESTION_DATA, key=lambda x: x['likes'], reverse=True)[:5]
        return {'question': _format_question(items)}

    # all: 각 카테고리 TOP 1~2
    return {
        'live':      _format_live(_sorted_live()[:1]),
        'vod':       _format_vod(_sorted_vod()[:1]),
        'fits':      FITS_DATA[:2],
        'community': _format_community(_sorted_community()[:2]),
        'question':  _format_question(_sorted_question()[:2]),
    }


def get_recommend_contents(category: str, page: int = 1) -> list:
    """카테고리별 추천 피드 반환
    - all       : 27 unit (live 9, vod 12, fits 3, community 2, question 2) 랜덤 배치
    - live      : 30 unit
    - vod       : 30 unit
    - fits      : 15 unit (2-col, 각 unit = FITS 2개)
    - community : 30 unit (2-col masonry)
    - question  : 15 unit (1-col)
    """
    if category == 'all':
        pool = []
        pool += [{'type': 'live',      'data': _format_live([d])[0]}     for d in LIVE_DATA]          # 9
        pool += [{'type': 'vod',       'data': _format_vod([d])[0]}      for d in VOD_DATA]            # 12
        pool += [{'type': 'fits_group','data': FITS_DATA[:3]}]                                          # 3 (그룹 1개)
        pool += [{'type': 'community', 'data': _format_community([d])[0]} for d in COMMUNITY_DATA[:2]] # 2
        pool += [{'type': 'question',  'data': _format_question([d])[0]}  for d in QUESTION_DATA[:2]]  # 2
        random.shuffle(pool)
        return pool  # 27 unit

    if category == 'live':
        items = LIVE_DATA * 4                          # 36개 확보 후 슬라이스
        return [{'type': 'live', 'data': _format_live([d])[0]} for d in items[:30]]

    if category == 'vod':
        items = VOD_DATA * 3
        return [{'type': 'vod', 'data': _format_vod([d])[0]} for d in items[:30]]

    if category == 'fits':
        items = FITS_DATA * 4
        groups = []
        for i in range(0, 30, 2):
            groups.append({'type': 'fits_pair', 'data': items[i:i+2]})
        return groups[:15]  # 15 unit

    if category == 'community':
        items = COMMUNITY_DATA * 4
        return [{'type': 'community', 'data': _format_community([d])[0]} for d in items[:30]]

    if category == 'question':
        items = QUESTION_DATA * 3
        return [{'type': 'question', 'data': _format_question([d])[0]} for d in items[:15]]

    return []


def get_search_suggests(query: str) -> list:
    """연관 검색어 반환 (입력 앞부분 일치, 최대 10개)"""
    if not query:
        return []
    q = query.lower()
    matched = [kw for kw in SEARCH_KEYWORDS if kw.lower().startswith(q)]
    return matched[:10]


# ──────────────────────────────────────────
# 내부 헬퍼
# ──────────────────────────────────────────

def _sorted_live():
    return sorted(LIVE_DATA, key=lambda x: x['viewers'], reverse=True)

def _sorted_vod():
    return sorted(VOD_DATA, key=lambda x: x['views'], reverse=True)

def _sorted_community():
    return sorted(COMMUNITY_DATA, key=lambda x: x['likes'], reverse=True)

def _sorted_question():
    return sorted(QUESTION_DATA, key=lambda x: x['likes'], reverse=True)


def _format_live(items: list) -> list:
    result = []
    for d in items:
        item = dict(d)
        item['viewers_fmt'] = fmt_num(d['viewers'])
        result.append(item)
    return result


def _format_vod(items: list) -> list:
    result = []
    for d in items:
        item = dict(d)
        item['views_fmt'] = fmt_num(d['views'])
        result.append(item)
    return result


def _format_community(items: list) -> list:
    result = []
    for d in items:
        item = dict(d)
        item['likes_fmt']     = fmt_num(d['likes'])
        item['comments_fmt']  = fmt_num(d['comments'])
        item['bookmarks_fmt'] = fmt_num(d['bookmarks'])
        result.append(item)
    return result


def _format_question(items: list) -> list:
    return [dict(d) for d in items]
