/* ===========================
   FITO - 그룹 만들기 JS
   =========================== */

let visibility = 'public';
let tags = [];

/* ── 입력 검증 (한글, 영어만) ── */
function sanitize(val) {
  return val.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g, '');
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
  // 언더바 포함 한글, 영어만 허용
  tagInput.value = tagInput.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9_]/g, '');
});
tagInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
});

function addTag() {
  const val = tagInput.value.trim();
  if (!val) return;
  if (tags.length >= 20) {
    showSnackbar('해시태그는 최대 20개까지 가능합니다.');
    return;
  }
  if (val.length > 30) {
    showSnackbar('태그는 30자까지 가능합니다.');
    return;
  }
  if (tags.includes(val)) {
    showSnackbar('이미 추가된 태그입니다.');
    return;
  }
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

/* ── 폼 유효성 ── */
function checkForm() {
  const valid = nameInput.value.trim().length > 0;
  document.getElementById('submitBtn').disabled = !valid;
}

/* ── 그룹 생성 ── */
function submitGroup() {
  if (!nameInput.value.trim()) return;
  showSnackbar('그룹이 생성되었습니다!');
  setTimeout(() => location.href = '/group', 1200);
}

/* ── 스낵바 ── */
function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg;
  sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 3000);
}
