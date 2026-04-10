/* ===========================
   FITO - 실시간 분석 JS
   =========================== */

let layout    = '11';
let isPaused  = false;
let isOverlay = true;
let dialOpen  = false;
let analysisStarted = false;
let swapped   = false;
let tapTimeout   = null;
let scoreTimer   = null;
let exerciseTimer = null;
let elapsed = 0;

const TOTAL_DURATION = 90;

let app, pip;
let cameraStream = null;   // 실제 카메라 스트림

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

/* ════════════════════════════
   INIT
   ════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  app = document.getElementById('splitWrap');
  pip = document.getElementById('pipBox');

  // 참고 영상 로드 (sessionStorage에서)
  loadRefVideo();

  // 카메라 시작
  startCamera();

  // 레이아웃 선택 팝업 표시
  document.getElementById('typeModal').style.display = 'flex';

  initPipDragOn(pip); // 기본 pip박스에도 연결
});

/* ════════════════════════════
   카메라 시작
   ════════════════════════════ */
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(function(stream) {
      cameraStream = stream;
      attachCameraToUserPane(stream);
    })
    .catch(function(err) {
      showCameraErrorInPane(err);
    });
}

function attachCameraToUserPane(stream) {
  const userPane = document.getElementById('userPane');

  // 기존 라벨 제거
  const lbl = userPane.querySelector('.rt-pane-label');
  if (lbl) lbl.remove();

  // video 태그 삽입
  let vid = document.getElementById('userVideo');
  if (!vid) {
    vid = document.createElement('video');
    vid.id = 'userVideo';
    vid.setAttribute('autoplay', '');
    vid.setAttribute('playsinline', '');
    vid.setAttribute('muted', '');
    vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)';
    userPane.insertBefore(vid, userPane.firstChild);
  }
  vid.srcObject = stream;

  // 카메라 ON 배지
  if (!document.getElementById('camBadge')) {
    const badge = document.createElement('div');
    badge.id = 'camBadge';
    badge.style.cssText = 'position:absolute;top:8px;left:8px;z-index:10;background:rgba(45,158,94,.85);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;display:flex;align-items:center;gap:4px';
    badge.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#fff;animation:blink 1s infinite"></span> 카메라 ON';
    userPane.appendChild(badge);
  }
}

