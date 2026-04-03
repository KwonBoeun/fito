/* ===========================
   FITO - 트레이너 라이브 JS
   =========================== */

/* ── Mock 데이터 ── */
const TRAINER_NAME = '김맹맹';
const USER_NAME    = '김땡땡';  // 5자 초과 시 ... 처리
const NOTICE_FULL  = '오늘 하체 루틴 집중! 스쿼트 3세트, 런지 3세트, 레그프레스 3세트 진행합니다. 질문은 채팅으로 남겨주세요.';
const NOTICE_MAX_PREVIEW = 18;

/* ── 상태 ── */
let micOn = true, camOn = true;
let micDisabled = false, camDisabled = false; // 트레이너 제한
let raiseHandOn = false;
let uiVisible = true;
let uiTimer = null;
let trainerSolo = false, userSolo = false;
let noticeExpanded = false;
let bannerOn = true, untilNewOn = false;
let selectedAudio = 'speaker';
let reactionOpen = false;

/* 이모티콘 제한 */
let emojiCount = 0;
let emojiLimited = false;
let emojiResetTimer = null;
const EMOJI_MAX = 4, EMOJI_WINDOW = 5000;

/* 채팅 */
let isWhisper = false;

/* 라이브 타이머 */
let liveSeconds = 0;
let liveParticipants = 2;

/* ════════════════════════
   참여자 탭바
   ════════════════════════ */
let activePtab = 'all';

/* 참여자 탭 데이터 */
const PARTICIPANTS = {
  all:     { label: 'ALL',    name: '',        type: 'all' },
  trainer: { label: '김맹맹', name: '김맹맹',  type: 'trainer' },
  user1:   { label: '박민지', name: '박민지',  type: 'user' },
  user2:   { label: '이준혁', name: '이준혁',  type: 'user' },
  user3:   { label: '최수연', name: '최수연',  type: 'user' },
};

function selectPtab(el, userId) {
  activePtab = userId;
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');

  const trainer = document.getElementById('trainerScreen');
  const user    = document.getElementById('userScreen');

  const videoArea = document.getElementById('videoArea');
  const userGrid  = document.getElementById('userGrid');

  if (userId === 'all') {
    // ALL: 트레이너 상단 + 참여자 2열 그리드
    videoArea.classList.add('all-mode');
    trainer.style.display = '';
    trainer.style.flex    = '';
    user.style.display    = 'none';
    userGrid.style.display = 'grid';
    // 내 이름 그리드에 반영
    const gridMyName = document.getElementById('gridMyName');
    if (gridMyName) {
      gridMyName.textContent = USER_NAME.length > 5 ? USER_NAME.slice(0,5)+'...' : USER_NAME;
    }
  } else if (userId === 'trainer') {
    // 트레이너 단독
    videoArea.classList.remove('all-mode');
    trainer.style.display = '';
    trainer.style.flex    = '1';
    user.style.display    = 'none';
    userGrid.style.display = 'none';
  } else {
    // 특정 참여자 → 기본 2분할 (트레이너 + 해당 참여자)
    videoArea.classList.remove('all-mode');
    const p = PARTICIPANTS[userId];
    trainer.style.display = '';
    trainer.style.flex    = '6';
    user.style.display    = '';
    user.style.flex       = '4';
    userGrid.style.display = 'none';
    // 사용자 화면에 선택 참여자 표시
    const nm = p.name.length > 5 ? p.name.slice(0,5)+'...' : p.name;
    document.getElementById('userNameBadge').textContent = nm;
    document.getElementById('userAvatar').textContent    = p.name[0] || '?';
  }
  resetUITimer();
}

// 탭 스크롤 (< 버튼)
function scrollPtab() {
  const scroll = document.getElementById('ptabScroll');
  const arrow  = scroll.parentElement.querySelector('.ptab-arrow svg');
  // 방향 전환
  if (scroll.scrollLeft > 0) {
    scroll.scrollLeft -= 80;
    // 맨 왼쪽이면 화살표 방향 다시 오른쪽으로
    if (scroll.scrollLeft <= 0) rotateArrow(arrow, false);
  } else {
    scroll.scrollLeft += 80;
    rotateArrow(arrow, true);
  }
}
function rotateArrow(svg, toLeft) {
  svg.style.transform = toLeft ? 'rotate(180deg)' : 'rotate(0deg)';
}

