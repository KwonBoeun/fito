/* ===========================
   FITO - PT 메인화면 JS
   =========================== */

/* ── Mock 데이터 ── */
const USER_NICKNAME = '김땡땡';

const SUBSCRIBED_TRAINERS = [
  { id: 1, name: '김맹맹 트레이너', isLive: true, liveElapsed: '55:55', liveParticipants: 2 },
  { id: 2, name: '박소연 트레이너', isLive: false },
  { id: 3, name: '이민호 트레이너', isLive: false },
];

const INTEREST_CATEGORIES = [
  {
    tag: '#가벼운_운동', trainers: [
      { name: '김트레', cat: '#유산소' }, { name: '김트레', cat: '#하체운동' },
      { name: '김트레', cat: '#상체운동' }, { name: '김트레', cat: '#유산소' },
      { name: '김트레', cat: '#코어' },   { name: '김트레', cat: '#전신' },
    ]
  },
  {
    tag: '#가버운_운동_그리고_빠른_다이어트', trainers: [
      { name: '박트레', cat: '#다이어트' }, { name: '이트레', cat: '#유산소' },
      { name: '최트레', cat: '#하체' },    { name: '정트레', cat: '#전신' },
      { name: '강트레', cat: '#코어' },    { name: '윤트레', cat: '#상체' },
    ]
  },
  {
    tag: '#근력운동', trainers: [
      { name: '한트레', cat: '#근력' }, { name: '오트레', cat: '#벌크업' },
      { name: '서트레', cat: '#상체' }, { name: '신트레', cat: '#하체' },
      { name: '권트레', cat: '#코어' }, { name: '황트레', cat: '#전신' },
    ]
  },
  {
    tag: '#여성_트레이너', trainers: [
      { name: '김소연', cat: '#유산소' }, { name: '이지은', cat: '#필라테스' },
      { name: '박민지', cat: '#요가' },  { name: '최수빈', cat: '#다이어트' },
      { name: '정나연', cat: '#코어' },  { name: '강혜린', cat: '#전신' },
    ]
  },
];

const ROUTINE_CATEGORIES = ['#가벼운_운동', '#초단기_다이어트', '#근력강화', '#스트레칭'];
const ROUTINE_DATA = {
  '#가벼운_운동': [
    { title: '5분 모닝 스트레칭', author: '김트레', duration: '5분' },
    { title: '홈트 30분 전신', author: '박트레', duration: '30분' },
    { title: '가볍게 걷기 루틴', author: '이트레', duration: '20분' },
  ],
  '#초단기_다이어트': [
    { title: '타바타 10분 루틴', author: '최트레', duration: '10분' },
    { title: '칼로리 폭탄 버피', author: '정트레', duration: '15분' },
    { title: '줄넘기 고강도', author: '강트레', duration: '12분' },
  ],
  '#근력강화': [
    { title: '상체 근력 루틴', author: '윤트레', duration: '40분' },
    { title: '하체 집중 스쿼트', author: '한트레', duration: '35분' },
    { title: '코어 안정화', author: '오트레', duration: '25분' },
  ],
  '#스트레칭': [
    { title: '자기 전 스트레칭', author: '서트레', duration: '10분' },
    { title: '오피스 어깨 루틴', author: '신트레', duration: '8분' },
    { title: '골반 교정 루틴', author: '권트레', duration: '15분' },
  ],
};

const VOD_DATA = [
  {
    title: '제목목목목제목목목목제목목목목제목목목목...',
    author: '올린사람 이름',
    tags: ['#초보자', '#소동하며_운동', '#유산소'],
    initials: '김',
  },
  {
    title: '30분 전신 다이어트 홈트레이닝',
    author: '박소연 트레이너',
    tags: ['#다이어트', '#전신운동', '#홈트'],
    initials: '박',
  },
];

