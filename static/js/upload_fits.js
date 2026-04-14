/* ===========================
   FITO - FITS Upload JS
   =========================== */

/* ════ 상태 ════ */
let videoFile     = null;
let videoDur      = 0;
let curTime       = 0;
let isPlaying     = false;
let activeTool    = null;
let trimStart     = 0;
let trimEnd       = 0;
let cutPoints     = [];
let textItems     = [];
let textColorSel  = '#ffffff';
let textSizeSel   = 'sm';
let selectedMusic = null;
let isDraggingTL  = false;
let isDraggingTR  = false;
let timelineW     = 280;
let animFrame     = null;

/* ════ DOM ════ */
const pickScreen     = document.getElementById('pick-screen');
const editor         = document.getElementById('editor');
const fileInput      = document.getElementById('file-input');
const pickBtn        = document.getElementById('pick-btn');
const previewVideo   = document.getElementById('preview-video');
const playOverlay    = document.getElementById('play-overlay');
const playIco        = document.getElementById('play-ico');
const pauseIco       = document.getElementById('pause-ico');
const curTimeEl      = document.getElementById('cur-time');
const totalTimeEl    = document.getElementById('total-time');
const doneBtnHdr     = document.getElementById('done-btn');
const textLayer      = document.getElementById('text-layer');
const musicBadge     = document.getElementById('music-badge');
const musicBadgeName = document.getElementById('music-badge-name');
const playhead       = document.getElementById('playhead');
const mainClip       = document.getElementById('main-clip');
const trimLeft       = document.getElementById('trim-left');
const trimRight      = document.getElementById('trim-right');
const timelineWrap   = document.getElementById('timeline-wrap');
const ruler          = document.getElementById('ruler');
const textTrackRow   = document.getElementById('text-track-row');
const textTrackBody  = document.getElementById('text-track-body');
const musicTrackRow  = document.getElementById('music-track-row');
const musicTrackBody = document.getElementById('music-track-body');
const infoSheet      = document.getElementById('info-sheet');
const uploadingOv    = document.getElementById('uploading-ov');
const uploadingBar   = document.getElementById('uploading-bar');
const uploadingPct   = document.getElementById('uploading-pct');
const uploadingLbl   = document.getElementById('uploading-label');
const doneOv         = document.getElementById('done-ov');

/* ════ 유틸 ════ */
const fmtSec = s => {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

/* ════ 파일 선택 ════ */
pickBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  videoFile = f;
  previewVideo.src = URL.createObjectURL(f);
  previewVideo.load();
});
previewVideo.addEventListener('loadedmetadata', () => {
  videoDur  = previewVideo.duration;
  trimStart = 0;
  trimEnd   = videoDur;
  totalTimeEl.textContent = fmtSec(videoDur);
  pickScreen.style.display = 'none';
  editor.style.display     = 'flex';
  editor.style.flexDirection = 'column';
  doneBtnHdr.disabled = false;
  buildRuler();
  updateClip();
  updatePlayhead();
});

/* ════ 재생/정지 ════ */
function togglePlay() {
  isPlaying ? previewVideo.pause() : previewVideo.play().catch(() => {});
}
previewVideo.addEventListener('play', () => {
  isPlaying = true;
  playOverlay.classList.add('playing');
  playIco.style.display  = 'none';
  pauseIco.style.display = '';
  startRAF();
});
previewVideo.addEventListener('pause', () => {
  isPlaying = false;
  playOverlay.classList.remove('playing');
  playIco.style.display  = '';
  pauseIco.style.display = 'none';
  cancelAnimationFrame(animFrame);
});
previewVideo.addEventListener('ended', () => {
  isPlaying = false;
  playOverlay.classList.remove('playing');
  playIco.style.display  = '';
  pauseIco.style.display = 'none';
});
previewVideo.addEventListener('timeupdate', () => {
  curTime = previewVideo.currentTime;
  curTimeEl.textContent = fmtSec(curTime);
  updatePlayhead();
});

