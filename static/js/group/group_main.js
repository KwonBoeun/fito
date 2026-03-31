/* ===========================
   FITO - 그룹 메인 JS
   =========================== */

/* ── Mock 데이터 ── */
const GROUP = {
  id: 1,
  name: '하체 마스터 클럽',
  creator: '핏걸_나연',
  desc: '매주 3회 하체 운동을 함께하는 그룹입니다. 스쿼트, 런지, 데드리프트 중심으로 서로 격려하며 운동해요! 초보자도 환영합니다.',
  tags: ['#하체', '#스쿼트', '#런지', '#데드리프트', '#초보환영'],
  members: 32,
  maxMembers: 100,
  isMember: true,
  myRole: 'member', // 'owner' | 'manager' | 'member'
  storageCount: 12,
};

const MEMBERS = [
  { name:'핏걸_나연', role:'owner' },
  { name:'트레이너박', role:'manager' },
  { name:'스쿼트킹', role:'manager' },
  { name:'런지퀸', role:'member' },
  { name:'코어킹', role:'member' },
  { name:'다이어터민', role:'member' },
  { name:'홈트여왕', role:'member' },
  { name:'근육맨제이', role:'member' },
];

const PENDING = [
  { name:'newbie_fit', greeting:'안녕하세요! 하체 운동 같이 하고 싶어요' },
];

const STORIES = [
  { id:1, author:'핏걸_나연' },
  { id:2, author:'스쿼트킹' },
  { id:3, author:'런지퀸' },
  { id:4, author:'코어킹' },
];

const TODAY_CHAT = {
  text: '오늘 스쿼트 100개 달성했습니다! 다들 같이 해봐요 🔥',
  author: '스쿼트킹',
  likes: 8,
};

const CHATS = [
  { id:'all', name:'전체 채팅', lastMsg:'스쿼트킹: 오늘 100개 달성!', unread:3, type:'all' },
  { id:'secret1', name:'고급반 채팅', lastMsg:'트레이너박: 내일 데드리프트...', unread:0, type:'secret' },
];

const LIVES = [
  { id:1, title:'하체 같이해요 🏋️', host:'핏걸_나연', status:'live', participants:6, max:8, startTime:null },
  { id:2, title:'스쿼트 챌린지', host:'스쿼트킹', status:'soon', participants:0, max:6, startTime:'14:30' },
  { id:3, title:'저녁 런지 루틴', host:'런지퀸', status:'scheduled', participants:0, max:5, startTime:'19:00' },
];

/* ── 그룹 정보 렌더링 ── */
function renderGroupInfo() {
  document.getElementById('headerGroupName').textContent = GROUP.name;
  document.getElementById('groupName').textContent = GROUP.name;
  document.getElementById('groupCreator').textContent = `그룹장: ${GROUP.creator}`;
  document.getElementById('groupDesc').textContent = GROUP.desc;
  document.getElementById('storageCount').textContent = `${GROUP.storageCount}개`;

  // 태그
  document.getElementById('groupTags').innerHTML =
    GROUP.tags.map(t => `<span class="gm-tag">${t}</span>`).join('');

  // 가입/탈퇴 버튼
  const btn = document.getElementById('joinLeaveBtn');
  if (GROUP.isMember) {
    btn.textContent = '탈퇴';
    btn.className = 'gm-join-btn leave';
  } else {
    btn.textContent = '가입 신청';
    btn.className = 'gm-join-btn join';
  }

  // 멤버 아바타
  const avatars = document.getElementById('membersAvatars');
  avatars.innerHTML = MEMBERS.slice(0, 4).map(() =>
    '<div class="gm-avatar"></div>'
  ).join('');
  document.getElementById('membersCount').textContent = `${GROUP.members}명`;
}

/* ── 그룹 이슈 렌더링 ── */
function renderIssues() {
  // 스토리
  const scroll = document.getElementById('storyScroll');
  if (STORIES.length === 0) {
    scroll.innerHTML = '<span style="font-size:11px;color:var(--gray-400)">업로드 된 핏츠가 없습니다. 첫 번째 핏츠의 주인공이 되어 보세요!</span>';
  } else {
    scroll.innerHTML = STORIES.map(() => '<div class="gm-story-item"></div>').join('');
  }

  // 오늘의 Chat
  const chatText = document.getElementById('todayChatText');
  const chatAuthor = document.getElementById('todayChatAuthor');
  const threshold = Math.ceil(GROUP.members / 10);

  if (TODAY_CHAT.likes >= threshold) {
    chatText.textContent = TODAY_CHAT.text;
    chatAuthor.textContent = `— ${TODAY_CHAT.author} ♥ ${TODAY_CHAT.likes}`;
  } else {
    chatText.textContent = '오늘은 조용하군요...!';
    chatAuthor.textContent = '';
  }
}

/* ── 채팅 리스트 렌더링 ── */
function renderChats() {
  const list = document.getElementById('chatList');
  list.innerHTML = CHATS.map(c => {
    const icon = c.type === 'all'
      ? '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
      : '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    const badge = c.unread > 0 ? `<span class="gm-chat-badge">${c.unread}</span>` : '';
    return `<div class="gm-chat-item" onclick="openChat('${c.type}')">
      <div class="gm-chat-icon">${icon}</div>
      <div class="gm-chat-info">
        <div class="gm-chat-name">${c.name}</div>
        <div class="gm-chat-preview">${c.lastMsg}</div>
      </div>
      ${badge}
    </div>`;
  }).join('');
}

