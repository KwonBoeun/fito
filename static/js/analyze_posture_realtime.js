/* ===========================
   FITO - 실시간 분석 JS
   =========================== */

let layout = '11';         // pip | 11 | 12
let isPaused = false;
let isOverlay = true;
let dialOpen = false;
let analysisStarted = false;
let swapped = false;
let tapTimeout = null;
let scoreTimer = null;
let exerciseTimer = null;
let elapsed = 0;
const TOTAL_DURATION = 90; // 참고 영상 총 길이(초) - mock

const SCORE_LEVELS = [
  { min:95, label:'perfect', cls:'perfect' },
  { min:85, label:'good',    cls:'good'    },
  { min:70, label:'normal',  cls:'normal'  },
  { min:55, label:'not bad', cls:'notbad'  },
  { min:0,  label:'bad',     cls:'bad'     },
];

function getScoreLevel(pct) {
  return SCORE_LEVELS.find(l => pct >= l.min) || SCORE_LEVELS[4];
}

/* ── 화면 탭 → 나가기 버튼 표시 ── */
function tapScreen() {
  const bar = document.getElementById('exitBar');
  bar.classList.add('show');
  clearTimeout(tapTimeout);
  tapTimeout = setTimeout(() => bar.classList.remove('show'), 3000);
}
document.addEventListener('click', e => {
  if (!e.target.closest('.rt-exit-bar') &&
      !e.target.closest('.rt-dial') &&
      !e.target.closest('.rt-pause-btn') &&
      !e.target.closest('[onclick]')) {
    tapScreen();
  }
});

/* ── 레이아웃 설정 ── */
function setLayout(l) {
  layout = l;
  const wrap = document.getElementById('splitWrap');
  const pip  = document.getElementById('pipBox');
  const refPane  = document.getElementById('refPane');
  const userPane = document.getElementById('userPane');

  wrap.className = 'rt-split-wrap';
  pip.style.display = 'none';
  refPane.style.flex = '1';
  userPane.style.flex = '1';
  userPane.style.borderTop = '2px solid rgba(255,255,255,.1)';

  if (l === 'pip') {
    wrap.classList.add('pip');
    userPane.style.height = '100%';
    userPane.style.flex   = 'none';
    userPane.style.borderTop = 'none';
    refPane.style.flex = 'none';
    refPane.style.display = 'none';
    pip.style.display = 'block';
  } else if (l === '12') {
    wrap.classList.add('split12');
    refPane.style.flex  = '1';
    userPane.style.flex = '2';
  }

  // 다이얼 아이템 선택 표시
  document.querySelectorAll('.rt-dial-item').forEach(el => {
    const t = el.getAttribute('onclick').includes(l);
    el.classList.toggle('selected', t);
  });
  // 유형선택 팝업 옵션도 동기화
  ['pip','11','12'].forEach(k => {
    document.getElementById(`opt-${k}`)?.classList.toggle('selected', k === l);
  });
}

/* ── 스피드 다이얼 ── */
function toggleDial() {
  dialOpen = !dialOpen;
  document.getElementById('dialItems').classList.toggle('open', dialOpen);
}

/* ── 화면 스위치 (상하 위치 교환) ── */
function switchPanes() {
  swapped = !swapped;
  const wrap = document.getElementById('splitWrap');
  const ref  = document.getElementById('refPane');
  const user = document.getElementById('userPane');
  if (swapped) {
    wrap.insertBefore(user, ref);
  } else {
    wrap.insertBefore(ref, user);
  }
  showSnackbar('화면 위치가 변경되었어요');
}

/* ── 정지 / 재개 ── */
function togglePause() {
  isPaused = !isPaused;
  const icon = document.getElementById('pauseIcon');
  if (isPaused) {
    clearInterval(scoreTimer);
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    showSnackbar('분석이 일시 정지됐어요');
  } else {
    startCountdown(() => startScoreLoop());
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  }
}

/* ── 오버레이 토글 ── */
function toggleOverlay() {
  isOverlay = !isOverlay;
  const btn   = document.getElementById('overlayToggleBtn');
  const layer = document.getElementById('overlayLayer');
  btn.textContent = isOverlay ? '오버레이 ON' : '오버레이 OFF';
  btn.classList.toggle('on', isOverlay);
  layer.style.display = isOverlay ? 'flex' : 'none';
}

