/* ===========================
   FITO - Main JS v4
   =========================== */

/* ── 유틸 ── */
const fmt = n => {
  if (n >= 1e9) return (n/1e9).toFixed(1).replace(/\.0$/,'')+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
};
const popScore = (v, t) => Math.log(v + 1) * Math.exp(-t / 24);
const timeAgo = h => {
  if (h < 1/60) return '방금 전';
  if (h < 1)    return `${Math.floor(h*60)}분 전`;
  if (h < 24)   return `${Math.floor(h)}시간 전`;
  if (h < 24*7) return `${Math.floor(h/24)}일 전`;
  if (h < 24*30)return `${Math.floor(h/(24*7))}주 전`;
  return `${Math.floor(h/(24*30))}달 전`;
};
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
};

/* ── SVG ── */
const HEART    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const COMMENT  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const BOOKMARK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
const MORE_IC  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`;
const ARROW    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
const CLOCK_IC = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
const CLOSE_IC = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

/* ── 랜덤 이미지 높이 (커뮤니티 핀터레스트용) ── */
const IMG_HEIGHTS = [120, 150, 180, 200, 140, 160, 130, 170, 190, 145, 155, 175, 125, 165, 185, 135, 195, 148, 162, 178, 132, 168, 142, 158, 172, 128, 182];

/* ── MOCK DATA ── */
const LIVE_DATA = [
  { id:1, title:'새벽 하체 루틴 같이해요', author:'핏걸_나연', viewers:3241, tags:['#초보자','#하체운동'], h:0.3 },
  { id:2, title:'30분 전신 유산소 라이브', author:'트레이너박', viewers:2102, tags:['#유산소','#전신운동'], h:1.2 },
  { id:3, title:'상체 벌크업 실시간 코칭', author:'근육맨제이', viewers:1854, tags:['#벌크업','#상체'], h:0.8 },
  { id:4, title:'코어 운동 20분 같이해요', author:'필라테스정', viewers:987, tags:['#코어','#필라테스'], h:2.1 },
  { id:5, title:'스트레칭&폼롤러 같이해요', author:'스트레치킴', viewers:654, tags:['#스트레칭','#회복'], h:3.5 },
  { id:6, title:'어깨 운동 라이브', author:'숄더맨', viewers:532, tags:['#어깨','#상체'], h:4 },
  { id:7, title:'다이어트 유산소 30분', author:'다이어터민', viewers:481, tags:['#다이어트','#유산소'], h:5 },
  { id:8, title:'새벽 팔 운동 라이브', author:'암컬킹', viewers:340, tags:['#팔운동','#상체'], h:6 },
  { id:9, title:'전신 스트레칭 모닝 루틴', author:'모닝핏', viewers:287, tags:['#스트레칭','#아침'], h:7 },
];
const VOD_DATA = [
  { id:1,  title:'스쿼트 완벽 자세 가이드',     author:'피트니스TV',    views:84200, tags:['#스쿼트','#자세교정'],  h:12,  dur:754  },
  { id:2,  title:'집에서 하는 30분 홈트 루틴',  author:'홈트여왕',      views:62100, tags:['#홈트','#초보자'],      h:36,  dur:1823 },
  { id:3,  title:'뱃살 빼는 코어 운동 10선',    author:'다이어터민',    views:51000, tags:['#다이어트','#코어'],    h:5,   dur:612  },
  { id:4,  title:'데드리프트 입문자 가이드',     author:'트레이너박',    views:43000, tags:['#데드리프트','#하체'],  h:48,  dur:1120 },
  { id:5,  title:'어깨 라운드 교정 스트레칭',   author:'자세교정연구소',views:38000, tags:['#자세교정','#어깨'],    h:20,  dur:487  },
  { id:6,  title:'상체 루틴 완전 정복',          author:'근육맨제이',    views:35000, tags:['#상체','#루틴'],        h:72,  dur:2247 },
  { id:7,  title:'힙업 운동 TOP5',               author:'힙돼지',        views:31000, tags:['#힙업','#하체'],        h:15,  dur:934  },
  { id:8,  title:'초보자 벌크업 식단 가이드',   author:'영양사진',      views:27000, tags:['#벌크업','#식단'],      h:30,  dur:1456 },
  { id:9,  title:'런닝 페이스별 칼로리 소모',   author:'러너킴',        views:24000, tags:['#러닝','#유산소'],      h:40,  dur:778  },
  { id:10, title:'팔굽혀펴기 자세 교정',         author:'피트니스TV',    views:21000, tags:['#팔굽혀펴기','#상체'],  h:60,  dur:523  },
  { id:11, title:'폼롤러 전신 마사지',            author:'회복전문',      views:18000, tags:['#폼롤러','#회복'],      h:24,  dur:1089 },
  { id:12, title:'플랭크 변형 10가지',            author:'코어킹',        views:15000, tags:['#플랭크','#코어'],      h:90,  dur:867  },
];
const FITS_DATA = [
  { id:1,  title:'스쿼트 30초 챌린지', author:'핏걸_나연', views:124000, tags:['#스쿼트'], h:3 },
  { id:2,  title:'플랭크 1분 도전', author:'코어킹', views:98000, tags:['#플랭크'], h:5 },
  { id:3,  title:'점프 버피 챌린지', author:'버피마스터', views:87000, tags:['#버피'], h:8 },
  { id:4,  title:'힙쓰러스트 꿀팁', author:'힙돼지', views:74000, tags:['#힙업'], h:10 },
  { id:5,  title:'런지 200개 챌린지', author:'런지퀸', views:65000, tags:['#런지'], h:14 },
  { id:6,  title:'풀업 입문자 가이드', author:'철봉남', views:52000, tags:['#풀업'], h:18 },
  { id:7,  title:'빠른 복근 10분', author:'식스팩왕', views:48000, tags:['#복근'], h:22 },
  { id:8,  title:'덤벨 컬 자세 보기', author:'암컬킹', views:43000, tags:['#덤벨'], h:26 },
  { id:9,  title:'점프스쿼트 30개', author:'점프퀸', views:38000, tags:['#점프'], h:30 },
  { id:10, title:'케틀벨 스윙 꿀팁', author:'케틀벨러', views:35000, tags:['#케틀벨'], h:34 },
  { id:11, title:'상체 스트레칭 모음', author:'스트레치킴', views:32000, tags:['#스트레칭'], h:38 },
  { id:12, title:'사이드 런지 챌린지', author:'런지퀸', views:29000, tags:['#런지'], h:42 },
  { id:13, title:'코어 버티기 챌린지', author:'코어킹', views:26000, tags:['#코어'], h:46 },
  { id:14, title:'힙힌지 기초 동작', author:'힙돼지', views:24000, tags:['#힙힌지'], h:50 },
  { id:15, title:'인클라인 푸쉬업', author:'피트니스TV', views:21000, tags:['#푸쉬업'], h:54 },
  { id:16, title:'밴드 운동 3종 세트', author:'밴드마스터', views:18000, tags:['#밴드'], h:58 },
  { id:17, title:'브이싯업 20개 도전', author:'식스팩왕', views:16000, tags:['#복근'], h:62 },
  { id:18, title:'점프 런지 챌린지', author:'런지퀸', views:14000, tags:['#런지'], h:66 },
  { id:19, title:'와이드 스쿼트 꿀팁', author:'핏걸_나연', views:12000, tags:['#스쿼트'], h:70 },
  { id:20, title:'복근 운동 5분 완성', author:'식스팩왕', views:11000, tags:['#복근'], h:74 },
  { id:21, title:'팔뚝살 빼는 운동', author:'암컬킹', views:10000, tags:['#팔'], h:78 },
  { id:22, title:'등 스트레칭 루틴', author:'스트레치킴', views:9000, tags:['#등'], h:82 },
  { id:23, title:'런닝 워밍업 루틴', author:'러너킴', views:8000, tags:['#러닝'], h:86 },
  { id:24, title:'힙업 파이어하이드런트', author:'힙돼지', views:7500, tags:['#힙업'], h:90 },
  { id:25, title:'벽 스쿼트 챌린지', author:'스쿼트킹', views:7000, tags:['#스쿼트'], h:94 },
  { id:26, title:'점핑잭 50개 챌린지', author:'유산소킹', views:6500, tags:['#유산소'], h:98 },
  { id:27, title:'마운틴 클라이머 챌린지', author:'코어킹', views:6000, tags:['#코어'], h:102 },
];
const COM_DATA = [
  { id:1,  author:'nayeonny',  content:'한동안 일정 과다로 가족바프 이후 첫 운동 기록\n시간 참 빠르다!', tags:['#오운완'], likes:212, comments:16, bookmarks:3,  h:7 },
  { id:2,  author:'fitking',   content:'오늘도 완료 💪 데드 120kg 처음 성공했어요!', tags:['#데드리프트','#PR'], likes:341, comments:28, bookmarks:12, h:3 },
  { id:3,  author:'pilates_j', content:'필라테스 3개월 차 몸 변화 공유해요. 확실히 코어가 강해진 게 느껴져요', tags:['#필라테스','#바디체인지'], likes:1204, comments:87, bookmarks:54, h:15 },
  { id:4,  author:'diet_min',  content:'오늘 식단 공유! 닭가슴살은 이제 지겨워서 색다르게 해봤어요', tags:['#식단','#다이어트'], likes:567, comments:43, bookmarks:21, h:22 },
  { id:5,  author:'runnerkim', content:'첫 하프마라톤 완주! 2시간 12분 기록 달성 🏃', tags:['#마라톤','#달리기'], likes:892, comments:61, bookmarks:38, h:10 },
  { id:6,  author:'shoulder_j',content:'어깨 3대 운동 루틴 정착 2개월, 라인이 달라졌어요', tags:['#어깨','#루틴'], likes:445, comments:32, bookmarks:18, h:30 },
  { id:7,  author:'squat_q',   content:'스쿼트 100kg 도전 성공 🏆', tags:['#스쿼트','#PR'], likes:723, comments:55, bookmarks:29, h:5 },
  { id:8,  author:'homefit',   content:'홈트 6개월, 헬스장 안 가도 충분해요!', tags:['#홈트','#바디체인지'], likes:1102, comments:94, bookmarks:67, h:48 },
  { id:9,  author:'coreking',  content:'플랭크 5분 챌린지 성공! 코어 불타는 느낌 🔥', tags:['#플랭크','#코어'], likes:334, comments:27, bookmarks:14, h:12 },
  { id:10, author:'bulkup_j',  content:'벌크업 식단 3개월 결과 공유합니다', tags:['#벌크업','#식단'], likes:678, comments:49, bookmarks:31, h:20 },
  { id:11, author:'morningfit',content:'아침 운동의 힘, 매일 6시 기상 3개월째', tags:['#아침운동','#루틴'], likes:521, comments:38, bookmarks:22, h:8 },
  { id:12, author:'hipup_k',   content:'힙업 운동 2개월 전후 비교샷 🍑', tags:['#힙업','#바디체인지'], likes:1567, comments:112, bookmarks:89, h:25 },
  { id:13, author:'stretch_k', content:'매일 스트레칭 30분의 기적, 유연성 대폭 향상', tags:['#스트레칭','#유연성'], likes:399, comments:29, bookmarks:17, h:35 },
  { id:14, author:'protein_j', content:'단백질 쉐이크 직접 만들어 먹는 레시피 공유', tags:['#단백질','#식단'], likes:445, comments:36, bookmarks:23, h:18 },
  { id:15, author:'cardio_m',  content:'유산소 다이어트 한달 -5kg 성공기', tags:['#다이어트','#유산소'], likes:834, comments:67, bookmarks:41, h:42 },
  { id:16, author:'deadlift_k',content:'데드리프트 자세 교정 후 허리 통증 사라짐', tags:['#데드리프트','#자세교정'], likes:602, comments:48, bookmarks:28, h:55 },
  { id:17, author:'jump_q',    content:'점프 스쿼트 챌린지 30일 완료 🎉', tags:['#챌린지','#스쿼트'], likes:489, comments:35, bookmarks:19, h:62 },
  { id:18, author:'lunge_j',   content:'런지 매일 100개 한달 결과', tags:['#런지','#챌린지'], likes:567, comments:41, bookmarks:25, h:70 },
  { id:19, author:'pullup_m',  content:'풀업 0개에서 10개까지 3개월 과정 공개', tags:['#풀업','#상체'], likes:934, comments:73, bookmarks:52, h:33 },
  { id:20, author:'yoga_j',    content:'요가와 웨이트 병행 루틴 소개', tags:['#요가','#루틴'], likes:378, comments:28, bookmarks:16, h:45 },
  { id:21, author:'running_k', content:'10km 달리기 서브40 달성! 페이스 훈련 공유', tags:['#러닝','#페이스'], likes:712, comments:54, bookmarks:33, h:28 },
  { id:22, author:'abs_king',  content:'식스팩 만들기 6개월 식단 전부 공개', tags:['#복근','#식단'], likes:1234, comments:98, bookmarks:76, h:15 },
  { id:23, author:'band_m',    content:'탄성밴드로 집에서 하는 전신 운동', tags:['#밴드','#홈트'], likes:456, comments:34, bookmarks:20, h:52 },
  { id:24, author:'kb_swing',  content:'케틀벨 스윙 100개 챌린지 달성', tags:['#케틀벨','#챌린지'], likes:389, comments:30, bookmarks:15, h:65 },
  { id:25, author:'bench_k',   content:'벤치프레스 100kg 도전기', tags:['#벤치프레스','#PR'], likes:834, comments:64, bookmarks:39, h:22 },
  { id:26, author:'diet_j',    content:'IIFYM 다이어트 한달 후기 솔직하게', tags:['#다이어트','#식단'], likes:623, comments:47, bookmarks:27, h:38 },
  { id:27, author:'foam_roll', content:'폼롤러 전신 마사지 루틴 공유', tags:['#폼롤러','#회복'], likes:345, comments:26, bookmarks:14, h:75 },
];
const Q_DATA = [
  { id:1,  title:'스쿼트할 때 무릎이 아픈데 자세 문제일까요?', body:'스쿼트 할 때마다 무릎 안쪽이 아파서요. 발 너비나 발끝 방향 문제인지 궁금합니다.', tags:['#스쿼트','#자세교정'], likes:34, comments:12, bookmarks:8,  h:5,  hasImg:true  },
  { id:2,  title:'데드리프트 vs 스쿼트 뭘 먼저 하는게 좋아요?', body:'초보자인데 하체 운동 순서가 궁금합니다. 둘 다 중요해서 뭘 먼저 해야 할지 모르겠어요.', tags:['#데드리프트','#루틴'], likes:28, comments:9,  bookmarks:5,  h:12, hasImg:false },
  { id:3,  title:'단백질 섭취 타이밍이 운동 전후 언제가 더 좋나요?', body:'운동 전에 먹으면 소화가 안 될 것 같고 운동 후에 먹으면 효과가 더 좋다고 하는데 실제로 차이 있나요?', tags:['#단백질','#영양'], likes:41, comments:22, bookmarks:15, h:8,  hasImg:false },
  { id:4,  title:'하루에 유산소 몇 분이 적당한가요?', body:'다이어트 목적으로 유산소 운동을 하려고 하는데, 너무 많이 하면 근손실이 온다고 해서요.', tags:['#유산소','#다이어트'], likes:19, comments:7,  bookmarks:3,  h:18, hasImg:false },
  { id:5,  title:'운동 루틴 좀 알려주세요 (주 3회)', body:'운동 시작한지 한 달 됐는데 어떤 순서로 운동해야 효과적인지 모르겠어요.', tags:['#초보자','#루틴'], likes:52, comments:31, bookmarks:18, h:6,  hasImg:false },
  { id:6,  title:'헬스장 vs 홈트 뭐가 더 효과적인가요?', body:'헬스장 등록 고민 중인데 집에서도 충분히 효과를 낼 수 있는지 궁금합니다.', tags:['#홈트','#헬스장'], likes:37, comments:18, bookmarks:9,  h:24, hasImg:true  },
  { id:7,  title:'런닝 후 무릎이 아픈데 어떻게 해야하나요?', body:'5km 이상 뛰면 무릎이 아프기 시작해요. 자세 문제인지 신발 문제인지 모르겠어요.', tags:['#러닝','#무릎'], likes:45, comments:24, bookmarks:12, h:10, hasImg:false },
  { id:8,  title:'이하은을 고발합니다', body:'pt 비용은 다 받아먹고 수업은 매번 지각하고 솔직히 뭘 가르치는지도 잘 모르겠네요. 혹시 저 트레이너 피해받으신 있으신가요? 있다면 같이 힘 합쳐서 환불 받고 싶어요 ㅠㅠ', tags:['#고발','#정트레'], likes:22, comments:4,  bookmarks:3,  h:16, hasImg:true  },
  { id:9,  title:'그룹 라이브 하는데 애 뭐냐?', body:'이 그룹에 정상인들 밖에 없어보여서 이 그룹 들어건데 처음 그룹 라이브 시작하자마자 그룹원 중에 이하은이 운동은 안하고 나만 계속 쳐다보는 거임;; 라이브 끝나면 나한테 연락음 하ㅋ,,,오자마자 바로 차단함', tags:['#그룹라이브','#빌런'], likes:12, comments:7,  bookmarks:8,  h:10, hasImg:true  },
  { id:10, title:'어깨 충돌증후군 있는데 운동해도 될까요?', body:'최근에 어깨 충돌증후군 진단 받았는데 가벼운 운동은 괜찮은지 궁금해요.', tags:['#어깨','#재활'], likes:28, comments:19, bookmarks:11, h:15, hasImg:false },
  { id:11, title:'크레아틴 먹는 시기가 따로 있나요?', body:'크레아틴 보충제 처음 먹어보려는데 언제 먹는 게 가장 효과적인지 알고 싶어요.', tags:['#보충제','#크레아틴'], likes:23, comments:11, bookmarks:6,  h:20, hasImg:false },
  { id:12, title:'풀업 한 개도 못 하는데 어떻게 시작하면 되나요?', body:'철봉에 매달리는 것도 힘든 초보인데 풀업 늘리는 방법이 있을까요?', tags:['#풀업','#상체'], likes:39, comments:21, bookmarks:13, h:9,  hasImg:false },
  { id:13, title:'식사 후 운동까지 얼마나 기다려야 하나요?', body:'밥 먹고 바로 운동하면 안 좋다고 하는데 정확히 얼마나 기다려야 하는지 궁금해요.', tags:['#식단','#타이밍'], likes:17, comments:8,  bookmarks:4,  h:35, hasImg:false },
  { id:14, title:'근육통 있을 때 운동해도 될까요?', body:'어제 운동했는데 다음날 근육통이 심할 때 같은 부위 운동해도 되는지 모르겠어요.', tags:['#근육통','#회복'], likes:44, comments:26, bookmarks:14, h:7,  hasImg:false },
  { id:15, title:'유산소와 웨이트 어떤 순서로 해야 효과적인가요?', body:'같은 날 유산소와 웨이트를 둘 다 하려는데 순서가 결과에 영향이 있나요?', tags:['#유산소','#웨이트'], likes:33, comments:16, bookmarks:9,  h:22, hasImg:false },
  { id:16, title:'다이어트 중 치팅데이 얼마나 자주 해도 되나요?', body:'1주일에 한 번 치팅데이 하면 다이어트에 영향이 많이 가나요?', tags:['#다이어트','#치팅데이'], likes:29, comments:13, bookmarks:7,  h:40, hasImg:false },
  { id:17, title:'벤치프레스 할 때 손목이 아픈데 어떻게 하나요?', body:'벤치프레스 3세트만 해도 손목이 아파서 중단하게 돼요. 그립 문제인가요?', tags:['#벤치프레스','#손목'], likes:21, comments:10, bookmarks:5,  h:28, hasImg:false },
  { id:18, title:'하체 비대칭 교정 운동 추천해주세요', body:'왼쪽 하체가 오른쪽보다 약하고 얇은 편인데 교정하는 방법이 있을까요?', tags:['#하체','#비대칭'], likes:26, comments:14, bookmarks:8,  h:16, hasImg:false },
  { id:19, title:'새벽 운동 vs 저녁 운동 뭐가 더 좋나요?', body:'운동 시간에 따라 효과 차이가 있나요? 생체리듬에 따라 다르다고 하던데.', tags:['#루틴','#시간'], likes:38, comments:20, bookmarks:11, h:32, hasImg:false },
  { id:20, title:'플랭크 얼마나 오래 해야 코어 강화에 효과 있나요?', body:'매일 1분 플랭크 하는데 이 정도면 충분한지 아니면 더 해야 하는지 궁금해요.', tags:['#플랭크','#코어'], likes:30, comments:15, bookmarks:8,  h:11, hasImg:false },
  { id:21, title:'단백질 쉐이크 브랜드 추천해주세요', body:'처음 보충제를 사려는데 가성비 좋고 맛있는 단백질 쉐이크 있으면 추천해주세요.', tags:['#단백질','#보충제'], likes:43, comments:28, bookmarks:16, h:14, hasImg:false },
  { id:22, title:'헬스 초보인데 PT 받아야 할까요?', body:'혼자 유튜브 보면서 운동 중인데 PT를 받으면 얼마나 효과 차이가 나는지 궁금해요.', tags:['#초보자','#PT'], likes:36, comments:22, bookmarks:12, h:19, hasImg:false },
  { id:23, title:'수면 부족할 때 운동하면 역효과인가요?', body:'5시간도 못 잔 날 운동해도 괜찮은지, 아니면 그냥 쉬는 게 나을지 모르겠어요.', tags:['#수면','#회복'], likes:24, comments:11, bookmarks:6,  h:26, hasImg:false },
  { id:24, title:'자전거 vs 트레드밀 유산소 효과 비교', body:'둘 다 비슷한 시간 탈 때 칼로리 소모나 심폐 강화에 차이가 있나요?', tags:['#유산소','#자전거'], likes:19, comments:9,  bookmarks:4,  h:42, hasImg:false },
  { id:25, title:'허리 통증 있는데 할 수 있는 하체 운동 있나요?', body:'허리 디스크 초기 증상이 있는데 스쿼트나 데드리프트 외에 할 수 있는 하체 운동이 있나요?', tags:['#허리','#재활'], likes:47, comments:29, bookmarks:17, h:8,  hasImg:false },
  { id:26, title:'여성도 웨이트 해야 하나요?', body:'여자인데 웨이트 하면 너무 근육질이 될까 봐 걱정되는데 실제로 어떤가요?', tags:['#여성운동','#웨이트'], likes:82, comments:47, bookmarks:31, h:13, hasImg:false },
  { id:27, title:'런닝 페이스 올리는 방법 알려주세요', body:'5km 30분대 수준인데 서브25 목표로 페이스 올리는 훈련 방법이 궁금해요.', tags:['#러닝','#페이스'], likes:27, comments:13, bookmarks:7,  h:36, hasImg:false },
];

/* ── HTML 빌더 ── */
const tagsHtml = tags => tags.map(t => `<span class="hashtag">${t}</span>`).join('');

function liveBadge(n) {
  return `<div class="thumb-live"><div class="live-badge-wrap"><span class="lb">LIVE</span><span class="lc">${fmt(n)}</span></div></div>`;
}

/* ── VOD 시간 포맷 ── */
const fmtDur = s => { const m=Math.floor(s/60),sec=Math.floor(s%60); return `${m}:${String(sec).padStart(2,'0')}`; };

/* 라이브/VOD 피드 유닛 */
function feedHtml(type, d) {
  const isLive = type === 'live';
  const badge  = isLive ? liveBadge(d.viewers) : '';
  const durBadge = (!isLive && d.dur) ? `<div class="vod-dur-badge">${fmtDur(d.dur)}</div>` : '';
  const meta   = isLive
    ? `<span class="feed-meta">${fmt(d.viewers)}명 시청 중</span>`
    : `<span class="feed-meta">조회수 ${fmt(d.views)} · ${timeAgo(d.h)}</span>`;
  const url = isLive ? `/live/${d.id}` : `/vod/${d.id}`;
  return `<div class="feed-unit ani" onclick="location.href='${url}'" style="cursor:pointer"><div class="feed-thumb">${badge}${durBadge}</div><div class="feed-info"><div class="feed-title">${d.title}</div><div class="feed-author"><div class="adot"></div><span>${d.author}</span></div>${meta}<div class="feed-tags">${tagsHtml(d.tags)}</div></div></div><div class="unit-div"></div>`;
}

/* FITS 3열 묶음 */
function fits3Html(items) {
  const cells = items.map(f => `<div class="fits-cell" onclick="location.href='/fits/${f.id}'" style="cursor:pointer"><div class="fits-cell-thumb"></div><div class="fits-cell-author"><div class="adot"></div><span>${f.author}</span></div><div class="fits-cell-title">${f.title}</div></div>`).join('');
  return `<div class="fits3-unit ani"><div class="fits3-grid">${cells}</div></div><div class="unit-div"></div>`;
}

/* FITS 2열 묶음 (FITS 카테고리 추천 - 2개씩 묶음) */
function fits2Html(items) {
  const cells = items.map(f => `<div class="fits2-cell" onclick="location.href='/fits/${f.id}'" style="cursor:pointer"><div class="fits2-thumb"></div><div class="fits2-author"><div class="adot"></div><span>${f.author}</span></div><div class="fits2-title">${f.title}</div></div>`).join('');
  return `<div class="fits2-unit ani"><div class="fits2-grid">${cells}</div></div><div class="unit-div"></div>`;
}

/* ─ 커뮤니티 추천 - 핀터레스트 2열 ─ */
function comRecHtml(items) {
  // 2열로 분리
  const left  = items.filter((_,i) => i % 2 === 0);
  const right = items.filter((_,i) => i % 2 === 1);

  const colHtml = (col, startIdx) => col.map((d, i) => {
    const imgH = IMG_HEIGHTS[(startIdx + i) % IMG_HEIGHTS.length];
    return `<div class="com-rec-item ani" onclick="location.href='/community/${d.id}'" style="cursor:pointer">
      <div class="com-rec-img" style="height:${imgH}px"></div>
      <div class="com-rec-footer">
        <div class="com-rec-header">
          <div class="com-rec-author">
            <div class="com-rec-adot"></div>
            <span class="com-rec-name">${d.author}</span>
          </div>
          <button class="com-rec-sub-btn">구독</button>
        </div>
        <div class="com-rec-reactions">
          <div class="rc">${HEART}${fmt(d.likes)}</div>
          <div class="rc">${COMMENT}${fmt(d.comments)}</div>
          <div class="rc">${BOOKMARK}${fmt(d.bookmarks)}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="com-rec-grid">
    <div>${colHtml(left, 0)}</div>
    <div>${colHtml(right, 1)}</div>
  </div>`;
}

/* ─ 질문 추천 - 1열 카드형 ─ */
function qCardHtml(d) {
  const imgHtml = d.hasImg
    ? `<div class="q-card-img"><div class="q-card-img-half"></div><div class="q-card-img-half"></div></div>`
    : '';
  return `<div class="q-card ani" onclick="location.href='/question/${d.id}'" style="cursor:pointer">
    <div class="q-card-hdr">
      <div class="q-card-author">
        <div class="q-card-pic"></div>
        <span class="q-card-name">jy_piece</span>
      </div>
      <div class="q-card-hdr-right">
        <button class="q-card-sub-btn">구독</button>
        <div class="q-card-more">${MORE_IC}</div>
      </div>
    </div>
    <div class="q-card-title">${d.title}</div>
    <div class="q-card-body">${d.body}</div>
    <div class="q-card-tags">${tagsHtml(d.tags)}</div>
    ${imgHtml}
    <div class="q-card-footer">
      <div class="q-card-reactions">
        <div class="rc">${HEART}${fmt(d.likes)}</div>
        <div class="rc">${COMMENT}${fmt(d.comments)}</div>
        <div class="rc">${BOOKMARK}${fmt(d.bookmarks)}</div>
      </div>
      <span class="q-card-time">${timeAgo(d.h)}</span>
    </div>
  </div>`;
}

/* ─ 전체 카테고리: 커뮤니티 슬라이드 (가로형: 정사각형 이미지 + 우측 텍스트) ─ */
/* ─ 전체 카테고리: 커뮤니티 슬라이드 (가로형 1열 2행) ─ */
function buildAllComSlide(items) {
  const rows = (Array.isArray(items) ? items : [items]).map(d =>
    `<div class="com-pop-slide" onclick="location.href='/community/${d.id}'" style="cursor:pointer">
      <div class="com-pop-sq-img"></div>
      <div class="com-pop-right">
        <div class="com-pop-username">@${d.author}</div>
        <div class="com-pop-content">${d.content}</div>
        <div class="tags" style="margin-bottom:5px">${tagsHtml(d.tags)}</div>
        <div class="com-pop-reactions">
          <div class="rc">${HEART}${fmt(d.likes)}</div>
          <div class="rc">${COMMENT}${fmt(d.comments)}</div>
          <div class="rc">${BOOKMARK}${fmt(d.bookmarks)}</div>
          <span class="com-pop-time">${timeAgo(d.h)}</span>
        </div>
      </div>
    </div>`
  ).join('');
  return `<div class="pop-slide"><div class="com-pop-stack">${rows}</div></div>`;
}

/* ─ 전체 카테고리: 질문 슬라이드 (가로형 1열 2행, 커뮤니티와 동일 크기) ─ */
function buildAllQSlide(pair) {
  const rows = pair.map(q =>
    `<div class="q-pop-row" onclick="location.href='/question/${q.id}'" style="cursor:pointer">
      <div class="q-pop-row-body">
        <div class="q-pop-row-title">${q.title}</div>
        <div class="q-pop-row-text">${q.body}</div>
        <div class="q-pop-row-tags">${tagsHtml(q.tags)}</div>
        <div class="q-pop-row-footer">
          <div class="rc">${HEART}${fmt(q.likes)}</div>
          <div class="rc">${COMMENT}${fmt(q.comments)}</div>
          <div class="rc">${BOOKMARK}${fmt(q.bookmarks)}</div>
          <span class="q-pop-row-time">${timeAgo(q.h)}</span>
        </div>
      </div>
    </div>`
  ).join('');
  return `<div class="pop-slide"><div style="display:flex;flex-direction:column;gap:8px">${rows}</div></div>`;
}

/* 스켈레톤 */
function skHtml(n = 3) {
  return Array.from({length:n}, () => `<div class="sk-wrap"><div class="sk sk-thumb"></div><div class="sk-info"><div class="sk sk-line sk-w100"></div><div class="sk sk-line sk-w80"></div><div class="sk sk-line sk-w40"></div></div></div>`).join('');
}

/* ── 전체 카테고리 인기 슬라이드 빌더 ── */
function buildAllPopSlides() {
  const liveTop = [...LIVE_DATA].sort((a,b) => b.viewers - a.viewers)[0];
  const vodTop  = [...VOD_DATA].sort((a,b) => popScore(b.views,b.h) - popScore(a.views,a.h))[0];
  const fitsTop = [...FITS_DATA].sort((a,b) => popScore(b.views,b.h) - popScore(a.views,a.h)).slice(0,2);
  const comTop  = [...COM_DATA].sort((a,b) => popScore(b.likes,b.h) - popScore(a.likes,a.h)).slice(0,2);
  const qTop    = [...Q_DATA].sort((a,b) => popScore(b.likes,b.h) - popScore(a.likes,a.h)).slice(0,2);

  return [
    /* 라이브 - 16:9 */
    `<div class="pop-slide" onclick="location.href='/live/${liveTop.id}'" style="cursor:pointer"><div class="slide-thumb-169">${liveBadge(liveTop.viewers)}</div><div class="slide-info"><div class="prof-dot"></div><div class="slide-meta"><div class="slide-title">${liveTop.title}</div><div class="slide-author">${liveTop.author}</div><div class="tags">${tagsHtml(liveTop.tags)}</div></div></div></div>`,
    /* VOD - 16:9 */
    `<div class="pop-slide" onclick="location.href='/vod/${vodTop.id}'" style="cursor:pointer"><div class="slide-thumb-169"><div class="slide-dur-badge">${fmtDur(vodTop.dur||0)}</div></div><div class="slide-info"><div class="prof-dot"></div><div class="slide-meta"><div class="slide-title">${vodTop.title}</div><div class="slide-author">${vodTop.author}</div><div class="slide-sub">조회수 ${fmt(vodTop.views)} · ${timeAgo(vodTop.h)}</div><div class="tags">${tagsHtml(vodTop.tags)}</div></div></div></div>`,
    /* FITS - 2개 */
    `<div class="pop-slide"><div class="slide-2col">${fitsTop.map(f => `<div class="fits-pop-card" onclick="location.href='/fits/${f.id}'" style="cursor:pointer"><div class="fits-pop-thumb"></div><div class="fits-pop-author"><div class="adot"></div><span>${f.author}</span></div><div class="fits-pop-title">${f.title}</div></div>`).join('')}</div></div>`,
    /* 커뮤니티 - 가로형 */
    buildAllComSlide(comTop),
    /* 질문 - 가로형 */
    buildAllQSlide(qTop),
  ];
}

/* ── 카테고리별 인기 슬라이드 빌더 ── */
function buildCatPopSlides(type) {
  if (type === 'live') {
    return [...LIVE_DATA].sort((a,b) => b.viewers - a.viewers).slice(0,5).map(d =>
      `<div class="pop-slide" onclick="location.href='/live/${d.id}'" style="cursor:pointer"><div class="slide-thumb-169">${liveBadge(d.viewers)}</div><div class="slide-info"><div class="prof-dot"></div><div class="slide-meta"><div class="slide-title">${d.title}</div><div class="slide-author">${d.author}</div><div class="slide-sub">${fmt(d.viewers)}명 시청 중</div><div class="tags">${tagsHtml(d.tags)}</div></div></div></div>`
    );
  }
  if (type === 'vod') {
    return [...VOD_DATA].sort((a,b) => popScore(b.views,b.h)-popScore(a.views,a.h)).slice(0,5).map(d =>
      `<div class="pop-slide" onclick="location.href='/vod/${d.id}'" style="cursor:pointer"><div class="slide-thumb-169"><div class="slide-dur-badge">${fmtDur(d.dur||0)}</div></div><div class="slide-info"><div class="prof-dot"></div><div class="slide-meta"><div class="slide-title">${d.title}</div><div class="slide-author">${d.author}</div><div class="slide-sub">조회수 ${fmt(d.views)} · ${timeAgo(d.h)}</div><div class="tags">${tagsHtml(d.tags)}</div></div></div></div>`
    );
  }
  if (type === 'fits') {
    /* TOP10 → 5슬라이드, 슬라이드당 2개 */
    const sorted = [...FITS_DATA].sort((a,b) => popScore(b.views,b.h)-popScore(a.views,a.h)).slice(0,10);
    const slides = [];
    for (let i = 0; i < sorted.length; i += 2) {
      const pair = sorted.slice(i, i+2);
      slides.push(`<div class="pop-slide"><div class="slide-2col">${pair.map(f => `<div class="fits-pop-card" onclick="location.href='/fits/${f.id}'" style="cursor:pointer"><div class="fits-pop-thumb"></div><div class="fits-pop-author"><div class="adot"></div><span>${f.author}</span></div><div class="fits-pop-title">${f.title}</div></div>`).join('')}</div></div>`);
    }
    return slides;
  }
  if (type === 'community') {
    /* TOP5 → 5슬라이드, 각 가로형 (이미지+텍스트) */
    return [...COM_DATA].sort((a,b) => popScore(b.likes,b.h)-popScore(a.likes,a.h)).slice(0,5).map(d => buildAllComSlide(d));
  }
  if (type === 'question') {
    /* TOP10 → 5슬라이드, 슬라이드당 2개 카드 */
    const sorted = [...Q_DATA].sort((a,b) => popScore(b.likes,b.h)-popScore(a.likes,a.h)).slice(0,10);
    const slides = [];
    for (let i = 0; i < sorted.length; i += 2) {
      slides.push(buildAllQSlide(sorted.slice(i, i+2)));
    }
    return slides;
  }
  return [];
}

/* ── 캐러셀 DOM 빌더 + 초기화 ── */
function buildAndInitCarousel(containerId, slides) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const dotsHtml = slides.map((_,i) => `<div class="dot${i===0?' active':''}"></div>`).join('');
  container.innerHTML = `<div class="pop-carousel"><div class="pop-track">${slides.join('')}</div></div><div class="pop-dots">${dotsHtml}</div>`;
  const track = container.querySelector('.pop-track');
  const dotsEl = container.querySelector('.pop-dots');
  initCarousel(track, dotsEl);
}

/* ── 캐러셀 팩토리 (snap 스와이프 + 자동 슬라이드) ── */
function initCarousel(trackEl, dotsEl) {
  const dots = dotsEl.querySelectorAll('.dot');
  let cur = 0, timer;
  let tx = 0, ty = 0, dragging = false, moved = false;

  function go(n) {
    cur = (n + dots.length) % dots.length;
    trackEl.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1)';
    trackEl.style.transform  = `translateX(-${cur * 100}%)`;
    dots.forEach((d,i) => d.classList.toggle('active', i === cur));
  }
  function start() { timer = setInterval(() => go(cur + 1), 3500); }
  function stop()  { clearInterval(timer); }

  dots.forEach((d,i) => d.addEventListener('click', () => { stop(); go(i); start(); }));

  const wrap = trackEl.parentElement;

  wrap.addEventListener('touchstart', e => {
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
    dragging = true; moved = false;
    stop();
    trackEl.style.transition = 'none';
  }, {passive:true});

  wrap.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - tx;
    const dy = e.touches[0].clientY - ty;
    /* 세로 스크롤 의도면 캐러셀 무시 */
    if (!moved && Math.abs(dy) > Math.abs(dx)) { dragging = false; start(); return; }
    moved = true;
    /* 실시간으로 손가락 따라 이동 (snap 느낌) */
    const offset = -(cur * 100) + (dx / wrap.offsetWidth * 100);
    trackEl.style.transform = `translateX(${offset}%)`;
  }, {passive:true});

  wrap.addEventListener('touchend', e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - tx;
    /* 30px 이상 끌었을 때 페이지 전환, 아니면 제자리로 snap */
    if (Math.abs(dx) > 30) {
      go(cur + (dx < 0 ? 1 : -1));
    } else {
      trackEl.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1)';
      trackEl.style.transform  = `translateX(-${cur * 100}%)`;
    }
    start();
  });

  start();
}

/* ── 추천 피드 렌더 ── */
function renderRecommendFeed(containerId, type) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = skHtml(4);

  setTimeout(() => {
    let html = '';

    if (type === 'all') {
      /* 27 unit: 라이브9, VOD12, FITS3묶음×3, 커뮤니티2, 질문2 */
      const pool = [
        ...Array.from({length:9},  (_,i) => ({t:'live', d:LIVE_DATA[i%LIVE_DATA.length]})),
        ...Array.from({length:12}, (_,i) => ({t:'vod',  d:VOD_DATA[i%VOD_DATA.length]})),
        {t:'fits3', items:FITS_DATA.slice(0,3)},
        {t:'fits3', items:FITS_DATA.slice(3,6)},
        {t:'fits3', items:FITS_DATA.slice(6,9)},
        ...Array.from({length:2}, (_,i) => ({t:'community', d:COM_DATA[i]})),
        ...Array.from({length:2}, (_,i) => ({t:'question',  d:Q_DATA[i]})),
      ];
      html = shuffle(pool).map(item => {
        if (item.t==='live')      return feedHtml('live', item.d);
        if (item.t==='vod')       return feedHtml('vod',  item.d);
        if (item.t==='fits3')     return fits3Html(item.items);
        /* 전체 커뮤니티/질문 유닛은 간략 단일 카드형 유지 */
        if (item.t==='community') return `<div class="com-unit ani" onclick="location.href='/community/${item.d.id}'" style="padding:10px 16px;cursor:pointer;border-bottom:1px solid #f2f2f2"><div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><div style="width:28px;height:28px;border-radius:50%;background:#e5e5e5;flex-shrink:0"></div><span style="font-size:12px;font-weight:600">@${item.d.author}</span></div><div style="font-size:13px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:4px">${item.d.content}</div><div style="display:flex;gap:4px;margin-bottom:4px">${tagsHtml(item.d.tags)}</div><div style="display:flex;gap:8px;font-size:11px;color:#666">${HEART}${fmt(item.d.likes)}&nbsp;${COMMENT}${fmt(item.d.comments)}&nbsp;<span style="margin-left:auto;color:#999">${timeAgo(item.d.h)}</span></div></div>`;
        if (item.t==='question')  return `<div onclick="location.href='/question/${item.d.id}'" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #f2f2f2" class="ani"><div style="font-size:13px;font-weight:600;margin-bottom:3px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${item.d.title}</div><div style="font-size:12px;color:#666;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:4px">${item.d.body}</div><div style="display:flex;gap:8px;font-size:11px;color:#666">${HEART}${fmt(item.d.likes)}&nbsp;${COMMENT}${fmt(item.d.comments)}&nbsp;<span style="margin-left:auto;color:#999">${timeAgo(item.d.h)}</span></div></div>`;
        return '';
      }).join('');

    } else if (type === 'live') {
      html = shuffle(Array.from({length:27},(_,i)=>LIVE_DATA[i%LIVE_DATA.length])).map(d=>feedHtml('live',d)).join('');

    } else if (type === 'vod') {
      html = shuffle(Array.from({length:27},(_,i)=>VOD_DATA[i%VOD_DATA.length])).map(d=>feedHtml('vod',d)).join('');

    } else if (type === 'fits') {
      /* FITS 추천: 27개 → 2개씩 묶음 (13묶음+1개) */
      const items = shuffle(Array.from({length:27},(_,i)=>FITS_DATA[i%FITS_DATA.length]));
      for (let i = 0; i < 27; i += 2) {
        html += fits2Html(items.slice(i, Math.min(i+2, 27)));
      }

    } else if (type === 'community') {
      /* 커뮤니티 추천: 27개 핀터레스트 2열 */
      const items = shuffle(Array.from({length:27},(_,i)=>COM_DATA[i%COM_DATA.length]));
      html = comRecHtml(items);

    } else if (type === 'question') {
      /* 질문 추천: 27개 1열 카드형 */
      html = shuffle(Array.from({length:27},(_,i)=>Q_DATA[i%Q_DATA.length])).map(d=>qCardHtml(d)).join('');
    }

    el.innerHTML = html;
    observeAni(el);
  }, 600);
}

