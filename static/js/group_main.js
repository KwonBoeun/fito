let store;
let group;
let members;
let lives;
let stories;
let pendingRequests;
let gid;
let myRole;

function avatarBackgroundStyle(imageUrl) {
  if (!imageUrl) return "";
  return `background-image:url('${imageUrl}');background-size:cover;background-position:center;`;
}

function renderAvatarMarkup(imageUrl, className = "gm-avatar") {
  return `<div class="${className}" style="${avatarBackgroundStyle(imageUrl)}"></div>`;
}

const MOCK_STORIES = [
  { id: 1, author: "coach_anna", title: "오늘 루틴 하이라이트", time: "2시간 전", views: 42 },
  { id: 2, author: "fit_mate", title: "코어 챌린지 성공", time: "5시간 전", views: 28 },
  { id: 3, author: "runner_kim", title: "아침 러닝 기록", time: "1일 전", views: 17 },
];

const MOCK_LIVES = [
  { id: 1, title: "저녁 스트레칭", host: "coach_anna", status: "live", participants: 4, max: 8, startTime: null },
  { id: 2, title: "주말 코어 특강", host: "fit_mate", status: "soon", participants: 0, max: 6, startTime: "18:30" },
];

const MOCK_CHATS = [
  {
    id: "all-demo",
    name: "전체 채팅",
    type: "all",
    allowedMembers: null,
    messages: [{ author: "coach_anna", text: "오늘 저녁 8시에 라이브 시작해요." }],
  },
  {
    id: "secret-demo",
    name: "운영진 채팅",
    type: "secret",
    allowedMembers: ["coach_anna"],
    messages: [{ author: "coach_anna", text: "공지 문구 확인 부탁해요." }],
  },
];

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

async function loadData() {
  gid = Number.parseInt(window.GROUP_ID, 10);
  store = window.FITO_STORE?.get?.() || {};

  const result = await apiFetch(`/api/groups/${gid}`);
  if (!result) return false;

  const fallbackStoreGroup =
    (store.groups || []).find((item) => item.id === gid) ||
    (store.recommendGroups || []).find((item) => item.id === gid);

  group = { ...fallbackStoreGroup, ...result.group };
  members = result.members?.length ? result.members : buildFallbackMembers(group, store);
  pendingRequests = result.pendingRequests || [];
  myRole = group.myRole || "none";

  stories = store.groupStories?.[gid]?.length ? store.groupStories[gid] : MOCK_STORIES;
  lives = store.groupLives?.[gid]?.length ? store.groupLives[gid] : MOCK_LIVES;

  syncGroupToStore(group, members, pendingRequests, stories, lives);
  return true;
}

function buildFallbackMembers(groupData, currentStore) {
  const existing = currentStore.groupMembers?.[gid];
  if (existing?.length) return existing;

  const built = [
    {
      name: groupData.creator,
      role: groupData.myRole === "none" ? "owner" : groupData.myRole,
      profileImageUrl: groupData.profileImg || "",
    },
  ];
  const targetCount = Math.max(groupData.members || 1, 1);
  for (let index = 1; index < targetCount; index += 1) {
    built.push({ name: `member_${gid}_${index}`, role: "member", profileImageUrl: "" });
  }
  return built;
}

