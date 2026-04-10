(function () {
  const NAV_ITEMS = [
    { label: '홈',  href: '/',         icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { label: '운동',  href: '/pt',       icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
    { label: '그룹', href: '/group',   icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { label: '분석', href: '/analyze', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { label: 'MY',  href: '/mypage',   icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  ];

  const NAV_PATHS = NAV_ITEMS.map(i => i.href).filter(h => h !== '#');
  const cameFromNav = NAV_PATHS.some(p => document.referrer.includes(p));

  // active 업데이트 함수로 분리
  function updateActive() {
    const currentPath = location.pathname;
    document.querySelectorAll('#bottom-nav a[data-nav]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === currentPath);
    });
  }

  // 렌더링
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = NAV_ITEMS.map(({ label, href, icon }) => `
    <a href="${href}" class="nav-item" data-nav>
      <div class="nav-icon"><svg viewBox="0 0 24 24">${icon}</svg></div>
      <span class="nav-label">${label}</span>
    </a>
  `).join('');

  updateActive(); // 최초 렌더링 시

  // 뒤로가기(bfcache 복원) 시에도 active 재적용
  window.addEventListener('pageshow', updateActive);

  // 뒤로가기 로직
  nav.querySelectorAll('a[data-nav]').forEach(link => {
    link.addEventListener('click', function (e) {
      const dest = this.getAttribute('href');
      if (!dest || dest === '#') return;
      e.preventDefault();
      cameFromNav ? location.replace(dest) : (location.href = dest);
    });
  });
})();