playOverlay.addEventListener('click', togglePlay);

function startRAF() {
  const step = () => {
    updatePlayhead();
    if (isPlaying) animFrame = requestAnimationFrame(step);
  };
  animFrame = requestAnimationFrame(step);
}

/* ════ 타임라인 ════ */
function buildRuler() {
  ruler.innerHTML = '';
  if (!videoDur) return;
  const step = videoDur > 60 ? 10 : videoDur > 20 ? 5 : 2;
  for (let t = 0; t <= videoDur; t += step) {
    const tick = document.createElement('div');
    tick.className = 'fup-ruler-tick';
    tick.style.left = (t / videoDur * timelineW) + 'px';
    tick.textContent = fmtSec(t);
    ruler.appendChild(tick);
  }
}

function updateClip() {
  if (!videoDur) return;
  const left  = (trimStart / videoDur) * timelineW;
  const width = ((trimEnd - trimStart) / videoDur) * timelineW;
  mainClip.style.left  = left  + 'px';
  mainClip.style.width = width + 'px';
}

function updatePlayhead() {
  if (!videoDur) return;
  playhead.style.left = (curTime / videoDur * timelineW) + 'px';
}

/* 타임라인 클릭 seek */
timelineWrap.addEventListener('click', e => {
  if (!videoDur) return;
  const rect  = timelineWrap.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / timelineW;
  previewVideo.currentTime = Math.max(0, Math.min(videoDur, ratio * videoDur));
});

/* Trim 핸들 드래그 */
trimLeft.addEventListener('mousedown',  e => { isDraggingTL = true; e.stopPropagation(); });
trimRight.addEventListener('mousedown', e => { isDraggingTR = true; e.stopPropagation(); });
trimLeft.addEventListener('touchstart',  e => { isDraggingTL = true; e.stopPropagation(); }, {passive:true});
trimRight.addEventListener('touchstart', e => { isDraggingTR = true; e.stopPropagation(); }, {passive:true});
window.addEventListener('mousemove', onDragMove);
window.addEventListener('touchmove', e => onDragMove(e.touches[0]), {passive:true});
window.addEventListener('mouseup',  () => { isDraggingTL = isDraggingTR = false; });
window.addEventListener('touchend', () => { isDraggingTL = isDraggingTR = false; });

function onDragMove(e) {
  if (!isDraggingTL && !isDraggingTR) return;
  const rect  = timelineWrap.getBoundingClientRect();
  const t     = Math.max(0, Math.min(videoDur, (e.clientX - rect.left) / timelineW * videoDur));
  if (isDraggingTL) trimStart = Math.min(t, trimEnd - 0.5);
  if (isDraggingTR) trimEnd   = Math.max(t, trimStart + 0.5);
  updateClip();
}

/* ════ 툴 전환 ════ */
document.querySelectorAll('.fup-tool').forEach(btn => {
  btn.addEventListener('click', () => {
    const tool = btn.dataset.tool;
    const wasActive = btn.classList.contains('active');
    document.querySelectorAll('.fup-panel').forEach(p => p.classList.remove('open'));
    document.querySelectorAll('.fup-tool').forEach(b => b.classList.remove('active'));
    if (!wasActive) {
      btn.classList.add('active');
      activeTool = tool;
      const panel = document.getElementById(`panel-${tool}`);
      if (panel) panel.classList.add('open');
      if (tool === 'music') buildMusicList();
    } else {
      activeTool = null;
    }
  });
});

/* ════ 자르기 ════ */
document.getElementById('cut-here-btn').addEventListener('click', () => {
  if (!videoDur) return;
  cutPoints.push(curTime);
  cutPoints.sort((a, b) => a - b);
  renderCutMarkers();
});
document.getElementById('cut-undo-btn').addEventListener('click', () => {
  if (cutPoints.length) { cutPoints.pop(); renderCutMarkers(); }
});
function renderCutMarkers() {
  mainClip.querySelectorAll('.cut-marker').forEach(m => m.remove());
  cutPoints.forEach(t => {
    const m = document.createElement('div');
    m.className = 'cut-marker';
    m.style.left = ((t / videoDur) * timelineW - parseFloat(mainClip.style.left || 0)) + 'px';
    mainClip.appendChild(m);
  });
}