function syncGroupToStore(groupData, memberList, pendingList, storyList, liveList) {
  if (!window.FITO_STORE?.update) return;

  window.FITO_STORE.update((state) => {
    state.myName = state.myName || groupData.creator;
    state.groups = state.groups || [];
    state.recommendGroups = state.recommendGroups || [];
    state.groupMembers = state.groupMembers || {};
    state.groupStories = state.groupStories || {};
    state.groupLives = state.groupLives || {};
    state.groupPending = state.groupPending || {};
    state.groupChats = state.groupChats || {};
    state.groupMessages = state.groupMessages || {};
    state.groupStorage = state.groupStorage || {};

    const joinedIndex = state.groups.findIndex((item) => item.id === groupData.id);
    const recommendIndex = state.recommendGroups.findIndex((item) => item.id === groupData.id);

    if (groupData.joined) {
      if (joinedIndex >= 0) state.groups[joinedIndex] = { ...state.groups[joinedIndex], ...groupData };
      else state.groups.unshift(groupData);
      if (recommendIndex >= 0) state.recommendGroups.splice(recommendIndex, 1);
    } else {
      if (recommendIndex >= 0) state.recommendGroups[recommendIndex] = { ...state.recommendGroups[recommendIndex], ...groupData };
      else state.recommendGroups.unshift(groupData);
    }

    state.groupMembers[groupData.id] = memberList.map((member) => ({
      name: member.name,
      role: member.role,
      profileImageUrl: member.profileImageUrl || "",
    }));
    state.groupPending[groupData.id] = pendingList.map((item) => ({
      membershipId: item.membershipId,
      name: item.name,
      greeting: item.greeting,
      profileImageUrl: item.profileImageUrl || "",
    }));
    state.groupStories[groupData.id] = storyList;
    state.groupLives[groupData.id] = liveList;
    state.groupChats[groupData.id] =
      state.groupChats[groupData.id]?.length
        ? state.groupChats[groupData.id]
        : MOCK_CHATS.map((chat) => ({
            id: `${chat.id}-${groupData.id}`,
            name: chat.name,
            type: chat.type,
            allowedMembers: chat.allowedMembers,
          }));

    MOCK_CHATS.forEach((chat) => {
      const chatId = `${chat.id}-${groupData.id}`;
      if (!state.groupMessages[chatId]) {
        state.groupMessages[chatId] = chat.messages.map((message, index) => ({
          id: index + 1,
          author: message.author,
          text: message.text,
          likes: 0,
          likedBy: [],
          time: "09:00",
          date: "2026-01-01",
        }));
      }
    });

    state.groupStorage[groupData.id] = state.groupStorage[groupData.id] || [];
  });

  store = window.FITO_STORE.get();
}

function renderGroupInfo() {
  document.getElementById("headerGroupName").textContent = group.name;
  document.getElementById("groupName").textContent = group.name;
  document.getElementById("groupCreator").textContent = `그룹장 ${group.creator}`;
  document.getElementById("groupDesc").textContent = group.desc || "설명이 없습니다.";
  document.getElementById("groupTags").innerHTML = (group.tags || [])
    .map((tag) => `<span class="gm-tag" onclick="searchByTag('${tag}')" style="cursor:pointer">${tag}</span>`)
    .join("");

  const joinLeaveBtn = document.getElementById("joinLeaveBtn");
  if (group.joined) {
    joinLeaveBtn.textContent = "탈퇴";
    joinLeaveBtn.className = "gm-join-btn leave";
  } else if (group.membershipStatus === "pending") {
    joinLeaveBtn.textContent = "신청중";
    joinLeaveBtn.className = "gm-join-btn join";
  } else {
    joinLeaveBtn.textContent = "가입 신청";
    joinLeaveBtn.className = "gm-join-btn join";
  }

  if (group.bannerImg) {
    const banner = document.getElementById("groupBanner");
    banner.style.backgroundImage = `url(${group.bannerImg})`;
    banner.style.backgroundSize = "cover";
  }
  if (group.profileImg) {
    const profile = document.getElementById("groupProfileImg");
    profile.style.backgroundImage = `url(${group.profileImg})`;
    profile.style.backgroundSize = "cover";
    profile.style.backgroundPosition = "center";
  }

  document.getElementById("membersAvatars").innerHTML = members
    .slice(0, 4)
    .map((member) => renderAvatarMarkup(member.profileImageUrl))
    .join("");
  document.getElementById("membersCount").textContent = `${members.length}명`;

  const pendingNotice = document.getElementById("pendingNotice");
  if ((myRole === "owner" || myRole === "manager") && pendingRequests.length > 0) {
    pendingNotice.style.display = "flex";
    document.getElementById("pendingNoticeCount").textContent = `${pendingRequests.length}명`;
  } else {
    pendingNotice.style.display = "none";
  }

  const storageCount = window.FITO_STORE?.getStorageCount?.(gid) || 0;
  document.getElementById("storageCount").textContent = storageCount > 0 ? `${storageCount}개` : "없음";

  if (!group.joined) {
    ["chatSection", "liveSection", "newLiveWrap", "storageSection"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.style.display = "none";
    });
  }
}

function renderIssues() {
  const storyScroll = document.getElementById("storyScroll");
  if (stories.length === 0) {
    storyScroll.innerHTML = `<span style="font-size:11px;color:var(--gray-400);padding:8px 0">${
      group.joined ? "업로드된 스토리가 없습니다. 첫 번째 스토리를 올려 보세요." : "업로드된 스토리가 없습니다."
    }</span>`;
  } else {
    storyScroll.innerHTML = stories.map((story) => `<div class="gm-story-item" title="${story.author}: ${story.title}"></div>`).join("");
  }

  const best = window.FITO_STORE?.getTodayBestChat?.(gid);
  const chatText = document.getElementById("todayChatText");
  const chatAuthor = document.getElementById("todayChatAuthor");

  if (best) {
    chatText.textContent = best.text;
    chatAuthor.textContent = `${best.author} · 좋아요 ${best.likes}`;
  } else {
    chatText.textContent = "오늘은 조용하군요…!";
    chatAuthor.textContent = "";
  }
}

