let visibility = "public";
let tags = [];
let profileImgData = "";
let bannerImgData = "";

function sanitizeText(value) {
  return value.replace(/[^\u3131-\u318E\uAC00-\uD7A3a-zA-Z0-9\s]/g, "");
}

function sanitizeTag(value) {
  return value.replace(/[^\u3131-\u318E\uAC00-\uD7A3a-zA-Z0-9_\s]/g, "");
}

document.getElementById("profileImgArea").addEventListener("click", () => {
  pickImage((data) => {
    profileImgData = data;
    document.getElementById("profileImgArea").innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    checkForm();
  });
});

document.getElementById("bannerImgArea").addEventListener("click", () => {
  pickImage((data) => {
    bannerImgData = data;
    document.getElementById("bannerImgArea").innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r-md)"/>`;
    checkForm();
  });
});

function pickImage(callback) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showSnackbar("이미지는 10MB 이하만 업로드할 수 있습니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => callback(loadEvent.target.result);
    reader.readAsDataURL(file);
  };
  input.click();
}

const nameInput = document.getElementById("groupName");
const descInput = document.getElementById("groupDesc");
const tagInput = document.getElementById("tagInput");
const submitBtn = document.getElementById("submitBtn");

nameInput.addEventListener("input", () => {
  nameInput.value = sanitizeText(nameInput.value);
  document.getElementById("nameCount").textContent = nameInput.value.length;
  checkForm();
});

descInput.addEventListener("input", () => {
  descInput.value = sanitizeText(descInput.value);
  document.getElementById("descCount").textContent = descInput.value.length;
  checkForm();
});

tagInput.addEventListener("input", () => {
  tagInput.value = sanitizeTag(tagInput.value);
});

tagInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addTag();
  }
});

function setVisibility(value) {
  visibility = value;
  document.getElementById("btnPublic").classList.toggle("selected", value === "public");
  document.getElementById("btnPrivate").classList.toggle("selected", value === "private");
}

function addTag() {
  const value = tagInput.value.trim();
  if (!value) {
    showSuggestedTags();
    return;
  }
  if (tags.length >= 20) {
    showSnackbar("해시태그는 최대 20개까지 등록할 수 있습니다.");
    return;
  }
  if (value.length > 30) {
    showSnackbar("해시태그는 30자 이하만 가능합니다.");
    return;
  }
  if (tags.includes(value)) {
    showSnackbar("이미 추가한 해시태그입니다.");
    return;
  }
  tags.push(value);
  tagInput.value = "";
  renderTags();
  checkForm();
  hideSuggestedTags();
}

function showSuggestedTags() {
  const defaults = ["health", "weight", "core", "cardio", "stretch", "diet", "running", "beginner", "pt", "meal"];
  const suggested = window.FITO_STORE?.get?.().suggestedTags || defaults;
  const available = suggested.filter((tag) => !tags.includes(tag));
  const element = document.getElementById("suggestedTags");
  element.style.display = "flex";
  element.innerHTML =
    '<div style="font-size:11px;color:var(--gray-400);width:100%;margin-bottom:4px">추천 해시태그</div>' +
    available
      .slice(0, 12)
      .map(
        (tag) =>
          `<span onclick="pickSuggestedTag('${tag}')" style="padding:5px 12px;background:var(--gray-100);border-radius:999px;font-size:12px;cursor:pointer">#${tag}</span>`,
      )
      .join("");
}

function hideSuggestedTags() {
  document.getElementById("suggestedTags").style.display = "none";
}

function pickSuggestedTag(tag) {
  if (tags.length >= 20 || tags.includes(tag)) return;
  tags.push(tag);
  renderTags();
  checkForm();
  showSuggestedTags();
}

function removeTag(index) {
  tags.splice(index, 1);
  renderTags();
  checkForm();
}

function renderTags() {
  document.getElementById("tagCountLabel").textContent = tags.length;
  document.getElementById("tagsWrap").innerHTML = tags
    .map(
      (tag, index) =>
        `<div class="gc-tag-chip">#${tag}<span class="gc-tag-chip-x" onclick="removeTag(${index})"><svg viewBox="0 0 24 24" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18" stroke="#999" stroke-width="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="#999" stroke-width="2"/></svg></span></div>`,
    )
    .join("");
}

function checkForm() {
  submitBtn.disabled = nameInput.value.trim().length === 0;
}

async function submitGroup() {
  const name = nameInput.value.trim();
  if (!name || submitBtn.disabled) return;

  submitBtn.disabled = true;

  try {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: descInput.value.trim(),
        visibility,
        tags,
        profileImg: profileImgData,
        bannerImg: bannerImgData,
      }),
    });
    const result = await response.json();

    if (response.status === 401 && result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }

    if (!response.ok || !result.ok) {
      showSnackbar(result.message || "그룹 생성에 실패했습니다.");
      submitBtn.disabled = false;
      return;
    }

    syncCreatedGroup(result.group);
    showSnackbar("그룹이 생성되었습니다.");
    setTimeout(() => {
      window.location.href = "/group";
    }, 700);
  } catch (error) {
    showSnackbar("서버와 통신하지 못했습니다.");
    submitBtn.disabled = false;
  }
}

function syncCreatedGroup(group) {
  if (!window.FITO_STORE?.update) return;

  window.FITO_STORE.update((state) => {
    state.myName = group.creator;
    state.groups = (state.groups || []).filter((item) => item.id !== group.id);
    state.recommendGroups = (state.recommendGroups || []).filter((item) => item.id !== group.id);
    state.groups.unshift(group);
    state.groupMembers = state.groupMembers || {};
    state.groupMembers[group.id] = [{ name: group.creator, role: "owner" }];
    state.groupLives = state.groupLives || {};
    state.groupStories = state.groupStories || {};
    state.groupPending = state.groupPending || {};
    state.groupChats = state.groupChats || {};
    state.groupMessages = state.groupMessages || {};
    state.groupStorage = state.groupStorage || {};
    state.groupLives[group.id] = [];
    state.groupStories[group.id] = [];
    state.groupPending[group.id] = [];
    state.groupChats[group.id] = [{ id: `all-${group.id}`, name: "전체 채팅", type: "all", allowedMembers: null }];
    state.groupMessages[`all-${group.id}`] = [];
    state.groupStorage[group.id] = [];
  });
}

function showSnackbar(message) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = message;
  snackbar.classList.add("show");
  setTimeout(() => snackbar.classList.remove("show"), 3000);
}
