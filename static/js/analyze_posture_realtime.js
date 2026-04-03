/* ===========================
   FITO - 실시간 분석 JS (FULL FIX)
   =========================== */

let layout = '11';
let isPaused = false;
let isOverlay = true;
let dialOpen = false;
let analysisStarted = false;
let swapped = false;
let tapTimeout = null;
let scoreTimer = null;
let exerciseTimer = null;
let elapsed = 0;

const TOTAL_DURATION = 90;

let app;
let pip;

/* 점수 기준 */
const SCORE_LEVELS = [
  { min:95, label:'perfect', cls:'perfect' },
  { min:85, label:'good',    cls:'good' },
  { min:70, label:'normal',  cls:'normal' },
  { min:55, label:'not bad', cls:'notbad' },
  { min:0,  label:'bad',     cls:'bad' },
];

function getScoreLevel(pct) {
  return SCORE_LEVELS.find(l => pct >= l.min) || SCORE_LEVELS[4];
}

/* =========================
   INIT
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  app = document.getElementById('splitWrap');
  pip = document.getElementById('pipBox');

  document.getElementById('typeModal').style.display = 'flex';

  initPipDrag();
});

/* =========================
   레이아웃
   ========================= */
function setLayout(l) {
  layout = l;

  const wrap = app;
  const refPane  = document.getElementById('refPane');
  const userPane = document.getElementById('userPane');

  wrap.className = 'rt-split-wrap';

  pip.style.display = 'none';

  refPane.style.display = 'flex';
  userPane.style.display = 'flex';

  refPane.style.flex = '';
  userPane.style.flex = '';
  userPane.style.height = '';
  userPane.style.borderTop = '2px solid rgba(255,255,255,.1)';

  if (l === 'pip') {
    wrap.classList.add('pip');

    userPane.style.height = '100%';
    userPane.style.borderTop = 'none';

    refPane.style.display = 'none';

    pip.style.display = 'block';
    pip.style.position = 'absolute';

    setTimeout(() => {
      const margin = 12;
      const maxX = app.clientWidth - pip.offsetWidth;
      const maxY = app.clientHeight - pip.offsetHeight;

      pip.style.left = (maxX - margin) + 'px';
      pip.style.top  = margin + 'px';
    }, 50);
  }

  else if (l === '12') {
    wrap.classList.add('split12');
    refPane.style.flex = '1';
    userPane.style.flex = '2';
  }

  else {
    refPane.style.flex = '1';
    userPane.style.flex = '1';
  }
}

/* =========================
   PIP 드래그 (완전 정상)
   ========================= */
function initPipDrag() {
  let isDown = false;   // 👈 눌렀는지
  let dragging = false;

  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;

  function getPoint(e) {
    return e.touches ? e.touches[0] : e;
  }

  pip.addEventListener('mousedown', start);
  pip.addEventListener('touchstart', start);

  function start(e) {
    const p = getPoint(e);

    const rect = pip.getBoundingClientRect();
    const appRect = app.getBoundingClientRect();

    offsetX = rect.left - appRect.left;
    offsetY = rect.top  - appRect.top;

    startX = p.clientX;
    startY = p.clientY;

    isDown = true;      // 👈 핵심
    dragging = false;
  }

  document.addEventListener('mousemove', move);
  document.addEventListener('touchmove', move);

  function move(e) {
    if (!isDown) return;   // 👈 이거 없어서 계속 따라다닌거임

    const p = getPoint(e);

    const dx = p.clientX - startX;
    const dy = p.clientY - startY;

    if (!dragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragging = true;
    }

    if (!dragging) return;

    let x = offsetX + dx;
    let y = offsetY + dy;

    const maxX = app.clientWidth  - pip.offsetWidth;
    const maxY = app.clientHeight - pip.offsetHeight;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    pip.style.left = x + 'px';
    pip.style.top  = y + 'px';
  }

  document.addEventListener('mouseup', end);
  document.addEventListener('touchend', end);

  function end() {
    isDown = false;     // 👈 반드시 초기화
    dragging = false;
  }
}

/* =========================
   UI 기능들
   ========================= */
function toggleDial() {
  dialOpen = !dialOpen;
  document.getElementById('dialItems').classList.toggle('open', dialOpen);
}

function switchPanes() {
  swapped = !swapped;
  const wrap = app;
  const ref  = document.getElementById('refPane');
  const user = document.getElementById('userPane');

  if (swapped) wrap.insertBefore(user, ref);
  else wrap.insertBefore(ref, user);
}

function toggleOverlay() {
  isOverlay = !isOverlay;
  const btn = document.getElementById('overlayToggleBtn');
  const layer = document.getElementById('overlayLayer');

  btn.textContent = isOverlay ? '오버레이 ON' : '오버레이 OFF';
  layer.style.display = isOverlay ? 'flex' : 'none';
}

/* =========================
   분석 시작
   ========================= */
function confirmTypeAndStart() {
  document.getElementById('typeModal').style.display = 'none';

  setLayout(layout);

  startCountdown(() => {
    analysisStarted = true;
    startScoreLoop();
    startExerciseTimer();
  });
}

/* 카운트다운 */
function startCountdown(cb) {
  const el = document.getElementById('countdown');
  const num = document.getElementById('countNum');

  el.classList.add('show');

  let cnt = 3;
  num.textContent = cnt;

  const t = setInterval(() => {
    cnt--;

    if (cnt <= 0) {
      clearInterval(t);
      el.classList.remove('show');
      cb && cb();
    } else {
      num.textContent = cnt;
    }
  }, 1000);
}

/* 점수 */
function startScoreLoop() {
  const pctEl  = document.getElementById('matchPct');
  const badge  = document.getElementById('scoreBadge');

  scoreTimer = setInterval(() => {
    if (isPaused) return;

    const pct = 55 + Math.floor(Math.random() * 40);
    const lvl = getScoreLevel(pct);

    pctEl.textContent = pct + '%';
    badge.textContent = `${lvl.label} · ${pct}%`;
    badge.className   = `rt-score-badge ${lvl.cls}`;

  }, 2000);
}

/* 타이머 */
function startExerciseTimer() {
  exerciseTimer = setInterval(() => {
    elapsed++;

    if (elapsed >= TOTAL_DURATION) {
      clearInterval(exerciseTimer);
      clearInterval(scoreTimer);

      document.getElementById('resultModal').classList.add('open');
    }
  }, 1000);
}

/* 일시정지 */
function togglePause() {
  isPaused = !isPaused;

  const icon = document.getElementById('pauseIcon');

  if (isPaused) {
    clearInterval(scoreTimer);
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  } else {
    startScoreLoop();
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  }
}