/* ── IntersectionObserver 애니메이션 ── */
function observeAni(container) {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e,i) => {
      if (e.isIntersecting) {
        setTimeout(() => { e.target.style.animationPlayState = 'running'; }, i * 40);
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.05});
  container.querySelectorAll('.ani').forEach(el => { el.style.animationPlayState = 'paused'; io.observe(el); });
}

/* ── 카테고리 탭 ── */
function initCategoryTabs() {
  const tabs    = document.querySelectorAll('.cat-tab');
  const screens = document.querySelectorAll('.cat-screen');
  const types   = ['all','live','vod','fits','community','question'];
  let active = 0, lock = false;
  const initialized = new Set(['all']);

  /* PTR에서 현재 탭 타입을 알 수 있도록 노출 */
  window._getActiveFeedInfo = () => ({
    type:    types[active],
    feedId: `rec-feed-${types[active]}`,
  });

  function activate(idx) {
    if (lock || idx === active) return;
    lock = true; setTimeout(() => { lock = false; }, 500);
    tabs[active].classList.remove('active');
    screens[active].classList.remove('active');
    active = idx;
    tabs[active].classList.add('active');
    screens[active].classList.add('active');
    window.scrollTo({top:0});

    const type = types[idx];
    if (!initialized.has(type)) {
      initialized.add(type);
      buildAndInitCarousel(`pop-car-${type}`, buildCatPopSlides(type));
      renderRecommendFeed(`rec-feed-${type}`, type);
    }
  }
  tabs.forEach((t,i) => t.addEventListener('click', () => activate(i)));
}

