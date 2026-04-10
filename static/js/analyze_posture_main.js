/* ===========================
   FITO - 자세분석 메인 JS
   =========================== */

/* ── 상태 ── */
const state = {
  activeTab: 0,
  upload: {
    videoUploaded: false,
    analysisType: null,
    refType: null,
    refUploaded: false,
    refLink: '',
    segments: [{ startSec: 0, endSec: 0 }],
    duration: '00:00',
    videoUrl: null,
    videoFile: null,
    thumbnailDataUrl: null,
  },
  rt: {
    analysisType: null,
    refType: null,
    refUploaded: false,
    refLink: '',
    cameraAllowed: false,
    cameraStream: null,
  },
};

/* ── 탭 전환 ── */
const tabs     = document.querySelectorAll('.ps-tab');
const panelEls = document.querySelectorAll('.ps-tab-panel');

function switchTab(idx) {
  if (state.activeTab === idx) return;
  state.activeTab = idx;

  tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
  panelEls.forEach((p, i) => p.classList.toggle('active', i === idx));

  window.scrollTo({ top: 0 });

  // 실시간 탭으로 전환 시 카메라 권한 요청
  if (idx === 1) requestCameraPermission();
}

/* ══════════════════════════════
   카메라 권한 요청 & 스트림 표시
   ══════════════════════════════ */
function requestCameraPermission() {
  const area  = document.getElementById('rtCameraArea');
  const label = area.querySelector('.ps-camera-label');

  // 이미 허용된 경우
  if (state.rt.cameraAllowed && state.rt.cameraStream) return;

  // 권한 요청 중 UI
  if (label) label.textContent = '카메라 권한을 요청하고 있어요...';

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(function(stream) {
      state.rt.cameraAllowed = true;
      state.rt.cameraStream  = stream;
      showCameraStream(stream);
    })
    .catch(function(err) {
      state.rt.cameraAllowed = false;
      showCameraError(err);
    });
}

