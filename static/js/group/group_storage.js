/* ===========================
   FITO - 그룹 라이브 저장소 JS
   =========================== */

let currentSort = 'latest';

const VIDEOS = [
  { id:1, title:'하체 같이해요 🏋️', date:'2025-03-26', participants:'핏걸_나연 포함 6명', duration:'01:24:30', damaged:false },
  { id:2, title:'스쿼트 챌린지 100개', date:'2025-03-24', participants:'스쿼트킹 포함 5명', duration:'00:45:12', damaged:false },
  { id:3, title:'저녁 런지 루틴', date:'2025-03-22', participants:'런지퀸 포함 4명', duration:'00:38:50', damaged:false },
  { id:4, title:'코어 운동 20분', date:'2025-03-20', participants:'코어킹 포함 7명', duration:'00:22:15', damaged:false },
  { id:5, title:'전신 스트레칭', date:'2025-03-18', participants:'홈트여왕 포함 3명', duration:'00:30:00', damaged:true },
  { id:6, title:'데드리프트 폼 체크', date:'2025-03-15', participants:'트레이너박 포함 8명', duration:'01:02:10', damaged:false },
  { id:7, title:'아침 유산소 루틴', date:'2025-03-12', participants:'다이어터민 포함 5명', duration:'00:28:45', damaged:false },
  { id:8, title:'그룹 운동 모임', date:'2025-03-10', participants:'핏걸_나연 포함 6명', duration:'01:10:20', damaged:false },
  { id:9, title:'플랭크 챌린지', date:'2025-03-08', participants:'코어킹 포함 4명', duration:'00:15:30', damaged:false },
  { id:10, title:'힙업 운동 모음', date:'2025-03-05', participants:'런지퀸 포함 5명', duration:'00:42:18', damaged:false },
  { id:11, title:'스트레칭 & 폼롤러', date:'2025-03-03', participants:'홈트여왕 포함 3명', duration:'00:25:00', damaged:false },
  { id:12, title:'벤치프레스 기록 도전', date:'2025-03-01', participants:'근육맨제이 포함 6명', duration:'00:55:40', damaged:false },
];

/* ── 정렬 ── */
function setSort(sort, btn) {
  currentSort = sort;
  document.querySelectorAll('.gs-sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderVideos();
}

/* ── 영상 리스트 렌더 ── */
function renderVideos() {
  const list = document.getElementById('videoList');
  const empty = document.getElementById('emptyState');

  if (VIDEOS.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  let sorted = [...VIDEOS];
  if (currentSort === 'latest') {
    sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
  }

  list.innerHTML = sorted.map(v => {
    const damagedStyle = v.damaged ? 'opacity:.4;pointer-events:none' : '';
    const damagedLabel = v.damaged
      ? '<div style="font-size:10px;color:var(--red);font-weight:600;margin-top:2px">영상 파일이 손상되었습니다</div>'
      : '';
    return `<div class="gs-video-card ani" style="${damagedStyle}" onclick="${v.damaged ? '' : `openVideoDetail(${v.id})`}">
      <div class="gs-video-thumb">
        <span class="gs-video-duration">${v.duration}</span>
      </div>
      <div class="gs-video-info">
        <div class="gs-video-title">${v.title}</div>
        <div class="gs-video-meta">${v.date} · ${v.participants}</div>
        ${damagedLabel}
        ${!v.damaged ? `<div class="gs-video-actions">
          <button class="gs-video-action-btn" onclick="event.stopPropagation();showSnackbar('핏츠 편집 화면으로 이동합니다')">핏츠 만들기</button>
          <button class="gs-video-action-btn" onclick="event.stopPropagation();showSnackbar('다운로드를 시작합니다')">다운로드</button>
        </div>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ── 영상 상세 ── */
function openVideoDetail(id) {
  const v = VIDEOS.find(v => v.id === id);
  if (!v) return;
  document.getElementById('detailTitle').textContent = v.title;
  document.getElementById('detailMeta').textContent = `${v.date} · ${v.participants} · ${v.duration}`;
  document.getElementById('videoOverlay').classList.add('open');
  document.getElementById('videoSheet').classList.add('open');
}
function closeVideoDetail() {
  document.getElementById('videoOverlay').classList.remove('open');
  document.getElementById('videoSheet').classList.remove('open');
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
  renderVideos();
});
