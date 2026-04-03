"""
메인화면 데이터 처리 모듈
인기 콘텐츠 / 추천 콘텐츠 / 검색 결과를 반환
"""

import random

# ───────────────────────────────────────────
# 더미 데이터
# ───────────────────────────────────────────

LIVE_DATA = [
    {"id": "l1", "type": "live", "title": "새벽 전신 유산소 같이해요 🔥", "uploader": "핏니스 지훈", "viewers": 1842, "hashtags": ["#새벽운동", "#유산소", "#같이운동"], "thumbnail": "https://picsum.photos/seed/live1/400/225"},
    {"id": "l2", "type": "live", "title": "하체 데이 PT 라이브 진행중!", "uploader": "트레이너 소연", "viewers": 983, "hashtags": ["#하체운동", "#PT", "#스쿼트"], "thumbnail": "https://picsum.photos/seed/live2/400/225"},
    {"id": "l3", "type": "live", "title": "요가 & 스트레칭 아침 루틴", "uploader": "요가 민지", "viewers": 654, "hashtags": ["#요가", "#스트레칭", "#모닝루틴"], "thumbnail": "https://picsum.photos/seed/live3/400/225"},
    {"id": "l4", "type": "live", "title": "복근 집중 운동 30분 챌린지", "uploader": "식스팩 태현", "viewers": 421, "hashtags": ["#복근", "#코어운동", "#챌린지"], "thumbnail": "https://picsum.photos/seed/live4/400/225"},
    {"id": "l5", "type": "live", "title": "초보자 맞춤 홈트 같이해요", "uploader": "홈트 마스터", "viewers": 312, "hashtags": ["#홈트", "#초보자", "#전신운동"], "thumbnail": "https://picsum.photos/seed/live5/400/225"},
]

VOD_DATA = [
    {"id": "v1", "type": "vod", "title": "10분 만에 끝내는 상체 루틴", "uploader": "운동일기 수빈", "views": 24500, "upload_time": "2시간 전", "hashtags": ["#상체운동", "#10분운동", "#홈트"], "thumbnail": "https://picsum.photos/seed/vod1/400/225", "duration": "10:23"},
    {"id": "v2", "type": "vod", "title": "다이어트 식단 + 운동 조합 완벽 가이드", "uploader": "다이어트 박사", "views": 18200, "upload_time": "5시간 전", "hashtags": ["#다이어트", "#식단관리", "#운동"], "thumbnail": "https://picsum.photos/seed/vod2/400/225", "duration": "22:45"},
    {"id": "v3", "type": "vod", "title": "스쿼트 자세 완벽 교정 (초보~고급)", "uploader": "퍼스널 트레이너 K", "views": 15600, "upload_time": "1일 전", "hashtags": ["#스쿼트", "#자세교정", "#하체"], "thumbnail": "https://picsum.photos/seed/vod3/400/225", "duration": "15:10"},
    {"id": "v4", "type": "vod", "title": "런닝머신 없이 유산소 200% 활용법", "uploader": "헬린이 탈출 채널", "views": 9800, "upload_time": "2일 전", "hashtags": ["#유산소", "#홈트", "#체지방"], "thumbnail": "https://picsum.photos/seed/vod4/400/225", "duration": "18:30"},
    {"id": "v5", "type": "vod", "title": "어깨 넓히는 루틴 따라하기", "uploader": "운동일기 수빈", "views": 7200, "upload_time": "3일 전", "hashtags": ["#어깨운동", "#넓은어깨", "#상체"], "thumbnail": "https://picsum.photos/seed/vod5/400/225", "duration": "12:05"},
]

