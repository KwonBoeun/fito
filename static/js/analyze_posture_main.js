/* ===========================
   FITO - 자세분석 메인 JS
   =========================== */

/* ── 상태 ── */
const state = {
  activeTab: 0,           // 0: upload, 1: realtime
  upload: {
    videoUploaded: false,
    analysisType: null,   // 'basic' | 'ref'
    refType: null,        // 'link' | 'file'
    refUploaded: false,
    segments: [{ start: '00:00', end: '00:00' }],
    duration: '00:00',
  },
  rt: {
    analysisType: null,
    refType: null,
    refUploaded: false,
  },
};

/* ── 탭 전환 ── */
const tabs   = document.querySelectorAll('.ps-tab');
const panelEls = document.querySelectorAll('.ps-tab-panel');

function switchTab(idx) {
  if (state.activeTab === idx) return;
  state.activeTab = idx;

  // 탭 버튼 활성화
  tabs.forEach((t, i) => t.classList.toggle('active', i === idx));

  // 패널 display 전환
  panelEls.forEach((p, i) => p.classList.toggle('active', i === idx));

  window.scrollTo({ top: 0 });
}

/* ── 분석 유형 선택 ── */
function selectAnalysisType(tab, type) {
  const prefix = tab === 'upload' ? 'upload' : 'rt';
  const s = state[tab === 'upload' ? 'upload' : 'rt'];

  // 버튼 UI
  document.getElementById(`${prefix}-basic`).classList.toggle('selected', type === 'basic');
  document.getElementById(`${prefix}-ref`).classList.toggle('selected', type === 'ref');
  s.analysisType = type;

  // 참고 영상 버튼 활성화 여부
  const linkBtn = document.getElementById(`${prefix}-ref-link`);
  const fileBtn = document.getElementById(`${prefix}-ref-file`);
  const isRef   = type === 'ref';
  [linkBtn, fileBtn].forEach(btn => {
    btn.classList.toggle('disabled', !isRef);
  });
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
    document.getElementById('linkModal').classList.add('open');
  } else {
    // 파일 업로드 모달
    currentModalTarget = 'ref';
    document.getElementById('uploadModal').classList.add('open');
    document.querySelector('.upload-modal-title').textContent = '참고 영상 업로드';
  }
}

/* ── 정보 팝업 토글 ── */
function toggleInfo(id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  // 다른 팝업 닫기
  document.querySelectorAll('.info-popup').forEach(p => {
    if (p.id !== id) p.classList.remove('open');
  });
}
document.addEventListener('click', e => {
  if (!e.target.closest('.ps-info-icon') && !e.target.closest('.info-popup')) {
    document.querySelectorAll('.info-popup').forEach(p => p.classList.remove('open'));
  }
});

/* ── 영상 업로드 모달 ── */
let currentModalTarget = 'user'; // 'user' | 'ref'
let segmentCount = 1;

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
  const segs  = state.upload.segments;
  list.innerHTML = segs.map((seg, i) => `
    <div class="upload-segment">
      <span class="upload-segment-label">구간 ${i+1}</span>
      <div class="upload-time-input"><span>${seg.start}</span></div>
      <span class="upload-segment-sep">~</span>
      <div class="upload-time-input"><span>${seg.end}</span></div>
      <div class="upload-segment-spacer"></div>
      ${i < 2 && segs.length < 3 ? `<button class="upload-seg-add-btn" onclick="addSegment()">+</button>` : `<button class="upload-seg-add-btn" disabled style="background:#e5e5e5;color:#ccc" >+</button>`}
      ${i > 0 ? `<button class="upload-seg-del-btn" onclick="delSegment(${i})">-</button>` : `<button class="upload-seg-del-btn" disabled>-</button>`}
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

function triggerFileInput() {
  document.getElementById('fileInput').click();
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 형식 체크
  if (!file.type.includes('mp4')) {
    showSnackbar(`해당 형식(${file.type || '알 수 없음'})은 지원되지 않습니다. 형식(.mp4)으로 업로드 해주세요.`);
    return;
  }
  // 용량 체크 (500MB)
  if (file.size > 500 * 1024 * 1024) {
    showSnackbar('용량을 초과하였습니다. 다시 시도해 주세요.');
    return;
  }

  // 업로드 완료 UI
  const label = document.getElementById('uploadModalLabel');
  label.textContent = `✓ ${file.name}`;
  label.style.color = '#2d9e5e';

  // 타임라인 표시
  document.getElementById('timelineWrap').style.display = 'block';

  // 영상 길이 추출
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.onloadedmetadata = () => {
    const dur = Math.floor(video.duration);
    const m = String(Math.floor(dur / 60)).padStart(2, '0');
    const s = String(dur % 60).padStart(2, '0');
    state.upload.duration = `${m}:${s}`;
    // 3분 초과 시 기본 구간 00:00~03:00
    if (dur > 180) {
      state.upload.segments[0].end = '03:00';
    } else {
      state.upload.segments[0].end = `${m}:${s}`;
    }
    renderSegments();
  };
}

function confirmUpload() {
  const label = document.getElementById('uploadModalLabel');
  if (!label.style.color.includes('2d9e5e')) {
    // 파일 미선택 상태면 무시
    closeUploadModal();
    return;
  }

  if (currentModalTarget === 'user') {
    state.upload.videoUploaded = true;
    // 메인 화면 썸네일 표시
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('uploadThumb').classList.add('show');
    document.getElementById('uploadDuration').textContent = state.upload.duration;
  } else {
    // 참고 영상 업로드 완료
    const tab  = state.activeTab === 0 ? 'upload' : 'rt';
    const prefix = tab;
    state[tab === 'upload' ? 'upload' : 'rt'].refUploaded = true;
    const statusEl = document.getElementById(`${prefix}-ref-status`);
    statusEl.textContent = '참고 영상 업로드 완료 ✓';
    statusEl.classList.add('uploaded');
  }
  closeUploadModal();
  // 파일 인풋 초기화
  document.getElementById('fileInput').value = '';
  label.textContent = '영상 업로드';
  label.style.color = '';
  document.getElementById('timelineWrap').style.display = 'none';
}

/* ── 링크 업로드 ── */
function confirmLink() {
  const url = document.getElementById('linkInput').value.trim();
  if (!url || !url.startsWith('http')) {
    showSnackbar('올바른 링크를 입력해 주세요.');
    return;
  }
  const tab    = state.activeTab === 0 ? 'upload' : 'rt';
  const prefix = state.activeTab === 0 ? 'upload' : 'rt';
  state[tab === 'upload' ? 'upload' : 'rt'].refUploaded = true;
  const statusEl = document.getElementById(`${prefix}-ref-status`);
  statusEl.textContent = '링크 업로드 완료 ✓';
  statusEl.classList.add('uploaded');
  document.getElementById('linkModal').classList.remove('open');
  document.getElementById('linkInput').value = '';
}

/* ── 분석 시작 ── */
function startAnalysis() {
  const isUpload = state.activeTab === 0;
  const s = isUpload ? state.upload : state.rt;
  const mode = isUpload ? 'upload' : 'realtime';

  // 선택 완료 검증
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

  // 로딩 화면으로 이동
  location.href = `/analyze/posture/loading?mode=${mode}`;
}

/* ── 스낵바 ── */
function showSnackbar(msg) {
  const sb = document.getElementById('snackbar');
  sb.textContent = msg;
  sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 3000);
}

/* ── mode 파라미터로 초기 탭 설정 ── */
document.addEventListener('DOMContentLoaded', () => {
  const mode = new URLSearchParams(location.search).get('mode');
  if (mode === 'realtime') switchTab(1);
});