function showCameraStream(stream) {
  const area = document.getElementById('rtCameraArea');
  area.innerHTML = ''; // 기존 내용 제거

  const video = document.createElement('video');
  video.setAttribute('autoplay', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;transform:scaleX(-1)'; // 좌우 반전 (거울 모드)
  video.srcObject = stream;

  // 카메라 ON 배지
  const badge = document.createElement('div');
  badge.style.cssText = 'position:absolute;top:10px;left:10px;background:rgba(45,158,94,.9);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;display:flex;align-items:center;gap:5px;z-index:5';
  badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#fff;animation:blink 1s infinite"></span> 카메라 ON';

  area.appendChild(video);
  area.appendChild(badge);
}

function showCameraError(err) {
  const area = document.getElementById('rtCameraArea');
  let msg = '카메라를 사용할 수 없어요.';
  if (err.name === 'NotAllowedError')  msg = '카메라 권한이 거부되었습니다.\n브라우저 설정에서 권한을 허용해 주세요.';
  if (err.name === 'NotFoundError')    msg = '연결된 카메라를 찾을 수 없어요.';
  if (err.name === 'NotReadableError') msg = '카메라가 다른 앱에서 사용 중이에요.';

  area.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <line x1="2" y1="2" x2="22" y2="22" stroke="#e05c4b"/>
      </svg>
      <span style="font-size:13px;color:#aaa;text-align:center;white-space:pre-line">${msg}</span>
      <button onclick="requestCameraPermission()" style="padding:8px 18px;background:#000;color:#fff;border:none;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">다시 시도</button>
    </div>`;
}

/* ══════════════════════════════
   분석 유형 선택
   ══════════════════════════════ */
function selectAnalysisType(tab, type) {
  const prefix = tab === 'upload' ? 'upload' : 'rt';
  const s = state[tab === 'upload' ? 'upload' : 'rt'];

  document.getElementById(`${prefix}-basic`).classList.toggle('selected', type === 'basic');
  document.getElementById(`${prefix}-ref`).classList.toggle('selected',   type === 'ref');
  s.analysisType = type;

  const linkBtn = document.getElementById(`${prefix}-ref-link`);
  const fileBtn = document.getElementById(`${prefix}-ref-file`);
  const isRef   = type === 'ref';
  [linkBtn, fileBtn].forEach(btn => btn.classList.toggle('disabled', !isRef));
  document.getElementById(`${prefix}-ref-status-row`).style.display = isRef ? 'flex' : 'none';
}

/* ── 참고 영상 업로드 유형 선택 ── */
function selectRefUploadType(tab, type) {
  const prefix = tab === 'upload' ? 'upload' : 'rt';
  const s = state[tab === 'upload' ? 'upload' : 'rt'];
  if (s.analysisType !== 'ref') return;

  document.getElementById(`${prefix}-ref-link`).classList.toggle('selected', type === 'link');
  document.getElementById(`${prefix}-ref-file`).classList.toggle('selected', type === 'file');
  s.refType = type;

  if (type === 'link') {
    currentLinkTarget = tab;
    document.getElementById('linkModal').classList.add('open');
  } else {
    currentModalTarget = 'ref';
    document.getElementById('uploadModal').classList.add('open');
    document.querySelector('.upload-modal-title').textContent = '참고 영상 업로드';
  }
}

/* ── 정보 팝업 토글 ── */
function toggleInfo(id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  document.querySelectorAll('.info-popup').forEach(p => { if (p.id !== id) p.classList.remove('open'); });
}
document.addEventListener('click', e => {
  if (!e.target.closest('.ps-info-icon') && !e.target.closest('.info-popup')) {
    document.querySelectorAll('.info-popup').forEach(p => p.classList.remove('open'));
  }
});

/* ══════════════════════════════
   링크 업로드 & 미리보기
   ══════════════════════════════ */
let currentLinkTarget = 'upload'; // 'upload' | 'rt'

function getYouTubeEmbedUrl(url) {
  // youtube.com/watch?v=ID  또는 youtu.be/ID
  const m1 = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (m1) return `https://www.youtube.com/embed/${m1[1]}?autoplay=0&controls=1`;
  return null;
}

function confirmLink() {
  const url = document.getElementById('linkInput').value.trim();
  if (!url || !url.startsWith('http')) {
    showSnackbar('올바른 링크를 입력해 주세요.');
    return;
  }

  const tab    = currentLinkTarget;
  const prefix = tab;
  const s      = state[tab === 'upload' ? 'upload' : 'rt'];

  s.refUploaded = true;
  s.refLink     = url;

  // 미리보기 삽입
  renderRefPreview(prefix, url);

  const statusEl = document.getElementById(`${prefix}-ref-status`);
  if (statusEl) {
    statusEl.textContent = '링크 업로드 완료 ✓';
    statusEl.classList.add('uploaded');
  }

  document.getElementById('linkModal').classList.remove('open');
  document.getElementById('linkInput').value = '';
}

function renderRefPreview(prefix, url) {
  const row = document.getElementById(`${prefix}-ref-status-row`);
  if (!row) return;

  // 기존 미리보기 제거
  const existing = document.getElementById(`${prefix}-ref-preview`);
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.id = `${prefix}-ref-preview`;
  wrap.style.cssText = 'width:100%;margin-top:10px;border-radius:10px;overflow:hidden;background:#111';

  const ytEmbed = getYouTubeEmbedUrl(url);

  if (ytEmbed) {
    // YouTube → iframe embed
    wrap.innerHTML = `
      <div style="position:relative;padding-top:56.25%">
        <iframe src="${ytEmbed}" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen></iframe>
      </div>
      <div style="padding:6px 10px;font-size:11px;color:#888;display:flex;align-items:center;gap:6px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="#888" stroke="none"/></svg>
        YouTube 참고 영상
      </div>`;
  } else {
    // 일반 mp4 링크 → video 태그
    wrap.innerHTML = `
      <video controls playsinline style="width:100%;max-height:200px;display:block;border-radius:8px">
        <source src="${url}" type="video/mp4">
        <p style="color:#aaa;font-size:12px;padding:10px">영상을 불러올 수 없어요.</p>
      </video>
      <div style="padding:6px 10px;font-size:11px;color:#888">직접 링크 영상</div>`;
  }

  // status row 다음에 삽입
  row.parentNode.insertBefore(wrap, row.nextSibling);

  // sessionStorage에 저장 (실시간 분석 화면으로 전달)
  sessionStorage.setItem('fito_ref_link', url);
  sessionStorage.setItem('fito_ref_type', ytEmbed ? 'youtube' : 'direct');
  if (ytEmbed) sessionStorage.setItem('fito_ref_embed', ytEmbed);
}

/* ══════════════════════════════════════
   영상 업로드 모달 — 비디오 편집툴 방식
   ══════════════════════════════════════ */

const SEG_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];  // 파랑, 주황, 초록

