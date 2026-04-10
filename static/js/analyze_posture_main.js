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
    segments: [{ start: '00:00', end: '00:00' }],
    duration: '00:00',
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

/* ══════════════════════════════
   영상 업로드 모달
   ══════════════════════════════ */
let currentModalTarget = 'user';

function openUploadModal() {
  currentModalTarget = 'user';
  document.querySelector('.upload-modal-title').textContent = '분석 영상 업로드';
  document.getElementById('uploadModal').classList.add('open');
  renderSegments();
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.remove('open');
}

function renderSegments() {
  const list = document.getElementById('segmentList');
  const segs = state.upload.segments;
  list.innerHTML = segs.map((seg, i) => `
    <div class="upload-segment">
      <span class="upload-segment-label">구간 ${i+1}</span>
      <div class="upload-time-input"><span>${seg.start}</span></div>
      <span class="upload-segment-sep">~</span>
      <div class="upload-time-input"><span>${seg.end}</span></div>
      <div class="upload-segment-spacer"></div>
      ${(i < 2 && segs.length < 3)
        ? `<button class="upload-seg-add-btn" onclick="addSegment()">+</button>`
        : `<button class="upload-seg-add-btn" disabled style="background:#e5e5e5;color:#ccc">+</button>`}
      ${i > 0
        ? `<button class="upload-seg-del-btn" onclick="delSegment(${i})">-</button>`
        : `<button class="upload-seg-del-btn" disabled>-</button>`}
    </div>
  `).join('');
}

function addSegment() {
  if (state.upload.segments.length >= 3) return;
  state.upload.segments.push({ start: '00:00', end: state.upload.duration });
  renderSegments();
}

function delSegment(idx) {
  state.upload.segments.splice(idx, 1);
  renderSegments();
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.includes('mp4')) {
    showSnackbar(`지원하지 않는 형식입니다. mp4 파일을 업로드해 주세요.`);
    return;
  }
  if (file.size > 500 * 1024 * 1024) {
    showSnackbar('용량을 초과했습니다. 다시 시도해 주세요.');
    return;
  }

  const label = document.getElementById('uploadModalLabel');
  label.textContent = `✓ ${file.name}`;
  label.style.color = '#2d9e5e';
  document.getElementById('timelineWrap').style.display = 'block';

  const url   = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src   = url;
  video.onloadedmetadata = () => {
    const dur = Math.floor(video.duration);
    const m = String(Math.floor(dur / 60)).padStart(2, '0');
    const s = String(dur % 60).padStart(2, '0');
    state.upload.duration             = `${m}:${s}`;
    state.upload.segments[0].end      = dur > 180 ? '03:00' : `${m}:${s}`;
    renderSegments();
  };
}

function confirmUpload() {
  const label = document.getElementById('uploadModalLabel');
  if (!label.style.color.includes('2d9e5e')) {
    closeUploadModal();
    return;
  }

  if (currentModalTarget === 'user') {
    state.upload.videoUploaded = true;
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('uploadThumb').classList.add('show');
    document.getElementById('uploadDuration').textContent = state.upload.duration;
  } else {
    const tab    = state.activeTab === 0 ? 'upload' : 'rt';
    const prefix = tab;
    state[tab === 'upload' ? 'upload' : 'rt'].refUploaded = true;
    const statusEl = document.getElementById(`${prefix}-ref-status`);
    statusEl.textContent = '참고 영상 업로드 완료 ✓';
    statusEl.classList.add('uploaded');
  }
  closeUploadModal();
  document.getElementById('fileInput').value = '';
  label.textContent = '영상 업로드';
  label.style.color = '';
  document.getElementById('timelineWrap').style.display = 'none';
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