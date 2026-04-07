/* ===========================
   FITO - Notification JS
   =========================== */

/* ── 알림 SVG 아이콘 ── */
const ICON = {
  live:    `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M7.76 7.76a6 6 0 0 0 0 8.49"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
  vod:     `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  comment: `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  group:   `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  friend:  `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
  notice:  `<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  event:   `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  trainer: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
};

/* ── 알림 Mock 데이터 ── */
let NOTIFICATIONS = [
  {
    id: 1, type: 'live', read: false,
    title: '알림 내용 미리보기',
    sub: '알림 보낸 사람',
    time: '17:40', dateGroup: '오늘',
    detail: { body: '라이브 방송이 시작되었습니다.\n지금 바로 참여해 보세요!', action: { label: '라이브 보러 가기', url: '/live/1' } }
  },
  {
    id: 2, type: 'live', read: false,
    title: '알림 내용 미리보기',
    sub: '알림 보낸 사람',
    time: '00:00', dateGroup: '오늘',
    detail: { body: '라이브 방송이 시작되었습니다.', action: { label: '라이브 보러 가기', url: '/live/2' } }
  },
  {
    id: 3, type: 'notice', read: true,
    title: '이하은 음치 짱잘함',
    sub: '공지사항',
    time: '07/11', dateGroup: '07월',
    detail: { body: '안녕하세요. FITO 공지사항입니다.\n서비스 이용에 감사드립니다.', action: null }
  },
  {
    id: 4, type: 'event', read: true,
    title: '이벤트 합니다 다다 씨',
    sub: '이벤트',
    time: '07/11', dateGroup: '07월',
    detail: { body: '이벤트 기간: 2024년 7월 11일 ~ 7월 31일\n참여 방법: 앱에서 미션 완료 후 제출', action: null }
  },
  {
    id: 5, type: 'trainer', read: true,
    title: '트레이너 구독을 수락했습니다',
    sub: '김도래',
    time: '07/11', dateGroup: '07월',
    detail: { body: '김도래 트레이너님이 구독 요청을 수락했습니다.\n트레이너의 라이브 및 VOD를 확인해 보세요.', action: { label: '트레이너 페이지 보기', url: '/pt' } }
  },
  {
    id: 6, type: 'comment', read: true,
    title: '내 글에 달린 댓글: 재밌다',
    sub: '김뱅뱅',
    time: '24/12/11', dateGroup: '24년 12월',
    detail: { body: '"재밌다"\n\n김뱅뱅님이 회원님의 게시글에 댓글을 남겼습니다.', action: { label: '게시글 보러 가기', url: '/community/1' } }
  },
  {
    id: 7, type: 'live', read: true,
    title: '박세건님이 라이브를 시작했습니다',
    sub: '박세건',
    time: '24/12/10', dateGroup: '24년 12월',
    detail: { body: '구독 중인 박세건님이 라이브를 시작했습니다.\n지금 입장하면 실시간으로 함께할 수 있어요!', action: { label: '라이브 입장하기', url: '/live/3' } }
  },
  {
    id: 8, type: 'group', read: true,
    title: '예약된 A그룹 라이브가 시작되었습니다',
    sub: '그룹 이름',
    time: '24/12/10', dateGroup: '24년 12월',
    detail: { body: '예약하신 A그룹 라이브가 지금 시작되었습니다.\n그룹원들과 함께 운동해 보세요!', action: { label: '그룹 라이브 입장', url: '/group/live?id=1' } }
  },
  {
    id: 9, type: 'group', read: true,
    title: '15분 뒤 A그룹 라이브가 시작합니다',
    sub: '그룹 이름',
    time: '24/12/10', dateGroup: '24년 12월',
    detail: { body: '예약하신 A그룹 라이브가 15분 후 시작됩니다.\n미리 준비해 두세요!', action: { label: '그룹 페이지 보기', url: '/group/main?id=1' } }
  },
  {
    id: 10, type: 'friend', read: true,
    title: '박세건님이 친구 요청을 보냈습니다',
    sub: '박세건',
    time: '24/12/10', dateGroup: '24년 12월',
    detail: { body: '박세건님이 친구 요청을 보냈습니다.\n요청을 수락하면 서로의 활동을 볼 수 있어요.', action: { label: '친구 요청 확인하기', url: '/mypage/friend-request' } }
  },
  {
    id: 11, type: 'friend', read: true,
    title: '박세건님이 친구 요청을 수락하셨습니다',
    sub: '박세건',
    time: '24/12/10', dateGroup: '24년 12월',
    detail: { body: '박세건님이 친구 요청을 수락했습니다.\n이제 서로의 활동을 확인할 수 있어요!', action: { label: '프로필 보러 가기', url: '/mypage/friends' } }
  },
];

/* ── 상태 ── */
let deleteMode = false;
let allSelected = false;

/* ── DOM 요소 ── */
const listEl        = document.getElementById('noti-list');
const btnDeleteMode = document.getElementById('btn-delete-mode');
const btnSelectAll  = document.getElementById('btn-select-all');
const btnDelConfirm = document.getElementById('btn-delete-confirm');
const dialogOv      = document.getElementById('dialog-ov');
const dialogCancel  = document.getElementById('dialog-cancel');
const dialogOk      = document.getElementById('dialog-ok');
const dialogSub     = document.getElementById('dialog-sub');
const detailOv      = document.getElementById('detail-ov');
const detailBack    = document.getElementById('detail-back');
const detailBody    = document.getElementById('detail-body');
const detailLabel   = document.getElementById('detail-type-label');
const iconSelectAll = document.getElementById('icon-select-all');

/* ── 타입별 한글 라벨 ── */
const TYPE_LABEL = {
  live: '라이브', vod: 'VOD', comment: '댓글',
  group: '그룹 라이브', friend: '친구', notice: '공지사항',
  event: '이벤트', trainer: '트레이너',
};

/* ── 목록 렌더링 ── */
function render() {
  if (NOTIFICATIONS.length === 0) {
    listEl.innerHTML = `
      <div class="noti-empty">
        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <p>알림이 없습니다</p>
      </div>`;
    return;
  }

  /* 날짜 그룹별로 묶기 */
  const groups = {};
  NOTIFICATIONS.forEach(n => {
    if (!groups[n.dateGroup]) groups[n.dateGroup] = [];
    groups[n.dateGroup].push(n);
  });

  let html = '';
  Object.entries(groups).forEach(([date, items]) => {
    html += `<div class="noti-date-label">${date}</div>`;
    items.forEach(n => {
      html += `
        <div class="noti-item${n.read ? ' read' : ''}${n.selected ? ' selected' : ''}"
             data-id="${n.id}">
          <div class="noti-checkbox">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          ${!n.read ? '<div class="noti-unread-dot"></div>' : ''}
          <div class="noti-icon type-${n.type}">${ICON[n.type] || ''}</div>
          <div class="noti-content">
            <div class="noti-content-title">${n.title}</div>
            <div class="noti-content-sub">${n.sub}</div>
          </div>
          <div class="noti-time">${n.time}</div>
        </div>`;
    });
  });
  listEl.innerHTML = html;

  /* 삭제 모드 클래스 */
  listEl.classList.toggle('delete-mode', deleteMode);

  /* 아이템 클릭 이벤트 */
  listEl.querySelectorAll('.noti-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = Number(el.dataset.id);
      if (deleteMode) {
        toggleSelect(id, el);
      } else {
        openDetail(id);
      }
    });
  });
}

/* ── 선택 토글 ── */
function toggleSelect(id, el) {
  const n = NOTIFICATIONS.find(x => x.id === id);
  if (!n) return;
  n.selected = !n.selected;
  el.classList.toggle('selected', n.selected);
  updateSelectAllIcon();
}

function updateSelectAllIcon() {
  const total    = NOTIFICATIONS.length;
  const selected = NOTIFICATIONS.filter(x => x.selected).length;
  allSelected = selected === total;
  /* 전체 선택 아이콘: 모두 선택되면 체크, 아니면 빈 박스 */
  iconSelectAll.innerHTML = allSelected
    ? `<rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor"/><polyline points="8 12 11 15 16 9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    : `<rect x="3" y="3" width="18" height="18" rx="3"/>`;
}

