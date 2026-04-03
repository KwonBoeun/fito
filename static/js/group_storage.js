/* ===========================
   FITO - 그룹 라이브 저장소 JS (v3)
   핏츠 만들기 기능 포함
   =========================== */
let currentSort = 'latest';
let currentVideoId = null;
let fitsCaptions = [];

const MUSIC_LIST = [
  { id:1, name:'Energetic Workout Beat', artist:'FitMusic', duration:'2:45' },
  { id:2, name:'Morning Run Vibes', artist:'RunBeats', duration:'3:12' },
  { id:3, name:'Core Power Mix', artist:'GymTracks', duration:'2:30' },
  { id:4, name:'Stretch & Relax', artist:'ChillFit', duration:'4:01' },
  { id:5, name:'HIIT Timer Beat', artist:'FitMusic', duration:'1:58' },
];

const VIDEOS = [
  { id:1, title:'하체 같이해요 🏋️', date:'2025-03-26', participants:'핏걸_나연 포함 6명', duration:'01:24:30', damaged:false },
  { id:2, title:'스쿼트 챌린지 100개', date:'2025-03-24', participants:'스쿼트킹 포함 5명', duration:'00:45:12', damaged:false },
  { id:3, title:'저녁 런지 루틴', date:'2025-03-22', participants:'런지퀸 포함 4명', duration:'00:38:50', damaged:false },
  { id:4, title:'코어 운동 20분', date:'2025-03-20', participants:'코어킹 포함 7명', duration:'00:22:15', damaged:false },
  { id:5, title:'전신 스트레칭', date:'2025-03-18', participants:'홈트여왕 포함 3명', duration:'00:30:00', damaged:true },
  { id:6, title:'데드리프트 폼 체크', date:'2025-03-15', participants:'트레이너박 포함 8명', duration:'01:02:10', damaged:false },
];