/* ════════════════════════
   시스템 알림 토스트
   ════════════════════════ */
let toastTimer = null;

function showSysToast(msg) {
  const toast = document.getElementById('sysToast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// 탭바 UI 자동 숨김 연동
const _origShowUI = showUI;
const _origHideUI = hideUI;

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', () => {
  initNotice();
  initUserName();
  startLiveTimer();
  startUIAutoHide();
  // 시뮬레이션: 5초 후 매니저 권한 알림
  // setTimeout(() => showSysToast('트레이너가 매니저 권한을 부여하였습니다'), 5000);
});

/* ── 공지 초기화 ── */
function initNotice() {
  const preview = NOTICE_FULL.length > NOTICE_MAX_PREVIEW
    ? NOTICE_FULL.slice(0, NOTICE_MAX_PREVIEW) + '...'
    : NOTICE_FULL;
  document.getElementById('noticePreviewText').textContent = preview;
  document.getElementById('noticeFullText').textContent   = NOTICE_FULL;
}

/* ── 사용자 이름 (5자 초과 시 ...) ── */
function initUserName() {
  const name = USER_NAME.length > 5 ? USER_NAME.slice(0, 5) + '...' : USER_NAME;
  document.getElementById('userNameBadge').textContent = name;
  document.getElementById('myMemberName').textContent  = USER_NAME;
  document.getElementById('userAvatar').textContent    = USER_NAME[0];
  document.getElementById('trainerNameTop').textContent    = TRAINER_NAME + ' 트레이너';
  document.getElementById('trainerNameBadge').textContent  = TRAINER_NAME;
  document.getElementById('trainerAvatar').textContent     = TRAINER_NAME[0];
}

/* ════════════════════════
   라이브 타이머
   ════════════════════════ */