/* ── Pull to Refresh ── */
function initPTR(onRefresh) {
  const ptr = document.getElementById('ptr');
  const THRESH = 70;
  let sy = 0, pulling = false, refreshing = false;

  /* ── 터치 방식 (모바일) ── */
  document.addEventListener('touchstart', e => {
    if (window.scrollY === 0) { sy = e.touches[0].clientY; pulling = true; }
  }, {passive:true});
  document.addEventListener('touchmove', e => {
    if (!pulling || refreshing) return;
    const dist = e.touches[0].clientY - sy;
    if (dist <= 0) return;
    const prog = Math.min(dist / THRESH, 1);
    ptr.style.transform = `translateX(-50%) translateY(${prog * 60 - 64}px)`;
    ptr.classList.toggle('show',  dist > 10);
    ptr.classList.toggle('ready', dist >= THRESH);
  }, {passive:true});
  document.addEventListener('touchend', () => {
    if (!pulling || refreshing) { pulling = false; return; }
    pulling = false;
    if (!ptr.classList.contains('ready')) {
      ptr.style.transform = 'translateX(-50%) translateY(-64px)';
      ptr.classList.remove('show','ready'); return;
    }
    refreshing = true;
    ptr.classList.add('spin'); ptr.classList.remove('ready');
    ptr.style.transform = 'translateX(-50%) translateY(8px)';
    onRefresh(() => { refreshing = false; ptr.classList.remove('spin','show'); ptr.style.transform = 'translateX(-50%) translateY(-64px)'; });
  });

  /* ── 트랙패드 / 마우스휠 방식 (노트북) ── */
  /* 최상단에서 두 손가락을 위로 올리면(deltaY < 0) PTR 발동 */
  let wheelAcc = 0, wheelTimer = null;
  document.addEventListener('wheel', e => {
    if (refreshing) return;
    /* 최상단이 아니면 무시 */
    if (window.scrollY > 0) { wheelAcc = 0; return; }
    /* 아래로 스크롤(deltaY > 0)이면 무시 */
    if (e.deltaY >= 0) { wheelAcc = 0; return; }
    /* 위로 스크롤 누적 */
    wheelAcc += Math.abs(e.deltaY);
    const prog = Math.min(wheelAcc / 200, 1);
    ptr.style.transform = `translateX(-50%) translateY(${prog * 60 - 64}px)`;
    ptr.classList.toggle('show',  wheelAcc > 20);
    ptr.classList.toggle('ready', wheelAcc >= 200);
    /* 타이머: 휠이 멈추면 발동 여부 결정 */
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      if (!refreshing && ptr.classList.contains('ready')) {
        refreshing = true;
        ptr.classList.add('spin'); ptr.classList.remove('ready');
        ptr.style.transform = 'translateX(-50%) translateY(8px)';
        onRefresh(() => {
          refreshing = false;
          ptr.classList.remove('spin','show');
          ptr.style.transform = 'translateX(-50%) translateY(-64px)';
        });
      } else {
        ptr.style.transform = 'translateX(-50%) translateY(-64px)';
        ptr.classList.remove('show','ready');
      }
      wheelAcc = 0;
    }, 150);
  }, {passive:true});
}