/* ── 1-1. 구독중인 트레이너 배너 ── */
function renderSubscribeBanner() {
  const wrap = document.getElementById('subscribeBannerWrap');
  if (!SUBSCRIBED_TRAINERS.length) {
    wrap.innerHTML = '<div class="subscribe-empty">구독중인 트레이너가 없어요.<br>트레이너를 찾아보세요!</div>';
    return;
  }

  // 라이브중 트레이너 우선 정렬
  const sorted = [...SUBSCRIBED_TRAINERS].sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0));

  const slidesHTML = sorted.map((t) => {
    const statusBadge = t.isLive
      ? `<span class="live-badge">라이브중</span>`
      : `<span class="subscribing-badge">구독중</span>`;

    // 하단 바: 라이브 중이면 빨간 바, 아니면 회색 바
    const bottomBar = t.isLive
      ? `<div class="subscribe-slide-live-bar">
           <div class="live-bar-item">${t.liveElapsed} 경과</div>
           <div class="live-bar-divider"></div>
           <div class="live-bar-item live-bar-join" onclick="openLiveModal(${t.id}, '${t.name}')">참여하기</div>
           <div class="live-bar-divider"></div>
           <div class="live-bar-item">${t.liveParticipants}인 참여중</div>
         </div>`
      : `<div class="subscribe-slide-sub-bar">트레이너 홈 방문하기 &rsaquo;</div>`;

    return `
      <div class="subscribe-slide">
        <div class="subscribe-slide-top">
          ${statusBadge}
          <span class="subscribe-trainer-name">${t.name}</span>
          <svg class="subscribe-home-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        ${bottomBar}
      </div>`;
  }).join('');

  const indicatorHTML = sorted.length > 1
    ? `<div class="subscribe-indicators">
         ${sorted.map((_, i) => `<div class="subscribe-dot ${i===0?'active':''}" data-idx="${i}"></div>`).join('')}
       </div>`
    : '';

  wrap.innerHTML = `
    <div class="subscribe-slider">
      <div class="subscribe-slides" id="subscribeSlides">
        ${slidesHTML}
      </div>
    </div>
    ${indicatorHTML}
  `;

  if (sorted.length > 1) initSubscribeSwipe(sorted.length);
}

