let groupState = {
  currentUser: null,
  joinedGroups: [],
  recommendGroups: [],
};
let currentSort = "activity";

function openSearchOverlay() {
  document.getElementById("searchOverlay").classList.add("open");
  setTimeout(() => document.getElementById("groupSearchInput").focus(), 100);
}

function closeSearchOverlay() {
  document.getElementById("searchOverlay").classList.remove("open");
  clearSearch();
}

document.querySelector(".gp-header-search").addEventListener("click", openSearchOverlay);

const searchInput = document.getElementById("groupSearchInput");
searchInput.addEventListener("input", async () => {
  const value = searchInput.value.replace(/[^\u3131-\u318E\uAC00-\uD7A3a-zA-Z0-9\s#]/g, "");
  if (value !== searchInput.value) {
    searchInput.value = value;
  }
  document.getElementById("searchClearBtn").style.display = value.trim() ? "block" : "none";
  await renderSearchResults(value.trim());
});

function clearSearch() {
  searchInput.value = "";
  document.getElementById("searchClearBtn").style.display = "none";
  document.getElementById("sortBar").style.display = "none";
  document.getElementById("searchResultsList").innerHTML = "";
}

function setSort(sort) {
  currentSort = sort;
  document.querySelectorAll(".gp-sort-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.sort === sort);
  });
  const query = searchInput.value.trim();
  if (query) {
    renderSearchResults(query);
  }
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  const result = await response.json();

  if (response.status === 401 && result.redirectUrl) {
    window.location.href = result.redirectUrl;
    return null;
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "요청에 실패했습니다.");
  }

  return result;
}

async function loadGroups() {
  const result = await apiFetch("/api/groups");
  if (!result) return;

  groupState = {
    currentUser: result.currentUser,
    joinedGroups: result.joinedGroups || [],
    recommendGroups: result.recommendGroups || [],
  };
  syncGroupsToLocalStore();
  renderGroups();
}

async function renderSearchResults(query) {
  const list = document.getElementById("searchResultsList");
  const sortBar = document.getElementById("sortBar");

  if (!query) {
    list.innerHTML = '<div style="padding:40px 20px;text-align:center;color:var(--gray-400);font-size:13px">검색어를 입력해 주세요.</div>';
    sortBar.style.display = "none";
    return;
  }

  sortBar.style.display = "flex";

  try {
    const cleanQuery = query.replace(/^#/, "");
    const result = await apiFetch(`/api/groups/search?query=${encodeURIComponent(cleanQuery)}&sort=${encodeURIComponent(currentSort)}`);
    if (!result) return;

    const groups = result.groups || [];
    if (!groups.length) {
      list.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--gray-400);font-size:13px">"${query}" 검색 결과가 없습니다.</div>`;
      return;
    }

    list.innerHTML = `<div style="padding:0 16px">${groups.map((group) => searchCardHtml(group)).join("")}</div>`;
  } catch (error) {
    list.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--gray-400);font-size:13px">${error.message}</div>`;
  }
}

function renderGroups() {
  const list = document.getElementById("groupList");
  const empty = document.getElementById("emptyState");
  const banner = document.getElementById("recommendBanner");
  const joined = groupState.joinedGroups;
  const recommend = groupState.recommendGroups;

  let html = "";
  if (joined.length > 0) {
    html += '<div class="gp-list-section-title">내 그룹</div>';
    html += joined.map((group) => groupCardHtml(group)).join("");
  } else if (recommend.length > 0) {
    html += '<div class="gp-list-section-title">추천 그룹</div>';
    html += recommend.map((group) => recommendCardHtml(group)).join("");
  }

  if (!html) {
    empty.style.display = "block";
    empty.textContent = "가입한 그룹이 없습니다. 그룹을 만들어 보세요.";
    list.innerHTML = "";
  } else {
    empty.style.display = "none";
    list.innerHTML = html;
  }

  if (joined.length > 0 && recommend.length > 0) {
    const pick = recommend[0];
    document.getElementById("recommendText").textContent = `${groupState.currentUser.nickname}님을 위한 추천 그룹 <${pick.name}>`;
    banner.style.display = "block";
    banner.onclick = () => goGroupMain(pick.id);
  } else {
    banner.style.display = "none";
  }
}

function searchCardHtml(group) {
  const tags = (group.tags || [])
    .slice(0, 3)
    .map((tag) => `<span class="gp-card-tag" onclick="event.stopPropagation();searchByTag('${tag}')">${tag}</span>`)
    .join("");
  const badge = group.joined ? "" : '<span style="color:var(--orange);font-size:10px;font-weight:700">추천</span>';

  return `<div class="gp-card ani" onclick="goGroupMain(${group.id})" style="${group.joined ? "" : "background:var(--gray-50)"}">
    <div class="gp-card-img">${group.profileImg ? `<img src="${group.profileImg}" style="width:100%;height:100%;object-fit:cover"/>` : ""}</div>
    <div class="gp-card-info">
      <div class="gp-card-name">${group.name}</div>
      <div class="gp-card-meta">멤버 ${group.members}명 ${badge}</div>
      <div class="gp-card-tags">${tags}</div>
    </div>
  </div>`;
}

