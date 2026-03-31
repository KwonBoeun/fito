/* ===========================
   FITO - 그룹 목록/검색 JS
   =========================== */

/* ── Mock 데이터 ── */
const JOINED_GROUPS = [
  { id:1, name:'하체 마스터 클럽', members:32, liveCnt:5, chatCnt:128, tags:['#하체','#스쿼트'], hasLive:true, liveViewers:6, inactive:false },
  { id:2, name:'아침 러닝 크루', members:18, liveCnt:3, chatCnt:85, tags:['#러닝','#아침운동'], hasLive:false, liveViewers:0, inactive:false },
  { id:3, name:'홈트 같이해요', members:45, liveCnt:8, chatCnt:240, tags:['#홈트','#초보자'], hasLive:true, liveViewers:4, inactive:false },
  { id:4, name:'코어 챌린지 30일', members:22, liveCnt:2, chatCnt:67, tags:['#코어','#챌린지'], hasLive:false, liveViewers:0, inactive:false },
  { id:5, name:'다이어트 식단 공유', members:61, liveCnt:0, chatCnt:3, tags:['#다이어트','#식단'], hasLive:false, liveViewers:0, inactive:true },
];

const RECOMMEND_GROUPS = [
  { id:101, name:'풀업 마스터', members:28, tags:['#풀업','#상체'], desc:'풀업 0개에서 10개까지 함께 도전' },
  { id:102, name:'필라테스 러버즈', members:53, tags:['#필라테스','#유연성'], desc:'매일 필라테스 루틴 공유' },
  { id:103, name:'벌크업 식단연구소', members:37, tags:['#벌크업','#식단'], desc:'벌크업을 위한 식단과 운동 공유' },
];

/* ── 검색 필터 (한글, 영어만 허용, 특수문자 금지) ── */
const searchInput = document.getElementById('groupSearchInput');
searchInput.addEventListener('input', () => {
  let val = searchInput.value;
  // 특수문자 제거 (한글, 영어, 숫자, 공백만 허용)
  val = val.replace(/[^가-힣a-zA-Z0-9\s]/g, '');
  if (val !== searchInput.value) {
    searchInput.value = val;
    showSnackbar('특수문자는 사용할 수 없습니다.');
  }
  renderGroups(val.trim());
});

/* ── 그룹 리스트 렌더링 ── */
function renderGroups(query) {
  const list = document.getElementById('groupList');
  const empty = document.getElementById('emptyState');
  const banner = document.getElementById('recommendBanner');

  let joined = [...JOINED_GROUPS];
  let recommend = [...RECOMMEND_GROUPS];

  // 검색 필터
  if (query) {
    joined = joined.filter(g => g.name.includes(query) || g.tags.some(t => t.includes(query)));
    recommend = recommend.filter(g => g.name.includes(query) || g.tags.some(t => t.includes(query)));
  }

  // 활동량 정렬 (비활성 그룹 후순위)
  joined.sort((a, b) => {
    if (a.inactive !== b.inactive) return a.inactive ? 1 : -1;
    return (b.liveCnt + b.chatCnt) - (a.liveCnt + a.chatCnt);
  });

  let html = '';

  if (joined.length > 0) {
    html += '<div class="gp-list-section-title">나의 그룹</div>';
    html += joined.map(g => groupCardHtml(g, 'joined')).join('');

    // 가끔 추천 배너 (50% 확률)
    if (Math.random() > 0.5 && recommend.length > 0) {
      const pick = recommend[Math.floor(Math.random() * recommend.length)];
      document.getElementById('recommendText').textContent =
        `회원님을 위한 추천그룹 <${pick.name}>가 있어요!`;
      banner.style.display = 'block';
    }
  } else if (recommend.length > 0) {
    html += '<div class="gp-list-section-title">추천 그룹</div>';
    html += recommend.map(g => groupCardHtml(g, 'recommend')).join('');
    banner.style.display = 'none';
  }

  if (!joined.length && !recommend.length && query) {
    empty.style.display = 'block';
    list.innerHTML = '';
  } else {
    empty.style.display = 'none';
    list.innerHTML = html;
  }
}

function groupCardHtml(g, type) {
  const inactiveClass = g.inactive ? ' inactive' : '';
  const liveBadge = g.hasLive
    ? `<span class="gp-card-live-badge">LIVE ${g.liveViewers}명</span>`
    : '';
  const membersText = `멤버 ${g.members}명`;
  const tags = g.tags.map(t => `<span class="gp-card-tag">${t}</span>`).join('');

  return `<div class="gp-card ani${inactiveClass}" onclick="goGroupMain(${g.id})">
    <div class="gp-card-img"></div>
    <div class="gp-card-info">
      <div class="gp-card-name">${g.name}</div>
      <div class="gp-card-meta">${membersText} ${liveBadge}</div>
      <div class="gp-card-tags">${tags}</div>
    </div>
  </div>`;
}

/* ── 그룹 이동 ── */
function goGroupMain(id) {
  location.href = `/group/main?id=${id}`;
}

/* ── 그룹 만들기 ── */
function onCreateGroupClick() {
  document.getElementById('createConfirmModal').classList.add('open');
}
function closeCreateModal() {
  document.getElementById('createConfirmModal').classList.remove('open');
}
function goCreateGroup() {
  closeCreateModal();
  location.href = '/group/create';
}

/* ── 스낵바 ── */
function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg;
  sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 3000);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  renderGroups('');
});
