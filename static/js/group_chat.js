/* ===========================
   FITO - 그룹 채팅 JS (v3)
   좋아요 토글, 비밀채팅 권한, 스토어
   =========================== */

let chatId, messages, myName;

const BAD_WORDS = ['시발','씨발','ㅅㅂ','개새끼','ㄱㅅㄲ','병신','ㅂㅅ','지랄','ㅈㄹ'];

function initChat() {
  const store = FITO_STORE.get();
  myName = store.myName || '나';
  chatId = window.CHAT_TYPE || 'all';

  // 실제 chatId 매핑
  const gid = parseInt(window.GROUP_ID);
  const chats = (store.groupChats && store.groupChats[gid]) || [];

  // chatId가 'all'이면 전체 채팅 찾기
  if (chatId === 'all') {
    const allChat = chats.find(c => c.type === 'all');
    if (allChat) chatId = allChat.id;
  }

  // 접근 권한 체크
  if (!FITO_STORE.isMember(gid)) {
    showSnackbar('그룹에 가입해야 채팅에 참여할 수 있습니다.');
    setTimeout(() => location.href = '/group', 1500);
    return false;
  }

  const chat = chats.find(c => c.id === chatId);
  if (chat && chat.type === 'secret') {
    if (!chat.allowedMembers || !chat.allowedMembers.includes(myName)) {
      showSnackbar('이 비밀 채팅방에 접근할 권한이 없습니다.');
      setTimeout(() => history.back(), 1500);
      return false;
    }
    document.getElementById('chatTitle').textContent = chat.name || '비밀 채팅';
  } else {
    document.getElementById('chatTitle').textContent = (chat && chat.name) || '전체 채팅';
  }

  // 메시지 로드
  messages = (store.groupMessages && store.groupMessages[chatId]) || [];
  return true;
}

function renderMessages() {
  const list = document.getElementById('messageList');
  let html = '', lastDate = '';

  messages.forEach(m => {
    if (m.date !== lastDate) { lastDate = m.date; html += `<div class="gc-msg-date-divider">${m.date}</div>`; }

    const isMe = m.author === myName;
    const alreadyLiked = (m.likedBy || []).includes(myName);
    const heartIcon = alreadyLiked ? '❤️' : '🤍';
    const likeCount = m.likes > 0 ? ` ${m.likes}` : '';
    const likeHtml = `<div class="gc-msg-like" onclick="event.stopPropagation();toggleLike(${m.id})">${heartIcon}${likeCount}</div>`;

    if (isMe) {
      html += `<div class="gc-msg mine" data-id="${m.id}"><div class="gc-msg-body">
        <div class="gc-msg-bubble mine">${m.text}${likeHtml}</div>
        <div class="gc-msg-time">${m.time}</div></div></div>`;
    } else {
      html += `<div class="gc-msg" data-id="${m.id}"><div class="gc-msg-avatar"></div><div class="gc-msg-body">
        <div class="gc-msg-name">${m.author}</div>
        <div class="gc-msg-bubble other">${m.text}${likeHtml}</div>
        <div class="gc-msg-time">${m.time}</div></div></div>`;
    }
  });

  list.innerHTML = html;
  list.scrollTop = list.scrollHeight;
}

/* ── 좋아요 토글 (더블클릭 대신 버튼 클릭) ── */
function toggleLike(msgId) {
  const store = FITO_STORE.get();
  const msgs = store.groupMessages[chatId];
  if (!msgs) return;
  const msg = msgs.find(m => m.id === msgId);
  if (!msg) return;

  if (!msg.likedBy) msg.likedBy = [];
  const idx = msg.likedBy.indexOf(myName);

  if (idx >= 0) {
    // 이미 좋아요 → 취소
    msg.likedBy.splice(idx, 1);
    msg.likes = Math.max(0, msg.likes - 1);
    showSnackbar('좋아요를 취소했습니다');
  } else {
    // 좋아요
    msg.likedBy.push(myName);
    msg.likes = (msg.likes || 0) + 1;
    showSnackbar('좋아요를 눌렀습니다 ♥');
  }

  FITO_STORE.save(store);
  messages = store.groupMessages[chatId];
  renderMessages();
}

/* ── 채팅 입력 ── */
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const charCount = document.getElementById('charCount');

chatInput.addEventListener('input', () => {
  let val = chatInput.value;
  if (val.length > 300) { val = val.substring(0, 300); chatInput.value = val; }
  charCount.textContent = val.length;
  sendBtn.classList.toggle('disabled', val.trim().length === 0);
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 80) + 'px';
});

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // 욕설 체크
  if (BAD_WORDS.some(w => text.includes(w))) {
    document.getElementById('badWordModal').classList.add('open');
    chatInput.value = ''; charCount.textContent = '0'; sendBtn.classList.add('disabled');
    return;
  }

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  FITO_STORE.update(s => {
    const newId = s.nextMsgId++;
    if (!s.groupMessages[chatId]) s.groupMessages[chatId] = [];
    s.groupMessages[chatId].push({
      id: newId, author: myName, text: text,
      time: time, likes: 0, likedBy: [], date: date,
    });
  });

  // 로컬 갱신
  const store = FITO_STORE.get();
  messages = store.groupMessages[chatId] || [];

  chatInput.value = ''; charCount.textContent = '0'; sendBtn.classList.add('disabled');
  chatInput.style.height = 'auto';
  renderMessages();
}

function closeBadWordModal() { document.getElementById('badWordModal').classList.remove('open'); }

function openAttach() { document.getElementById('attachOverlay').classList.add('open'); document.getElementById('attachSheet').classList.add('open'); }
function closeAttach() { document.getElementById('attachOverlay').classList.remove('open'); document.getElementById('attachSheet').classList.remove('open'); }
function selectAttachType(type) { closeAttach(); showSnackbar(type==='image' ? '이미지를 선택해주세요 (최대 20장, 300MB)' : '동영상을 선택해주세요 (최대 20개, 300MB)'); }

function showSnackbar(msg) { const sb=document.getElementById('snackbar'); sb.textContent=msg; sb.classList.add('show'); setTimeout(()=>sb.classList.remove('show'),3000); }

document.addEventListener('DOMContentLoaded', () => {
  if (initChat()) renderMessages();
});