/* ── 스크롤 헤더 ── */
function initScrollHeader() {
  const hdr = document.querySelector('.top-header');
  let tick = false;
  window.addEventListener('scroll', () => {
    if (!tick) { requestAnimationFrame(() => { hdr.classList.toggle('scrolled', window.scrollY > 60); tick = false; }); tick = true; }
  });
}

/* ── 검색 ── */
const RK = 'fito_recent';
const getRecent = () => { try { return JSON.parse(localStorage.getItem(RK))||[]; } catch { return []; }};
const saveRecent = l => localStorage.setItem(RK, JSON.stringify(l));
const addRecent  = w => { let l=getRecent().filter(x=>x!==w); l.unshift(w); if(l.length>50) l=l.slice(0,50); saveRecent(l); };
const rmRecent   = w => saveRecent(getRecent().filter(x=>x!==w));

function initSearch() {
  const ov      = document.getElementById('search-ov');
  const input   = document.getElementById('srch-input');
  const clear   = document.getElementById('srch-clear');
  const back    = document.getElementById('srch-back');
  const recWrap = document.getElementById('rec-wrap');
  const relWrap = document.getElementById('rel-wrap');
  const resWrap = document.getElementById('res-wrap');

  const showSection = w => {
    recWrap.style.display = w==='rec'?'block':'none';
    relWrap.style.display = w==='rel'?'block':'none';
    resWrap.style.display = w==='res'?'block':'none';
  };
  const open  = () => { ov.classList.add('open'); setTimeout(()=>input.focus(),100); renderRecent(); };
  const close = () => { ov.classList.remove('open'); input.value=''; showSection('rec'); };

  function renderRecent() {
    showSection('rec');
    const list = getRecent().slice(0,10);
    document.getElementById('rec-list').innerHTML = list.length
      ? list.map(w=>`<div class="recent-item"><div class="recent-l" data-w="${w}">${CLOCK_IC}${w}</div><div class="recent-x" data-w="${w}">${CLOSE_IC}</div></div>`).join('')
      : `<div style="color:#999;font-size:13px;padding:12px 0">최근 검색 기록이 없습니다</div>`;
    document.querySelectorAll('.recent-l[data-w]').forEach(el => {
      el.addEventListener('click', () => {
        const w = el.dataset.w;
        input.value = w;
        clear.style.display = 'flex';
        /* 렌더링 완료 후 검색 실행 */
        requestAnimationFrame(() => doSearch(w));
      });
    });
    document.querySelectorAll('.recent-x[data-w]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();rmRecent(el.dataset.w);renderRecent();}));
  }
  function renderRelated(q) {
    showSection('rel');
    /* 실제 데이터 title/author/tags에서 q로 시작하는 단어 추출 */
    const pool = new Set();
    const add = (str) => { if(str && str.toLowerCase().startsWith(q.toLowerCase())) pool.add(str); };
    [...LIVE_DATA,...VOD_DATA,...FITS_DATA].forEach(d => {
      add(d.title); add(d.author); (d.tags||[]).forEach(t => add(t.replace('#','')));
    });
    [...COM_DATA].forEach(d => { (d.tags||[]).forEach(t => add(t.replace('#',''))); });
    [...Q_DATA].forEach(d => { add(d.title); (d.tags||[]).forEach(t => add(t.replace('#',''))); });
    const rel = [...pool].slice(0, 10);
    document.getElementById('rel-list').innerHTML = rel.length
      ? rel.map(w=>`<div class="related-item" data-w="${w}">${ARROW}${w}</div>`).join('')
      : `<div style="color:#999;font-size:13px;padding:12px 0">연관 검색어가 없습니다</div>`;
    document.querySelectorAll('.related-item[data-w]').forEach(el=>el.addEventListener('click',()=>{input.value=el.dataset.w;doSearch(el.dataset.w);}));
  }
  function doSearch(q) {
    if (!q.trim()) { renderRecent(); return; }
    addRecent(q.trim());
    showSection('res');

    /* ── 전체 카테고리 검색 ── */
    const matchStr = (v) => v && String(v).toLowerCase().includes(q.toLowerCase());
    const matchItem = (item, fields) => fields.some(f => {
      const v = item[f];
      if (Array.isArray(v)) return v.some(t => matchStr(t));
      return matchStr(v);
    });

    const results = {
      live:      LIVE_DATA.filter(d => matchItem(d, ['title','author','tags'])),
      vod:       VOD_DATA.filter(d =>  matchItem(d, ['title','author','tags'])),
      fits:      FITS_DATA.filter(d => matchItem(d, ['title','author','tags'])),
      community: COM_DATA.filter(d =>  matchItem(d, ['content','author','tags'])),
      question:  Q_DATA.filter(d =>   matchItem(d, ['title','body','author','tags'])),
    };
    const totalCount = Object.values(results).reduce((s,a) => s + a.length, 0);

    /* 오타 교정 */
    const TYPOS = {'스쿽트':'스쿼트','혹트':'홈트','스쿼터':'스쿼트','필라':'필라테스'};
    const typo = TYPOS[q];

    let html = '';
    if (typo) {
      html += `<div class="did-you-mean">혹시 <span id="dym" style="cursor:pointer;color:#4b668b;font-weight:700">${typo}</span> 을(를) 찾으셨나요?</div>`;
    }
    if (totalCount === 0 && !typo) {
      html += `<div class="no-result">🔍 "<strong>${q}</strong>"에 대한 결과가 없습니다</div>`;
      document.getElementById('res-content').innerHTML = html;
      return;
    }

    /* 탭 + 필터 */
    html += `
      <div class="srch-tabs" id="srch-tabs">
        <div class="s-tab active" data-cat="all">전체</div>
        <div class="s-tab" data-cat="live">라이브</div>
        <div class="s-tab" data-cat="vod">VOD</div>
        <div class="s-tab" data-cat="fits">FITS</div>
        <div class="s-tab" data-cat="community">커뮤니티</div>
        <div class="s-tab" data-cat="question">질문</div>
      </div>
      <div class="srch-filters" id="srch-filters">
        <div class="f-btn active" data-sort="popular">인기순</div>
        <div class="f-btn" data-sort="recent">최신순</div>
      </div>
      <div id="srch-results-body"></div>`;

    document.getElementById('res-content').innerHTML = html;

    const dymEl = document.getElementById('dym');
    if (dymEl) dymEl.addEventListener('click', () => { input.value = dymEl.textContent; doSearch(dymEl.textContent); });

    let curCat = 'all', curSort = 'popular';

    const sortArr = (arr, type) => {
      const a = [...arr];
      if (curSort === 'popular') {
        if (type === 'live') return a.sort((x,y) => y.viewers - x.viewers);
        if (type === 'community' || type === 'question') return a.sort((x,y) => y.likes - x.likes);
        return a.sort((x,y) => y.views - x.views);
      }
      return a.sort((x,y) => x.h - y.h); /* 최신순 */
    };

    const mkFits = (arr) => sortArr(arr,'fits').map(d =>
      `<div onclick="location.href='/fits/${d.id}'" style="display:flex;gap:12px;padding:10px 16px;cursor:pointer;border-bottom:1px solid #f2f2f2;align-items:center">
        <div style="width:80px;height:80px;background:var(--gray-200);border-radius:6px;flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;margin-bottom:4px">${d.title}</div>
          <div style="font-size:12px;color:#666">${d.author}</div>
          <div style="margin-top:3px">${tagsHtml(d.tags)}</div>
        </div>
      </div>`).join('');
    const mkCom = (arr) => sortArr(arr,'community').map(d =>
      `<div onclick="location.href='/community/${d.id}'" style="padding:10px 16px;cursor:pointer;border-bottom:1px solid #f2f2f2">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <div style="width:26px;height:26px;border-radius:50%;background:#e5e5e5;flex-shrink:0"></div>
          <span style="font-size:12px;font-weight:600">@${d.author}</span>
          <span style="font-size:11px;color:#999;margin-left:auto">${timeAgo(d.h)}</span>
        </div>
        <div style="font-size:13px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:4px">${d.content}</div>
        <div style="margin-bottom:4px">${tagsHtml(d.tags)}</div>
        <div style="display:flex;gap:8px;font-size:11px;color:#666">${HEART}${fmt(d.likes)}&nbsp;${COMMENT}${fmt(d.comments)}</div>
      </div>`).join('');
    const mkQ = (arr) => sortArr(arr,'question').map(d =>
      `<div onclick="location.href='/question/${d.id}'" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #f2f2f2">
        <div style="font-size:13px;font-weight:700;margin-bottom:3px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${d.title}</div>
        <div style="font-size:12px;color:#666;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:4px">${d.body}</div>
        <div style="margin-bottom:4px">${tagsHtml(d.tags)}</div>
        <div style="display:flex;gap:8px;font-size:11px;color:#666">${HEART}${fmt(d.likes)}&nbsp;${COMMENT}${fmt(d.comments)}&nbsp;<span style="margin-left:auto;color:#999">${timeAgo(d.h)}</span></div>
      </div>`).join('');

    const noRes = `<div style="padding:32px 16px;text-align:center;color:#999;font-size:13px">이 카테고리에서 결과가 없습니다</div>`;

    function renderResults() {
      const body = document.getElementById('srch-results-body');
      if (!body) return;
      let out = '';
      if (curCat === 'all') {
        if (results.live.length)      out += `<div class="srch-cat-label">라이브</div>${sortArr(results.live,'live').map(d=>feedHtml('live',d)).join('')}`;
        if (results.vod.length)       out += `<div class="srch-cat-label">VOD</div>${sortArr(results.vod,'vod').map(d=>feedHtml('vod',d)).join('')}`;
        if (results.fits.length)      out += `<div class="srch-cat-label">FITS</div>${mkFits(results.fits)}`;
        if (results.community.length) out += `<div class="srch-cat-label">커뮤니티</div>${mkCom(results.community)}`;
        if (results.question.length)  out += `<div class="srch-cat-label">질문</div>${mkQ(results.question)}`;
      } else if (curCat === 'live')      out = results.live.length      ? sortArr(results.live,'live').map(d=>feedHtml('live',d)).join('') : noRes;
        else if (curCat === 'vod')       out = results.vod.length       ? sortArr(results.vod,'vod').map(d=>feedHtml('vod',d)).join('')   : noRes;
        else if (curCat === 'fits')      out = results.fits.length      ? mkFits(results.fits)      : noRes;
        else if (curCat === 'community') out = results.community.length ? mkCom(results.community)  : noRes;
        else if (curCat === 'question')  out = results.question.length  ? mkQ(results.question)     : noRes;
      body.innerHTML = out || noRes;
    }

    renderResults();

    document.querySelectorAll('#srch-tabs .s-tab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('#srch-tabs .s-tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        curCat = t.dataset.cat;
        renderResults();
      });
    });
    document.querySelectorAll('#srch-filters .f-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#srch-filters .f-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        curSort = b.dataset.sort;
        renderResults();
      });
    });
  }

  document.querySelectorAll('.search-bar,.hdr-search-ic,.cat-search-btn').forEach(el=>el.addEventListener('click',open));
  back.addEventListener('click',close);
  clear.addEventListener('click',()=>{input.value='';clear.style.display='none';renderRecent();input.focus();});
  input.addEventListener('input',()=>{const q=input.value.trim();clear.style.display=q?'flex':'none';q?renderRelated(q):renderRecent();});
  input.addEventListener('keydown',e=>{if(e.key==='Enter') doSearch(input.value.trim());});
  document.getElementById('rec-clear-all').addEventListener('click',()=>{saveRecent([]);renderRecent();});
}