let storySortType = "latest";

function openStories() {
  if (stories.length === 0) {
    showSnackbar("스토리가 없습니다.");
    return;
  }
  renderStoryList();
  document.getElementById("storyOverlay").classList.add("open");
  document.getElementById("storySheet").classList.add("open");
}

function closeStories() {
  document.getElementById("storyOverlay").classList.remove("open");
  document.getElementById("storySheet").classList.remove("open");
}

function sortStories(type) {
  storySortType = type;
  document.getElementById("storyLatest").className = type === "latest" ? "ss-btn active" : "ss-btn";
  document.getElementById("storyPopular").className = type === "popular" ? "ss-btn active" : "ss-btn";
  renderStoryList();
}

function renderStoryList() {
  const sortedStories = [...stories];
  if (storySortType === "popular") {
    sortedStories.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  document.getElementById("storyList").innerHTML = sortedStories
    .map(
      (story) => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--gray-100)">
          <div style="width:56px;height:56px;border-radius:8px;background:var(--gray-200);flex-shrink:0;display:flex;align-items:center;justify-content:center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:600;margin-bottom:2px">${story.title}</div>
            <div style="font-size:11px;color:var(--gray-400)">${story.author} · ${story.time} · 조회 ${story.views || 0}</div>
          </div>
        </div>`,
    )
    .join("");
}

function renderChats() {
  const chats = store.groupChats?.[gid] || [];
  const list = document.getElementById("chatList");
  if (chats.length === 0) {
    list.innerHTML = '<div class="gp-empty">채팅방이 없습니다.</div>';
    return;
  }

  const myName = store.myName || group.creator;
  list.innerHTML = chats
    .map((chat) => {
      const messages = store.groupMessages?.[chat.id] || [];
      const lastMessage = messages.length > 0 ? `${messages[messages.length - 1].author}: ${messages[messages.length - 1].text}` : "메시지가 없습니다.";
      const hasAccess = chat.type === "all" || !chat.allowedMembers || chat.allowedMembers.includes(myName);
      const icon =
        chat.type === "all"
          ? '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
          : '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
      return `<div class="gm-chat-item" style="${hasAccess ? "" : "opacity:0.4"}" onclick="openChat('${chat.id}', ${hasAccess})">
        <div class="gm-chat-icon">${icon}</div>
        <div class="gm-chat-info">
          <div class="gm-chat-name">${chat.name}${hasAccess ? "" : " 잠금"}</div>
          <div class="gm-chat-preview">${hasAccess ? lastMessage : "접근 권한이 없습니다."}</div>
        </div>
      </div>`;
    })
    .join("");
}

function renderLives() {
  const list = document.getElementById("liveList");
  if (lives.length === 0) {
    list.innerHTML = '<div class="gp-empty">라이브가 아직 없습니다.<br>새 라이브를 만들어 보세요.</div>';
    return;
  }

  const order = { live: 0, soon: 1, scheduled: 2 };
  const sortedLives = [...lives].sort((a, b) => (order[a.status] || 9) - (order[b.status] || 9));

  list.innerHTML = sortedLives
    .map((live) => {
      let statusHtml = "";
      let metaText = "";
      if (live.status === "live") {
        statusHtml = '<span class="gm-live-status live">LIVE</span>';
        metaText = `${live.participants}/${live.max}명 참여 중`;
      } else if (live.status === "soon") {
        statusHtml = '<span class="gm-live-status soon">곧 시작</span>';
        metaText = `${live.startTime} 시작 예정`;
      } else {
        statusHtml = '<span class="gm-live-status scheduled">예정</span>';
        metaText = `${live.startTime} 시작 예정`;
      }
      return `<div class="gm-live-card" onclick="joinLive(${live.id}, '${live.status}')">
        <div class="gm-live-thumb">${live.status === "live" ? '<div style="position:absolute;inset:0;background:rgba(232,22,28,.1)"></div>' : ""}</div>
        <div class="gm-live-info">
          <div class="gm-live-title">${live.title}</div>
          <div class="gm-live-meta">${live.host} · ${metaText}</div>
          ${statusHtml}
        </div>
      </div>`;
    })
    .join("");
}

function searchByTag(tag) {
  window.location.href = `/group?tag=${encodeURIComponent(tag)}`;
}

function toggleMembership() {
  if (group.joined) {
    document.getElementById("leaveModal").classList.add("open");
    return;
  }
  if (group.membershipStatus === "pending") {
    showSnackbar("이미 가입 신청을 보냈습니다.");
    return;
  }
  document.getElementById("joinModal").classList.add("open");
}

function closeJoinModal() {
  document.getElementById("joinModal").classList.remove("open");
}

function closeLeaveModal() {
  document.getElementById("leaveModal").classList.remove("open");
}

async function submitJoin() {
  const greeting = document.getElementById("joinGreeting").value.trim();
  if (greeting.length < 1 || greeting.length > 100) {
    showSnackbar("가입 인사는 1자 이상 100자 이하로 입력해 주세요.");
    return;
  }

  try {
    const result = await apiFetch(`/api/groups/${gid}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ greeting }),
    });
    if (!result) return;
    closeJoinModal();
    document.getElementById("joinGreeting").value = "";
    await refreshPageData();
    showSnackbar("가입 신청을 보냈습니다.");
  } catch (error) {
    showSnackbar(error.message);
  }
}