/* ── 라이브 목록 렌더링 ── */
function renderLives() {
  const list = document.getElementById('liveList');
  if (LIVES.length === 0) {
    list.innerHTML = '<div class="gp-empty">라이브가 만들어지지 않았습니다. 새로운 라이브를 만들어 보는건 어떨까요?</div>';
    return;
  }

  list.innerHTML = LIVES.map(l => {
    let statusHtml = '';
    let metaText = '';
    if (l.status === 'live') {
      statusHtml = '<span class="gm-live-status live">● LIVE</span>';
      metaText = `${l.participants}/${l.max}명 참여 중`;
    } else if (l.status === 'soon') {
      statusHtml = '<span class="gm-live-status soon">곧 시작</span>';
      metaText = `${l.startTime} 시작 예정`;
    } else {
      statusHtml = '<span class="gm-live-status scheduled">예정</span>';
      metaText = `${l.startTime} 시작 예정`;
    }

    return `<div class="gm-live-card" onclick="joinLive(${l.id})">
      <div class="gm-live-thumb">
        ${l.status === 'live' ? '<div style="position:absolute;inset:0;background:rgba(232,22,28,.1)"></div>' : ''}
      </div>
      <div class="gm-live-info">
        <div class="gm-live-title">${l.title}</div>
        <div class="gm-live-meta">${l.host} · ${metaText}</div>
        ${statusHtml}
      </div>
    </div>`;
  }).join('');
}

/* ── 가입/탈퇴 ── */
function toggleMembership() {
  if (GROUP.isMember) {
    document.getElementById('leaveModal').classList.add('open');
  } else {
    document.getElementById('joinModal').classList.add('open');
  }
}
function closeJoinModal() { document.getElementById('joinModal').classList.remove('open'); }
function closeLeaveModal() { document.getElementById('leaveModal').classList.remove('open'); }
function submitJoin() {
  const greeting = document.getElementById('joinGreeting').value.trim();
  if (!greeting) { showSnackbar('가입인사를 1자 이상 입력해주세요.'); return; }
  closeJoinModal();
  showSnackbar('가입 신청이 전송되었습니다.');
}
function confirmLeave() {
  closeLeaveModal();
  GROUP.isMember = false;
  renderGroupInfo();
  showSnackbar('그룹에서 탈퇴했습니다.');
}

/* ── 그룹원 관리 ── */
function openMembersSheet() {
  renderMembersList();
  document.getElementById('membersOverlay').classList.add('open');
  document.getElementById('membersSheet').classList.add('open');
}
function closeMembersSheet() {
  document.getElementById('membersOverlay').classList.remove('open');
  document.getElementById('membersSheet').classList.remove('open');
}

function renderMembersList() {
  const isAdmin = GROUP.myRole === 'owner' || GROUP.myRole === 'manager';
  const list = document.getElementById('membersList');
  let html = '';

  // 가입 대기 (관리자만)
  if (isAdmin && PENDING.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:8px">가입 대기 중</div>';
    html += PENDING.map(p =>
      `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--gray-200);flex-shrink:0"></div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--gray-400)">${p.greeting}</div></div>
        <button style="padding:4px 10px;background:var(--black);color:var(--white);border:none;border-radius:var(--r-full);font-size:11px;font-weight:600;cursor:pointer">수락</button>
        <button style="padding:4px 10px;background:var(--gray-100);color:var(--red);border:none;border-radius:var(--r-full);font-size:11px;font-weight:600;cursor:pointer">거절</button>
      </div>`
    ).join('');
    html += '<div style="height:12px"></div>';
  }

  // 멤버 리스트
  html += '<div style="font-size:12px;font-weight:700;color:var(--gray-500);margin-bottom:8px">멤버</div>';
  const roleLabel = { owner:'그룹장', manager:'매니저', member:'그룹원' };
  const roleColor = { owner:'var(--orange)', manager:'var(--blue)', member:'var(--gray-400)' };
  html += MEMBERS.map(m =>
    `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
      <div style="width:32px;height:32px;border-radius:50%;background:var(--gray-200);flex-shrink:0"></div>
      <div style="flex:1"><div style="font-size:13px;font-weight:600">${m.name}</div></div>
      <span style="font-size:10px;font-weight:700;color:${roleColor[m.role]};padding:2px 8px;background:var(--gray-50);border-radius:var(--r-full)">${roleLabel[m.role]}</span>
    </div>`
  ).join('');

  list.innerHTML = html;
}

/* ── 채팅 이동 ── */
function openChat(type) {
  location.href = `${window.URL_GROUP_CHAT}&type=${type}`;
}

/* ── 채팅방 추가 ── */
function addChat() {
  if (GROUP.myRole === 'member') {
    document.getElementById('noPermMsg').textContent = '채팅방을 만들 권한이 없습니다.';
    document.getElementById('noPermModal').classList.add('open');
    return;
  }
  showSnackbar('비밀 채팅방이 추가되었습니다.');
}

/* ── 라이브 참가 ── */
function joinLive(id) {
  location.href = `${window.URL_GROUP_LIVE}?id=${id}`;
}

/* ── 새 라이브 만들기 (더블클릭 방지) ── */
let liveCreateLock = false;
function createNewLive() {
  if (liveCreateLock) return;
  liveCreateLock = true;
  setTimeout(() => { liveCreateLock = false; }, 2000);
  location.href = window.URL_GROUP_LIVE_CREATE;
}

/* ── 스토리 보기 ── */
function openStories() {
  showSnackbar('핏츠 목록을 불러오는 중...');
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
  renderGroupInfo();
  renderIssues();
  renderChats();
  renderLives();
});