function groupCardHtml(group) {
  const liveBadge = group.hasLive ? `<span class="gp-card-live-badge">LIVE ${group.liveViewers}명</span>` : "";
  const tags = (group.tags || [])
    .slice(0, 3)
    .map((tag) => `<span class="gp-card-tag" onclick="event.stopPropagation();searchByTag('${tag}')">${tag}</span>`)
    .join("");

  return `<div class="gp-card ani${group.inactive ? " inactive" : ""}" onclick="goGroupMain(${group.id})">
    <div class="gp-card-img">${group.profileImg ? `<img src="${group.profileImg}" style="width:100%;height:100%;object-fit:cover"/>` : ""}</div>
    <div class="gp-card-info">
      <div class="gp-card-name">${group.name}</div>
      <div class="gp-card-meta">멤버 ${group.members}명 ${liveBadge}</div>
      <div class="gp-card-tags">${tags}</div>
    </div>
  </div>`;
}

function recommendCardHtml(group) {
  const tags = (group.tags || [])
    .slice(0, 3)
    .map((tag) => `<span class="gp-card-tag" onclick="event.stopPropagation();searchByTag('${tag}')">${tag}</span>`)
    .join("");

  return `<div class="gp-card ani" onclick="goGroupMain(${group.id})" style="background:var(--gray-50)">
    <div class="gp-card-img">${group.profileImg ? `<img src="${group.profileImg}" style="width:100%;height:100%;object-fit:cover"/>` : ""}</div>
    <div class="gp-card-info">
      <div class="gp-card-name">${group.name}</div>
      <div class="gp-card-meta">멤버 ${group.members}명 <span style="color:var(--orange)">추천</span></div>
      <div class="gp-card-tags">${tags}</div>
    </div>
  </div>`;
}

function syncGroupsToLocalStore() {
  if (!window.FITO_STORE?.update) return;

  const joined = groupState.joinedGroups;
  const recommend = groupState.recommendGroups;

  window.FITO_STORE.update((state) => {
    state.myName = groupState.currentUser?.nickname || state.myName;
    state.groups = joined.map((group) => ({ ...group }));
    state.recommendGroups = recommend.map((group) => ({ ...group }));
    state.groupMembers = state.groupMembers || {};
    state.groupLives = state.groupLives || {};
    state.groupStories = state.groupStories || {};
    state.groupPending = state.groupPending || {};
    state.groupChats = state.groupChats || {};
    state.groupMessages = state.groupMessages || {};
    state.groupStorage = state.groupStorage || {};

    [...joined, ...recommend].forEach((group) => {
      if (!state.groupMembers[group.id]) {
        const members = [{ name: group.creator, role: group.joined ? group.myRole || "owner" : "owner" }];
        for (let index = 1; index < group.members; index += 1) {
          members.push({ name: `member_${group.id}_${index}`, role: "member" });
        }
        state.groupMembers[group.id] = members;
      }
      state.groupLives[group.id] = state.groupLives[group.id] || [];
      state.groupStories[group.id] = state.groupStories[group.id] || [];
      state.groupPending[group.id] = state.groupPending[group.id] || [];
      state.groupChats[group.id] = state.groupChats[group.id] || [{ id: `all-${group.id}`, name: "전체 채팅", type: "all", allowedMembers: null }];
      state.groupMessages[`all-${group.id}`] = state.groupMessages[`all-${group.id}`] || [];
      state.groupStorage[group.id] = state.groupStorage[group.id] || [];
    });
  });
}

function searchByTag(tag) {
  const keyword = tag.replace(/^#/, "");
  searchInput.value = keyword;
  document.getElementById("searchClearBtn").style.display = "block";
  if (!document.getElementById("searchOverlay").classList.contains("open")) {
    openSearchOverlay();
  }
  renderSearchResults(keyword);
}

function goGroupMain(id) {
  window.location.href = `/group/main?id=${id}`;
}

function onCreateGroupClick() {
  document.getElementById("createConfirmModal").classList.add("open");
}

function closeCreateModal() {
  document.getElementById("createConfirmModal").classList.remove("open");
}

function goCreateGroup() {
  closeCreateModal();
  window.location.href = "/group/create";
}

function showSnackbar(message) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = message;
  snackbar.classList.add("show");
  setTimeout(() => snackbar.classList.remove("show"), 3000);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadGroups();
    const urlTag = new URLSearchParams(window.location.search).get("tag");
    if (urlTag) {
      openSearchOverlay();
      setTimeout(() => {
        searchInput.value = urlTag.replace(/^#/, "");
        document.getElementById("searchClearBtn").style.display = "block";
        renderSearchResults(searchInput.value);
      }, 150);
    }
  } catch (error) {
    showSnackbar(error.message);
  }
});
