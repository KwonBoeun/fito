/* ===========================
   FITO - MY 페이지 JS
   =========================== */

const USER_NICKNAME = "김세건";

function switchMyTab(tab) {
  const isProfile = tab === "profile";

  document.getElementById("tabProfile").classList.toggle("active", isProfile);
  document.getElementById("tabMypage").classList.toggle("active", !isProfile);
  document.getElementById("screenProfile").classList.toggle("active", isProfile);
  document.getElementById("screenMypage").classList.toggle("active", !isProfile);
  document.getElementById("myHeaderTitle").textContent = isProfile ? "프로필" : "마이페이지";
}

let activeProfileTab = 0;
function switchProfileTab(idx) {
  activeProfileTab = idx;
  document.querySelectorAll(".profile-content-tab").forEach((tab, index) => {
    tab.classList.toggle("active", index === idx);
  });
  renderProfileGrid(idx);
}

const GRID_LABELS = [
  "VOD", "VOD", "FITS", "VOD", "FITS", "VOD",
  "VOD", "FITS", "VOD", "VOD", "FITS", "VOD",
  "VOD", "FITS", "VOD", "VOD", "FITS", "VOD",
];

function renderProfileGrid() {
  const grid = document.getElementById("profileGrid");
  const count = 18;
  grid.innerHTML = Array.from({ length: count }, (_, index) => `
    <div class="profile-grid-item" onclick="goProfileDetail(${index})">
      <div class="profile-grid-item-label">${GRID_LABELS[index] || ""}</div>
    </div>
  `).join("");
}

function goProfileDetail(idx) {
  window.location.href = `/mypage/profile/detail?idx=${idx}`;
}

function initProfile() {
  const name = USER_NICKNAME;
  document.getElementById("profileName").textContent = name;
  document.getElementById("profileAvatar").textContent = name[0];
}

function goFriends() {
  window.location.href = "/mypage/friends";
}

function goFriendRequest() {
  window.location.href = "/mypage/friend-request";
}

async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    window.location.href = result.redirectUrl || "/";
  } catch (error) {
    alert("로그아웃 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initProfile();
  renderProfileGrid(activeProfileTab);
});