/* ── 삭제 모드 전환 ── */
function enterDeleteMode() {
  deleteMode = true;
  NOTIFICATIONS.forEach(n => n.selected = false);
  btnDeleteMode.classList.add('hidden');
  btnSelectAll.classList.remove('hidden');
  btnDelConfirm.classList.remove('hidden');
  listEl.classList.add('delete-mode');
  updateSelectAllIcon();
}

function exitDeleteMode() {
  deleteMode = false;
  NOTIFICATIONS.forEach(n => n.selected = false);
  btnDeleteMode.classList.remove('hidden');
  btnSelectAll.classList.add('hidden');
  btnDelConfirm.classList.add('hidden');
  listEl.classList.remove('delete-mode');
  render();
}

/* ── 전체 선택 ── */
btnSelectAll.addEventListener('click', () => {
  allSelected = !allSelected;
  NOTIFICATIONS.forEach(n => n.selected = allSelected);
  render();
  listEl.classList.add('delete-mode');
  updateSelectAllIcon();
});

/* ── 삭제 버튼 ── */
btnDelConfirm.addEventListener('click', () => {
  const selectedCount = NOTIFICATIONS.filter(x => x.selected).length;
  if (selectedCount === 0) {
    /* 아무것도 선택 안 했으면 삭제 모드 해제 */
    exitDeleteMode();
    return;
  }
  dialogSub.textContent = `선택한 알림 ${selectedCount}개가 삭제됩니다.`;
  dialogOv.classList.add('open');
});

