(function () {
  const NAV_ITEMS = [
    {
      label: "홈",
      href: "/home",
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    },
    {
      label: "운동",
      href: "/pt",
      icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    },
    {
      label: "그룹",
      href: "/group",
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    },
    {
      label: "분석",
      href: "/analyze",
      icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    },
    {
      label: "MY",
      href: "/mypage",
      icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    },
  ];

  const nav = document.getElementById("bottom-nav");
  if (!nav) return;

  const navPaths = NAV_ITEMS.map((item) => item.href);
  const cameFromNav = navPaths.some((path) => document.referrer.includes(path));

  function updateActive() {
    const currentPath = window.location.pathname;
    document.querySelectorAll("#bottom-nav a[data-nav]").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === currentPath);
    });
  }

  nav.innerHTML = NAV_ITEMS.map(
    ({ label, href, icon }) => `
      <a href="${href}" class="nav-item" data-nav>
        <div class="nav-icon"><svg viewBox="0 0 24 24">${icon}</svg></div>
        <span class="nav-label">${label}</span>
      </a>
    `,
  ).join("");

  updateActive();
  window.addEventListener("pageshow", updateActive);

  nav.querySelectorAll("a[data-nav]").forEach((link) => {
    link.addEventListener("click", function onNavClick(event) {
      const destination = this.getAttribute("href");
      if (!destination || destination === "#") return;
      event.preventDefault();
      if (cameFromNav) {
        window.location.replace(destination);
      } else {
        window.location.href = destination;
      }
    });
  });
})();