function confirmLeave() {
  if (!window.FITO_STORE?.update) return;
  window.FITO_STORE.update((state) => {
    const target = (state.groups || []).find((item) => item.id === gid);
    if (target) {
      target.joined = false;
      target.myRole = "none";
      target.membershipStatus = "none";
    }
  });
  closeLeaveModal();
  showSnackbar("그룹에서 탈퇴했습니다. 현재는 테스트용 동작입니다.");
  setTimeout(() => {
    window.location.href = "/group";
  }, 700);
}

function openMembersSheet() {
  renderMembersList();
  document.getElementById("membersOverlay").classList.add("open");
  document.getElementById("membersSheet").classList.add("open");
}

function closeMembersSheet() {
  document.getElementById("membersOverlay").classList.remove("open");
  document.getElementById("membersSheet").classList.remove("open");
}

function renderMembersList() {
  const list = document.getElementById("membersList");
  const isAdmin = myRole === "owner" || myRole === "manager";
  const roleLabel = { owner: "그룹장", manager: "매니저", member: "그룹원" };
  const roleColor = { owner: "var(--orange)", manager: "var(--blue)", member: "var(--gray-400)" };

  let html = "";
  if (isAdmin && pendingRequests.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:8px">가입 대기 중</div>';
    html += pendingRequests
      .map(
        (item) => `<div class="gm-member-row">
          ${renderAvatarMarkup(item.profileImageUrl, "gm-member-avatar")}
          <div class="gm-member-copy">
            <div class="gm-member-name">${item.name}</div>
            <div class="gm-member-greeting">${item.greeting}</div>
          </div>
          <button onclick="acceptPending(${item.membershipId})" style="padding:4px 10px;background:#000;color:#fff;border:none;border-radius:999px;font-size:11px;font-weight:600;cursor:pointer">수락</button>
          <button onclick="rejectPending(${item.membershipId})" style="padding:4px 10px;background:#f2f2f2;color:#e05c4b;border:none;border-radius:999px;font-size:11px;font-weight:600;cursor:pointer">거절</button>
        </div>`,
      )
      .join("");
    html += '<div style="height:12px"></div>';
  }

  html += '<div style="font-size:12px;font-weight:700;color:var(--gray-500);margin-bottom:8px">멤버</div>';
  html += members
    .map((member) => {
      const memberName = member.name || member.nickname;
      let actions = "";
      if (myRole === "owner" && member.role === "member" && memberName !== (store.myName || group.creator)) {
        actions =
          `<button onclick="promoteMember('${memberName}')" style="padding:3px 8px;background:var(--blue);color:#fff;border:none;border-radius:999px;font-size:10px;cursor:pointer;margin-right:4px">승급</button>` +
          `<button onclick="kickMember('${memberName}')" style="padding:3px 8px;background:#fdecea;color:#e05c4b;border:none;border-radius:999px;font-size:10px;cursor:pointer">내보내기</button>`;
      }
      return `<div class="gm-member-row">
        ${renderAvatarMarkup(member.profileImageUrl, "gm-member-avatar")}
        <div class="gm-member-copy"><div class="gm-member-name">${memberName}</div></div>
        <span style="font-size:10px;font-weight:700;color:${roleColor[member.role]};padding:2px 8px;background:var(--gray-50);border-radius:999px">${roleLabel[member.role]}</span>
        ${actions}
      </div>`;
    })
    .join("");

  list.innerHTML = html;
}

