/* ── FITO FITS Detail JS (TikTok-style) ── */

let FITS_DATA = [
  { id:1,  title:'스쿼트 30초 챌린지', author:'핏걸_나연', views:124000, likes:8200, comments:341, tags:['#스쿼트'], dur:32  },
  { id:2,  title:'플랭크 1분 도전',    author:'코어킹',    views:98000,  likes:6100, comments:280, tags:['#플랭크'], dur:62  },
  { id:3,  title:'점프 버피 챌린지',   author:'버피마스터',views:87000,  likes:5400, comments:215, tags:['#버피'],   dur:45  },
  { id:4,  title:'힙쓰러스트 꿀팁',   author:'힙돼지',    views:74000,  likes:4800, comments:190, tags:['#힙업'],   dur:58  },
  { id:5,  title:'런지 200개 챌린지', author:'런지퀸',    views:65000,  likes:4200, comments:170, tags:['#런지'],   dur:74  },
  { id:6,  title:'풀업 입문자 가이드', author:'철봉남',    views:52000,  likes:3500, comments:142, tags:['#풀업'],   dur:89  },
  { id:7,  title:'빠른 복근 10분',     author:'식스팩왕',  views:48000,  likes:3100, comments:128, tags:['#복근'],   dur:601 },
  { id:8,  title:'덤벨 컬 자세 보기', author:'암컬킹',    views:43000,  likes:2800, comments:114, tags:['#덤벨'],   dur:41  },
  { id:9,  title:'점프스쿼트 30개',   author:'점프퀸',    views:38000,  likes:2400, comments:98,  tags:['#점프'],   dur:38  },
  { id:10, title:'케틀벨 스윙 꿀팁',  author:'케틀벨러',  views:35000,  likes:2100, comments:87,  tags:['#케틀벨'], dur:53  },
];

/* ── 유저 업로드 FITS 병합 ── */
(function mergeUserFits() {
  try {
    const raw = localStorage.getItem('fito_user_fits');
    if (!raw) return;
    const userFits = JSON.parse(raw);
    if (!Array.isArray(userFits) || !userFits.length) return;
    const maxMock = FITS_DATA.reduce((m, d) => Math.max(m, d.id), 0);
    userFits.forEach((v, i) => {
      FITS_DATA.unshift({
        id:      maxMock + i + 1,
        title:   v.title   || '내 FITS',
        author:  '나',
        views:   0,
        likes:   0,
        comments:0,
        tags:    v.tags    || [],
        dur:     0,
        userUrl: v.videoUrl || null,
        isUserUploaded: true,
        _storageIdx: i,
      });
    });
  } catch(e) { console.warn('mergeUserFits(detail) error', e); }
})();

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
const fmtDur = s => { const m=Math.floor(s/60),sec=Math.floor(s%60); return `${m}:${String(sec).padStart(2,'0')}`; };

const HEART_SVG = `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const COMMENT_SVG = `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

let startId = 1;
const likedSet = new Set();

/* ── 슬라이드별 플레이어 상태 ── */
const playerState = {}; /* { [fitsId]: { cur, total, timer } } */

function initFitsPlayer(fits) {
  const id   = fits.id;
  const dur  = fits.dur || 30;
  playerState[id] = { cur: 0, total: dur, timer: null, playing: false };

  const fillEl  = document.getElementById(`fpfill-${id}`);
  const thumbEl = document.getElementById(`fpthumb-${id}`);
  const inputEl = document.getElementById(`fpinput-${id}`);
  const timeEl  = document.getElementById(`ftime-${id}`);
  if (!fillEl) return;

  function updateUI() {
    const st = playerState[id];
    const pct = st.total > 0 ? (st.cur / st.total * 100) : 0;
    fillEl.style.width   = pct + '%';
    thumbEl.style.left   = pct + '%';
    inputEl.value        = pct;
    if (timeEl) timeEl.textContent = `${fmtDur(st.cur)} / ${fmtDur(st.total)}`;
  }

  function startPlay() {
    const st = playerState[id];
    if (st.playing) return;
    st.playing = true;
    st.timer = setInterval(() => {
      st.cur = Math.min(st.cur + 0.5, st.total);
      updateUI();
      if (st.cur >= st.total) { st.cur = 0; } /* 끝나면 처음으로 */
    }, 500);
  }

  function stopPlay() {
    const st = playerState[id];
    if (!st.playing) return;
    st.playing = false;
    clearInterval(st.timer);
  }

  /* seekbar 조작 */
  inputEl.addEventListener('input', () => {
    playerState[id].cur = playerState[id].total * inputEl.value / 100;
    updateUI();
  });
  inputEl.addEventListener('click', e => e.stopPropagation());

  updateUI();
  return { startPlay, stopPlay };
}

