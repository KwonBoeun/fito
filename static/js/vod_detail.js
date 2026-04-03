/* ── FITO VOD Detail JS ── */

const VOD_DATA = [
  { id:1,  title:'스쿼트 완벽 자세 가이드', author:'피트니스TV', views:84200, tags:['#스쿼트','#자세교정'], h:12 },
  { id:2,  title:'집에서 하는 30분 홈트 루틴', author:'홈트여왕', views:62100, tags:['#홈트','#초보자'], h:36 },
  { id:3,  title:'뱃살 빼는 코어 운동 10선', author:'다이어터민', views:51000, tags:['#다이어트','#코어'], h:5 },
  { id:4,  title:'데드리프트 입문자 가이드', author:'트레이너박', views:43000, tags:['#데드리프트','#하체'], h:48 },
  { id:5,  title:'어깨 라운드 교정 스트레칭', author:'자세교정연구소', views:38000, tags:['#자세교정','#어깨'], h:20 },
  { id:6,  title:'상체 루틴 완전 정복', author:'근육맨제이', views:35000, tags:['#상체','#루틴'], h:72 },
  { id:7,  title:'힙업 운동 TOP5', author:'힙돼지', views:31000, tags:['#힙업','#하체'], h:15 },
  { id:8,  title:'초보자 벌크업 식단 가이드', author:'영양사진', views:27000, tags:['#벌크업','#식단'], h:30 },
  { id:9,  title:'런닝 페이스별 칼로리 소모', author:'러너킴', views:24000, tags:['#러닝','#유산소'], h:40 },
  { id:10, title:'팔굽혀펴기 자세 교정', author:'피트니스TV', views:21000, tags:['#팔굽혀펴기','#상체'], h:60 },
  { id:11, title:'폼롤러 전신 마사지', author:'회복전문', views:18000, tags:['#폼롤러','#회복'], h:24 },
  { id:12, title:'플랭크 변형 10가지', author:'코어킹', views:15000, tags:['#플랭크','#코어'], h:90 },
];

const MOCK_COMMENTS = [
  { name:'pilates_j', text:'정말 도움이 많이 됐어요! 자세가 많이 나아진 것 같아요 😊', time:'2시간 전' },
  { name:'homefit', text:'이걸 보고 따라했는데 확실히 다르네요 ㅎㅎ', time:'3시간 전' },
  { name:'squat_q', text:'발 너비 부분 설명이 제일 이해가 잘 됐어요', time:'5시간 전' },
];

const fmt = n => {
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
};
const timeAgo = h => {
  if (h < 1)    return `${Math.floor(h*60)}분 전`;
  if (h < 24)   return `${Math.floor(h)}시간 전`;
  if (h < 168)  return `${Math.floor(h/24)}일 전`;
  return `${Math.floor(h/168)}주 전`;
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

function init() {
  const path = window.location.pathname;
  const id = parseInt(path.split('/').pop()) || 1;
  const vod = VOD_DATA.find(d => d.id === id) || VOD_DATA[0];

  document.title = `FITO - ${vod.title}`;
  document.getElementById('vod-title').textContent = vod.title;
  document.getElementById('vod-author').textContent = vod.author;
  document.getElementById('vod-meta').textContent = `조회수 ${fmt(vod.views)}회 · ${timeAgo(vod.h)}`;

  /* 태그 */
  const tagsEl = document.getElementById('vod-tags');
  vod.tags.forEach(t => {
    const s = document.createElement('span');
    s.className = 'hashtag';
    s.textContent = t;
    tagsEl.appendChild(s);
  });

  /* 좋아요 (mock) */
  let liked = false, likes = Math.floor(vod.views * 0.05);
  const likeBtn = document.getElementById('like-btn');
  document.getElementById('like-cnt').textContent = fmt(likes);
  likeBtn.addEventListener('click', () => {
    liked = !liked;
    likes += liked ? 1 : -1;
    document.getElementById('like-cnt').textContent = fmt(likes);
    likeBtn.classList.toggle('liked', liked);
  });

  /* 영상 설명 토글 */
  const desc = document.getElementById('vod-desc');
  const toggle = document.getElementById('desc-toggle');
  toggle.addEventListener('click', () => {
    const open = desc.classList.toggle('open');
    toggle.textContent = open ? '영상 설명 닫기 ▴' : '영상 설명 보기 ▾';
  });

  /* 댓글 미리보기 3개 */
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

  /* 추천 VOD (현재 제외 랜덤 4개) */
  const recList = document.getElementById('rec-list');
  const recs = VOD_DATA.filter(d => d.id !== id).slice(0,4);
  recs.forEach(r => {
    recList.innerHTML += `
      <div class="rec-card" onclick="location.href='/vod/${r.id}'">
        <div class="rec-thumb">커버 이미지</div>
        <div class="rec-info">
          <div class="rec-title">${r.title}</div>
          <div class="rec-meta">${r.author} · 조회수 ${fmt(r.views)}</div>
          <div class="rec-meta">${timeAgo(r.h)}</div>
        </div>
      </div>`;
  });

  /* Last-Playback (mock: 위치 저장/복원 안내) */
  const lastPos = getPos(id);
  if (lastPos > 0) {
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#f0f4ff;padding:10px 16px;font-size:12px;color:#4b668b;display:flex;align-items:center;justify-content:space-between;';
    banner.innerHTML = `<span>⏱ 이전에 ${Math.floor(lastPos/60)}분 ${lastPos%60}초까지 시청했어요</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:12px;color:#999;cursor:pointer">✕</button>`;
    document.querySelector('.vod-video').after(banner);
  }
  /* 시청 시뮬레이션: 3초 후부터 매초 위치 업데이트 */
  let watchSec = lastPos;
  setTimeout(() => {
    setInterval(() => { watchSec++; savePos(id, watchSec); }, 1000);
  }, 3000);

  /* 댓글 입력 */
  const input = document.getElementById('comment-input');
  document.querySelector('.comment-send').addEventListener('click', () => {
    if (!input.value.trim()) return;
    const c = { name:'나', text: input.value.trim(), time:'방금 전' };
    preview.innerHTML += `
      <div class="comment-item">
        <div class="comment-pic"></div>
        <div class="comment-body">
          <div class="comment-author">${c.name}</div>
          <div class="comment-text">${c.text}</div>
          <div class="comment-meta"><span>${c.time}</span></div>
        </div>
      </div>`;
    input.value = '';
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.querySelector('.comment-send').click();
  });

  /* 더보기 팝업 */
  document.getElementById('more-btn').addEventListener('click', () =>
    document.getElementById('more-popup').classList.add('open'));
  document.getElementById('more-bg').addEventListener('click', () =>
    document.getElementById('more-popup').classList.remove('open'));
}

document.addEventListener('DOMContentLoaded', init);