async function acceptPending(membershipId) {
  try {
    const result = await apiFetch(`/api/groups/${gid}/requests/${membershipId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!result) return;
    await refreshPageData();
    renderMembersList();
    showSnackbar("가입 요청을 수락했습니다.");
  } catch (error) {
    showSnackbar(error.message);
  }
}

async function rejectPending(membershipId) {
  try {
    const result = await apiFetch(`/api/groups/${gid}/requests/${membershipId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!result) return;
    await refreshPageData();
    renderMembersList();
    showSnackbar("가입 요청을 거절했습니다.");
  } catch (error) {
    showSnackbar(error.message);
  }
}

function promoteMember(name) {
  window.FITO_STORE.update((state) => {
    const target = (state.groupMembers[gid] || []).find((member) => member.name === name);
    if (target) target.role = "manager";
  });
  store = window.FITO_STORE.get();
  members = store.groupMembers[gid] || members;
  renderMembersList();
  showSnackbar(`${name}님을 매니저로 승급했습니다. 현재는 테스트용 동작입니다.`);
}

function kickMember(name) {
  window.FITO_STORE.update((state) => {
    state.groupMembers[gid] = (state.groupMembers[gid] || []).filter((member) => member.name !== name);
  });
  store = window.FITO_STORE.get();
  members = store.groupMembers[gid] || members;
  renderGroupInfo();
  renderMembersList();
  showSnackbar(`${name}님을 그룹에서 제외했습니다. 현재는 테스트용 동작입니다.`);
}

function openChat(chatId, hasAccess) {
  if (!group.joined) {
    showSnackbar("그룹에 가입해야 채팅에 참여할 수 있습니다.");
    return;
  }
  if (!hasAccess) {
    showSnackbar("이 채팅방에 접근할 권한이 없습니다.");
    return;
  }
  window.location.href = `${window.URL_GROUP_CHAT}&type=${chatId}`;
}

function addChat() {
  if (!window.FITO_STORE?.canManage?.(gid)) {
    document.getElementById("noPermMsg").textContent = "채팅방을 만들 권한이 없습니다. (매니저 이상)";
    document.getElementById("noPermModal").classList.add("open");
    return;
  }
  const name = window.prompt("비밀 채팅방 이름을 입력해 주세요.");
  if (!name || !name.trim()) return;

  window.FITO_STORE.update((state) => {
    const chatId = `secret-${state.nextChatId++}`;
    state.groupChats[gid] = state.groupChats[gid] || [];
    state.groupChats[gid].push({
      id: chatId,
      name: name.trim(),
      type: "secret",
      allowedMembers: [state.myName || group.creator],
    });
    state.groupMessages[chatId] = [];
  });

  store = window.FITO_STORE.get();
  renderChats();
  showSnackbar(`"${name.trim()}" 채팅방을 추가했습니다. 현재는 테스트용 동작입니다.`);
}

function joinLive(id, status) {
  if (!group.joined) {
    showSnackbar("그룹에 가입해야 라이브에 참여할 수 있습니다.");
    return;
  }
  const live = lives.find((item) => item.id === id);
  const timeParam = live && live.startTime ? `&time=${live.startTime}` : "";
  window.location.href = `${window.URL_GROUP_LIVE}?id=${id}&status=${status}${timeParam}`;
}

let liveCreateLock = false;
function createNewLive() {
  if (!group.joined) {
    showSnackbar("그룹에 가입해야 라이브를 만들 수 있습니다.");
    return;
  }
  if (!window.FITO_STORE?.canManage?.(gid)) {
    showSnackbar("라이브를 만들 권한이 없습니다. (매니저 이상)");
    return;
  }
  if (liveCreateLock) return;
  liveCreateLock = true;
  setTimeout(() => {
    liveCreateLock = false;
  }, 2000);
  window.location.href = window.URL_GROUP_LIVE_CREATE;
}

async function refreshPageData() {
  await loadData();
  renderGroupInfo();
  renderIssues();
  renderChats();
  renderLives();
}

function showSnackbar(message) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = message;
  snackbar.classList.add("show");
  setTimeout(() => snackbar.classList.remove("show"), 3000);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const loaded = await loadData();
    if (!loaded) return;
    renderGroupInfo();
    renderIssues();
    renderChats();
    renderLives();
  } catch (error) {
    showSnackbar(error.message);
  }
});