let subIdx = 0;
function initSubscribeSwipe(total) {
  const slides = document.getElementById('subscribeSlides');
  const dots   = document.querySelectorAll('.subscribe-dot');
  let startX = 0;
  slides.parentElement.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slides.parentElement.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0 && subIdx < total - 1) subIdx++;
    else if (diff < 0 && subIdx > 0) subIdx--;
    slides.style.transform = `translateX(-${subIdx * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === subIdx));
  });
}

/* ── 라이브 참여 모달 ── */
function openLiveModal(trainerId, trainerName) {
  document.getElementById('liveModal').classList.add('open');
  document.getElementById('liveModal').dataset.id = trainerId;
}
function closeLiveModal() {
  document.getElementById('liveModal').classList.remove('open');
}
function joinLive() {
  var trainerId = document.getElementById('liveModal').dataset.id || '1';
  closeLiveModal();
  window.location.href = '/pt/live?id=' + trainerId;
}

/* ── 1-4. 닉네임 처리 ── */
function getNicknameTitle(nickname) {
  const len = nickname.length;
  if (len <= 12) return `${nickname}님의 최근 관심사는?`;
  if (len <= 19) return `${nickname}님의\n최근 관심사는?`;
  return `${nickname}\n님의 최근 관심사는?`;
}

/* ── 1-4. 사용자 맞춤 트레이너 추천 ── */
let activeCatIdx = 0;

function renderInterestSection() {
  const section = document.getElementById('interestSection');
  const titleText = getNicknameTitle(USER_NICKNAME).replace('\n', '<br>');

  // 카테고리 태그 HTML
  const catTagsHTML = INTEREST_CATEGORIES.map((c, i) => `
    <div class="interest-cat ${i===0?'active':''}" onclick="selectInterestCat(${i})">${c.tag}</div>
  `).join('');

  section.innerHTML = `
    <div class="interest-header">
      <div class="interest-title" id="interestTitle">${titleText}</div>
      <div class="interest-cats" id="interestCats">${catTagsHTML}</div>
    </div>
    <div id="interestTrainers"></div>
  `;

  renderInterestTrainers(0);
}

function selectInterestCat(idx) {
  activeCatIdx = idx;
  document.querySelectorAll('.interest-cat').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  renderInterestTrainers(idx);
}

function renderInterestTrainers(idx) {
  const cat = INTEREST_CATEGORIES[idx];
  const container = document.getElementById('interestTrainers');
  // 이름 글자수 제한 (한글 5자, 영어 8자 — 모두 한글 기준 5자 적용)
  function truncateName(name) {
    return name.length > 5 ? name.slice(0, 5) : name;
  }
  container.innerHTML = `
    <div class="trainer-scroll-wrap">
      <div class="trainer-row">
        ${cat.trainers.map(t => `
          <div class="trainer-card" onclick="alert('${t.name} 프로필')">
            <div class="trainer-avatar">
              <div class="trainer-avatar-img">${t.name[0]}</div>
            </div>
            <div class="trainer-name">${truncateName(t.name)}</div>
            <div class="trainer-cat-tag">${t.cat}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ── 1-5. 루틴 추천 ── */
let activeRoutineCat = ROUTINE_CATEGORIES[0];

function renderRoutineSection() {
  const catsEl = document.getElementById('routineCats');
  catsEl.innerHTML = ROUTINE_CATEGORIES.map((c, i) => `
    <div class="routine-cat-btn ${i===0?'active':''}" onclick="selectRoutineCat('${c}', this)">${c}</div>
  `).join('');
  renderRoutineCards(activeRoutineCat);
}

function selectRoutineCat(cat, btn) {
  activeRoutineCat = cat;
  document.querySelectorAll('.routine-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRoutineCards(cat);
}

function renderRoutineCards(cat) {
  const routines = ROUTINE_DATA[cat] || [];
  const el = document.getElementById('routineCards');
  el.innerHTML = routines.map(r => `
    <div class="routine-card" onclick="alert('${r.title}')">
      <div class="routine-card-thumb">
        <div class="routine-card-thumb-inner">
          <span class="routine-card-duration">${r.duration}</span>
        </div>
      </div>
      <div class="routine-card-body">
        <div class="routine-card-title">${r.title}</div>
        <div class="routine-card-author">${r.author}</div>
      </div>
    </div>
  `).join('');
}

/* ── 1-6. 트레이너 영상 추천 ── */
function renderVodSection() {
  const el = document.getElementById('vodList');
  el.innerHTML = VOD_DATA.map(v => `
    <div class="vod-card" onclick="alert('VOD 시청: ${v.title}')">
      <div class="vod-thumb">
        <div class="vod-thumb-inner">
          <div class="vod-play-icon">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>
      <div class="vod-info">
        <div class="vod-info-avatar">${v.initials}</div>
        <div class="vod-info-text">
          <div class="vod-title">${v.title}</div>
          <div class="vod-trainer">${v.author}</div>
          <div class="vod-tags">
            ${v.tags.map(t => `<span class="vod-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── 1-3. 트레이너 카테고리 선택 ── */
const CATEGORY_ROUTES = {
  'male-best':   '남성 BEST 추천 페이지',
  'female-best': '여성 BEST 추천 페이지',
  'time-based':  '시간별 추천 페이지',
  'value':       '가성비 좋은 트레이너 페이지',
  'review':      '좋은 후기 트레이너 페이지',
  'group':       '공개 그룹 모집 페이지',
};

let selectedCategory = null;

function selectCategory(el, type) {
  // 이미 선택된 버튼 클릭 시 → 선택 해제
  if (selectedCategory === type) {
    el.classList.remove('selected');
    selectedCategory = null;
    return;
  }

  // 기존 선택 해제
  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));

  // 새 버튼 선택 (검정 배경)
  el.classList.add('selected');
  selectedCategory = type;

  // 짧은 딜레이 후 해당 페이지로 이동 (선택 피드백 보여준 뒤)
  setTimeout(() => {
    // 실제 라우트 연결 시 아래를 교체
    // window.location.href = '/' + type;
    alert(CATEGORY_ROUTES[type] + '로 이동합니다.');
    // 이동 후 선택 상태 초기화
    el.classList.remove('selected');
    selectedCategory = null;
  }, 200);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  renderSubscribeBanner();
  renderInterestSection();
  renderRoutineSection();
  renderVodSection();
});