let modalVideoEl    = null;
let modalVideoDur   = 0;
let playAnimFrame   = null;
let activeSegIdx    = 0;       // 현재 선택된 구간 인덱스
let tlDragState     = null;    // { segIdx, type: 'body'|'left'|'right', startX, startLeft, startWidth }
let currentModalTarget = 'user';

function openUploadModal() {
  currentModalTarget = 'user';
  document.getElementById('uploadModalTitle').textContent = '분석 영상 업로드';
  document.getElementById('uploadModal').classList.add('open');
  modalVideoEl = document.getElementById('uploadVideoEl');
  attachVideoEvents();
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.remove('open');
  // 재생 멈춤
  if (modalVideoEl) modalVideoEl.pause();
  cancelAnimationFrame(playAnimFrame);
}

/* ── 비디오 이벤트 연결 ── */
function attachVideoEvents() {
  if (!modalVideoEl || modalVideoEl._evAttached) return;
  modalVideoEl._evAttached = true;
  modalVideoEl.addEventListener('loadedmetadata', onVideoLoaded);
  modalVideoEl.addEventListener('timeupdate', onTimeUpdate);
  modalVideoEl.addEventListener('ended', () => setPlayIcon(false));
}

function onVideoLoaded() {
  modalVideoDur = modalVideoEl.duration;
  const dur = Math.floor(modalVideoDur);
  const m = String(Math.floor(dur / 60)).padStart(2, '0');
  const s = String(dur % 60).padStart(2, '0');
  state.upload.duration = m + ':' + s;

  // 기본 구간 1 초기화 (전체)
  if (state.upload.segments.length === 0) {
    state.upload.segments = [{ startSec: 0, endSec: Math.min(dur, 180) }];
  } else {
    state.upload.segments[0].startSec = 0;
    state.upload.segments[0].endSec   = Math.min(dur, 180);
  }

  document.getElementById('playerControls').classList.add('visible');
  document.getElementById('timelineOuter').classList.add('visible');
  document.getElementById('uploadVideoPlaceholder').style.display = 'none';

  renderSegmentList();
  renderTlBlocks();
  extractThumbnail();
}

function onTimeUpdate() {
  if (!modalVideoDur) return;
  const cur = modalVideoEl.currentTime;
  const pct = (cur / modalVideoDur) * 100;
  document.getElementById('seekBar').value = pct;
  document.getElementById('tlPlayhead').style.left = pct + '%';
  document.getElementById('timeDisp').textContent = fmtSec(cur) + ' / ' + fmtSec(modalVideoDur);
}

function fmtSec(s) {
  s = Math.floor(s);
  return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
}

/* ── 파일 선택 ── */
function handleVideoWrapClick() {
  document.getElementById('fileInput').click();
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024 * 1024) { showSnackbar('용량을 초과했습니다.'); return; }

  const url = URL.createObjectURL(file);
  modalVideoEl = document.getElementById('uploadVideoEl');
  modalVideoEl._evAttached = false;
  attachVideoEvents();
  modalVideoEl.src = url;
  modalVideoEl.load();
  state.upload.videoFile = file;
  state.upload.videoUrl  = url;
}