/* ── 다이얼로그 ── */
dialogCancel.addEventListener('click', () => dialogOv.classList.remove('open'));
dialogOk.addEventListener('click', () => {
  NOTIFICATIONS = NOTIFICATIONS.filter(x => !x.selected);
  dialogOv.classList.remove('open');
  exitDeleteMode();
});
dialogOv.addEventListener('click', e => {
  if (e.target === dialogOv) dialogOv.classList.remove('open');
});

/* ── 삭제 모드 진입 버튼 ── */
btnDeleteMode.addEventListener('click', enterDeleteMode);

/* ── 상세 열기 ── */
function openDetail(id) {
  const n = NOTIFICATIONS.find(x => x.id === id);
  if (!n) return;

  /* 읽음 처리 */
  n.read = true;
  render();

  /* 이동이 필요한 타입은 바로 이동 */
  const NAV_URL = {
    live:    n.detail?.action?.url || '/live/1',
    group:   n.detail?.action?.url || '/group/main?id=1',
    friend:  n.detail?.action?.url || '/mypage/friend-request',
  };
  if (NAV_URL[n.type] && n.type !== 'comment' && n.type !== 'notice'
      && n.type !== 'event' && n.type !== 'trainer') {
    location.href = NAV_URL[n.type];
    return;
  }

  /* 상세 오버레이 표시 */
  detailLabel.textContent = TYPE_LABEL[n.type] || '알림';
  const d = n.detail || {};
  const iconHtml = ICON[n.type] || '';
  const actionHtml = d.action
    ? `<a href="${d.action.url}" class="detail-action-btn" style="margin-top:20px">${d.action.label}</a>`
    : '';

  detailBody.innerHTML = `
    <div class="detail-card">
      <div class="detail-card-icon type-${n.type}">${iconHtml}</div>
      <div class="detail-card-title">${n.title}</div>
      <div class="detail-card-sub">${n.sub}</div>
      <div class="detail-card-time">${n.time}</div>
      ${d.body ? `<div class="detail-card-body">${d.body.replace(/\n/g,'<br>')}</div>` : ''}
    </div>
    ${actionHtml}
  `;

  /* detail-card-icon에 타입 색상 클래스 적용 */
  const iconEl = detailBody.querySelector('.detail-card-icon');
  if (iconEl) {
    iconEl.classList.add(`type-${n.type}`);
    const svg = iconEl.querySelector('svg');
    if (svg) { svg.style.width='28px'; svg.style.height='28px'; svg.style.fill='none'; svg.style.strokeWidth='1.8'; }
  }

  detailOv.classList.add('open');
}

/* ── 상세 닫기 ── */
detailBack.addEventListener('click', () => detailOv.classList.remove('open'));

/* ── 초기 렌더 ── */
render();
