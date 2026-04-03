/* ── FITO Live Detail JS ── */

const LIVE_DATA = [
  { id:1, title:'새벽 하체 루틴 같이해요', author:'핏걸_나연', viewers:3241, tags:['#초보자','#하체운동'], h:0.3 },
  { id:2, title:'30분 전신 유산소 라이브', author:'트레이너박', viewers:2102, tags:['#유산소','#전신운동'], h:1.2 },
  { id:3, title:'상체 벌크업 실시간 코칭', author:'근육맨제이', viewers:1854, tags:['#벌크업','#상체'], h:0.8 },
  { id:4, title:'코어 운동 20분 같이해요', author:'필라테스정', viewers:987, tags:['#코어','#필라테스'], h:2.1 },
  { id:5, title:'스트레칭&폼롤러 같이해요', author:'스트레치킴', viewers:654, tags:['#스트레칭','#회복'], h:3.5 },
  { id:6, title:'어깨 운동 라이브', author:'숄더맨', viewers:532, tags:['#어깨','#상체'], h:4 },
  { id:7, title:'다이어트 유산소 30분', author:'다이어터민', viewers:481, tags:['#다이어트','#유산소'], h:5 },
  { id:8, title:'새벽 팔 운동 라이브', author:'암컬킹', viewers:340, tags:['#팔운동','#상체'], h:6 },
  { id:9, title:'전신 스트레칭 모닝 루틴', author:'모닝핏', viewers:287, tags:['#스트레칭','#아침'], h:7 },
];

const fmt = n => {
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
};

/* ── 채팅 mock 데이터 ── */
const MOCK_CHAT = [
  { role:'host', name:'김트레', text:'라이브진행자 어쩌고저쩌고' },
  { role:'viewer', name:'시청자', text:'채팅 어쩌고저쩌고' },
  { role:'viewer', name:'시청시청자', text:'채팅 어쩌고저쩌고' },
  { role:'mod',  name:'김트레가준역할', text:'채팅 관리자 어쩌고저쩌고' },
  { role:'viewer', name:'시청시청자', text:'채팅 어쩌고저쩌고' },
  { role:'viewer', name:'시청자', text:'채팅 어쩌고저쩌고' },
  { role:'viewer', name:'시청시청자', text:'채팅 어쩌고저쩌고' },
  { role:'viewer', name:'시청시청자', text:'이하은은 바보바보' },
  { role:'viewer', name:'momo', text:'꺄~~~ 시작이다!!!' },
  { role:'viewer', name:'fitlover22', text:'오늘도 화이팅이요 💪' },
  { role:'viewer', name:'diet_j', text:'운동하면서 보고 있어요ㅋㅋ' },
  { role:'viewer', name:'하늘이', text:'같이해요~!' },
  { role:'viewer', name:'운동짱', text:'첫 입장! 반가워요' },
  { role:'viewer', name:'nayeonny', text:'오늘도 열심히 할게요!' },
  { role:'viewer', name:'pro_fit', text:'저도 따라하는 중입니다 ㅎㅎ' },
  { role:'viewer', name:'pilates_j', text:'코어에 집중해야하는데 너무 어렵다' },
  { role:'viewer', name:'morningfit', text:'벌써 땀 뻘뻘 나요' },
  { role:'host', name:'김트레', text:'다들 자세 흐트러지지 않게 조심해요!' },
  { role:'viewer', name:'squat_q', text:'오늘 몇 세트 예정인가요?' },
  { role:'viewer', name:'runnerkim', text:'화면 잘 보여요 👍' },
  { role:'viewer', name:'coreking', text:'ㅋㅋㅋ 벌써 포기하고 싶다' },
  { role:'viewer', name:'diet_min', text:'저도 집에서 같이 하고 있어요!' },
];

let chatIdx = 0;
let liveData = null;
let viewerCount = 0;

function addChatMsg(msg) {
  const list = document.getElementById('chat-list');
  const div = document.createElement('div');
  div.className = 'chat-msg';

  let roleHtml = '';
  if (msg.role === 'host') roleHtml = `<span class="chat-role-host">👑</span>`;
  if (msg.role === 'mod')  roleHtml = `<span class="chat-role-mod">🔧</span>`;

  div.innerHTML = `${roleHtml}<span class="chat-name">${msg.name}</span><span class="chat-text">${msg.text}</span>`;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;

  /* 최대 60개만 유지 */
  while (list.children.length > 60) list.removeChild(list.firstChild);
}

function startMockChat() {
  /* 초기 메시지 8개 */
  for (let i = 0; i < 8 && i < MOCK_CHAT.length; i++) {
    addChatMsg(MOCK_CHAT[i]);
    chatIdx = i + 1;
  }

  /* 2~4초 간격으로 새 메시지 추가 */
  function scheduleNext() {
    const delay = 2000 + Math.random() * 2000;
    setTimeout(() => {
      addChatMsg(MOCK_CHAT[chatIdx % MOCK_CHAT.length]);
      chatIdx++;
      scheduleNext();
    }, delay);
  }
  scheduleNext();
}

function startViewerUpdate() {
  const el = document.getElementById('viewer-count');
  function update() {
    /* ±0~15명 랜덤 증감 */
    viewerCount = Math.max(0, viewerCount + Math.floor(Math.random() * 31) - 15);
    el.textContent = fmt(viewerCount);
    setTimeout(update, 60000); /* 1분 주기 */
  }
  /* 즉시 표시 후 주기 시작 */
  el.textContent = fmt(viewerCount);
  setTimeout(update, 60000);
}

function init() {
  const path = window.location.pathname; /* /live/1 */
  const id = parseInt(path.split('/').pop()) || 1;
  liveData = LIVE_DATA.find(d => d.id === id) || LIVE_DATA[0];

  document.title = `FITO - ${liveData.title}`;
  document.getElementById('hdr-title').textContent = liveData.author;
  document.getElementById('live-title').textContent = liveData.title;
  document.getElementById('live-author').textContent = liveData.author;

  /* 방송 시작 시간 (mock: 현재 기준) */
  const now = new Date();
  const startH = String(now.getHours()).padStart(2,'0');
  const startM = String(now.getMinutes()).padStart(2,'0');
  document.getElementById('live-starttime').textContent = `⏱ ${startH}:${startM} 방송시작`;

  viewerCount = liveData.viewers;
  startViewerUpdate();
  startMockChat();

  /* 채팅 입력 Enter */
  const input = document.getElementById('chat-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      addChatMsg({ role:'viewer', name:'나', text: input.value.trim() });
      input.value = '';
    }
  });

  /* 더보기 팝업 */
  document.getElementById('more-btn').addEventListener('click', () => {
    document.getElementById('more-popup').classList.add('open');
  });
  document.getElementById('more-bg').addEventListener('click', () => {
    document.getElementById('more-popup').classList.remove('open');
  });
}

document.addEventListener('DOMContentLoaded', init);