FITS_DATA = [
    {"id": "f1", "type": "fits", "title": "플랭크 30초 챌", "uploader": "운동하는 혜지", "views": 8200, "hashtags": ["#플랭크", "#30초"], "thumbnail": "https://picsum.photos/seed/fits1/200/300"},
    {"id": "f2", "type": "fits", "title": "점핑잭 1분!", "uploader": "새벽런너", "views": 6100, "hashtags": ["#점핑잭", "#유산소"], "thumbnail": "https://picsum.photos/seed/fits2/200/300"},
    {"id": "f3", "type": "fits", "title": "버피 10개 도전 🔥", "uploader": "핏보이 준서", "views": 5400, "hashtags": ["#버피", "#전신운동"], "thumbnail": "https://picsum.photos/seed/fits3/200/300"},
    {"id": "f4", "type": "fits", "title": "스쿼트 폼 체크해봐요", "uploader": "트레이너 소연", "views": 4800, "hashtags": ["#스쿼트", "#폼체크"], "thumbnail": "https://picsum.photos/seed/fits4/200/300"},
    {"id": "f5", "type": "fits", "title": "밴드 운동 홈트 꿀팁", "uploader": "홈짐 마스터", "views": 3900, "hashtags": ["#밴드운동", "#홈짐"], "thumbnail": "https://picsum.photos/seed/fits5/200/300"},
    {"id": "f6", "type": "fits", "title": "런지 자세 따라하기", "uploader": "운동하는 혜지", "views": 3200, "hashtags": ["#런지", "#하체"], "thumbnail": "https://picsum.photos/seed/fits6/200/300"},
]

COMMUNITY_DATA = [
    {"id": "c1", "type": "community", "title": "", "content": "오늘도 6시 기상 성공 🌅 새벽 운동 3개월째인데 이제 안하면 오히려 이상한 느낌이에요 여러분도 화이팅!", "uploader": "새벽런너", "likes": 342, "comments": 28, "bookmarks": 15, "upload_time": "1시간 전", "hashtags": ["#오운완", "#새벽운동", "#습관"], "thumbnail": "https://picsum.photos/seed/comm1/120/120"},
    {"id": "c2", "type": "community", "title": "", "content": "3개월 전 vs 지금 비교샷 공유해요! 꾸준히 하니까 정말 달라지더라고요 포기하지 마세요 여러분 💪", "uploader": "변화중인 민준", "likes": 891, "comments": 74, "bookmarks": 102, "upload_time": "3시간 전", "hashtags": ["#바디프로필", "#변화", "#다이어트"], "thumbnail": "https://picsum.photos/seed/comm2/120/120"},
    {"id": "c3", "type": "community", "title": "", "content": "헬스장 PT 처음 받아봤는데 혼자 할 때랑 진짜 너무 달라요... 자세 교정이 이렇게 중요한지 몰랐네요", "uploader": "헬린이 지현", "likes": 156, "comments": 31, "bookmarks": 8, "upload_time": "5시간 전", "hashtags": ["#PT", "#자세교정", "#헬스장"], "thumbnail": "https://picsum.photos/seed/comm3/120/120"},
]

QUESTION_DATA = [
    {"id": "q1", "type": "question", "title": "스쿼트 할 때 무릎이 아픈데 자세 문제인가요?", "content": "스쿼트를 시작한 지 2주 됐는데 무릎 안쪽이 뻐근해요. 자세 영상 보면서 따라하는데도 이러네요. 혹시 폼 문제인지 아니면 다른 이유가 있을까요?", "uploader": "헬린이 승민", "likes": 48, "comments": 23, "bookmarks": 12, "upload_time": "30분 전", "hashtags": ["#스쿼트", "#무릎통증", "#자세교정"]},
    {"id": "q2", "type": "question", "title": "유산소 먼저 vs 근력 먼저, 어떤 게 맞나요?", "content": "다이어트가 목표인데 헬스장 가면 항상 어떤 순서로 해야 할지 모르겠어요. 트레이너마다 말이 달라서 혼란스럽습니다.", "uploader": "다이어트중 나영", "likes": 124, "comments": 47, "bookmarks": 35, "upload_time": "2시간 전", "hashtags": ["#유산소", "#근력운동", "#운동순서"]},
]


