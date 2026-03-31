/* ── FITO FITS Detail JS (TikTok-style) ── */

const FITS_DATA = [
  { id:1,  title:'스쿼트 30초 챌린지', author:'핏걸_나연', views:124000, likes:8200, comments:341, tags:['#스쿼트'] },
  { id:2,  title:'플랭크 1분 도전', author:'코어킹', views:98000, likes:6100, comments:280, tags:['#플랭크'] },
  { id:3,  title:'점프 버피 챌린지', author:'버피마스터', views:87000, likes:5400, comments:215, tags:['#버피'] },
  { id:4,  title:'힙쓰러스트 꿀팁', author:'힙돼지', views:74000, likes:4800, comments:190, tags:['#힙업'] },
  { id:5,  title:'런지 200개 챌린지', author:'런지퀸', views:65000, likes:4200, comments:170, tags:['#런지'] },
  { id:6,  title:'풀업 입문자 가이드', author:'철봉남', views:52000, likes:3500, comments:142, tags:['#풀업'] },
  { id:7,  title:'빠른 복근 10분', author:'식스팩왕', views:48000, likes:3100, comments:128, tags:['#복근'] },
  { id:8,  title:'덤벨 컬 자세 보기', author:'암컬킹', views:43000, likes:2800, comments:114, tags:['#덤벨'] },
  { id:9,  title:'점프스쿼트 30개', author:'점프퀸', views:38000, likes:2400, comments:98, tags:['#점프'] },
  { id:10, title:'케틀벨 스윙 꿀팁', author:'케틀벨러', views:35000, likes:2100, comments:87, tags:['#케틀벨'] },
];

const MOCK_COMMENTS = [
  '대박 따라했는데 진짜 힘드네요 ㅋㅋ',
  '자세 설명이 너무 잘 됐어요!',
  '매일 아침에 이거 하고 있어요 💪',
  '처음엔 10개도 못 했는데 이제 30개까지 됐어요',
  '이분 다른 영상도 다 좋아요',
];

const fmt = n => {
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
};

const HEART_SVG = `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const COMMENT_SVG = `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

let startId = 1;
const likedSet = new Set();

function buildSlide(fits, isFirst) {
  const slide = document.createElement('div');
  slide.className = 'fits-slide';
  slide.dataset.id = fits.id;

  const liked = likedSet.has(fits.id);
  const likeClass = liked ? ' liked' : '';

  slide.innerHTML = `
    ${isFirst ? `
    <div class="fits-label">
      <button class="fits-back" onclick="history.back()">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="fits-label-title">FITS</span>
      <div style="width:32px"></div>
    </div>` : ''}
    <div class="fits-actions">
      <button class="fits-action-btn${likeClass}" data-action="like" data-id="${fits.id}">
        <div class="fits-action-icon">${HEART_SVG}</div>
        <span class="fits-action-count" id="like-${fits.id}">${fmt(fits.likes)}</span>
      </button>
      <button class="fits-action-btn" data-action="comment" data-id="${fits.id}">
        <div class="fits-action-icon">${COMMENT_SVG}</div>
        <span class="fits-action-count">${fmt(fits.comments)}</span>
      </button>
    </div>
    <div class="fits-bottom">
      <div class="fits-author-row">
        <div class="fits-author-pic"></div>
        <span class="fits-author-name">${fits.author}</span>
        <button class="fits-author-sub">구독</button>
      </div>
      <div class="fits-title">${fits.title}</div>
      <div class="fits-tags">${fits.tags.map(t=>`<span class="fits-tag">${t}</span>`).join('')}</div>
    </div>`;

  return slide;
}

function openCommentDrawer(id) {
  const fits = FITS_DATA.find(d => d.id === id) || FITS_DATA[0];
  document.getElementById('drawer-title').textContent = `댓글 ${fmt(fits.comments)}개`;
  const body = document.getElementById('drawer-body');
  body.innerHTML = '';
  MOCK_COMMENTS.forEach(text => {
    body.innerHTML += `
      <div class="comment-item">
        <div class="comment-pic"></div>
        <div class="comment-body">
          <div class="comment-author">user_${Math.floor(Math.random()*9000+1000)}</div>
          <div class="comment-text">${text}</div>
        </div>
      </div>`;
  });
  document.getElementById('comment-drawer').classList.add('open');
  document.getElementById('drawer-bg').style.display = 'block';
}

function closeDrawer() {
  document.getElementById('comment-drawer').classList.remove('open');
  document.getElementById('drawer-bg').style.display = 'none';
}

function init() {
  const path = window.location.pathname; /* /fits/1 */
  startId = parseInt(path.split('/').pop()) || 1;

  const container = document.getElementById('fits-container');

  /* 시작 ID부터 나머지 순서로 배열 */
  const startIdx = FITS_DATA.findIndex(d => d.id === startId);
  const ordered = [
    ...FITS_DATA.slice(startIdx),
    ...FITS_DATA.slice(0, startIdx),
  ];

  ordered.forEach((fits, i) => {
    container.appendChild(buildSlide(fits, i === 0));
  });

  /* 좋아요 / 댓글 클릭 */
  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    const fits = FITS_DATA.find(d => d.id === id);
    if (!fits) return;

    if (btn.dataset.action === 'like') {
      const isLiked = likedSet.has(id);
      if (isLiked) { likedSet.delete(id); fits.likes--; }
      else          { likedSet.add(id);   fits.likes++; }
      btn.classList.toggle('liked', !isLiked);
      document.getElementById(`like-${id}`).textContent = fmt(fits.likes);
    }
    if (btn.dataset.action === 'comment') {
      openCommentDrawer(id);
    }
  });

  /* 댓글 드로어 닫기 */
  document.getElementById('drawer-bg').addEventListener('click', closeDrawer);
  document.getElementById('drawer-send').addEventListener('click', () => {
    const input = document.getElementById('drawer-input');
    if (!input.value.trim()) return;
    const body = document.getElementById('drawer-body');
    body.innerHTML = `
      <div class="comment-item">
        <div class="comment-pic"></div>
        <div class="comment-body">
          <div class="comment-author">나</div>
          <div class="comment-text">${input.value.trim()}</div>
        </div>
      </div>` + body.innerHTML;
    input.value = '';
  });
}

document.addEventListener('DOMContentLoaded', init);