function setSort(s, btn) {
  currentSort = s;
  document.querySelectorAll('.gs-sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderVideos();
}

function renderVideos() {
  const list = document.getElementById('videoList');
  const empty = document.getElementById('emptyState');
  if (!VIDEOS.length) { list.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  let sorted = [...VIDEOS];
  if (currentSort==='latest') sorted.sort((a,b)=>new Date(b.date)-new Date(a.date));
  else sorted.sort((a,b)=>a.title.localeCompare(b.title,'ko'));

  list.innerHTML = sorted.map(v => {
    if (v.damaged) {
      return `<div class="gs-video-card ani" style="opacity:.4;pointer-events:none">
        <div class="gs-video-thumb"><span class="gs-video-duration">${v.duration}</span></div>
        <div class="gs-video-info"><div class="gs-video-title">${v.title}</div><div class="gs-video-meta">${v.date} · ${v.participants}</div>
        <div style="font-size:10px;color:#e05c4b;font-weight:600;margin-top:2px">영상 파일이 손상되었습니다</div></div>
      </div>`;
    }
    return `<div class="gs-video-card ani" onclick="openVideoDetail(${v.id})">
      <div class="gs-video-thumb"><span class="gs-video-duration">${v.duration}</span></div>
      <div class="gs-video-info">
        <div class="gs-video-title">${v.title}</div>
        <div class="gs-video-meta">${v.date} · ${v.participants}</div>
        <div class="gs-video-actions">
          <button class="gs-video-action-btn" onclick="event.stopPropagation();openFitsEditorDirect(${v.id})">핏츠 만들기</button>
          <button class="gs-video-action-btn" onclick="event.stopPropagation();showSnackbar('다운로드를 시작합니다')">다운로드</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── 영상 상세 ── */
function openVideoDetail(id) {
  currentVideoId = id;
  const v = VIDEOS.find(v=>v.id===id); if(!v) return;
  document.getElementById('detailTitle').textContent=v.title;
  document.getElementById('detailMeta').textContent=`${v.date} · ${v.participants} · ${v.duration}`;
  document.getElementById('videoOverlay').classList.add('open');
  document.getElementById('videoSheet').classList.add('open');
}
function closeVideoDetail() {
  document.getElementById('videoOverlay').classList.remove('open');
  document.getElementById('videoSheet').classList.remove('open');
}

/* ═══════════════════════════
   핏츠 만들기
   ═══════════════════════════ */
function openFitsEditor() {
  closeVideoDetail();
  initFitsEditor(currentVideoId);
}
function openFitsEditorDirect(id) {
  currentVideoId = id;
  initFitsEditor(id);
}

function initFitsEditor(videoId) {
  const v = VIDEOS.find(v=>v.id===videoId);
  if (!v) { showSnackbar('영상을 찾을 수 없습니다.'); return; }

  fitsCaptions = [];
  document.getElementById('fitsSourceTitle').textContent = v.title;
  document.getElementById('fitsStart').value = '00:00';
  document.getElementById('fitsEnd').value = '00:30';
  document.getElementById('fitsDuration').textContent = '30초';
  document.getElementById('fitsDesc').value = '';
  document.getElementById('fitsCaptionList').innerHTML = '';
  document.getElementById('fitsCaptionText').value = '';
  document.getElementById('fitsCaptionTime').value = '';
  document.getElementById('fitsMusicInfo').style.display = 'none';
  setFitsMusic('none');

  document.getElementById('fitsOverlay').classList.add('open');
  document.getElementById('fitsSheet').classList.add('open');

  // 구간 변경 시 자동 계산
  document.getElementById('fitsStart').addEventListener('input', updateFitsDuration);
  document.getElementById('fitsEnd').addEventListener('input', updateFitsDuration);
}

function closeFitsEditor() {
  document.getElementById('fitsOverlay').classList.remove('open');
  document.getElementById('fitsSheet').classList.remove('open');
}

function updateFitsDuration() {
  const start = parseTime(document.getElementById('fitsStart').value);
  const end = parseTime(document.getElementById('fitsEnd').value);
  if (start !== null && end !== null && end > start) {
    const dur = end - start;
    const m = Math.floor(dur / 60);
    const s = dur % 60;
    document.getElementById('fitsDuration').textContent = m > 0 ? `${m}분 ${s}초` : `${s}초`;
  } else {
    document.getElementById('fitsDuration').textContent = '--';
  }
}

function parseTime(str) {
  const parts = str.split(':');
  if (parts.length !== 2) return null;
  const m = parseInt(parts[0]), s = parseInt(parts[1]);
  if (isNaN(m) || isNaN(s)) return null;
  return m * 60 + s;
}

/* ── 음악 선택 ── */
function setFitsMusic(type) {
  document.getElementById('fitsMusicNone').classList.toggle('active', type==='none');
  document.getElementById('fitsMusicSelect').classList.toggle('active', type==='select');
  if (type === 'select') {
    // 음악 선택 목록 표시
    const pick = MUSIC_LIST[Math.floor(Math.random() * MUSIC_LIST.length)];
    const info = document.getElementById('fitsMusicInfo');
    info.style.display = 'block';
    info.innerHTML = `🎵 <b>${pick.name}</b> - ${pick.artist} (${pick.duration})<br>
      <span style="font-size:10px;color:var(--gray-400)">다른 음악을 선택하려면 '음악 선택' 버튼을 다시 누르세요</span>`;
  } else {
    document.getElementById('fitsMusicInfo').style.display = 'none';
  }
}

/* ── 자막 추가 ── */
function addFitsCaption() {
  const text = document.getElementById('fitsCaptionText').value.trim();
  const time = document.getElementById('fitsCaptionTime').value.trim();
  if (!text) { showSnackbar('자막 내용을 입력해주세요.'); return; }
  if (!time || !time.match(/^\d{2}:\d{2}$/)) { showSnackbar('시점을 00:00 형식으로 입력해주세요.'); return; }

  fitsCaptions.push({ text, time });
  document.getElementById('fitsCaptionText').value = '';
  document.getElementById('fitsCaptionTime').value = '';
  renderFitsCaptions();
}

function removeFitsCaption(idx) {
  fitsCaptions.splice(idx, 1);
  renderFitsCaptions();
}

function renderFitsCaptions() {
  const list = document.getElementById('fitsCaptionList');
  if (fitsCaptions.length === 0) {
    list.innerHTML = '<div style="font-size:11px;color:var(--gray-400);padding:4px 0">추가된 자막이 없습니다</div>';
    return;
  }
  list.innerHTML = fitsCaptions.map((c, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--gray-50);border-radius:8px;margin-bottom:4px">
      <span style="font-size:11px;font-weight:700;color:var(--blue);flex-shrink:0">${c.time}</span>
      <span style="font-size:12px;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${c.text}</span>
      <span style="cursor:pointer;font-size:14px;color:var(--gray-400)" onclick="removeFitsCaption(${i})">✕</span>
    </div>
  `).join('');
}

/* ── 핏츠 공유 ── */
function shareFits() {
  const start = document.getElementById('fitsStart').value;
  const end = document.getElementById('fitsEnd').value;
  const startSec = parseTime(start);
  const endSec = parseTime(end);

  if (startSec === null || endSec === null || endSec <= startSec) {
    showSnackbar('구간을 올바르게 설정해주세요.');
    return;
  }
  if (endSec - startSec > 180) {
    showSnackbar('핏츠는 최대 3분까지 가능합니다.');
    return;
  }

  const v = VIDEOS.find(v => v.id === currentVideoId);
  // 스토어에 핏츠 추가
  const params = new URLSearchParams(location.search);
  const gid = parseInt(params.get('group_id') || '1');

  FITO_STORE.update(s => {
    if (!s.groupStories[gid]) s.groupStories[gid] = [];
    s.groupStories[gid].unshift({
      id: Date.now(),
      author: s.myName || '나',
      title: document.getElementById('fitsDesc').value.trim() || (v ? v.title + ' 핏츠' : '새 핏츠'),
      time: '방금 전',
      views: 0,
    });
  });

  closeFitsEditor();
  showSnackbar('핏츠가 그룹에 공유되었습니다! 🎉');
}

function showSnackbar(msg) {
  const sb=document.getElementById('snackbar'); sb.textContent=msg; sb.classList.add('show');
  setTimeout(()=>sb.classList.remove('show'),3000);
}

document.addEventListener('DOMContentLoaded', () => { renderVideos(); });