function startLiveTimer() {
  setInterval(() => {
    liveSeconds++;
    const h = String(Math.floor(liveSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((liveSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(liveSeconds % 60).padStart(2, '0');
    const display = liveSeconds >= 3600 ? `${h}:${m}:${s} 경과` : `${m}:${s} 경과`;
    document.getElementById('liveTimer').textContent = `${display} · ${liveParticipants}인 참여중`;
  }, 1000);
}

/* ════════════════════════
   UI 자동 숨김 (10초)
   ════════════════════════ */
function startUIAutoHide() {
  resetUITimer(); // 진입 시 UI 표시 → 10초 후 자동 숨김
}
function resetUITimer() {
  clearTimeout(uiTimer);
  showUI();
  uiTimer = setTimeout(hideUI, 10000);
}
function showUI() {
  uiVisible = true;
  document.getElementById('liveTopbar').classList.remove('hidden');
  document.getElementById('liveToolbar').classList.remove('hidden');
  // 탭바: 숨기지 않고 위로 이동 (도구바 위)
  document.getElementById('participantTabsWrap').classList.add('ui-visible');
}
function hideUI() {
  uiVisible = false;
  document.getElementById('liveTopbar').classList.add('hidden');
  document.getElementById('liveToolbar').classList.add('hidden');
  // 탭바: 아래로 내려옴 (항상 표시)
  document.getElementById('participantTabsWrap').classList.remove('ui-visible');
}
/* 화면 터치 시 UI 재표시 (공지 펼치기 아이콘 제외) */
function onVideoAreaClick(e) {
  if (e.target.closest('#noticeFoldBtn')) return;
  if (e.target.closest('.participant-tabs-wrap')) return;
  if (e.target.closest('.live-notice-bar')) return;
  if (!uiVisible) {
    resetUITimer(); // 숨겨진 상태 → 표시
  } else {
    hideUI();        // 표시된 상태 → 탭하면 바로 숨김
    clearTimeout(uiTimer);
  }
}

/* ════════════════════════
   1-1. 상단바
   ════════════════════════ */
function toggleAudioModal() {
  const modal   = document.getElementById('audioModal');
  const overlay = document.getElementById('audioOverlay');
  const open    = modal.classList.contains('open');
  modal.classList.toggle('open', !open);
  overlay.classList.toggle('open', !open);
}
function closeAudioModal() {
  document.getElementById('audioModal').classList.remove('open');
  document.getElementById('audioOverlay').classList.remove('open');
}
function selectAudio(type, el) {
  selectedAudio = type;
  document.querySelectorAll('.sheet-radio').forEach(r => r.classList.remove('active'));
  el.querySelector('.sheet-radio').classList.add('active');
  closeAudioModal();
}
function exitLive() {
  if (confirm('라이브에서 나가시겠어요?')) history.back();
}

/* ════════════════════════
   1-2. 공지바
   ════════════════════════ */
function toggleNotice() {
  noticeExpanded = !noticeExpanded;
  document.getElementById('noticePreview').style.display   = noticeExpanded ? 'none' : 'flex';
  document.getElementById('noticeExpanded').classList.toggle('open', noticeExpanded);
}
function openNoticeSheet() {
  // 펼침 닫고 공지 시트 열기
  document.getElementById('noticeExpanded').classList.remove('open');
  document.getElementById('noticePreview').style.display = 'flex';
  noticeExpanded = false;
  openSheet('noticeSheet');
}

/* ════════════════════════
   1-3/1-4. 더블클릭 단독 표시
   ════════════════════════ */
function toggleTrainerSolo() {
  trainerSolo = !trainerSolo;
  userSolo = false;
  document.getElementById('trainerScreen').classList.toggle('fullsolo', trainerSolo);
  document.getElementById('userScreen').classList.toggle('fullsolo', false);
  document.getElementById('userScreen').style.display = trainerSolo ? 'none' : '';
}
function toggleUserSolo() {
  userSolo = !userSolo;
  trainerSolo = false;
  document.getElementById('userScreen').classList.toggle('fullsolo', userSolo);
  document.getElementById('trainerScreen').classList.toggle('fullsolo', false);
  document.getElementById('trainerScreen').style.flex = userSolo ? '0' : '1';
}

/* ════════════════════════
   1-5. 마이크 / 카메라
   ════════════════════════ */
function toggleMic() {
  if (micDisabled) return; // 트레이너 제한 시 무시
  micOn = !micOn;
  const btn = document.getElementById('micBtn');
  btn.classList.toggle('off', !micOn);
  document.getElementById('micSvgOn').style.display  = micOn ? '' : 'none';
  document.getElementById('micSvgOff').style.display = micOn ? 'none' : '';
  document.getElementById('micLabel').textContent = micOn ? '마이크' : '마이크 꺼짐';
  // 멤버 아이콘 동기화
  document.getElementById('memberMicIcon').classList.toggle('off', !micOn);
  resetUITimer();
}
function toggleCam() {
  if (camDisabled) return;
  camOn = !camOn;
  const btn = document.getElementById('camBtn');
  btn.classList.toggle('off', !camOn);
  document.getElementById('camSvgOn').style.display  = camOn ? '' : 'none';
  document.getElementById('camSvgOff').style.display = camOn ? 'none' : '';
  document.getElementById('camLabel').textContent = camOn ? '카메라' : '카메라 꺼짐';
  document.getElementById('memberCamIcon').classList.toggle('off', !camOn);
  resetUITimer();
}

/* ── 트레이너 강제 비활성 시뮬레이션 ── */
function setMicDisabled(val) {
  micDisabled = val;
  if (val) { micOn = false; }
  document.getElementById('micBtn').classList.toggle('disabled', val);
  document.getElementById('micBtn').classList.toggle('off', !micOn && !val);
}
function setCamDisabled(val) {
  camDisabled = val;
  if (val) { camOn = false; }
  document.getElementById('camBtn').classList.toggle('disabled', val);
}

/* ════════════════════════
   반응 팝업
   ════════════════════════ */
function toggleReactionPopup() {
  reactionOpen = !reactionOpen;
  document.getElementById('reactionPopup').classList.toggle('open', reactionOpen);
  document.getElementById('reactionOverlay').classList.toggle('open', reactionOpen);
  resetUITimer();
}
function closeReactionPopup() {
  reactionOpen = false;
  document.getElementById('reactionPopup').classList.remove('open');
  document.getElementById('reactionOverlay').classList.remove('open');
}

/* ── 손들기 ON/OFF ── */
function toggleRaiseHand() {
  raiseHandOn = !raiseHandOn;
  const btn = document.getElementById('raiseHandBtn');
  btn.classList.toggle('on', raiseHandOn);
  document.getElementById('raiseHandStatus').textContent = raiseHandOn ? 'ON' : 'OFF';
  document.getElementById('reactionBtn').classList.toggle('raised', raiseHandOn);
}

/* ── 이모티콘 전송 ── */
function sendEmoji(emoji) {
  if (emojiLimited) {
    document.getElementById('emojiLimitMsg').classList.add('show');
    return;
  }
  // 1초에 하나만
  const now = Date.now();
  if (window._lastEmojiTime && now - window._lastEmojiTime < 1000) return;
  window._lastEmojiTime = now;

  emojiCount++;

  // 5초에 4개 초과 제한
  if (emojiCount > EMOJI_MAX) {
    emojiLimited = true;
    document.getElementById('emojiLimitMsg').classList.add('show');
    clearTimeout(emojiResetTimer);
    emojiResetTimer = setTimeout(() => {
      emojiLimited = false;
      emojiCount   = 0;
      document.getElementById('emojiLimitMsg').classList.remove('show');
    }, EMOJI_WINDOW);
    return;
  }
  clearTimeout(emojiResetTimer);
  emojiResetTimer = setTimeout(() => {
    emojiCount = 0;
  }, EMOJI_WINDOW);

  addEmojiToStream(emoji);
  closeReactionPopup();
}

/* ── 이모티콘 스트림 (FIFO 최대 7개, 10초 타임아웃) ── */
const EMOJI_STREAM_MAX = 7;
let emojiStreamItems = [];

function addEmojiToStream(emoji) {
  const stream = document.getElementById('emojiStream');

  // 7개 초과 시 가장 오래된 거 제거
  if (emojiStreamItems.length >= EMOJI_STREAM_MAX) {
    const oldest = emojiStreamItems.shift();
    oldest.el.remove();
    clearTimeout(oldest.timer);
  }

  const el = document.createElement('div');
  el.className = 'emoji-item';
  el.textContent = emoji;
  stream.appendChild(el);

  const timer = setTimeout(() => {
    el.remove();
    emojiStreamItems = emojiStreamItems.filter(i => i.el !== el);
  }, 10000);

  emojiStreamItems.push({ el, timer });
}

/* ════════════════════════
   채팅
   ════════════════════════ */
function toggleWhisper() {
  isWhisper = !isWhisper;
  const btn = document.getElementById('whisperBtn');
  btn.style.background = isWhisper ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)';
  document.getElementById('chatInput').placeholder = isWhisper
    ? '트레이너에게만 보내기...' : '채팅을 입력하세요';
}
function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  // 10초 이상 경과 데이터는 화면에 표시 안 함 (네트워크 지연 시뮬레이션 생략)
  const list = document.getElementById('chatList');
  const item = document.createElement('div');
  item.className = 'chat-item';
  item.innerHTML = `
    <div class="chat-avatar" style="background:#4B668B">${USER_NAME[0]}</div>
    <div class="chat-bubble">
      <div class="chat-name">${USER_NAME}${isWhisper ? ' (귓속말)' : ''}</div>
      <div class="chat-text">${text}</div>
    </div>`;
  list.appendChild(item);
  list.scrollTop = list.scrollHeight;
  input.value = '';
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('chatInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChat();
  });
});

