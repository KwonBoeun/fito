/* ── FITO VOD Detail JS (with Player) ── */

const VOD_DATA = [
  { id:1,  title:'스쿼트 완벽 자세 가이드',     author:'피트니스TV',    views:84200, tags:['#스쿼트','#자세교정'], h:12,  dur:754  },
  { id:2,  title:'집에서 하는 30분 홈트 루틴',  author:'홈트여왕',      views:62100, tags:['#홈트','#초보자'],    h:36,  dur:1823 },
  { id:3,  title:'뱃살 빼는 코어 운동 10선',    author:'다이어터민',    views:51000, tags:['#다이어트','#코어'],  h:5,   dur:612  },
  { id:4,  title:'데드리프트 입문자 가이드',     author:'트레이너박',    views:43000, tags:['#데드리프트','#하체'],h:48,  dur:1120 },
  { id:5,  title:'어깨 라운드 교정 스트레칭',   author:'자세교정연구소',views:38000, tags:['#자세교정','#어깨'],  h:20,  dur:487  },
  { id:6,  title:'상체 루틴 완전 정복',          author:'근육맨제이',    views:35000, tags:['#상체','#루틴'],      h:72,  dur:2247 },
  { id:7,  title:'힙업 운동 TOP5',               author:'힙돼지',        views:31000, tags:['#힙업','#하체'],      h:15,  dur:934  },
  { id:8,  title:'초보자 벌크업 식단 가이드',   author:'영양사진',      views:27000, tags:['#벌크업','#식단'],    h:30,  dur:1456 },
  { id:9,  title:'런닝 페이스별 칼로리 소모',   author:'러너킴',        views:24000, tags:['#러닝','#유산소'],    h:40,  dur:778  },
  { id:10, title:'팔굽혀펴기 자세 교정',         author:'피트니스TV',    views:21000, tags:['#팔굽혀펴기','#상체'],h:60,  dur:523  },
  { id:11, title:'폼롤러 전신 마사지',            author:'회복전문',      views:18000, tags:['#폼롤러','#회복'],    h:24,  dur:1089 },
  { id:12, title:'플랭크 변형 10가지',            author:'코어킹',        views:15000, tags:['#플랭크','#코어'],    h:90,  dur:867  },
];

const MOCK_COMMENTS = [
  { name:'pilates_j', text:'정말 도움이 많이 됐어요! 자세가 많이 나아진 것 같아요 😊', time:'2시간 전' },
  { name:'homefit',   text:'이걸 보고 따라했는데 확실히 다르네요 ㅎㅎ', time:'3시간 전' },
  { name:'squat_q',   text:'발 너비 부분 설명이 제일 이해가 잘 됐어요', time:'5시간 전' },
];