function showCameraErrorInPane(err) {
  const userPane = document.getElementById('userPane');
  let msg = '카메라 사용 불가';
  if (err.name === 'NotAllowedError')  msg = '카메라 권한 거부됨';
  if (err.name === 'NotFoundError')    msg = '카메라 없음';

  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;';
  errDiv.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e05c4b" stroke-width="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <line x1="2" y1="2" x2="22" y2="22" stroke="#e05c4b"/>
    </svg>
    <span style="color:#aaa;font-size:11px;text-align:center">${msg}</span>
    <button onclick="startCamera()" style="padding:6px 14px;background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:999px;font-size:11px;cursor:pointer;font-family:inherit">다시 시도</button>`;
  userPane.appendChild(errDiv);
}

/* ════════════════════════════
   참고 영상 (sessionStorage → ref pane)
   ════════════════════════════ */
function loadRefVideo() {
  const refLink  = sessionStorage.getItem('fito_ref_link');
  const refType  = sessionStorage.getItem('fito_ref_type');  // 'youtube' | 'direct'
  const embedUrl = sessionStorage.getItem('fito_ref_embed');

  if (!refLink) return;

  const refPane = document.getElementById('refPane');
  const lbl     = refPane.querySelector('.rt-pane-label');
  if (lbl) lbl.remove();

  // score 표시는 유지
  const scoreEl = document.getElementById('scoreDisplay');

  if (refType === 'youtube' && embedUrl) {
    const wrap = document.createElement('div');
    wrap.id = 'refVideoWrap';
    wrap.style.cssText = 'position:absolute;inset:0;';
    // enablejsapi=1 포함, autoplay=0으로 로드 준비
    wrap.dataset.embedBase = embedUrl;  // 나중에 src 교체에 사용
    wrap.innerHTML = '<iframe id="refIframe" src="' + embedUrl + '&autoplay=0&mute=1&enablejsapi=1" style="width:100%;height:100%;border:none" allowfullscreen allow="autoplay; encrypted-media"></iframe>';
    refPane.insertBefore(wrap, scoreEl);
  } else {
    // 직접 mp4 링크 — autoplay 없이 준비만
    const vid = document.createElement('video');
    vid.id  = 'refVideoEl';
    vid.src = refLink;
    vid.setAttribute('playsinline', '');
    vid.setAttribute('loop', '');
    vid.setAttribute('controls', '');
    vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000';
    refPane.insertBefore(vid, scoreEl);
    // 재생은 startRefVideo()에서
  }

  // 참고 영상 배지
  const badge = document.createElement('div');
  badge.style.cssText = 'position:absolute;top:8px;left:8px;z-index:10;background:rgba(75,102,139,.85);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px';
  badge.textContent = refType === 'youtube' ? '▶ YouTube 참고 영상' : '▶ 참고 영상';
  refPane.appendChild(badge);
}

/* ════════════════════════════
   참고 영상 재생 시작
   ════════════════════════════ */
function startRefVideo() {
  // ① 직접 video 태그 (mp4)
  var vid = document.getElementById('refVideoEl');
  if (vid) {
    vid.muted = false;
    vid.play().catch(function() {
      // 자동재생 차단 시 muted로 재시도
      vid.muted = true;
      vid.play().catch(function(){});
    });
    return;
  }

  // ② YouTube iframe — src를 autoplay=1&mute=1 로 교체 (가장 신뢰성 높음)
  var wrap = document.getElementById('refVideoWrap');
  var iframe = document.getElementById('refIframe');
  if (iframe && wrap) {
    var base = wrap.dataset.embedBase || iframe.src.split('&autoplay')[0];
    // mute=1 필수 (Chrome 자동재생 정책)
    iframe.src = base + '&autoplay=1&mute=1&enablejsapi=1';
  }
}

/* ════════════════════════════
   레이아웃
   ════════════════════════════ */
function setLayout(l) {
  layout = l;
  const wrap     = app;
  const refPane  = document.getElementById('refPane');
  const userPane = document.getElementById('userPane');

  wrap.className = 'rt-split-wrap';
  pip.style.display = 'none';
  refPane.style.display  = 'flex';
  userPane.style.display = 'flex';
  refPane.style.flex  = '';
  userPane.style.flex = '';
  userPane.style.height    = '';
  userPane.style.borderTop = '2px solid rgba(255,255,255,.1)';

  if (l === 'pip') {
    wrap.classList.add('pip');

    // userPane: 전체 화면
    userPane.style.height    = '100%';
    userPane.style.borderTop = 'none';

    // refPane 자체를 PIP 박스로 사용 (clone 없이 → srcObject 유지)
    pip.style.display = 'none'; // 기존 빈 pipBox는 숨김

    refPane.style.display   = 'block';
    refPane.style.flex      = 'none';
    refPane.style.position  = 'absolute';
    refPane.style.width     = '110px';
    refPane.style.height    = '155px';
    refPane.style.borderRadius = '10px';
    refPane.style.border    = '2px solid rgba(255,255,255,.4)';
    refPane.style.overflow  = 'hidden';
    refPane.style.zIndex    = '20';
    refPane.style.cursor    = 'grab';
    refPane.style.background = '#222';

    // 참고 영상이 없으면 안내 텍스트
    if (!refPane.querySelector('video, iframe')) {
      var noVid = document.createElement('span');
      noVid.id = 'pipNoVid';
      noVid.style.cssText = 'color:#aaa;font-size:10px;display:flex;height:100%;align-items:center;justify-content:center;text-align:center;padding:4px';
      noVid.textContent = '참고 영상 없음';
      refPane.appendChild(noVid);
    }

    // 초기 위치: 좌측 상단
    setTimeout(function() {
      var margin = 12;
      refPane.style.left  = margin + 'px';
      refPane.style.right = 'auto';
      refPane.style.top   = (52 + margin) + 'px'; // 헤더 아래
    }, 30);

    // PIP 드래그를 refPane에 연결
    initPipDragOn(refPane);
  } else {
    // PIP 해제: refPane 스타일 리셋
    refPane.style.position   = '';
    refPane.style.width      = '';
    refPane.style.height     = '';
    refPane.style.borderRadius = '';
    refPane.style.border     = '';
    refPane.style.zIndex     = '';
    refPane.style.cursor     = '';
    refPane.style.right      = '';
    refPane.style.top        = '';
    var noVid = document.getElementById('pipNoVid');
    if (noVid) noVid.remove();
    var oldHandle = document.getElementById('pipResizeHandle');
    if (oldHandle) oldHandle.remove();

    if (l === '12') {
      wrap.classList.add('split12');
      refPane.style.flex  = '1';
      userPane.style.flex = '2';
    } else {
      refPane.style.flex  = '1';
      userPane.style.flex = '1';
    }
  }
}

/* ════════════════════════════
   PIP 드래그
   ════════════════════════════ */
function initPipDragOn(el) {
  /* PIP 이동: iframe이 이벤트를 가로채므로
     상단 드래그 핸들 바에서만 이동 처리 */

  if (el._pipCleanup) el._pipCleanup();

  var HANDLE_H = 28;  // 핸들 바 높이 (px)
  var MIN_W = 80,  MAX_W = 300;
  var MIN_H = 100, MAX_H = 400;

  /* ── 핸들 바 생성 ── */
  var handle = el.querySelector('.pip-drag-handle');
  if (!handle) {
    handle = document.createElement('div');
    handle.className = 'pip-drag-handle';
    handle.style.cssText = [
      'position:absolute', 'top:0', 'left:0', 'right:0',
      'height:' + HANDLE_H + 'px',
      'z-index:50',
      'cursor:grab',
      'background:linear-gradient(rgba(0,0,0,.55),transparent)',
      'border-radius:10px 10px 0 0',
      'display:flex', 'align-items:center', 'justify-content:center',
      'touch-action:none'
    ].join(';');
    // 가운데 점선 (iOS PIP 스타일)
    var dots = document.createElement('div');
    dots.style.cssText = 'display:flex;gap:4px;opacity:.7;pointer-events:none';
    for (var i = 0; i < 3; i++) {
      var d = document.createElement('div');
      d.style.cssText = 'width:4px;height:4px;border-radius:50%;background:#fff';
      dots.appendChild(d);
    }
    handle.appendChild(dots);
    el.insertBefore(handle, el.firstChild);
  }

  /* ── 리사이즈 핸들 (우하단) ── */
  var rHandle = el.querySelector('.pip-resize-handle');
  if (!rHandle) {
    rHandle = document.createElement('div');
    rHandle.className = 'pip-resize-handle';
    rHandle.style.cssText = [
      'position:absolute', 'bottom:0', 'right:0',
      'width:26px', 'height:26px', 'z-index:50',
      'cursor:nwse-resize', 'touch-action:none',
      'display:flex', 'align-items:flex-end', 'justify-content:flex-end',
      'padding:5px'
    ].join(';');
    rHandle.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" style="pointer-events:none">'
      + '<line x1="9" y1="1" x2="1" y2="9" stroke="rgba(255,255,255,.7)" stroke-width="1.5" stroke-linecap="round"/>'
      + '<line x1="9" y1="5" x2="5" y2="9" stroke="rgba(255,255,255,.7)" stroke-width="1.5" stroke-linecap="round"/>'
      + '</svg>';
    el.appendChild(rHandle);
  }

  /* ── 공통 유틸 ── */
  function pt(e) {
    if (e.touches && e.touches.length)            return e.touches[0];
    if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0];
    return e;
  }
  function appRect() {
    return (document.querySelector('.app-wrap') || document.body).getBoundingClientRect();
  }

  /* ══════════════
     이동 (핸들 바)
     ══════════════ */
  var moveActive = false;
  var mSX=0, mSY=0, mSL=0, mST=0;

  function moveStart(e) {
    var p = pt(e), r = el.getBoundingClientRect(), ar = appRect();
    mSX = p.clientX; mSY = p.clientY;
    mSL = r.left - ar.left;
    mST = r.top  - ar.top;
    moveActive = true;
    handle.style.cursor = 'grabbing';
    e.preventDefault(); e.stopPropagation();
  }
  function moveMove(e) {
    if (!moveActive) return;
    var p = pt(e), ar = appRect();
    var x = Math.max(0, Math.min(mSL + p.clientX - mSX, ar.width  - el.offsetWidth));
    var y = Math.max(0, Math.min(mST + p.clientY - mSY, ar.height - el.offsetHeight));
    el.style.left = x + 'px'; el.style.right = 'auto'; el.style.top = y + 'px';
    e.preventDefault();
  }
  function moveEnd() {
    moveActive = false;
    handle.style.cursor = 'grab';
  }

  handle.addEventListener('mousedown',  moveStart);
  handle.addEventListener('touchstart', moveStart, { passive: false });
  document.addEventListener('mousemove', moveMove);
  document.addEventListener('touchmove', moveMove, { passive: false });
  document.addEventListener('mouseup',   moveEnd);
  document.addEventListener('touchend',  moveEnd);
  document.addEventListener('touchcancel', moveEnd);

  /* ══════════════
     리사이즈 (우하단 핸들)
     ══════════════ */
  var resActive = false;
  var rSX=0, rSY=0, rSL=0, rST=0, rSW=0, rSH=0;

  function resStart(e) {
    var p = pt(e), r = el.getBoundingClientRect(), ar = appRect();
    rSX = p.clientX; rSY = p.clientY;
    rSL = r.left - ar.left; rST = r.top - ar.top;
    rSW = r.width; rSH = r.height;
    resActive = true;
    e.preventDefault(); e.stopPropagation();
  }
  function resMove(e) {
    if (!resActive) return;
    var p = pt(e), ar = appRect();
    var nW = Math.min(Math.max(rSW + p.clientX - rSX, MIN_W), MAX_W, ar.width  - rSL - 4);
    var nH = Math.min(Math.max(rSH + p.clientY - rSY, MIN_H), MAX_H, ar.height - rST - 4);
    el.style.width = nW + 'px'; el.style.height = nH + 'px';
    e.preventDefault();
  }
  function resEnd() { resActive = false; }

  rHandle.addEventListener('mousedown',  resStart);
  rHandle.addEventListener('touchstart', resStart, { passive: false });
  document.addEventListener('mousemove', resMove);
  document.addEventListener('touchmove', resMove, { passive: false });
  document.addEventListener('mouseup',   resEnd);
  document.addEventListener('touchend',  resEnd);
  document.addEventListener('touchcancel', resEnd);

  /* ── cleanup ── */
  el._pipCleanup = function() {
    handle.removeEventListener('mousedown',  moveStart);
    handle.removeEventListener('touchstart', moveStart);
    rHandle.removeEventListener('mousedown',  resStart);
    rHandle.removeEventListener('touchstart', resStart);
    document.removeEventListener('mousemove', moveMove);
    document.removeEventListener('touchmove', moveMove);
    document.removeEventListener('mouseup',   moveEnd);
    document.removeEventListener('touchend',  moveEnd);
    document.removeEventListener('touchcancel', moveEnd);
    document.removeEventListener('mousemove', resMove);
    document.removeEventListener('touchmove', resMove);
    document.removeEventListener('mouseup',   resEnd);
    document.removeEventListener('touchend',  resEnd);
    document.removeEventListener('touchcancel', resEnd);
    el._pipCleanup = null;
  };
}


function initPipResize(el, handle) { /* 통합됨 */ }

/* ════════════════════════════
   UI 기능
   ════════════════════════════ */
function toggleDial() {
  dialOpen = !dialOpen;
  document.getElementById('dialItems').classList.toggle('open', dialOpen);
}

function switchPanes() {
  swapped = !swapped;
  const ref  = document.getElementById('refPane');
  const user = document.getElementById('userPane');
  if (swapped) app.insertBefore(user, ref);
  else         app.insertBefore(ref, user);
}

function toggleOverlay() {
  isOverlay = !isOverlay;
  const btn   = document.getElementById('overlayToggleBtn');
  const layer = document.getElementById('overlayLayer');
  btn.textContent   = isOverlay ? '오버레이 ON' : '오버레이 OFF';
  btn.classList.toggle('on', isOverlay);
  layer.style.display = isOverlay ? 'flex' : 'none';
}

/* ── 레이아웃 선택 팝업 ── */
function chooseType(type) {
  layout = type;
  ['pip','11','12'].forEach(t => {
    document.getElementById(`opt-${t}`).classList.toggle('selected', t === type);
  });
  document.querySelectorAll('.rt-dial-item').forEach(el => {
    el.classList.toggle('selected', el.textContent.trim() === (type === '11' ? '1:1' : type === '12' ? '1:2' : 'PIP'));
  });
}

function cancelTypeModal() {
  document.getElementById('typeModal').style.display = 'none';
  // 카메라 스트림 정지
  if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
  window.location.href = window.RT_URL_POSTURE;
}

function confirmTypeAndStart() {
  document.getElementById('typeModal').style.display = 'none';
  setLayout(layout);
  startCountdown(() => {
    analysisStarted = true;
    startRefVideo();       // 카운트다운 후 참고 영상 재생 시작
    startScoreLoop();
    startExerciseTimer();
  });
}

/* ── 카운트다운 ── */
function startCountdown(cb) {
  const el  = document.getElementById('countdown');
  const num = document.getElementById('countNum');
  el.classList.add('show');
  let cnt = 3;
  num.textContent = cnt;
  const t = setInterval(() => {
    cnt--;
    if (cnt <= 0) { clearInterval(t); el.classList.remove('show'); cb && cb(); }
    else num.textContent = cnt;
  }, 1000);
}

/* ── 점수 루프 ── */
function startScoreLoop() {
  const pctEl = document.getElementById('matchPct');
  const badge = document.getElementById('scoreBadge');
  scoreTimer  = setInterval(() => {
    if (isPaused) return;
    const pct = 55 + Math.floor(Math.random() * 40);
    const lvl = getScoreLevel(pct);
    pctEl.textContent  = pct + '%';
    badge.textContent  = `${lvl.label} · ${pct}%`;
    badge.className    = `rt-score-badge ${lvl.cls}`;
  }, 2000);
}

/* ── 타이머 ── */
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

/* ── 일시정지 ── */
function togglePause() {
  isPaused = !isPaused;
  const icon = document.getElementById('pauseIcon');
  if (isPaused) {
    clearInterval(scoreTimer);
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    // 카메라도 일시정지 (비디오 트랙 비활성화)
    if (cameraStream) cameraStream.getVideoTracks().forEach(t => { t.enabled = false; });
  } else {
    startScoreLoop();
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    if (cameraStream) cameraStream.getVideoTracks().forEach(t => { t.enabled = true; });
  }
}

/* ── 나가기 ── */
function handleExit() {
  if (!analysisStarted) return;
  document.getElementById('exitModal').classList.add('open');
}

function forceExit() {
  document.getElementById('exitModal').classList.remove('open');
  clearInterval(scoreTimer);
  clearInterval(exerciseTimer);
  stopCamera();
  if (elapsed / TOTAL_DURATION >= 0.25) {
    document.getElementById('resultModal').classList.add('open');
  } else {
    showCenterSnackbar('운동량이 충분하지 않아 분석 결과가 제공되지 않습니다.');
    setTimeout(() => { window.location.href = window.RT_URL_POSTURE; }, 1200);
  }
}

function closeExitModal() { document.getElementById('exitModal').classList.remove('open'); }

function goReport() {
  stopCamera();
  sessionStorage.removeItem('fito_ref_link');
  sessionStorage.removeItem('fito_ref_type');
  sessionStorage.removeItem('fito_ref_embed');
  window.location.href = window.RT_URL_REPORT + '?mode=realtime';
}

function noResult() {
  stopCamera();
  window.location.href = window.RT_URL_POSTURE;
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
}

/* ── 화면 탭 ── */
function tapScreen() {
  const bar = document.getElementById('exitBar');
  bar.classList.add('show');
  clearTimeout(tapTimeout);
  tapTimeout = setTimeout(() => bar.classList.remove('show'), 3000);
}

document.getElementById('splitWrap').addEventListener('click', e => {
  if (e.target.closest('.rt-exit-btn')) return;
  tapScreen();
});

function showCenterSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg; 
  sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 1200);
}