/* ===========================
   FITO - Community Upload JS
   =========================== */

/* ── 상태 ── */
let images  = [];   // { dataUrl, file } 최대 5장
let tags    = [];

/* ── DOM ── */
const imgScroll    = document.getElementById('img-scroll');
const imgAddBtn    = document.getElementById('img-add-btn');
const imgInput     = document.getElementById('img-input');
const imgHint      = document.getElementById('img-hint');
const contentInput = document.getElementById('content-input');
const charCount    = document.getElementById('char-count');
const tagList      = document.getElementById('tag-list');
const tagAddBtn    = document.getElementById('tag-add-btn');
const tagInputWrap = document.getElementById('tag-input-wrap');
const tagInput     = document.getElementById('tag-input');
const tagConfirm   = document.getElementById('tag-confirm');
const uploadBtn    = document.getElementById('upload-btn');
const draftBtn     = document.getElementById('draft-btn');
const doneOv       = document.getElementById('done-ov');

/* ── 사진 추가 ── */
imgAddBtn.addEventListener('click', () => {
  if (images.length >= 5) return;
  imgInput.value = '';
  imgInput.click();
});
imgInput.addEventListener('change', e => {
  const files = Array.from(e.target.files);
  files.slice(0, 5 - images.length).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      images.push({ dataUrl: ev.target.result, file });
      renderImages();
    };
    reader.readAsDataURL(file);
  });
});

function renderImages() {
  /* 기존 썸네일 제거 */
  imgScroll.querySelectorAll('.upost-img-thumb-wrap').forEach(n => n.remove());
  images.forEach((img, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'upost-img-thumb-wrap';
    wrap.innerHTML =
      `<img class="upost-img-thumb" src="${img.dataUrl}" alt="사진 ${i+1}"/>` +
      `<button class="upost-img-del" data-idx="${i}">✕</button>`;
    imgScroll.insertBefore(wrap, imgAddBtn);
  });
  /* + 버튼 표시/숨김 */
  imgAddBtn.style.display = images.length >= 5 ? 'none' : 'flex';
  imgHint.textContent = `사진 ${images.length}/5`;
  /* 삭제 버튼 이벤트 */
  imgScroll.querySelectorAll('.upost-img-del').forEach(btn => {
    btn.addEventListener('click', () => {
      images.splice(Number(btn.dataset.idx), 1);
      renderImages();
    });
  });
  validateForm();
}

/* ── 내용 글자수 ── */
contentInput.addEventListener('input', () => {
  charCount.textContent = contentInput.value.length;
  validateForm();
});

/* ── 태그 ── */
tagAddBtn.addEventListener('click', () => {
  const open = tagInputWrap.style.display === 'none';
  tagInputWrap.style.display = open ? 'flex' : 'none';
  if (open) tagInput.focus();
});

function addTag() {
  const val = tagInput.value.trim().replace(/^#/, '');
  if (!val || tags.includes('#' + val) || tags.length >= 10) return;
  tags.push('#' + val);
  tagInput.value = '';
  renderTags();
}
tagConfirm.addEventListener('click', addTag);
tagInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTag(); });

function renderTags() {
  tagList.innerHTML = '';
  tags.forEach((tag, i) => {
    const chip = document.createElement('div');
    chip.className = 'upost-tag-chip';
    chip.innerHTML =
      `<span>${tag}</span>` +
      `<button class="upost-tag-chip-del" data-idx="${i}">✕</button>`;
    chip.querySelector('.upost-tag-chip-del').addEventListener('click', () => {
      tags.splice(i, 1);
      renderTags();
    });
    tagList.appendChild(chip);
  });
}

/* ── 유효성 검사 ── */
function validateForm() {
  const ok = contentInput.value.trim().length > 0;
  uploadBtn.disabled = !ok;
}
validateForm();

/* ── 임시저장 (버튼만) ── */
draftBtn.addEventListener('click', () => {
  alert('임시저장 기능은 준비 중입니다.');
});

/* ── 업로드 ── */
uploadBtn.addEventListener('click', () => {
  const content = contentInput.value.trim();
  if (!content) {
    contentInput.classList.add('shake');
    contentInput.focus();
    setTimeout(() => contentInput.classList.remove('shake'), 500);
    return;
  }

  const stored = JSON.parse(localStorage.getItem('fito_user_community') || '[]');
  stored.unshift({
    author:    '나',
    content,
    tags,
    hasImg:    images.length > 0,
    uploadedAt: Date.now(),
  });
  localStorage.setItem('fito_user_community', JSON.stringify(stored));
  doneOv.style.display = 'flex';
});