const fmt = n => {
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
};
const timeAgo = h => {
  if (h < 1)   return `${Math.floor(h*60)}분 전`;
  if (h < 24)  return `${Math.floor(h)}시간 전`;
  if (h < 168) return `${Math.floor(h/24)}일 전`;
  return `${Math.floor(h/168)}주 전`;
};
const fmtDur = s => {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2,'0')}`;
};

/* Last-Playback Position */
const STORAGE_KEY = 'fito_vod_pos';
function getPos(id) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')[id] || 0; } catch { return 0; }
}
function savePos(id, sec) {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    d[id] = sec; localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {}
}

/* ── 플레이어 상태 ── */
let playState = { playing:false, cur:0, total:0, muted:false, speed:1, timer:null, vodId:null };

function updateSeekUI() {
  const pct = playState.total > 0 ? (playState.cur / playState.total * 100) : 0;
  document.getElementById('seek-fill').style.width  = pct + '%';
  document.getElementById('seek-thumb').style.left  = pct + '%';
  document.getElementById('seek-input').value        = pct;
  document.getElementById('vod-time').textContent   =
    `${fmtDur(playState.cur)} / ${fmtDur(playState.total)}`;
  if (playState.vodId !== null) savePos(playState.vodId, Math.floor(playState.cur));
}

function setPlaying(val) {
  playState.playing = val;
  const PLAY_PATH  = `<polygon points="5 3 19 12 5 21 5 3"/>`;
  const PAUSE_PATH = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
  document.getElementById('play-icon').innerHTML   = val ? PAUSE_PATH : PLAY_PATH;
  document.getElementById('center-icon').innerHTML = val ? PAUSE_PATH : PLAY_PATH;

  /* 실제 영상이 연결된 경우 */
  if (playState._realVideo) {
    if (val) playState._realVideo.play().catch(() => {});
    else     playState._realVideo.pause();
    clearInterval(playState.timer);
    return;
  }

  clearInterval(playState.timer);
  if (val) {
    playState.timer = setInterval(() => {
      playState.cur = Math.min(playState.cur + 0.5 * playState.speed, playState.total);
      updateSeekUI();
      if (playState.cur >= playState.total) setPlaying(false);
    }, 500);
  }
}

function showControls() {
  const ctrl = document.getElementById('vod-controls');
  ctrl.classList.remove('hidden');
  clearTimeout(showControls._t);
  if (playState.playing) {
    showControls._t = setTimeout(() => ctrl.classList.add('hidden'), 3000);
  }
}

function initPlayer(vod) {
  playState.vodId  = vod.id;
  playState.total  = vod.dur;
  playState.cur    = getPos(vod.id);
  updateSeekUI();

  const wrap = document.getElementById('player-wrap');

  /* ── 유저 업로드 VOD: 실제 영상 재생 ── */
  if (vod.userUrl) {
    const realVideo = document.getElementById('real-video');
    const bg        = document.getElementById('vod-player-bg');
    realVideo.src   = vod.userUrl;
    realVideo.style.display = '';
    if (bg) bg.style.display = 'none';

    realVideo.addEventListener('loadedmetadata', () => {
      playState.total = Math.floor(realVideo.duration);
      realVideo.currentTime = playState.cur;
      updateSeekUI();
    });
    realVideo.addEventListener('timeupdate', () => {
      playState.cur = Math.floor(realVideo.currentTime);
      if (!playState.seeking) updateSeekUI();
      savePos(vod.id, playState.cur);
    });
    realVideo.addEventListener('ended', () => {
      setPlaying(false);
    });

    /* 재생 제어를 실제 비디오에 연결 */
    playState._realVideo = realVideo;
  }

  /* 탭 → 컨트롤 토글 */
  wrap.addEventListener('click', e => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.vod-popup')) return;
    showControls();
  });

  /* 중앙 버튼 */
  document.getElementById('center-btn').addEventListener('click', e => {
    e.stopPropagation();
    setPlaying(!playState.playing);
    showControls();
  });

  /* 하단 재생 버튼 */
  document.getElementById('play-btn').addEventListener('click', e => {
    e.stopPropagation();
    setPlaying(!playState.playing);
    showControls();
  });

  /* seekbar */
  const seekInput = document.getElementById('seek-input');
  seekInput.addEventListener('input', () => {
    playState.cur = playState.total * seekInput.value / 100;
    updateSeekUI();
    showControls();
  });
  seekInput.addEventListener('click', e => e.stopPropagation());

  /* 음소거 */
  document.getElementById('mute-btn').addEventListener('click', e => {
    e.stopPropagation();
    playState.muted = !playState.muted;
    const el = document.getElementById('mute-icon');
    el.innerHTML = playState.muted
      ? `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`
      : `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
    showControls();
  });

  /* 재생 속도 팝업 */
  const speedBtn   = document.getElementById('speed-btn');
  const speedPopup = document.getElementById('speed-popup');
  speedBtn.addEventListener('click', e => {
    e.stopPropagation();
    speedPopup.classList.toggle('open');
    document.getElementById('quality-popup').classList.remove('open');
  });
  speedPopup.querySelectorAll('.vod-popup-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      playState.speed = parseFloat(item.dataset.speed);
      speedBtn.textContent = playState.speed + 'x';
      speedPopup.querySelectorAll('.vod-popup-item').forEach(i => {
        const isActive = parseFloat(i.dataset.speed) === playState.speed;
        i.classList.toggle('active', isActive);
        i.innerHTML = i.dataset.speed + 'x' + (isActive ? ' <span class="vod-popup-check">✓</span>' : '');
      });
      speedPopup.classList.remove('open');
      if (playState.playing) { setPlaying(false); setPlaying(true); }
    });
  });

  /* 화질 팝업 */
  const qualBtn    = document.getElementById('quality-btn');
  const qualPopup  = document.getElementById('quality-popup');
  qualBtn.addEventListener('click', e => {
    e.stopPropagation();
    qualPopup.classList.toggle('open');
    speedPopup.classList.remove('open');
  });
  qualPopup.querySelectorAll('.vod-popup-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      qualBtn.textContent = item.dataset.q;
      qualPopup.querySelectorAll('.vod-popup-item').forEach(i => {
        const isActive = i.dataset.q === item.dataset.q;
        i.classList.toggle('active', isActive);
        i.innerHTML = (i.dataset.q === 'FHD' ? '1080p' : i.dataset.q === 'HD' ? '720p' : i.dataset.q === 'SD' ? '480p' : '360p')
          + (isActive ? ' <span class="vod-popup-check">✓</span>' : '');
      });
      qualPopup.classList.remove('open');
    });
  });

  /* 팝업 닫기 (외부 클릭) */
  document.addEventListener('click', () => {
    speedPopup.classList.remove('open');
    qualPopup.classList.remove('open');
  });

  /* 전체화면 */
  document.getElementById('fullscreen-btn').addEventListener('click', e => {
    e.stopPropagation();
    wrap.classList.toggle('fullscreen');
    const btn = document.getElementById('fullscreen-btn');
    btn.querySelector('svg').innerHTML = wrap.classList.contains('fullscreen')
      ? `<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>`
      : `<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>`;
  });

  /* Last-Playback 배너 */
  if (playState.cur > 5) {
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#f0f4ff;padding:10px 16px;font-size:12px;color:#4b668b;display:flex;align-items:center;justify-content:space-between';
    banner.innerHTML = `<span>⏱ 이전에 ${fmtDur(playState.cur)}까지 시청했어요</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:12px;color:#999;cursor:pointer">✕</button>`;
    wrap.after(banner);
  }
}

