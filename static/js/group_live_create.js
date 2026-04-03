/* ===========================
   FITO - 그룹 라이브 만들기 JS (v3)
   시간 스크롤 수정, 스토어 저장
   =========================== */

let visibility = 'public';
let peopleCount = 4;
let selectedHour = 0, selectedMin = 0;

function sanitize(val) { return val.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g, ''); }

const nameInput = document.getElementById('liveName');
nameInput.addEventListener('input', () => {
  nameInput.value = sanitize(nameInput.value);
  document.getElementById('nameCount').textContent = nameInput.value.length;
});

function setVisibility(v) {
  visibility = v;
  document.getElementById('btnPublic').classList.toggle('selected', v === 'public');
  document.getElementById('btnPrivate').classList.toggle('selected', v === 'private');
}

/* ══════════════════════════════
   시간 설정 - 버튼 기반 (안정적)
   ══════════════════════════════ */
function buildTimePicker() {
  const now = new Date();
  selectedHour = now.getHours();
  selectedMin = now.getMinutes();
  renderHour();
  renderMin();
  updateTimeDisplay();
}

function renderHour() {
  document.getElementById('hourDisplay').textContent = String(selectedHour).padStart(2, '0');
}
function renderMin() {
  document.getElementById('minDisplay').textContent = String(selectedMin).padStart(2, '0');
}

function changeHour(delta) {
  // delta: +1은 ▼버튼(숫자 증가), -1은 ▲버튼(숫자 감소)
  selectedHour += delta;
  if (selectedHour > 23) selectedHour = 0;
  if (selectedHour < 0) selectedHour = 23;
  renderHour();
  updateTimeDisplay();
}

function changeMin(delta) {
  selectedMin += delta;
  if (selectedMin > 59) selectedMin = 0;
  if (selectedMin < 0) selectedMin = 59;
  renderMin();
  updateTimeDisplay();
}

function updateTimeDisplay() {
  document.getElementById('selectedTime').textContent =
    `${String(selectedHour).padStart(2,'0')}:${String(selectedMin).padStart(2,'0')}`;
}

/* 시/분 직접 입력 */
function editHourDirect() {
  const val = prompt('시간을 입력하세요 (0~23):', String(selectedHour));
  if (val === null) return;
  const n = parseInt(val);
  if (isNaN(n) || n < 0 || n > 23) { showSnackbar('올바르지 않은 시간입니다.'); return; }
  selectedHour = n;
  renderHour();
  updateTimeDisplay();
}

function editMinDirect() {
  const val = prompt('분을 입력하세요 (0~59):', String(selectedMin));
  if (val === null) return;
  const n = parseInt(val);
  if (isNaN(n) || n < 0 || n > 59) { showSnackbar('올바르지 않은 시간입니다.'); return; }
  selectedMin = n;
  renderMin();
  updateTimeDisplay();
}

/* ── 인원 (4~8) ── */
function changePeople(d) {
  const next = peopleCount + d;
  if (next < 4 || next > 8) return;
  peopleCount = next;
  document.getElementById('pplCount').textContent = peopleCount;
  document.getElementById('pplMinus').classList.toggle('disabled', peopleCount <= 4);
  document.getElementById('pplPlus').classList.toggle('disabled', peopleCount >= 8);
}

/* ── 라이브 생성 (스토어 저장) ── */
function confirmLive() {
  const name = nameInput.value.trim();
  if (!name) { showSnackbar('라이브 이름을 입력해주세요.'); return; }

  const now = new Date();
  const selTime = new Date();
  selTime.setHours(selectedHour, selectedMin, 0, 0);
  if (selTime <= now) { showSnackbar('올바르지 않은 시간입니다. 현재 시간 이후로 설정해주세요.'); return; }

  const params = new URLSearchParams(location.search);
  const gid = parseInt(params.get('group_id') || '1');

  // 권한 체크
  if (!FITO_STORE.canManage(gid)) {
    showSnackbar('라이브를 만들 권한이 없습니다.');
    return;
  }

  FITO_STORE.update(s => {
    const newId = s.nextLiveId++;
    if (!s.groupLives[gid]) s.groupLives[gid] = [];
    const timeStr = `${String(selectedHour).padStart(2,'0')}:${String(selectedMin).padStart(2,'0')}`;
    const diffMin = (selTime - now) / 60000;
    s.groupLives[gid].push({
      id: newId, title: name, host: s.myName || '나',
      status: diffMin <= 10 ? 'soon' : 'scheduled',
      participants: 0, max: peopleCount, startTime: timeStr,
      desc: document.getElementById('liveDesc').value.trim(),
      visibility: visibility,
      record: document.getElementById('recCheck').checked,
    });
  });

  showSnackbar('라이브가 생성되었습니다!');
  setTimeout(() => { location.href = window.URL_GROUP_MAIN || '/group'; }, 1000);
}

function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg; sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  buildTimePicker();
  changePeople(0);
});