/* ── 화면 유형 선택 팝업 ── */
function chooseType(t) {
  layout = t;
  ['pip','11','12'].forEach(k => {
    document.getElementById(`opt-${k}`).classList.toggle('selected', k === t);
  });
}

function cancelTypeModal() {
  location.href = window.RT_URL_POSTURE || '/analyze/posture';
}

function confirmTypeAndStart() {
  document.getElementById('typeModal').style.display = 'none';
  setLayout(layout);
  startCountdown(() => {
    analysisStarted = true;
    startScoreLoop();
    startExerciseTimer();
  });
}

/* ── 카운트다운 ── */
function startCountdown(cb) {
  const el  = document.getElementById('countdown');
  const num = document.getElementById('countNum');
  el.classList.add('show');
  let cnt = 10;
  num.textContent = cnt;
  const t = setInterval(() => {
    cnt--;
    if (cnt <= 0) {
      clearInterval(t);
      el.classList.remove('show');
      cb && cb();
    } else {
      num.textContent = cnt;
      // 리애니메이션
      num.style.animation = 'none';
      num.offsetHeight; // reflow
      num.style.animation = 'countPulse .9s ease';
    }
  }, 1000);
}

/* ── 점수 루프 (mock) ── */
function startScoreLoop() {
  const pctEl  = document.getElementById('matchPct');
  const badge  = document.getElementById('scoreBadge');
  const snacks = [
    { cls:'notbad', msg:'무릎 각도를 조금 더 굽혀주세요' },
    { cls:'bad',    msg:'등을 더 곧게 펴주세요' },
  ];

  scoreTimer = setInterval(() => {
    if (isPaused) return;
    const pct = 55 + Math.floor(Math.random() * 40); // 55~94% 랜덤
    const lvl = getScoreLevel(pct);
    pctEl.textContent = pct + '%';
    badge.textContent = `${lvl.label} · ${pct}%`;
    badge.className   = `rt-score-badge ${lvl.cls}`;

    // 교정 스낵바 (not bad, bad 시)
    if (lvl.cls === 'notbad' || lvl.cls === 'bad') {
      const pick = snacks[Math.floor(Math.random() * snacks.length)];
      showSnackbar(pick.msg);
    }
  }, 2000);
}

/* ── 운동 타이머 ── */
function startExerciseTimer() {
  exerciseTimer = setInterval(() => {
    elapsed++;
    if (elapsed >= TOTAL_DURATION) {
      clearInterval(exerciseTimer);
      clearInterval(scoreTimer);
      showSnackbar('운동이 모두 완료되었습니다. 분석을 종료하겠습니다.');
      setTimeout(() => document.getElementById('resultModal').classList.add('open'), 1500);
    }
  }, 1000);
}

/* ── 나가기 ── */
function showExitModal()  { document.getElementById('exitModal').classList.add('open'); }
function closeExitModal() { document.getElementById('exitModal').classList.remove('open'); }
function forceExit() {
  clearInterval(scoreTimer);
  clearInterval(exerciseTimer);
  // 충분히 했으면 결과 제공 (1/4 이상)
  if (elapsed >= TOTAL_DURATION / 4) {
    document.getElementById('exitModal').classList.remove('open');
    document.getElementById('resultModal').classList.add('open');
  } else {
    showSnackbar('운동량이 충분하지 않아 분석 결과가 제공되지 않습니다.');
    setTimeout(() => location.href = (window.RT_URL_POSTURE || '/analyze/posture'), 2000);
  }
}
function goReport()  { location.href = (window.RT_URL_REPORT || '/analyze/posture/report') + '?mode=realtime'; }
function noResult()  { location.href = (window.RT_URL_POSTURE || '/analyze/posture'); }

/* ── 스낵바 ── */
let snackTimer = null;
function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg;
  sb.classList.add('show');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => sb.classList.remove('show'), 2500);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // 유형 선택 팝업 자동 표시
  document.getElementById('typeModal').style.display = 'flex';
});