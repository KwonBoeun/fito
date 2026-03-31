/* ===========================
   FITO - 그룹 채팅 JS
   =========================== */

const MY_NAME = '나';

/* ── Mock 욕설 리스트 ── */
const BAD_WORDS = ['시발', '씨발', 'ㅅㅂ', '개새끼', 'ㄱㅅㄲ', '병신', 'ㅂㅅ', '지랄', 'ㅈㄹ'];

/* ── Mock 채팅 데이터 ── */
const MESSAGES = [
  { id:1, author:'핏걸_나연', text:'오늘 운동 다들 하셨나요?', time:'09:32', isMe:false, likes:2, date:'2025-03-27' },
  { id:2, author:'스쿼트킹', text:'오늘 스쿼트 100개 달성했습니다! 다들 같이 해봐요 🔥', time:'10:15', isMe:false, likes:8, date:'2025-03-27' },
  { id:3, author:'런지퀸', text:'저도 런지 50개 했어요! 하체 불타는 느낌 ㅋㅋ', time:'10:22', isMe:false, likes:3, date:'2025-03-27' },
  { id:4, author:MY_NAME, text:'오늘 데드리프트 80kg 성공했어요 💪', time:'10:45', isMe:true, likes:5, date:'2025-03-27' },
  { id:5, author:'코어킹', text:'다들 대단하시네요! 저는 플랭크 3분 도전 중입니다', time:'11:02', isMe:false, likes:1, date:'2025-03-27' },
  { id:6, author:'트레이너박', text:'오늘 저녁 7시에 라이브 합니다~ 하체 루틴 같이해요', time:'11:30', isMe:false, likes:4, date:'2025-03-27' },
  { id:7, author:'다이어터민', text:'오늘 식단은 닭가슴살 샐러드와 고구마!', time:'12:15', isMe:false, likes:0, date:'2025-03-27' },
  { id:8, author:'홈트여왕', text:'집에서 덤벨만으로도 충분히 하체 운동 가능해요. 오늘 영상 올릴게요!', time:'13:40', isMe:false, likes:2, date:'2025-03-27' },
];

let nextMsgId = MESSAGES.length + 1;

/* ── 채팅 제목 ── */
function setChatTitle() {
  const type = window.CHAT_TYPE || 'all';
  document.getElementById('chatTitle').textContent =
    type === 'all' ? '전체 채팅' : '비밀 채팅';
}

/* ── 채팅 기록 렌더링 ── */
function renderMessages() {
  const list = document.getElementById('messageList');
  let html = '';
  let lastDate = '';

  MESSAGES.forEach(m => {
    // 날짜 구분선
    if (m.date !== lastDate) {
      lastDate = m.date;
      html += `<div class="gc-msg-date-divider">${m.date}</div>`;
    }

    const likeHtml = m.likes > 0
      ? `<div class="gc-msg-like show">♥ ${m.likes}</div>`
      : `<div class="gc-msg-like">♥ 0</div>`;

    if (m.isMe) {
      html += `<div class="gc-msg mine" data-id="${m.id}">
        <div class="gc-msg-body">
          <div class="gc-msg-bubble mine" ondblclick="likeMessage(${m.id})">${m.text}${likeHtml}</div>
          <div class="gc-msg-time">${m.time}</div>
        </div>
      </div>`;
    } else {
      html += `<div class="gc-msg" data-id="${m.id}">
        <div class="gc-msg-avatar"></div>
        <div class="gc-msg-body">
          <div class="gc-msg-name">${m.author}</div>
          <div class="gc-msg-bubble other" ondblclick="likeMessage(${m.id})">${m.text}${likeHtml}</div>
          <div class="gc-msg-time">${m.time}</div>
        </div>
      </div>`;
    }
  });

  list.innerHTML = html;
  // 맨 아래로 스크롤
  list.scrollTop = list.scrollHeight;
}

/* ── 더블클릭 좋아요 ── */
function likeMessage(id) {
  const msg = MESSAGES.find(m => m.id === id);
  if (!msg) return;
  msg.likes++;
  renderMessages();
  showSnackbar('좋아요를 눌렀습니다 ♥');
}

/* ── 채팅 입력 ── */
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const charCount = document.getElementById('charCount');

chatInput.addEventListener('input', () => {
  let val = chatInput.value;

  // 300자 제한
  if (val.length > 300) {
    val = val.substring(0, 300);
    chatInput.value = val;
  }

  // 지원 언어 검사 (한글, 영어, 숫자, 공백, 기본 특수문자만)
  const unsupported = /[^\u0000-\u007F\uAC00-\uD7AF\u3130-\u318F\uFF00-\uFFEFㄱ-ㅎㅏ-ㅣ\s.,!?~@#$%^&*()_+\-=\[\]{}|;:'"<>/♥💪🔥❤️😂✋🏋️👏👑]/.test(val);
  if (unsupported) {
    showSnackbar('입력한 문자는 지원하는 형식의 문자가 아닙니다.');
    chatInput.value = '';
    charCount.textContent = '0';
    sendBtn.classList.add('disabled');
    return;
  }

  charCount.textContent = val.length;
  sendBtn.classList.toggle('disabled', val.trim().length === 0);

  // 자동 높이 조절
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 80) + 'px';
});

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

/* ── 메시지 전송 ── */
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // 욕설 체크
  const lower = text.toLowerCase();
  const hasBadWord = BAD_WORDS.some(w => lower.includes(w));
  if (hasBadWord) {
    document.getElementById('badWordModal').classList.add('open');
    chatInput.value = '';
    charCount.textContent = '0';
    sendBtn.classList.add('disabled');
    return;
  }

  // 메시지 추가
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  MESSAGES.push({
    id: nextMsgId++,
    author: MY_NAME,
    text: text,
    time: time,
    isMe: true,
    likes: 0,
    date: date,
  });

  chatInput.value = '';
  charCount.textContent = '0';
  sendBtn.classList.add('disabled');
  chatInput.style.height = 'auto';
  renderMessages();
}

function closeBadWordModal() {
  document.getElementById('badWordModal').classList.remove('open');
}

/* ── 첨부 ── */
function openAttach() {
  document.getElementById('attachOverlay').classList.add('open');
  document.getElementById('attachSheet').classList.add('open');
}
function closeAttach() {
  document.getElementById('attachOverlay').classList.remove('open');
  document.getElementById('attachSheet').classList.remove('open');
}
function selectAttachType(type) {
  closeAttach();
  showSnackbar(type === 'image' ? '이미지를 선택해주세요 (최대 20장)' : '동영상을 선택해주세요 (최대 20개)');
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
  setChatTitle();
  renderMessages();
});