/* ── 접속 주기 UX ── */
function checkFlow() {
  const last = localStorage.getItem('fito_last');
  const isNew = !localStorage.getItem('fito_user');
  const now = Date.now();
  localStorage.setItem('fito_last', now);
  if (isNew) localStorage.setItem('fito_user','1');
  if (isNew) setTimeout(()=>document.getElementById('modal-tutorial').classList.add('open'),500);
  else if (last && now-Number(last)>7*24*60*60*1000) setTimeout(()=>document.getElementById('modal-welcome').classList.add('open'),500);
}

function initModals() {
  document.querySelectorAll('.modal-confirm').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.modal-ov').classList.remove('open')));
  document.querySelectorAll('.modal-ov').forEach(ov=>ov.addEventListener('click',e=>{if(e.target===ov) ov.classList.remove('open');}));
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollHeader();
  initCategoryTabs();
  initSearch();
  initModals();
  checkFlow();
  buildAndInitCarousel('pop-car-all', buildAllPopSlides());
  renderRecommendFeed('rec-feed-all', 'all');
  initPTR(done => {
    const info = window._getActiveFeedInfo ? window._getActiveFeedInfo() : { type:'all', feedId:'rec-feed-all' };
    renderRecommendFeed(info.feedId, info.type);
    setTimeout(done, 800);
  });
});