function buildSlide(fits) {
  const slide = document.createElement('div');
  slide.className = 'fits-slide';
  slide.dataset.id = fits.id;

  const liked = likedSet.has(fits.id);
  const likeClass = liked ? ' liked' : '';

  slide.innerHTML = `
    <div class="fits-label">
      <button class="fits-back" onclick="history.back()">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="fits-label-title">FITS</span>
      ${fits.isUserUploaded
        ? `<button class="fits-del-btn" data-fitid="${fits.id}" data-storageidx="${fits._storageIdx}"
             style="background:none;border:none;cursor:pointer;padding:4px 6px;
                    color:rgba(255,255,255,.85);font-size:12px;font-weight:700;
                    border:1px solid rgba(255,255,255,.4);border-radius:6px">삭제</button>`
        : `<div style="width:36px"></div>`
      }
    </div>
    <!-- 일시정지 아이콘 -->
    <div class="fits-pause-icon" id="fpause-${fits.id}">
      <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
    </div>
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
        <button class="fits-author-sub" data-sub="${fits.id}">구독</button>
      </div>
      <div class="fits-title">${fits.title}</div>
      <div class="fits-tags">${fits.tags.map(t=>`<span class="fits-tag">${t}</span>`).join('')}</div>
      <!-- 틱톡 스타일 진행 바 (해시태그 아래) -->
      <div class="fits-bar-wrap" id="fbar-${fits.id}">
        <div class="fits-time" id="ftime-${fits.id}">0:00 / 0:00</div>
        <div class="fits-progress-wrap" id="fprog-${fits.id}">
          <div class="fits-progress-track"></div>
          <div class="fits-progress-fill" id="fpfill-${fits.id}" style="width:0%"></div>
          <div class="fits-progress-thumb" id="fpthumb-${fits.id}" style="left:0%"></div>
          <input type="range" class="fits-progress-input" id="fpinput-${fits.id}"
            min="0" max="100" value="0" step="0.1"/>
        </div>
      </div>
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

  /* 슬라이드별 플레이어 초기화 */
  ordered.forEach(fits => initFitsPlayer(fits));

  /* IntersectionObserver — 화면에 들어오면 재생, 나가면 정지 */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = parseInt(entry.target.dataset.id);
      if (!playerState[id]) return;
      const fill  = document.getElementById(`fpfill-${id}`);
      const thumb = document.getElementById(`fpthumb-${id}`);
      const input = document.getElementById(`fpinput-${id}`);
      const time  = document.getElementById(`ftime-${id}`);

      if (entry.isIntersecting) {
        /* 화면 진입 → 재생 시작 */
        if (!playerState[id].playing) {
          playerState[id].playing = true;
          /* 진입 시 아이콘 숨김 */
          const pi = document.getElementById(`fpause-${id}`);
          if (pi) pi.classList.remove('show');
          playerState[id].timer = setInterval(() => {
            const st = playerState[id];
            st.cur = Math.min(st.cur + 0.5, st.total);
            const pct = st.total > 0 ? (st.cur / st.total * 100) : 0;
            if (fill)  fill.style.width  = pct + '%';
            if (thumb) thumb.style.left  = pct + '%';
            if (input) input.value       = pct;
            if (time)  time.textContent  = `${fmtDur(st.cur)} / ${fmtDur(st.total)}`;
            if (st.cur >= st.total) st.cur = 0; /* 루프 */
          }, 500);
        }
      } else {
        /* 화면 이탈 → 정지 */
        if (playerState[id].playing) {
          playerState[id].playing = false;
          clearInterval(playerState[id].timer);
        }
      }
    });
  }, { threshold: 0.6 });

  container.querySelectorAll('.fits-slide').forEach(slide => io.observe(slide));

  /* ── 진행 바 자동숨김 + 탭 재생/일시정지 ── */
  const BAR_HIDE_DELAY = 3000;
  const barTimers = {}; /* { [fitsId]: timeoutId } */

  function showBar(id) {
    const bar = document.getElementById(`fbar-${id}`);
    if (bar) bar.classList.remove('fits-bar-hidden');
    clearTimeout(barTimers[id]);
    barTimers[id] = setTimeout(() => {
      const b = document.getElementById(`fbar-${id}`);
      if (b) b.classList.add('fits-bar-hidden');
    }, BAR_HIDE_DELAY);
  }

  function togglePlayById(id) {
    const st = playerState[id];
    if (!st) return;
    const fill  = document.getElementById(`fpfill-${id}`);
    const thumb = document.getElementById(`fpthumb-${id}`);
    const input = document.getElementById(`fpinput-${id}`);
    const time  = document.getElementById(`ftime-${id}`);
    const pauseIcon = document.getElementById(`fpause-${id}`);

    if (st.playing) {
      /* 일시정지 */
      st.playing = false;
      clearInterval(st.timer);
      /* 일시정지 아이콘 표시 (사라지지 않음 - 재생 시 제거) */
      if (pauseIcon) pauseIcon.classList.add('show');
    } else {
      /* 재생 */
      st.playing = true;
      /* 일시정지 아이콘 즉시 숨김 */
      if (pauseIcon) pauseIcon.classList.remove('show');
      st.timer = setInterval(() => {
        st.cur = Math.min(st.cur + 0.5, st.total);
        const pct = st.total > 0 ? (st.cur / st.total * 100) : 0;
        if (fill)  fill.style.width  = pct + '%';
        if (thumb) thumb.style.left  = pct + '%';
        if (input) input.value       = pct;
        if (time)  time.textContent  = `${fmtDur(st.cur)} / ${fmtDur(st.total)}`;
        if (st.cur >= st.total) st.cur = 0;
      }, 500);
    }
    showBar(id);
  }

  /* ── 슬라이드별 클릭 핸들러 (좌표 기반 재생/정지 + 버튼 기능) ── */
  container.querySelectorAll('.fits-slide').forEach(slide => {
    const slideId = parseInt(slide.dataset.id);

    slide.addEventListener('click', e => {
      /* 0순위: 삭제 버튼 */
      const delBtn = e.target.closest('.fits-del-btn');
      if (delBtn) {
        if (!confirm('FITS를 삭제할까요?')) return;
        try {
          const stored = JSON.parse(localStorage.getItem('fito_user_fits') || '[]');
          const storageIdx = parseInt(delBtn.dataset.storageidx);
          if (!isNaN(storageIdx)) {
            stored.splice(storageIdx, 1);
            localStorage.setItem('fito_user_fits', JSON.stringify(stored));
          }
        } catch(e2) {}
        location.href = '/';
        return;
      }

      /* 1순위: 댓글·좋아요 버튼 (data-action) */
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const id = parseInt(actionBtn.dataset.id);
        const fits = FITS_DATA.find(d => d.id === id);
        if (!fits) return;
        if (actionBtn.dataset.action === 'like') {
          const isLiked = likedSet.has(id);
          if (isLiked) { likedSet.delete(id); fits.likes--; }
          else          { likedSet.add(id);   fits.likes++; }
          actionBtn.classList.toggle('liked', !isLiked);
          document.getElementById(`like-${id}`).textContent = fmt(fits.likes);
        }
        if (actionBtn.dataset.action === 'comment') {
          openCommentDrawer(id);
        }
        return;
      }

      /* 2순위: 구독 버튼 */
      const subBtn = e.target.closest('[data-sub]');
      if (subBtn) {
        const isSubbed = subBtn.dataset.subbed === 'true';
        subBtn.dataset.subbed = String(!isSubbed);
        subBtn.textContent = isSubbed ? '구독' : '구독 중';
        subBtn.style.background = isSubbed ? 'none' : '#fff';
        subBtn.style.color      = isSubbed ? '#fff' : '#000';
        return;
      }

      /* 3순위: seekbar, 뒤로가기, 드로어 등 나머지 인터랙티브 요소는 그대로 통과 */
      if (e.target.closest('input, button, a')) return;

      /* 4순위: 슬라이드 중간 영역 탭 → 재생/정지 */
      const rect   = slide.getBoundingClientRect();
      const relY   = e.clientY - rect.top;
      const topGuard    = 80;                   /* 상단 헤더 영역 */
      const bottomGuard = rect.height * 0.35;   /* 하단 35% = 정보 영역 */
      if (relY > topGuard && relY < rect.height - bottomGuard) {
        togglePlayById(slideId);
      }
    });
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
