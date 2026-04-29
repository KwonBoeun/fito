/* ===========================
   FITO - Question Upload JS
   =========================== */

/* ── 임시 로그인 유저 ID (추후 세션으로 교체) ── */
const CURRENT_USER_ID = 1;

/* ── 상태 ── */
let images       = [];
let tags         = [];
let isAnon       = true;
let isProfile    = false;
let rewardAmount = 0;
let rewardBalance= 120;  // mock 보유 리워드

/* ── DOM ── */
const titleInput    = document.getElementById('title-input');
const contentInput  = document.getElementById('content-input');
const charCount     = document.getElementById('char-count');
const imgScroll     = document.getElementById('img-scroll');
const imgAddBtn     = document.getElementById('img-add-btn');
const imgInput      = document.getElementById('img-input');
const imgHint       = document.getElementById('img-hint');
const anonOffBtn    = document.getElementById('anon-off');
const anonOnBtn     = document.getElementById('anon-on');
const profileToggle = document.getElementById('profile-toggle');
const rewardInput   = document.getElementById('reward-input');
const rewardApply   = document.getElementById('reward-apply');
const rewardBalEl   = document.getElementById('reward-balance');
const tagList       = document.getElementById('tag-list');
const tagAddBtn     = document.getElementById('tag-add-btn');
const tagInputWrap  = document.getElementById('tag-input-wrap');
const tagInput      = document.getElementById('tag-input');
const tagConfirm    = document.getElementById('tag-confirm');
const uploadBtn     = document.getElementById('upload-btn');
const draftBtn      = document.getElementById('draft-btn');
const doneOv        = document.getElementById('done-ov');

/* ── 사진 추가 ── */
imgAddBtn.addEventListener('click', () => {
  if (images.length >= 5) return;
  imgInput.value = '';
  imgInput.click();
});
imgInput.addEventListener('change', e => {
  Array.from(e.target.files).slice(0, 5 - images.length).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      images.push({ dataUrl: ev.target.result, file });
      renderImages();
    };
    reader.readAsDataURL(file);
  });
});

function renderImages() {
  imgScroll.querySelectorAll('.upost-img-thumb-wrap').forEach(n => n.remove());
  images.forEach((img, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'upost-img-thumb-wrap';
    wrap.innerHTML =
      `<img class="upost-img-thumb" src="${img.dataUrl}" alt="사진 ${i+1}"/>` +
      `<button class="upost-img-del" data-idx="${i}">✕</button>`;
    imgScroll.insertBefore(wrap, imgAddBtn);
  });
  imgAddBtn.style.display = images.length >= 5 ? 'none' : 'flex';
  imgHint.textContent = `사진 ${images.length}/5`;
  imgScroll.querySelectorAll('.upost-img-del').forEach(btn => {
    btn.addEventListener('click', () => {
      images.splice(Number(btn.dataset.idx), 1);
      renderImages();
    });
  });
}

/* ── 내용 글자수 ── */
contentInput.addEventListener('input', () => {
  charCount.textContent = contentInput.value.length;
  validateForm();
});
titleInput.addEventListener('input', validateForm);

/* ── 익명 토글 ── */
function setAnon(val) {
  isAnon = val;
  anonOnBtn.classList.toggle('active', val);
  anonOffBtn.classList.toggle('active', !val);

  /* 익명 ON이면 내 프로필 게시 비활성화 */
  profileToggle.classList.toggle('disabled', val);
  if (val) {
    isProfile = false;
    profileToggle.querySelectorAll('.upost-toggle-btn').forEach(b => b.classList.remove('active'));
  }
}
anonOnBtn.addEventListener('click',  () => setAnon(true));
anonOffBtn.addEventListener('click', () => setAnon(false));

/* ── 내 프로필 게시 토글 ── */
profileToggle.querySelectorAll('.upost-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (isAnon) return;
    isProfile = btn.dataset.val === 'on';
    profileToggle.querySelectorAll('.upost-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ── 리워드 적용 ── */
rewardApply.addEventListener('click', () => {
  const val = parseInt(rewardInput.value) || 0;
  if (val < 0) { rewardInput.value = 0; return; }
  if (val > rewardBalance) {
    rewardInput.value = rewardBalance;
    rewardInput.classList.add('shake');
    setTimeout(() => rewardInput.classList.remove('shake'), 500);
    rewardAmount = rewardBalance;
  } else {
    rewardAmount = val;
  }
  rewardBalEl.textContent = rewardBalance - rewardAmount;
});

/* ── 태그 ── */
tagAddBtn.addEventListener('click', () => {
  const open = tagInputWrap.style.display === 'none';
  tagInputWrap.style.display = open ? 'flex' : 'none';
  if (open) tagInput.focus();
});

function addTag() {
  const val = tagInput.value.trim().replace(/^#/, '');
  if (!val || tags.includes('#' + val) || tags.length >= 5) return;
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
  const ok = titleInput.value.trim().length > 0 &&
             contentInput.value.trim().length > 0;
  uploadBtn.disabled = !ok;
}
validateForm();

/* ── 임시저장 ── */
draftBtn.addEventListener('click', () => {
  alert('임시저장 기능은 준비 중입니다.');
});

/* ── 업로드 (localStorage → API) ── */
uploadBtn.addEventListener('click', async () => {
  const title   = titleInput.value.trim();
  const content = contentInput.value.trim();

  /* 유효성 */
  if (!title) {
    titleInput.classList.add('shake');
    titleInput.focus();
    setTimeout(() => titleInput.classList.remove('shake'), 500);
    return;
  }
  if (!content) {
    contentInput.classList.add('shake');
    contentInput.focus();
    setTimeout(() => contentInput.classList.remove('shake'), 500);
    return;
  }

  uploadBtn.disabled    = true;
  uploadBtn.textContent = '업로드 중...';

  try {
    let res;

    if (images.length > 0) {
      /* 이미지 있으면 multipart/form-data */
      const formData = new FormData();
      formData.append('title',     title);
      formData.append('body',      content);
      formData.append('isAnon',    String(isAnon));
      formData.append('isProfile', String(!isAnon && isProfile));
      formData.append('reward',    String(rewardAmount));
      tags.forEach(t => formData.append('tags', t));
      images.forEach(img => formData.append('images', img.file));

      res = await fetch('/api/questions', {
        method:  'POST',
        headers: { 'X-User-Id': String(CURRENT_USER_ID) },
        body:    formData,
      });
    } else {
      /* 이미지 없으면 JSON */
      res = await fetch('/api/questions', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id':    String(CURRENT_USER_ID),
        },
        body: JSON.stringify({
          title,
          body:      content,
          tags,
          isAnon,
          isProfile: !isAnon && isProfile,
          reward:    rewardAmount,
        }),
      });
    }

    const json = await res.json();

    if (json.status !== 'ok') {
      alert(json.message || '업로드 중 오류가 발생했습니다.');
      uploadBtn.disabled    = false;
      uploadBtn.textContent = '업로드';
      return;
    }

    /* 성공 → 완료 오버레이 표시 */
    doneOv.style.display = 'flex';

    /* 완료 버튼을 질문 상세 페이지로 연결 */
    const homeBtn = doneOv.querySelector('.upost-done-home');
    if (homeBtn && json.data && json.data.id) {
      homeBtn.textContent = '질문 보기';
      homeBtn.onclick = () => { location.href = `/question/${json.data.id}`; };
    }

  } catch(e) {
    console.error('[upload_question]', e);
    alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    uploadBtn.disabled    = false;
    uploadBtn.textContent = '업로드';
  }
});