/* ===========================
   FITO - 그룹 만들기 JS (v2)
   이미지 업로드, 실제 그룹 생성
   =========================== */

let visibility = 'public';
let tags = [];
let profileImgData = '';
let bannerImgData = '';

function sanitize(val) { return val.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g, ''); }

/* ── 이미지 업로드 ── */
document.getElementById('profileImgArea').addEventListener('click', () => {
  pickImage(data => {
    profileImgData = data;
    document.getElementById('profileImgArea').innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    checkForm();
  });
});
document.getElementById('bannerImgArea').addEventListener('click', () => {
  pickImage(data => {
    bannerImgData = data;
    document.getElementById('bannerImgArea').innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r-md)"/>`;
    checkForm();
  });
});

function pickImage(cb) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showSnackbar('이미지 크기가 너무 큽니다. (최대 10MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => cb(ev.target.result);
    reader.readAsDataURL(file);
  };
  input.click();
}

/* ── 그룹명 ── */
const nameInput = document.getElementById('groupName');
nameInput.addEventListener('input', () => {
  nameInput.value = sanitize(nameInput.value);
  document.getElementById('nameCount').textContent = nameInput.value.length;
  checkForm();
});

/* ── 그룹 설명 ── */
const descInput = document.getElementById('groupDesc');
descInput.addEventListener('input', () => {
  document.getElementById('descCount').textContent = descInput.value.length;
  checkForm();
});

/* ── 공개/비공개 ── */
function setVisibility(v) {
  visibility = v;
  document.getElementById('btnPublic').classList.toggle('selected', v === 'public');
  document.getElementById('btnPrivate').classList.toggle('selected', v === 'private');
}

/* ── 해시태그 ── */
const tagInput = document.getElementById('tagInput');
tagInput.addEventListener('input', () => {
  tagInput.value = tagInput.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9_]/g, '');
});
tagInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
});

function addTag() {
  const val = tagInput.value.trim();
  if (!val) return;
  if (tags.length >= 20) { showSnackbar('해시태그는 최대 20개까지 가능합니다.'); return; }
  if (val.length > 30) { showSnackbar('태그는 30자까지 가능합니다.'); return; }
  if (tags.includes(val)) { showSnackbar('이미 추가된 태그입니다.'); return; }
  tags.push(val);
  tagInput.value = '';
  renderTags();
  checkForm();
}

function removeTag(idx) {
  tags.splice(idx, 1);
  renderTags();
  checkForm();
}

function renderTags() {
  const wrap = document.getElementById('tagsWrap');
  document.getElementById('tagCountLabel').textContent = tags.length;
  wrap.innerHTML = tags.map((t, i) =>
    `<div class="gc-tag-chip">#${t}<span class="gc-tag-chip-x" onclick="removeTag(${i})"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></div>`
  ).join('');
}

function checkForm() {
  const valid = nameInput.value.trim().length > 0;
  document.getElementById('submitBtn').disabled = !valid;
}

/* ── 그룹 생성 (실제 스토어에 저장) ── */
function submitGroup() {
  const name = nameInput.value.trim();
  if (!name) return;

  const data = FITO_STORE.update(store => {
    const newId = store.nextGroupId++;
    const newGroup = {
      id: newId,
      name: name,
      creator: store.myName || '나',
      members: 1,
      liveCnt: 0,
      chatCnt: 0,
      tags: tags.map(t => '#' + t),
      hasLive: false,
      liveViewers: 0,
      inactive: false,
      visibility: visibility,
      desc: descInput.value.trim(),
      joined: true,
      myRole: 'owner',
      profileImg: profileImgData,
      bannerImg: bannerImgData,
    };
    store.groups.push(newGroup);
    store.groupMembers[newId] = [{ name: store.myName || '나', role: 'owner' }];
    store.groupLives[newId] = [];
    store.groupStories[newId] = [];
    store.groupPending[newId] = [];
  });

  showSnackbar('그룹이 생성되었습니다!');
  setTimeout(() => location.href = '/group', 1000);
}

function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg; sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 3000);
}