# ───────────────────────────────────────────
# 숫자 포맷
# ───────────────────────────────────────────
def format_count(n):
    if n >= 1_000_000_000:
        return f"{n/1_000_000_000:.1f}B"
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return str(n)


def _format_item(item):
    item = dict(item)
    for key in ("viewers", "views", "likes"):
        if key in item:
            item[f"{key}_fmt"] = format_count(item[key])
    return item


# ───────────────────────────────────────────
# 인기 콘텐츠
# ───────────────────────────────────────────
def get_popular_content(category: str) -> dict:
    result = {}

    if category in ("all", "live"):
        result["live"] = [_format_item(i) for i in LIVE_DATA[:5]]
    if category in ("all", "vod"):
        result["vod"] = [_format_item(i) for i in VOD_DATA[:5]]
    if category in ("all", "fits"):
        result["fits"] = [_format_item(i) for i in FITS_DATA[:10]]
    if category in ("all", "community"):
        result["community"] = [_format_item(i) for i in COMMUNITY_DATA[:5]]
    if category in ("all", "question"):
        result["question"] = [_format_item(i) for i in QUESTION_DATA[:5]]

    return result


# ───────────────────────────────────────────
# 추천 콘텐츠
# ───────────────────────────────────────────
def get_recommended_content(category: str) -> list:
    pool = []

    if category == "all":
        # 추천 피드 기획서 패턴 고정
        pattern = [
            "live", "vod", "vod", "live", 
            "fits", "fits", "fits", 
            "live", "vod", "live", 
            "community", 
            "question", "question", 
            "vod", "live", 
            "fits", "fits", "fits", 
            "live", "vod", "live", 
            "fits", "fits", "fits", 
            "live", "vod", 
            "community", 
            "vod", "live", "live", "vod", "live"
        ]
        
        lives = [_format_item(i) for i in LIVE_DATA] * 5
        vods = [_format_item(i) for i in VOD_DATA] * 5
        fits_list = [_format_item(i) for i in FITS_DATA] * 5
        comms = [_format_item(i) for i in COMMUNITY_DATA] * 5
        quests = [_format_item(i) for i in QUESTION_DATA] * 5
        
        random.shuffle(lives)
        random.shuffle(vods)
        random.shuffle(fits_list)
        random.shuffle(comms)
        random.shuffle(quests)
        
        for p in pattern:
            if p == "live" and lives: pool.append(lives.pop(0))
            elif p == "vod" and vods: pool.append(vods.pop(0))
            elif p == "fits" and fits_list: pool.append(fits_list.pop(0))
            elif p == "community" and comms: pool.append(comms.pop(0))
            elif p == "question" and quests: pool.append(quests.pop(0))
            
        return pool

    if category == "live":
        pool += [_format_item(i) for i in LIVE_DATA] * 9
    elif category == "vod":
        pool += [_format_item(i) for i in VOD_DATA] * 3
    elif category == "fits":
        pool += [_format_item(i) for i in FITS_DATA[:3]]
    elif category == "community":
        pool += [_format_item(i) for i in COMMUNITY_DATA] * 2
    elif category == "question":
        pool += [_format_item(i) for i in QUESTION_DATA] * 2

    random.shuffle(pool)
    return pool[:27]


# ───────────────────────────────────────────
# 검색
# ───────────────────────────────────────────
def search_content(query: str, category: str, sort: str) -> dict:
    all_items = LIVE_DATA + VOD_DATA + FITS_DATA + COMMUNITY_DATA + QUESTION_DATA
    q = query.lower()

    def match(item):
        text = (item.get("title", "") + item.get("content", "") + " ".join(item.get("hashtags", []))).lower()
        return q in text

    filtered = [_format_item(i) for i in all_items if match(i)]

    if category != "all":
        type_map = {"live": "live", "vod": "vod", "fits": "fits", "community": "community", "question": "question"}
        filtered = [i for i in filtered if i["type"] == type_map.get(category, category)]

    if sort == "latest":
        filtered = list(reversed(filtered))

    return {"results": filtered, "total": len(filtered)}