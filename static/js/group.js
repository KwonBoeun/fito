/* ===========================
   FITO - 그룹 목록/검색 JS (v2)
   =========================== */

const searchInput = document.getElementById('groupSearchInput');
let store;

searchInput.addEventListener('input', () => {
  let val = searchInput.value;
  val = val.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g, '');
  if (val !== searchInput.value) {
    searchInput.value = val;
    showSnackbar('특수문자는 사용할 수 없습니다.');
  }
  renderGroups(val.trim());
});

function renderGroups(query) {
  store = FITO_STORE.get();
  const list = document.getElementById('groupList');
  const empty = document.getElementById('emptyState');
  const banner = document.getElementById('recommendBanner');

  let joined = store.groups.filter(g => g.joined);
  let recommend = store.recommendGroups || [];

  if (query) {
    const q = query.toLowerCase();
    joined = joined.filter(g => g.name.toLowerCase().includes(q) || g.tags.some(t => t.toLowerCase().includes(q)));
    recommend = recommend.filter(g => g.name.toLowerCase().includes(q) || g.tags.some(t => t.toLowerCase().includes(q)));
  }

  joined.sort((a, b) => {
    if (a.inactive !== b.inactive) return a.inactive ? 1 : -1;
    return (b.liveCnt + b.chatCnt) - (a.liveCnt + a.chatCnt);
  });

  let html = '';

  if (joined.length > 0) {
    html += '<div class="gp-list-section-title">나의 그룹</div>';
    html += joined.map(g => groupCardHtml(g)).join('');
    if (recommend.length > 0 && Math.random() > 0.5 && !query) {
      const pick = recommend[Math.floor(Math.random() * recommend.length)];
      document.getElementById('recommendText').textContent = `회원님을 위한 추천그룹 <${pick.name}>가 있어요!`;
      banner.style.display = 'block';
      banner.onclick = () => goGroupMain(pick.id);
    } else { banner.style.display = 'none'; }
  }

  if (recommend.length > 0) {
    html += '<div class="gp-list-section-title" style="margin-top:8px">추천 그룹</div>';
    html += recommend.map(g => recommendCardHtml(g)).join('');
  }

  if (!joined.length && !recommend.length) {
    empty.style.display = 'block';
    empty.textContent = query ? `"${query}"에 대한 검색 결과가 없습니다.` : '가입한 그룹이 없습니다. 그룹을 만들어보세요!';
    list.innerHTML = '';
    banner.style.display = 'none';
  } else {
    empty.style.display = 'none';
    list.innerHTML = html;
  }
}

function groupCardHtml(g) {
  const inactiveClass = g.inactive ? ' inactive' : '';
  const liveBadge = g.hasLive ? `<span class="gp-card-live-badge">LIVE ${g.liveViewers}명</span>` : '';
  const memberList = store.groupMembers && store.groupMembers[g.id];
  const memberCount = memberList ? memberList.length : g.members;
  const tags = g.tags.slice(0,3).map(t => `<span class="gp-card-tag">${t}</span>`).join('');
  return `<div class="gp-card ani${inactiveClass}" onclick="goGroupMain(${g.id})">
    <div class="gp-card-img">${g.profileImg ? `<img src="${g.profileImg}" style="width:100%;height:100%;object-fit:cover"/>` : ''}</div>
    <div class="gp-card-info">
      <div class="gp-card-name">${g.name}</div>
      <div class="gp-card-meta">멤버 ${memberCount}명 ${liveBadge}</div>
      <div class="gp-card-tags">${tags}</div>
    </div>
  </div>`;
}

function recommendCardHtml(g) {
  const tags = g.tags.slice(0,3).map(t => `<span class="gp-card-tag">${t}</span>`).join('');
  return `<div class="gp-card ani" onclick="goGroupMain(${g.id})" style="background:var(--gray-50)">
    <div class="gp-card-img" style="background:linear-gradient(135deg,#ddd,#bbb)"></div>
    <div class="gp-card-info">
      <div class="gp-card-name">${g.name}</div>
      <div class="gp-card-meta">멤버 ${g.members}명 · <span style="color:var(--orange)">추천</span></div>
      <div class="gp-card-tags">${tags}</div>
      <div style="font-size:11px;color:var(--gray-500);margin-top:2px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${g.desc || ''}</div>
    </div>
  </div>`;
}

function goGroupMain(id) {
  const s = FITO_STORE.get();
  const group = s.groups.find(g => g.id === id) || (s.recommendGroups || []).find(g => g.id === id);
  if (!group) { showSnackbar('해당 그룹이 존재하지 않습니다.'); return; }
  location.href = `/group/main?id=${id}`;
}

function onCreateGroupClick() { document.getElementById('createConfirmModal').classList.add('open'); }
function closeCreateModal() { document.getElementById('createConfirmModal').classList.remove('open'); }
function goCreateGroup() { closeCreateModal(); location.href = '/group/create'; }

function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg; sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => { renderGroups(''); });
