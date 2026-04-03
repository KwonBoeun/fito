/* ===========================
   FITO - 그룹 라이브 JS (v2)
   ALL 버튼, 이모티콘 선택, 채팅/공지
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

const EMOJIS = ['👏','💪','🔥','❤️','😂','✋','👍','🎉','💯','😍','🏋️','🤩'];

let liveChatMessages = [
  { author:'핏걸_나연', text:'다들 준비됐나요?', time:'14:30' },
  { author:'스쿼트킹', text:'네! 시작해요 💪', time:'14:31' },
];

/* ── 참가자 그리드 ── */
function renderParticipants() {
  const grid = document.getElementById('participantsGrid');
  const maxShow = showAllParticipants ? PARTICIPANTS.length : 4;
  const visible = PARTICIPANTS.slice(0, maxShow);

  grid.innerHTML = visible.map(p => `
    <div class="gl-participant">
      ${p.camOn ? '' : '<div class="gl-participant-avatar"></div>'}
      <span class="gl-participant-name">${p.name}${p.isHost ? ' 👑' : ''}</span>
      ${p.hand ? '<span class="gl-participant-hand">✋</span>' : ''}
    </div>
  `).join('');

  const moreEl = document.getElementById('moreParticipants');
  if (PARTICIPANTS.length > 4) {
    moreEl.style.display = 'flex';
    document.getElementById('moreBtn').textContent =
      showAllParticipants ? '접기 ▲' : `더보기 (${PARTICIPANTS.length - 4}명) ▼`;
  } else { moreEl.style.display = 'none'; }
}

function toggleAllParticipants() {
  showAllParticipants = !showAllParticipants;
  renderParticipants();
}

/* ── 마이크 ── */
function toggleMic() {
  micOn = !micOn;
  document.getElementById('micBtn').classList.toggle('off', !micOn);
  showSnackbar(micOn ? '마이크 ON' : '마이크 OFF');
}

/* ── 카메라 ── */
function toggleCam() {
  camOn = !camOn;
  document.getElementById('camBtn').classList.toggle('off', !camOn);
  document.getElementById('filterBtn').classList.toggle('off', !camOn);
  showSnackbar(camOn ? '카메라 ON' : '카메라 OFF');
}

/* ── 음량 ── */
function toggleVolume() {
  volumeOn = !volumeOn;
  const btn = document.getElementById('volumeBtn');
  btn.innerHTML = volumeOn
    ? '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'
    : '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
}

/* ── 이모티콘 선택 UI ── */
function sendEmoji() {
  document.getElementById('emojiOverlay').classList.add('open');
  document.getElementById('emojiSheet').classList.add('open');
}
function closeEmoji() {
  document.getElementById('emojiOverlay').classList.remove('open');
  document.getElementById('emojiSheet').classList.remove('open');
}
function pickEmoji(emoji) {
  closeEmoji();
  showSnackbar(`${emoji} 이모티콘을 보냈습니다`);
  // 참가자 화면에 일시적으로 표시
  const grid = document.getElementById('participantsGrid');
  const mySlot = grid.querySelector('.gl-participant:last-child');
  if (mySlot) {
    const emojiEl = document.createElement('span');
    emojiEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:36px;animation:emojiFade 2s ease forwards;z-index:10';
    emojiEl.textContent = emoji;
    mySlot.appendChild(emojiEl);
    setTimeout(() => emojiEl.remove(), 2000);
  }
}

/* ── 필터/배경 ── */
function toggleFilter() {
  if (!camOn) { showSnackbar('카메라를 먼저 켜주세요'); return; }
  showSnackbar('필터가 적용되었습니다');
}

/* ── 화면 공유 ── */
function sharScreen() { showSnackbar('화면 공유 요청을 보냈습니다'); }

/* ── 더보기 (채팅, 공지, 녹화) ── */
function openMoreTools() {
  document.getElementById('moreOverlay').classList.add('open');
  document.getElementById('moreSheet').classList.add('open');
}
function closeMoreTools() {
  document.getElementById('moreOverlay').classList.remove('open');
  document.getElementById('moreSheet').classList.remove('open');
}

/* ── 라이브 내 채팅 ── */
function openLiveChat() {
  closeMoreTools();
  renderLiveChatMessages();
  document.getElementById('chatOverlay').classList.add('open');
  document.getElementById('chatSheet').classList.add('open');
}
function closeLiveChat() {
  document.getElementById('chatOverlay').classList.remove('open');
  document.getElementById('chatSheet').classList.remove('open');
}
function renderLiveChatMessages() {
  const list = document.getElementById('liveChatList');
  list.innerHTML = liveChatMessages.map(m => `
    <div style="margin-bottom:8px">
      <span style="font-size:11px;font-weight:700;color:var(--orange)">${m.author}</span>
      <span style="font-size:10px;color:var(--gray-400);margin-left:4px">${m.time}</span>
      <div style="font-size:13px;color:var(--black);margin-top:2px">${m.text}</div>
    </div>
  `).join('');
  list.scrollTop = list.scrollHeight;
}
function sendLiveChat() {
  const input = document.getElementById('liveChatInput');
  const text = input.value.trim();
  if (!text) return;
  const now = new Date();
  liveChatMessages.push({
    author: '나',
    text: text,
    time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  });
  input.value = '';
  renderLiveChatMessages();
}

/* ── 공지 편집 ── */
function editNotice() {
  closeMoreTools();
  document.getElementById('noticeEditOverlay').classList.add('open');
  document.getElementById('noticeEditSheet').classList.add('open');
  document.getElementById('noticeEditInput').value = document.getElementById('noticeText').textContent;
}
function closeNoticeEdit() {
  document.getElementById('noticeEditOverlay').classList.remove('open');
  document.getElementById('noticeEditSheet').classList.remove('open');
}
function saveNotice() {
  const val = document.getElementById('noticeEditInput').value.trim();
  if (val) document.getElementById('noticeText').textContent = val;
  closeNoticeEdit();
  showSnackbar('공지가 수정되었습니다');
}

/* ── 녹화 토글 ── */
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
      <span style="position:absolute;bottom:2px;left:4px;font-size:9px;color:#fff;background:rgba(0,0,0,.5);padding:1px 4px;border-radius:3px">${p.name}${p.isHost?' 👑':''}</span>
      ${p.hand ? '<span style="position:absolute;top:2px;right:4px;font-size:12px">✋</span>' : ''}
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
function closeExitModal() { document.getElementById('exitModal').classList.remove('open'); }
function confirmExit() {
  exitLock = true;
  closeExitModal();
  location.href = window.URL_GROUP_MAIN || '/group';
}

/* ── 스낵바 ── */
let snackTimer = null;
function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg; sb.style.bottom = '80px';
  sb.classList.add('show');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => sb.classList.remove('show'), 2500);
}

document.addEventListener('DOMContentLoaded', () => { renderParticipants(); });
