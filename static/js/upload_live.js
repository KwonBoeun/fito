/* ===========================
   FITO - Live Upload JS v2
   =========================== */

/* 상태 변수 */
let state        = 'pre';
let stream       = null;
let isMicOn      = true;
let isCamOn      = true;
let isMirrored   = true;
let isRecording  = false;
let liveTimer    = null;
let liveSeconds  = 0;
let viewerTimer  = null;
let viewerCount  = 0;
let activePanel  = null;
let selectedFilter = -1;
let selectedBg     = -1;

/* DOM 참조 */
const video         = document.getElementById('live-video');
const fallback      = document.getElementById('live-video-fallback');
const camOffOverlay = document.getElementById('cam-off-overlay');
const previewHint   = document.getElementById('preview-hint');
const liveTitle     = document.getElementById('live-title');
const descRow       = document.getElementById('desc-row');
const statusBar     = document.getElementById('status-bar');
const viewerRow     = document.getElementById('viewer-count-row');
const viewerNum     = document.getElementById('viewer-num');
const timerEl       = document.getElementById('live-timer');
const recDot        = document.querySelector('.rec-dot');
const micBtn        = document.getElementById('mic-btn');
const micSvgOn      = document.getElementById('mic-svg-on');
const micSvgOff     = document.getElementById('mic-svg-off');
const camBtn        = document.getElementById('cam-btn');
const camSvgOn      = document.getElementById('cam-svg-on');
const camSvgOff     = document.getElementById('cam-svg-off');
const mirrorBtn     = document.getElementById('mirror-btn');
const filterBtn     = document.getElementById('filter-btn');
const bgBtn         = document.getElementById('bg-btn');
const recToggleBtn  = document.getElementById('rec-toggle-btn');
const recToggleDot  = document.querySelector('.rec-toggle-dot');
const startLiveBtn  = document.getElementById('start-live-btn');
const endBtn        = document.getElementById('end-btn');
const bottomPre     = document.getElementById('bottom-pre');
const bottomLive    = document.getElementById('bottom-live');
const viewerList    = document.getElementById('viewer-list');
const filterPanel   = document.getElementById('filter-panel');
const bgPanel       = document.getElementById('bg-panel');
const panelDim      = document.getElementById('panel-dim');
const filterConfirm = document.getElementById('filter-confirm');
const bgConfirm     = document.getElementById('bg-confirm');
const filterGrid    = document.getElementById('filter-grid');
const bgGrid        = document.getElementById('bg-grid');
const endOverlay    = document.getElementById('end-overlay');

/* ═══ 카메라 시작 ═══ */
async function startCamera() {
  try {
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    });
    video.srcObject = stream;
    fallback.classList.remove('show');
    stream.getAudioTracks().forEach(t => { t.enabled = isMicOn; });
    stream.getVideoTracks().forEach(t => { t.enabled = isCamOn; });
    applyMirror();
  } catch (err) {
    console.warn('Camera error:', err.name);
    fallback.classList.add('show');
  }
}

/* ═══ 마이크 ON/OFF ═══ */
function toggleMic() {
  isMicOn = !isMicOn;
  if (stream) stream.getAudioTracks().forEach(t => { t.enabled = isMicOn; });
  micBtn.classList.toggle('off', !isMicOn);
  micSvgOn.style.display  = isMicOn  ? '' : 'none';
  micSvgOff.style.display = !isMicOn ? '' : 'none';
}

/* ═══ 카메라 ON/OFF ═══ */
function toggleCamera() {
  isCamOn = !isCamOn;
  if (stream) stream.getVideoTracks().forEach(t => { t.enabled = isCamOn; });
  camOffOverlay.classList.toggle('show', !isCamOn);
  camBtn.classList.toggle('off', !isCamOn);
  camSvgOn.style.display  = isCamOn  ? '' : 'none';
  camSvgOff.style.display = !isCamOn ? '' : 'none';
}

/* ═══ 미러 ═══ */
function applyMirror() {
  video.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
}
function toggleMirror() {
  isMirrored = !isMirrored;
  mirrorBtn.classList.toggle('active', isMirrored);
  applyMirror();
}