/* ════ 텍스트 ════ */
const TEXT_COLORS = ['#ffffff','#000000','#e8161c','#f59e0b','#16a34a','#2563eb','#9333ea'];
(function buildColorDots() {
  const container = document.getElementById('color-dots');
  TEXT_COLORS.forEach(c => {
    const dot = document.createElement('div');
    dot.className = 'fcolor-dot' + (c === textColorSel ? ' active' : '');
    dot.style.background = c;
    if (c === '#ffffff') dot.style.border = '1.5px solid #444';
    dot.addEventListener('click', () => {
      textColorSel = c;
      container.querySelectorAll('.fcolor-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
    container.appendChild(dot);
  });
})();

document.querySelectorAll('.fstyle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    textSizeSel = btn.dataset.size;
    document.querySelectorAll('.fstyle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.getElementById('text-add-btn').addEventListener('click', addText);
document.getElementById('text-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addText();
});

function addText() {
  const val = document.getElementById('text-input').value.trim();
  if (!val) return;
  const id = Date.now();
  textItems.push({ id, text: val, color: textColorSel, size: textSizeSel, x: 30, y: 40 });
  document.getElementById('text-input').value = '';
  renderTextLayer();
  renderTextTrack();
  renderTextItemList();
  textTrackRow.style.display = '';
}

function renderTextLayer() {
  textLayer.innerHTML = '';
  textItems.forEach(item => {
    const el = document.createElement('div');
    el.className = `fup-text-item ${item.size}`;
    el.textContent = item.text;
    el.style.color = item.color;
    el.style.left  = item.x + '%';
    el.style.top   = item.y + '%';
    let startX, startY, ox, oy;
    el.addEventListener('mousedown', e => {
      startX = e.clientX; startY = e.clientY; ox = item.x; oy = item.y;
      const move = mv => {
        const pw = textLayer.clientWidth, ph = textLayer.clientHeight;
        item.x = Math.max(0, Math.min(88, ox + (mv.clientX - startX) / pw * 100));
        item.y = Math.max(0, Math.min(88, oy + (mv.clientY - startY) / ph * 100));
        el.style.left = item.x + '%';
        el.style.top  = item.y + '%';
      };
      const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    });
    textLayer.appendChild(el);
  });
}

function renderTextTrack() {
  textTrackBody.innerHTML = '';
  textItems.forEach((item, i) => {
    const clip = document.createElement('div');
    clip.className = 'ftext-clip';
    clip.style.left  = (i * 50 + 4) + 'px';
    clip.style.width = '90px';
    clip.textContent = item.text;
    textTrackBody.appendChild(clip);
  });
}

function renderTextItemList() {
  const list = document.getElementById('text-item-list');
  list.innerHTML = '';
  textItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'ftext-item';
    row.innerHTML =
      `<span class="ftext-item-label" style="color:${item.color}">${item.text}</span>` +
      `<button class="ftext-item-del" data-id="${item.id}">✕</button>`;
    row.querySelector('.ftext-item-del').addEventListener('click', () => {
      textItems = textItems.filter(t => t.id !== item.id);
      renderTextLayer(); renderTextTrack(); renderTextItemList();
      if (!textItems.length) textTrackRow.style.display = 'none';
    });
    list.appendChild(row);
  });
}

/* ════ 배경음악 ════ */
const MUSIC_LIST = [
  { name:'에너지 업 비트',   dur:'2:30', id:'bgm1' },
  { name:'모닝 런 템포',     dur:'3:12', id:'bgm2' },
  { name:'파워 리프팅',      dur:'2:58', id:'bgm3' },
  { name:'요가 릴렉스',      dur:'4:05', id:'bgm4' },
  { name:'새벽 운동 바이브', dur:'3:44', id:'bgm5' },
  { name:'HIIT 익스플로전',  dur:'2:20', id:'bgm6' },
];

function buildMusicList() {
  const container = document.getElementById('music-list');
  container.innerHTML = '';
  MUSIC_LIST.forEach(m => {
    const item = document.createElement('div');
    item.className = 'fmusic-item' + (selectedMusic === m.id ? ' active' : '');
    item.innerHTML = `
      <div class="fmusic-icon">
        <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div class="fmusic-info">
        <div class="fmusic-name">${m.name}</div>
        <div class="fmusic-dur">${m.dur}</div>
      </div>
      <div class="fmusic-check">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>`;
    item.addEventListener('click', () => {
      selectedMusic = selectedMusic === m.id ? null : m.id;
      updateMusicBadge(selectedMusic ? m.name : null);
      renderMusicTrack(selectedMusic ? m : null);
      buildMusicList();
    });
    container.appendChild(item);
  });
}

function updateMusicBadge(name) {
  musicBadge.style.display = name ? 'flex' : 'none';
  if (name) musicBadgeName.textContent = name;
}

function renderMusicTrack(m) {
  musicTrackBody.innerHTML = '';
  if (!m) { musicTrackRow.style.display = 'none'; return; }
  musicTrackRow.style.display = '';
  const clip = document.createElement('div');
  clip.className = 'fmusic-clip';
  clip.style.left  = '0px';
  clip.style.width = timelineW + 'px';
  clip.textContent = m.name;
  musicTrackBody.appendChild(clip);
}

/* ════ 완료 버튼 → 정보 시트 ════ */
doneBtnHdr.addEventListener('click', () => {
  if (!videoFile) return;
  previewVideo.pause();
  infoSheet.style.display = 'flex';
});
document.getElementById('info-cancel').addEventListener('click', () => {
  infoSheet.style.display = 'none';
});

/* ════ 업로드 ════ */
document.getElementById('info-upload').addEventListener('click', async () => {
  const titleInput = document.getElementById('info-title');
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    titleInput.style.borderColor = '#e8161c';
    setTimeout(() => { titleInput.style.borderColor = ''; }, 1500);
    return;
  }
  const tagsRaw = document.getElementById('info-tags').value.trim();
  const tags    = tagsRaw ? tagsRaw.split(/\s+/).map(t => t.startsWith('#') ? t : '#' + t) : [];

  infoSheet.style.display   = 'none';
  uploadingOv.style.display = 'flex';

  const formData = new FormData();
  formData.append('video', videoFile, videoFile.name);

  try {
    const result = await uploadWithProgress(formData);
    const stored = JSON.parse(localStorage.getItem('fito_user_fits') || '[]');
    stored.unshift({
      title,
      author:   '나',
      tags,
      videoUrl: result.videoUrl,
      views:    0,
      h:        0,
      uploadedAt: Date.now(),
    });
    localStorage.setItem('fito_user_fits', JSON.stringify(stored));
    uploadingOv.style.display = 'none';
    doneOv.style.display      = 'flex';
  } catch (err) {
    console.error('Upload failed:', err);
    uploadingOv.style.display = 'none';
    alert('업로드 실패: ' + (err.message || '서버 오류'));
  }
});

function uploadWithProgress(formData) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/fits');
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        const pct = Math.round(e.loaded / e.total * 100);
        uploadingBar.style.width = pct + '%';
        uploadingPct.textContent = pct + '%';
        uploadingLbl.textContent = pct < 100 ? '업로드 중...' : '처리 중...';
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch(e) { reject(new Error('응답 파싱 실패')); }
      } else {
        reject(new Error('HTTP ' + xhr.status));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('네트워크 오류')));
    xhr.send(formData);
  });
}
