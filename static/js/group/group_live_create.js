/* ===========================
   FITO - 그룹 라이브 만들기 JS
   =========================== */

let visibility = 'public';
let peopleCount = 4;
let selectedHour = 0, selectedMin = 0;

/* ── 입력 검증 ── */
function sanitize(val) {
  return val.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g, '');
}

const nameInput = document.getElementById('liveName');
nameInput.addEventListener('input', () => {
  nameInput.value = sanitize(nameInput.value);
  document.getElementById('nameCount').textContent = nameInput.value.length;
});

/* ── 공개/비공개 ── */
function setVisibility(v) {
  visibility = v;
  document.getElementById('btnPublic').classList.toggle('selected', v === 'public');
  document.getElementById('btnPrivate').classList.toggle('selected', v === 'private');
}

/* ── 시간 설정 (스크롤) ── */
function buildTimeScroll() {
  const hourScroll = document.getElementById('hourScroll');
  const minScroll = document.getElementById('minScroll');

  // 시간 (0~23, 무한 스크롤 느낌으로 반복)
  let hourHtml = '';
  for (let rep = 0; rep < 3; rep++) {
    for (let h = 0; h < 24; h++) {
      const cls = (rep === 1 && h === 0) ? ' active' : '';
      hourHtml += `<div class="gl-time-item${cls}" data-val="${h}" onclick="selectHour(${h},this)">${String(h).padStart(2,'0')}</div>`;
    }
  }
  hourScroll.innerHTML = hourHtml;

  // 분 (0~59)
  let minHtml = '';
  for (let rep = 0; rep < 3; rep++) {
    for (let m = 0; m < 60; m++) {
      const cls = (rep === 1 && m === 0) ? ' active' : '';
      minHtml += `<div class="gl-time-item${cls}" data-val="${m}" onclick="selectMin(${m},this)">${String(m).padStart(2,'0')}</div>`;
    }
  }
  minScroll.innerHTML = minHtml;

  // 현재 시간으로 초기화
  const now = new Date();
  selectedHour = now.getHours();
  selectedMin = now.getMinutes();
  updateTimeDisplay();

  // 스크롤 위치 세팅
  setTimeout(() => {
    const hItem = hourScroll.querySelector(`[data-val="${selectedHour}"]`);
    const mItem = minScroll.querySelector(`[data-val="${selectedMin}"]`);
    if (hItem) hourScroll.scrollTop = hItem.offsetTop - 40;
    if (mItem) minScroll.scrollTop = mItem.offsetTop - 40;
  }, 100);

  // 스크롤 snap 이벤트
  hourScroll.addEventListener('scroll', () => {
    const center = hourScroll.scrollTop + 60;
    let closest = null, minDist = Infinity;
    hourScroll.querySelectorAll('.gl-time-item').forEach(el => {
      const dist = Math.abs(el.offsetTop + 20 - center);
      if (dist < minDist) { minDist = dist; closest = el; }
    });
    if (closest) {
      hourScroll.querySelectorAll('.gl-time-item').forEach(el => el.classList.remove('active'));
      closest.classList.add('active');
      selectedHour = parseInt(closest.dataset.val);
      updateTimeDisplay();
    }
  });

  minScroll.addEventListener('scroll', () => {
    const center = minScroll.scrollTop + 60;
    let closest = null, minDist = Infinity;
    minScroll.querySelectorAll('.gl-time-item').forEach(el => {
      const dist = Math.abs(el.offsetTop + 20 - center);
      if (dist < minDist) { minDist = dist; closest = el; }
    });
    if (closest) {
      minScroll.querySelectorAll('.gl-time-item').forEach(el => el.classList.remove('active'));
      closest.classList.add('active');
      selectedMin = parseInt(closest.dataset.val);
      updateTimeDisplay();
    }
  });
}

function selectHour(h, el) {
  selectedHour = h;
  document.getElementById('hourScroll').querySelectorAll('.gl-time-item').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({ behavior:'smooth', block:'center' });
  updateTimeDisplay();
}

function selectMin(m, el) {
  selectedMin = m;
  document.getElementById('minScroll').querySelectorAll('.gl-time-item').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({ behavior:'smooth', block:'center' });
  updateTimeDisplay();
}

function updateTimeDisplay() {
  document.getElementById('selectedTime').textContent =
    `${String(selectedHour).padStart(2,'0')}:${String(selectedMin).padStart(2,'0')}`;
}

/* ── 인원 설정 (4~8명) ── */
function changePeople(delta) {
  const next = peopleCount + delta;
  if (next < 4 || next > 8) return;
  peopleCount = next;
  document.getElementById('pplCount').textContent = peopleCount;
  document.getElementById('pplMinus').classList.toggle('disabled', peopleCount <= 4);
  document.getElementById('pplPlus').classList.toggle('disabled', peopleCount >= 8);
}

/* ── 시간 유효성 검사 ── */
function validateTime() {
  const now = new Date();
  const selected = new Date();
  selected.setHours(selectedHour, selectedMin, 0, 0);
  if (selected <= now) {
    showSnackbar('올바르지 않은 시간입니다.');
    return false;
  }
  return true;
}

/* ── 라이브 확정 ── */
function confirmLive() {
  if (!nameInput.value.trim()) {
    showSnackbar('라이브 이름을 입력해주세요.');
    return;
  }
  if (!validateTime()) return;

  showSnackbar('라이브가 생성되었습니다!');
  setTimeout(() => {
    location.href = window.URL_GROUP_MAIN || '/group';
  }, 1200);
}

/* ── 스낵바 ── */
function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg;
  sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 3000);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  buildTimeScroll();
  changePeople(0); // 초기 버튼 상태
});