/* ═══ 녹화 토글 ═══ */
function toggleRecording() {
  isRecording = !isRecording;
  recToggleDot.classList.toggle('active', isRecording);
  document.getElementById('rec-toggle-label').textContent =
    isRecording ? '녹화중' : '녹화하기';
}

/* ═══ 라이브 시작 ═══ */
function startLiveBroadcast() {
  if (!liveTitle.value.trim()) {
    liveTitle.focus();
    liveTitle.style.outline = '2px solid rgba(232,22,28,.9)';
    liveTitle.animate([
      {transform:'translateX(-6px)'},{transform:'translateX(6px)'},
      {transform:'translateX(-4px)'},{transform:'translateX(4px)'},
      {transform:'translateX(0)'}
    ], {duration:400, easing:'ease'});
    setTimeout(() => { liveTitle.style.outline = ''; }, 1500);
    return;
  }

  state = 'live';

  /* UI 전환 */
  descRow.style.display     = 'none';
  previewHint.style.display = 'none';
  bottomPre.style.display   = 'none';
  statusBar.classList.add('show');
  viewerRow.classList.add('show');
  bottomLive.classList.add('show');

  if (isRecording) recDot.classList.add('active');

  /* 타이머 */
  liveSeconds = 0;
  liveTimer = setInterval(() => {
    liveSeconds++;
    timerEl.textContent = formatTime(liveSeconds);
  }, 1000);

  /* 시청자 시뮬레이션 */
  viewerCount = Math.floor(Math.random() * 100) + 30;
  updateViewerCount();
  viewerTimer = setInterval(simulateViewers, 3000);

  /* 입장 채팅 */
  setTimeout(() => addViewerMsg('핏걸_나연',  '방금 들어왔어요! 👋'),    800);
  setTimeout(() => addViewerMsg('운동짱82',   '오늘도 파이팅! 💪'),      2500);
  setTimeout(() => addViewerMsg('헬린이탈출', '어떤 운동 할 거예요?'),    4500);
  setTimeout(() => addViewerMsg('코어킹',     '구독했어요 🔥'),           6500);
}

/* ═══ 방송 종료 ═══ */
function endBroadcast() {
  state = 'ended';
  clearInterval(liveTimer);
  clearInterval(viewerTimer);
  if (stream) stream.getTracks().forEach(t => t.stop());
  endOverlay.classList.add('show');
}

/* ═══ 시간 포맷 ═══ */
function formatTime(s) {
  const h   = String(Math.floor(s / 3600)).padStart(2, '0');
  const m   = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

/* ═══ 가짜 시청자 ═══ */
const FAKE_USERS = [
  '운동짱82','핏걸_나연','헬린이탈출','PT박코치','스쿼트킹',
  '다이어터민','근육맨제이','홈트여왕','러너킴','코어킹',
  '새벽운동러','힙업퀸','식스팩왕','런지마스터','벤치맨'
];
const FAKE_MSGS = [
  '안녕하세요!👋','오늘도 파이팅!💪','운동 너무 힘들어요ㅠ',
  '정말 대단하세요!','질문 있어요!','몇 세트 하시나요?',
  '저도 따라하고 있어요!','구독했어요🔥','자세가 너무 예쁘네요',
  '좋아요 눌렀어요❤️','화이팅!!','오늘 얼마나 하실 예정이에요?',
  '같이 운동하니까 더 힘나요','최고예요!🏆','응원합니다!!',
];
function simulateViewers() {
  if (state !== 'live') return;
  viewerCount = Math.max(1, viewerCount + Math.floor(Math.random() * 25) - 8);
  updateViewerCount();
  if (Math.random() > 0.35) {
    addViewerMsg(
      FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
      FAKE_MSGS [Math.floor(Math.random() * FAKE_MSGS.length)]
    );
  }
}
function updateViewerCount() { viewerNum.textContent = viewerCount.toLocaleString(); }
function addViewerMsg(name, msg) {
  const item = document.createElement('div');
  item.className = 'viewer-item';
  item.innerHTML =
    `<div class="viewer-avatar">${name[0]}</div>` +
    `<span class="viewer-name">${name}</span>` +
    `<span class="viewer-msg">${msg}</span>`;
  viewerList.appendChild(item);
  while (viewerList.children.length > 5) viewerList.removeChild(viewerList.firstChild);
}

/* ═══ 필터/배경 패널 (선택만, 체크 표시) ═══ */
const FILTER_COLORS = [
  ['#e5e5e5','#cccccc'],
  ['#16a34a','#4ade80'],['#2563eb','#93c5fd'],['#dc2626','#fca5a5'],
  ['#d97706','#fcd34d'],['#7c3aed','#c4b5fd'],['#0891b2','#67e8f9'],
  ['#065f46','#6ee7b7'],['#1e3a5f','#93bbdf'],['#831843','#f9a8d4'],
  ['#78350f','#fbbf24'],['#134e4a','#5eead4'],['#1e1b4b','#818cf8'],
];
const BG_COLORS = [
  ['#e5e5e5','#cccccc'],
  ['#1a1a2e','#16213e'],['#065f46','#6ee7b7'],['#7c3aed','#a78bfa'],
  ['#dc2626','#fca5a5'],['#d97706','#fcd34d'],['#0891b2','#67e8f9'],
  ['#111827','#374151'],['#831843','#f9a8d4'],['#1e3a5f','#3b82f6'],
  ['#064e3b','#10b981'],['#4a044e','#c026d3'],['#1c1917','#57534e'],
];

function buildGrid(container, colors, currentIdx, onSelect) {
  container.innerHTML = '';
  colors.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'panel-thumb' + (i === currentIdx ? ' selected' : '');
    div.style.background = `linear-gradient(135deg,${c[0]},${c[1]})`;
    if (i === 0) {
      div.innerHTML = `<span style="position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;font-size:10px;font-weight:700;color:#999;letter-spacing:-.3px">없음</span>`;
      div.style.position = 'relative';
    }
    div.addEventListener('click', () => {
      container.querySelectorAll('.panel-thumb').forEach(t => t.classList.remove('selected'));
      div.classList.add('selected');
      onSelect(i);
    });
    container.appendChild(div);
  });
}