/* ════════════════════════
   공지 설정 토글
   ════════════════════════ */
function toggleSetting(type) {
  if (type === 'banner') {
    bannerOn = !bannerOn;
    document.getElementById('toggleBanner').classList.toggle('on', bannerOn);
    document.getElementById('noticeBar').classList.toggle('hidden', !bannerOn);
    // 배너 OFF 시 '새 공지까지 숨기기' 비활성화
    document.getElementById('toggleUntilNew').classList.toggle('disabled', !bannerOn);
    if (!bannerOn) { untilNewOn = false; document.getElementById('toggleUntilNew').classList.remove('on'); }
  } else if (type === 'untilNew') {
    if (!bannerOn) return;
    untilNewOn = !untilNewOn;
    document.getElementById('toggleUntilNew').classList.toggle('on', untilNewOn);
    if (untilNewOn) document.getElementById('noticeBar').classList.add('hidden');
  }
}

/* ════════════════════════
   시트 공통 열기/닫기
   ════════════════════════ */
function openSheet(sheetId) {
  const ovId = sheetId.replace('Sheet', 'Overlay');
  document.getElementById(sheetId).classList.add('open');
  document.getElementById(ovId).classList.add('open');
  resetUITimer();
}
function closeSheet(sheetId, ovId) {
  document.getElementById(sheetId).classList.remove('open');
  document.getElementById(ovId).classList.remove('open');
}