/* ===========================
   FITO - MY 페이지 JS
   =========================== */

const USER_NICKNAME = '김땡땡';

/* ── 탭 전환 ── */
function switchMyTab(tab) {
  const isProfile = tab === 'profile';

  document.getElementById('tabProfile').classList.toggle('active', isProfile);
  document.getElementById('tabMypage').classList.toggle('active', !isProfile);
  document.getElementById('screenProfile').classList.toggle('active', isProfile);
  document.getElementById('screenMypage').classList.toggle('active', !isProfile);
  document.getElementById('myHeaderTitle').textContent = isProfile ? '프로필' : '마이페이지';
}

/* ── 프로필 콘텐츠 탭 ── */
let activeProfileTab = 0;
function switchProfileTab(idx, el) {
  activeProfileTab = idx;
  document.querySelectorAll('.profile-content-tab').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
  renderProfileGrid(idx);
}

/* ── 프로필 그리드 렌더링 ── */
const PROFILE_DETAIL_URL = '{{ url_for_placeholder_profile_detail }}';
const FRIENDS_URL        = '{{ url_for_placeholder_friends }}';
const FRIEND_REQ_URL     = '{{ url_for_placeholder_friend_req }}';

const GRID_LABELS = ['VOD', 'VOD', 'FITS', 'VOD', 'FITS', 'VOD', 'VOD', 'FITS', 'VOD',
                     'VOD', 'FITS', 'VOD', 'VOD', 'FITS', 'VOD', 'VOD', 'FITS', 'VOD'];

function renderProfileGrid(tabIdx) {
  const grid = document.getElementById('profileGrid');
  const count = 18; // 6행 × 3열
  grid.innerHTML = Array.from({ length: count }, (_, i) => `
    <div class="profile-grid-item" onclick="goProfileDetail(${i})">
      <div class="profile-grid-item-label">${GRID_LABELS[i] || ''}</div>
    </div>
  `).join('');
}

function goProfileDetail(idx) {
  window.location.href = '/mypage/profile/detail?idx=' + idx;
}

/* ── 프로필 정보 초기화 ── */
function initProfile() {
  const name = USER_NICKNAME;
  document.getElementById('profileName').textContent    = name;
  document.getElementById('profileAvatar').textContent  = name[0];
}

/* ── 페이지 이동 ── */
function goFriends()      { window.location.href = '/mypage/friends'; }
function goFriendRequest(){ window.location.href = '/mypage/friend-request'; }


/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', () => {
  initProfile();
  renderProfileGrid(0);
});