function openPanel(type) {
  if (activePanel === type) { closePanel(); return; }
  closePanel(false);
  activePanel = type;
  panelDim.classList.add('show');
  if (type === 'filter') {
    buildGrid(filterGrid, FILTER_COLORS,
      selectedFilter === -1 ? 0 : selectedFilter, i => { selectedFilter = i === 0 ? -1 : i; });
    filterPanel.classList.add('open');
    filterBtn.classList.add('active');
  } else {
    buildGrid(bgGrid, BG_COLORS,
      selectedBg === -1 ? 0 : selectedBg, i => { selectedBg = i === 0 ? -1 : i; });
    bgPanel.classList.add('open');
    bgBtn.classList.add('active');
  }
}
function closePanel(resetActive = true) {
  filterPanel.classList.remove('open');
  bgPanel.classList.remove('open');
  panelDim.classList.remove('show');
  filterBtn.classList.remove('active');
  bgBtn.classList.remove('active');
  if (resetActive) activePanel = null;
}

/* 패널 탭 */
['filter-tabs','bg-tabs'].forEach(tabsId => {
  document.querySelectorAll(`#${tabsId} .panel-tab`).forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll(`#${tabsId} .panel-tab`).forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});

/* ═══ 이벤트 바인딩 ═══ */
micBtn.addEventListener('click',        toggleMic);
camBtn.addEventListener('click',        toggleCamera);
mirrorBtn.addEventListener('click',     toggleMirror);
filterBtn.addEventListener('click',     () => openPanel('filter'));
bgBtn.addEventListener('click',         () => openPanel('bg'));
recToggleBtn.addEventListener('click',  toggleRecording);
startLiveBtn.addEventListener('click',  startLiveBroadcast);
endBtn.addEventListener('click',        endBroadcast);
filterConfirm.addEventListener('click', closePanel);
bgConfirm.addEventListener('click',     closePanel);
panelDim.addEventListener('click',      closePanel);

/* ═══ 초기화 ═══ */
document.addEventListener('DOMContentLoaded', async () => {
  mirrorBtn.classList.add('active');
  await startCamera();
});

function cleanup() {
  if (stream) stream.getTracks().forEach(t => t.stop());
  clearInterval(liveTimer);
  clearInterval(viewerTimer);
}
window.addEventListener('pagehide', cleanup);
window.addEventListener('beforeunload', cleanup);
