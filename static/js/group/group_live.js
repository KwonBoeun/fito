/* ===========================
   FITO - 그룹 라이브 JS
   =========================== */

let micOn = true, camOn = false, isRec = false, volumeOn = true;
let showAllParticipants = false;

const PARTICIPANTS = [
  { name:'핏걸_나연', isHost:true, camOn:true, hand:false },
  { name:'스쿼트킹', isHost:false, camOn:true, hand:false },
  { name:'런지퀸', isHost:false, camOn:false, hand:true },
  { name:'코어킹', isHost:false, camOn:true, hand:false },
  { name:'다이어터민', isHost:false, camOn:false, hand:false },
  { name:'홈트여왕', isHost:false, camOn:true, hand:false },
];

/* ── 참가자 그리드 렌더 ── */
function renderParticipants() {
  const grid = document.getElementById('participantsGrid');
  const maxShow = showAllParticipants ? PARTICIPANTS.length : 4;
  const visible = PARTICIPANTS.slice(0, maxShow);

  grid.innerHTML = visible.map(p => `
    <div class="gl-participant">
      ${p.camOn ? '' : `<div class="gl-participant-avatar"></div>`}
      <span class="gl-participant-name">${p.name}${p.isHost ? ' 👑' : ''}</span>
      ${p.hand ? '<span class="gl-participant-hand">✋</span>' : ''}
    </div>
  `).join('');

  // 더보기 버튼
  const moreEl = document.getElementById('moreParticipants');
  if (PARTICIPANTS.length > 4) {
    moreEl.style.display = 'flex';
    document.getElementById('moreBtn').textContent =
      showAllParticipants ? '접기 ▲' : `더보기 (${PARTICIPANTS.length - 4}명) ▼`;
  } else {
    moreEl.style.display = 'none';
  }
}

function toggleAllParticipants() {
  showAllParticipants = !showAllParticipants;
  renderParticipants();
}

/* ── 마이크 토글 ── */
function toggleMic() {
  micOn = !micOn;
  document.getElementById('micBtn').classList.toggle('off', !micOn);
  showSnackbar(micOn ? '마이크가 켜졌습니다' : '마이크가 꺼졌습니다');
}

/* ── 카메라 토글 ── */
function toggleCam() {
  camOn = !camOn;
  document.getElementById('camBtn').classList.toggle('off', !camOn);
  document.getElementById('filterBtn').classList.toggle('off', !camOn);
  showSnackbar(camOn ? '카메라가 켜졌습니다' : '카메라가 꺼졌습니다');
}

/* ── 음량 토글 ── */
function toggleVolume() {
  volumeOn = !volumeOn;
  const btn = document.getElementById('volumeBtn');
  if (volumeOn) {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  } else {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
  }
}

/* ── 이모티콘/손들기 ── */
function sendEmoji() {
  const emojis = ['👏', '💪', '🔥', '❤️', '😂', '✋'];
  const pick = emojis[Math.floor(Math.random() * emojis.length)];
  showSnackbar(`${pick} 이모티콘을 보냈습니다`);
}

/* ── 필터/배경 ── */
function toggleFilter() {
  if (!camOn) {
    showSnackbar('카메라를 먼저 켜주세요');
    return;
  }
  showSnackbar('필터가 적용되었습니다');
}

/* ── 화면 공유 ── */
function sharScreen() {
  showSnackbar('화면 공유 요청을 보냈습니다');
}

/* ── 더보기 도구 ── */
function openMoreTools() {
  document.getElementById('moreOverlay').classList.add('open');
  document.getElementById('moreSheet').classList.add('open');
}
function closeMoreTools() {
  document.getElementById('moreOverlay').classList.remove('open');
  document.getElementById('moreSheet').classList.remove('open');
}

function openLiveChat() {
  closeMoreTools();
  showSnackbar('채팅 창을 불러오는 중...');
}

function editNotice() {
  closeMoreTools();
  const newNotice = prompt('공지를 입력하세요:');
  if (newNotice) {
    document.getElementById('noticeText').textContent = newNotice;
    showSnackbar('공지가 수정되었습니다');
  }
}

function toggleRec() {
  isRec = !isRec;
  document.getElementById('recIcon').style.display = isRec ? 'flex' : 'none';
  document.getElementById('recToggleLabel').textContent = isRec ? '녹화 중지' : '녹화 시작';
  closeMoreTools();
  showSnackbar(isRec ? '녹화가 시작되었습니다' : '녹화가 중지되었습니다');
}

/* ── ALL 보기 ── */
function openAllView() {
  const grid = document.getElementById('allParticipantsGrid');
  grid.innerHTML = PARTICIPANTS.map(p => `
    <div style="aspect-ratio:4/3;background:#1a1a1a;border-radius:6px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
      ${p.camOn ? '' : '<div style="width:30px;height:30px;border-radius:50%;background:#555"></div>'}
      <span style="position:absolute;bottom:2px;left:4px;font-size:9px;color:#fff;background:rgba(0,0,0,.5);padding:1px 4px;border-radius:3px">${p.name}</span>
    </div>
  `).join('');
  document.getElementById('allOverlay').classList.add('open');
  document.getElementById('allSheet').classList.add('open');
}
function closeAllView() {
  document.getElementById('allOverlay').classList.remove('open');
  document.getElementById('allSheet').classList.remove('open');
}

/* ── 나가기 ── */
let exitLock = false;
function exitLive() {
  if (exitLock) return;
  document.getElementById('exitModal').classList.add('open');
}
function closeExitModal() {
  document.getElementById('exitModal').classList.remove('open');
}
function confirmExit() {
  exitLock = true;
  closeExitModal();
  location.href = window.URL_GROUP_MAIN || '/group';
}

/* ── 스낵바 ── */
let snackTimer = null;
function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg;
  sb.style.bottom = '80px';
  sb.classList.add('show');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => sb.classList.remove('show'), 2500);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  renderParticipants();
});
