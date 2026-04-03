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
function renderProfileGrid(tabIdx) {
  const grid = document.getElementById('profileGrid');
  // 빈 그리드 9칸 (실제 콘텐츠 없는 상태)
  const count = 9;
  grid.innerHTML = Array.from({ length: count }, (_, i) => `
    <div class="profile-grid-item" onclick="alert('콘텐츠 ${i+1}')">
    </div>
  `).join('');
}

/* ── 프로필 정보 초기화 ── */
function initProfile() {
  const name = USER_NICKNAME;
  document.getElementById('profileName').textContent    = name;
  document.getElementById('profileAvatar').textContent  = name[0];
}

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', () => {
  initProfile();
  renderProfileGrid(0);
});