/* ── 재생 컨트롤 ── */
function togglePlay() {
  if (!modalVideoEl || !modalVideoEl.src) return;
  if (modalVideoEl.paused) { modalVideoEl.play(); setPlayIcon(true); }
  else                     { modalVideoEl.pause(); setPlayIcon(false); }
}
function setPlayIcon(playing) {
  document.getElementById('playIcon').innerHTML = playing
    ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
    : '<polygon points="5 3 19 12 5 21 5 3"/>';
}
function onSeekInput(val) {
  if (!modalVideoDur) return;
  modalVideoEl.currentTime = (val / 100) * modalVideoDur;
}
function onSeekChange(val) { onSeekInput(val); }

/* ── 타임라인 바 클릭 → 시크 ── */
function onTlBarClick(e) {
  if (tlDragState) return; // 드래그 중이면 무시
  const bar = document.getElementById('tlBar');
  const pct = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
  if (modalVideoDur) modalVideoEl.currentTime = pct * modalVideoDur;
}

/* ══════════════════════
   구간 블록 렌더
   ══════════════════════ */
function renderTlBlocks() {
  const bar  = document.getElementById('tlBar');
  // 기존 블록 제거 (플레이헤드 제외)
  bar.querySelectorAll('.upload-seg-block').forEach(b => b.remove());

  state.upload.segments.forEach(function(seg, i) {
    if (!modalVideoDur) return;
    const left  = (seg.startSec / modalVideoDur) * 100;
    const width = ((seg.endSec - seg.startSec) / modalVideoDur) * 100;
    const color = SEG_COLORS[i];

    const block = document.createElement('div');
    block.className = 'upload-seg-block' + (i === activeSegIdx ? ' active-seg' : '');
    block.dataset.segIdx = i;
    block.style.left  = left + '%';
    block.style.width = Math.max(width, 2) + '%';

    block.innerHTML =
      '<div class="upload-seg-block-inner" style="background:' + color + '"></div>' +
      '<div class="upload-seg-label-inside">구간 ' + (i+1) + '</div>' +
      '<div class="upload-seg-handle left"  data-seg="' + i + '" data-type="left"></div>' +
      '<div class="upload-seg-handle right" data-seg="' + i + '" data-type="right"></div>';

    // 블록 전체 드래그 (이동)
    block.addEventListener('mousedown',  function(e) { startTlDrag(e, i, 'body'); });
    block.addEventListener('touchstart', function(e) { startTlDrag(e, i, 'body'); }, { passive: false });

    // 핸들 드래그
    block.querySelectorAll('.upload-seg-handle').forEach(function(h) {
      h.addEventListener('mousedown',  function(e) { e.stopPropagation(); startTlDrag(e, i, h.dataset.type); });
      h.addEventListener('touchstart', function(e) { e.stopPropagation(); startTlDrag(e, i, h.dataset.type); }, { passive: false });
    });

    // 블록 클릭 → 활성 구간 선택
    block.addEventListener('click', function(e) {
      if (tlDragState) return;
      setActiveSeg(i);
    });

    bar.appendChild(block);
  });
}

function setActiveSeg(idx) {
  activeSegIdx = idx;
  renderTlBlocks();
  renderSegmentList();
}

/* ══════════════════════
   타임라인 드래그 (이동 / 리사이즈)
   ══════════════════════ */