function init() {
  const id  = parseInt(window.location.pathname.split('/').pop()) || 1;

  /* 유저 업로드 VOD도 검색 */
  let vod = VOD_DATA.find(d => d.id === id);
  if (!vod) {
    try {
      const userVods = JSON.parse(localStorage.getItem('fito_user_vods') || '[]');
      const maxMock  = VOD_DATA.reduce((m,d) => Math.max(m,d.id), 0);
      userVods.forEach((v,i) => {
        if (!vod && maxMock + i + 1 === id) {
          vod = { id, title: v.title||'내 VOD', author: v.author||'나',
                  views:0, tags: v.tags||[], h:0, dur:0,
                  userUrl: v.videoUrl, isUserUploaded:true };
        }
      });
    } catch(e) {}
    if (!vod) vod = VOD_DATA[0];
  }

  document.title = `FITO - ${vod.title}`;
  document.getElementById('vod-title').textContent  = vod.title;
  document.getElementById('vod-author').textContent = vod.author;
  document.getElementById('vod-meta').textContent   = `조회수 ${fmt(vod.views)}회 · ${timeAgo(vod.h)}`;

  vod.tags.forEach(t => {
    const s = document.createElement('span');
    s.className = 'hashtag'; s.textContent = t;
    document.getElementById('vod-tags').appendChild(s);
  });

  /* 플레이어 초기화 */
  initPlayer(vod);

  /* 좋아요 */
  let liked = false, likes = Math.floor(vod.views * 0.05);
  const likeBtn = document.getElementById('like-btn');
  document.getElementById('like-cnt').textContent = fmt(likes);
  likeBtn.addEventListener('click', () => {
    liked = !liked; likes += liked ? 1 : -1;
    document.getElementById('like-cnt').textContent = fmt(likes);
    likeBtn.classList.toggle('liked', liked);
  });

  /* 영상 설명 토글 */
  const desc   = document.getElementById('vod-desc');
  const toggle = document.getElementById('desc-toggle');
  toggle.addEventListener('click', () => {
    const open = desc.classList.toggle('open');
    toggle.textContent = open ? '영상 설명 닫기 ▴' : '영상 설명 보기 ▾';
  });

  /* 댓글 미리보기 */
  const preview = document.getElementById('comment-preview');
  document.getElementById('comment-cnt-label').textContent = `댓글 ${MOCK_COMMENTS.length}개`;
  MOCK_COMMENTS.slice(0,3).forEach(c => {
    preview.innerHTML += `
      <div class="comment-item">
        <div class="comment-pic"></div>
        <div class="comment-body">
          <div class="comment-author">${c.name}</div>
          <div class="comment-text">${c.text}</div>
          <div class="comment-meta"><span>${c.time}</span></div>
        </div>
      </div>`;
  });

  /* 추천 VOD (현재 제외 4개, 시간 뱃지 포함) */
  const recList = document.getElementById('rec-list');
  VOD_DATA.filter(d => d.id !== id).slice(0,4).forEach(r => {
    recList.innerHTML += `
      <div class="rec-card" onclick="location.href='/vod/${r.id}'">
        <div class="rec-thumb">
          <span class="rec-dur">${fmtDur(r.dur)}</span>
        </div>
        <div class="rec-info">
          <div class="rec-title">${r.title}</div>
          <div class="rec-meta">${r.author} · 조회수 ${fmt(r.views)}</div>
          <div class="rec-meta">${timeAgo(r.h)}</div>
        </div>
      </div>`;
  });

  /* 구독 */
  const subBtn = document.getElementById('sub-btn');
  let subscribed = false;
  subBtn.addEventListener('click', () => {
    subscribed = !subscribed;
    subBtn.textContent = subscribed ? '구독 중' : '구독';
    subBtn.style.background = subscribed ? 'var(--black)' : 'var(--white)';
    subBtn.style.color = subscribed ? 'var(--white)' : 'var(--black)';
  });

  /* 댓글 작성 */
  const input = document.getElementById('sheet-comment-input');
  const sendBtn = document.getElementById('sheet-send-btn');
  
  input.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.click();
});

  /* 더보기 팝업 */
  document.getElementById('more-btn').addEventListener('click', () =>
    document.getElementById('more-popup').classList.add('open'));
  document.getElementById('more-bg').addEventListener('click', () =>
    document.getElementById('more-popup').classList.remove('open'));

  /* 내 VOD이면 삭제 메뉴 추가 */
  if (vod.isUserUploaded) {
    const moreBox = document.getElementById('more-popup-box');
    const delItem = document.createElement('div');
    delItem.className = 'more-popup-item danger';
    delItem.textContent = '삭제하기';
    delItem.addEventListener('click', () => {
      if (!confirm('VOD를 삭제할까요?')) return;
      try {
        const stored = JSON.parse(localStorage.getItem('fito_user_vods') || '[]');
        const maxMock = VOD_DATA.filter(d => !d.isUserUploaded).reduce((m, d) => Math.max(m, d.id), 0);
        const idx = vod.id - maxMock - 1;
        if (idx >= 0) { stored.splice(idx, 1); localStorage.setItem('fito_user_vods', JSON.stringify(stored)); }
      } catch(e) {}
      location.href = '/';
    });
    moreBox.appendChild(delItem);
  }
}

document.addEventListener('DOMContentLoaded', init);