function startTlDrag(e, segIdx, type) {
  e.preventDefault();
  const p   = e.touches ? e.touches[0] : e;
  const bar = document.getElementById('tlBar');
  const seg = state.upload.segments[segIdx];

  tlDragState = {
    segIdx,
    type,
    startX:     p.clientX,
    barW:       bar.offsetWidth,
    startStart: seg.startSec,
    startEnd:   seg.endSec,
    barLeft:    bar.getBoundingClientRect().left
  };
  setActiveSeg(segIdx);

  document.addEventListener('mousemove', onTlDragMove);
  document.addEventListener('touchmove', onTlDragMove, { passive: false });
  document.addEventListener('mouseup',   onTlDragEnd);
  document.addEventListener('touchend',  onTlDragEnd);
}

function onTlDragMove(e) {
  if (!tlDragState) return;
  e.preventDefault();
  const p   = e.touches ? e.touches[0] : e;
  const dx  = p.clientX - tlDragState.startX;
  const dSec = (dx / tlDragState.barW) * modalVideoDur;
  const seg  = state.upload.segments[tlDragState.segIdx];
  const MIN_SEG = 1; // 최소 1초

  if (tlDragState.type === 'left') {
    seg.startSec = Math.max(0, Math.min(tlDragState.startStart + dSec, seg.endSec - MIN_SEG));
  } else if (tlDragState.type === 'right') {
    seg.endSec = Math.min(modalVideoDur, Math.max(tlDragState.startEnd + dSec, seg.startSec + MIN_SEG));
  } else {
    // body 이동
    const dur = tlDragState.startEnd - tlDragState.startStart;
    let ns = tlDragState.startStart + dSec;
    ns = Math.max(0, Math.min(ns, modalVideoDur - dur));
    seg.startSec = ns;
    seg.endSec   = ns + dur;
  }

  renderTlBlocks();
  renderSegmentList();
}

function onTlDragEnd() {
  tlDragState = null;
  document.removeEventListener('mousemove', onTlDragMove);
  document.removeEventListener('touchmove', onTlDragMove);
  document.removeEventListener('mouseup',   onTlDragEnd);
  document.removeEventListener('touchend',  onTlDragEnd);
}

/* ══════════════════════
   구간 목록 렌더
   ══════════════════════ */
function renderSegmentList() {
  const list = document.getElementById('segmentList');
  list.innerHTML = state.upload.segments.map(function(seg, i) {
    const color = SEG_COLORS[i];
    const isActive = i === activeSegIdx;
    return '<div class="upload-segment' + (isActive ? ' active-seg-row' : '') + '" onclick="setActiveSeg(' + i + ')">' +
      '<div class="upload-seg-color-dot" style="background:' + color + '"></div>' +
      '<span class="upload-segment-label">구간 ' + (i+1) + '</span>' +
      '<span class="upload-seg-times">' + fmtSec(seg.startSec) + ' ~ ' + fmtSec(seg.endSec) + '</span>' +
      '<div class="upload-seg-action-btns">' +
        '<button class="upload-seg-mark-btn start" onclick="event.stopPropagation();markStart(' + i + ')">시작↓</button>' +
        '<button class="upload-seg-mark-btn end"   onclick="event.stopPropagation();markEnd('   + i + ')">끝↓</button>' +
        '<button class="upload-seg-del-btn" ' + (i === 0 ? 'disabled' : 'onclick="event.stopPropagation();delSegment(' + i + ')"') + '>×</button>' +
      '</div>' +
    '</div>';
  }).join('');

  // 추가 버튼 상태
  document.getElementById('tlAddBtn').disabled = state.upload.segments.length >= 3;
}

/* ── 현재 재생 시간으로 구간 마킹 ── */
function markStart(idx) {
  const t = modalVideoEl ? modalVideoEl.currentTime : 0;
  const seg = state.upload.segments[idx];
  seg.startSec = Math.min(t, seg.endSec - 1);
  renderTlBlocks();
  renderSegmentList();
}
function markEnd(idx) {
  const t = modalVideoEl ? modalVideoEl.currentTime : modalVideoDur;
  const seg = state.upload.segments[idx];
  seg.endSec = Math.max(t, seg.startSec + 1);
  renderTlBlocks();
  renderSegmentList();
}

/* ── 구간 추가 / 삭제 ── */
function addSegment() {
  if (state.upload.segments.length >= 3) return;
  const mid   = modalVideoDur / 2;
  const start = Math.max(0, mid - 5);
  const end   = Math.min(modalVideoDur, mid + 5);
  state.upload.segments.push({ startSec: start, endSec: end });
  activeSegIdx = state.upload.segments.length - 1;
  renderTlBlocks();
  renderSegmentList();
}
function delSegment(idx) {
  if (idx === 0) return;
  state.upload.segments.splice(idx, 1);
  if (activeSegIdx >= state.upload.segments.length) activeSegIdx = state.upload.segments.length - 1;
  renderTlBlocks();
  renderSegmentList();
}

/* ══════════════════════
   첫 프레임 썸네일 추출
   ══════════════════════ */
function extractThumbnail() {
  const video = document.getElementById('uploadVideoEl');
  // 0.1초 시점에서 캡처
  video.currentTime = 0.1;
  video.addEventListener('seeked', function capFrame() {
    video.removeEventListener('seeked', capFrame);
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 320;
    canvas.height = video.videoHeight || 180;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    state.upload.thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
    video.currentTime = 0;
  }, { once: true });
}

/* ══════════════════════
   완료 버튼
   ══════════════════════ */
function confirmUpload() {
  if (!state.upload.videoUrl) {
    showSnackbar('영상을 먼저 선택해 주세요.');
    return;
  }

  // 분석 선택 화면에 썸네일 표시
  applyThumbnailToMainScreen();

  state.upload.videoUploaded = true;
  closeUploadModal();
  document.getElementById('fileInput').value = '';
}

function applyThumbnailToMainScreen() {
  const area        = document.getElementById('uploadVideoArea');
  const placeholder = document.getElementById('uploadPlaceholder');
  const thumb       = document.getElementById('uploadThumb');

  if (state.upload.thumbnailDataUrl) {
    // 캔버스 썸네일 이미지로 표시
    let img = area.querySelector('.upload-thumb-img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'upload-thumb-img';
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit';
      area.appendChild(img);
    }
    img.src = state.upload.thumbnailDataUrl;
  }

  // 기존 placeholder 숨기기
  if (placeholder) placeholder.style.display = 'none';

  // 구간 정보 배지 표시
  if (thumb) {
    thumb.classList.add('show');
    const durEl = document.getElementById('uploadDuration');
    if (durEl) {
      const totalSec = state.upload.segments.reduce(function(acc, s) {
        return acc + (s.endSec - s.startSec);
      }, 0);
      durEl.textContent = fmtSec(totalSec) + ' (구간 ' + state.upload.segments.length + '개)';
    }
  }
}

/* ══════════════════════════════
   분석 시작
   ══════════════════════════════ */
function startAnalysis() {
  const isUpload = state.activeTab === 0;
  const s    = isUpload ? state.upload : state.rt;
  const mode = isUpload ? 'upload' : 'realtime';

  if (isUpload && !s.videoUploaded) {
    showSnackbar('모든 선택을 완료해주세요');
    return;
  }
  if (!s.analysisType) {
    showSnackbar('모든 선택을 완료해주세요');
    return;
  }
  if (s.analysisType === 'ref' && !s.refUploaded) {
    showSnackbar('모든 선택을 완료해주세요');
    return;
  }

  // 실시간: 카메라 스트림 정지 (realtime 화면에서 다시 시작)
  if (!isUpload && state.rt.cameraStream) {
    state.rt.cameraStream.getTracks().forEach(t => t.stop());
  }

  location.href = `/analyze/posture/loading?mode=${mode}`;
}

/* ── 스낵바 ── */
function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg;
  sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 3000);
}

/* ── 초기 탭 설정 ── */
document.addEventListener('DOMContentLoaded', () => {
  const mode = new URLSearchParams(location.search).get('mode');
  if (mode === 'realtime') switchTab(1);
});