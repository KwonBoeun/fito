/**
 * render.js
 * 각 콘텐츠 타입별 HTML 문자열 생성 함수.
 * home.js에서 호출해 DOM에 주입합니다.
 */

/* ── 숫자 포맷 ── */
function fmtNum(n) {
  const num = typeof n === 'number' ? n : parseInt(String(n).replace(/[^0-9]/g, '')) || 0;
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return String(num);
}

/* ── 해시태그 배열 → HTML ── */
function renderTags(tags, cls = 'card-hashtag', wrap = 'card-hashtags') {
  if (!tags || !tags.length) return '';
  const inner = tags.map(t => `<span class="${cls}">#${t}</span>`).join('');
  return `<div class="${wrap}">${inner}</div>`;
}

function renderUnitTags(tags) {
  if (!tags || !tags.length) return '';
  return tags.map(t => `<span class="unit-hashtag">#${t}</span>`).join('');
}

function renderFeedTags(tags) {
  if (!tags || !tags.length) return '';
  return `<div class="tag-row">${tags.map(t => `<span class="tag-item">#${t}</span>`).join('')}</div>`;
}

/* ════════════════════════════════════════
   인기 섹션 카드 (스와이프용)
   ════════════════════════════════════════ */

/** 라이브 인기 카드 */
function renderPopLive(d) {
  return `
  <div class="pop-card" onclick="alert('라이브 시청')">
    <div class="thumb-placeholder ${d.bg || 'bg-live1'}" style="height:190px">${d.emoji || '🏋️'}</div>
    <div class="pop-overlay"></div>
    <div class="card-info">
      <div class="live-badge"><div class="dot"></div>LIVE</div>
      <div class="card-title">${d.title}</div>
      <div class="card-meta">
        <span class="card-author">@${d.author}</span>
        <span class="card-viewers"><i class="fa-solid fa-eye" style="font-size:9px"></i> ${d.viewers_fmt || fmtNum(d.viewers)}명</span>
      </div>
      ${renderTags(d.tags)}
    </div>
  </div>`;
}

/** VOD 인기 카드 */
function renderPopVod(d) {
  return `
  <div class="pop-card" onclick="alert('VOD 시청')">
    <div class="thumb-placeholder ${d.bg || 'bg-vod1'}" style="height:190px">${d.emoji || '🎬'}</div>
    <div class="pop-overlay"></div>
    <div class="card-info">
      <span class="type-badge">VOD</span>
      <div class="card-title">${d.title}</div>
      <div class="card-meta">
        <span class="card-author">@${d.author}</span>
        <span class="card-viewers"><i class="fa-solid fa-play" style="font-size:9px"></i> ${d.views_fmt || fmtNum(d.views)}</span>
      </div>
      ${renderTags(d.tags)}
    </div>
  </div>`;
}

/** FITS 인기 카드 (2열 그리드 형태) */
function renderPopFits(items) {
  const cards = items.slice(0, 2).map(d => `
    <div style="position:relative;overflow:hidden;border-radius:0">
      <div class="thumb-placeholder ${d.bg || 'bg-fits1'}" style="height:190px;font-size:40px">${d.emoji || '⚡'}</div>
      <div class="pop-overlay"></div>
      <div class="card-info">
        <div class="card-title" style="font-size:12px">${d.title}</div>
        <div class="card-author">@${d.author}</div>
      </div>
    </div>`).join('');

  return `
  <div class="pop-card" onclick="alert('FITS 시청')" style="width:100%">
    <span class="type-badge" style="position:absolute;top:10px;left:10px;z-index:2">FITS</span>
    <div style="display:grid;grid-template-columns:1fr 1fr;height:190px;overflow:hidden;border-radius:var(--radius-card)">
      ${cards}
    </div>
  </div>`;
}

/** 커뮤니티 인기 카드 (단일) */
function renderPopCommunity(d) {
  return `
  <div class="pop-card" onclick="alert('커뮤니티 게시글')" style="width:100%">
    <div class="thumb-placeholder ${d.bg || 'bg-comm1'}" style="height:190px">${d.emoji || '💪'}</div>
    <div class="pop-overlay"></div>
    <div class="card-info">
      <span class="type-badge">커뮤니티</span>
      <div class="card-meta" style="margin-bottom:5px">
        <div class="avatar-xs">${d.avatar || '?'}</div>
        <span class="card-author">@${d.name}</span>
        <span class="card-author" style="color:rgba(255,255,255,0.5)">· ${d.time}</span>
      </div>
      <div class="card-title">${d.text}</div>
      ${renderTags(d.tags)}
      <div style="display:flex;gap:10px;margin-top:6px">
        <span style="font-size:10px;color:rgba(255,255,255,0.8)">❤️ ${fmtNum(d.likes)}</span>
        <span style="font-size:10px;color:rgba(255,255,255,0.8)">💬 ${fmtNum(d.comments)}</span>
        <span style="font-size:10px;color:rgba(255,255,255,0.8)">🔖 ${fmtNum(d.bookmarks)}</span>
      </div>
    </div>
  </div>`;
}

/** 질문 인기 카드 (2열 박스) */
function renderPopQuestion(items) {
  const boxes = items.slice(0, 2).map(d => `
    <div style="background:rgba(255,255,255,0.06);border-radius:12px;padding:12px;">
      <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:5px;line-height:1.3">${d.title}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.5)">💬 ${d.comments} · ❤️ ${d.likes}</div>
    </div>`).join('');

  return `
  <div class="pop-card" onclick="alert('질문 게시글')" style="width:100%">
    <div style="padding:20px;height:190px;background:linear-gradient(135deg,#1A1A2E,#2D3561);
      display:flex;flex-direction:column;justify-content:space-between;border-radius:var(--radius-card)">
      <div>
        <span class="type-badge" style="background:rgba(79,142,247,0.3);color:#A0BFFF;margin-bottom:10px">질문</span>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${boxes}</div>
      </div>
      ${renderTags(items[0]?.tags)}
    </div>
  </div>`;
}

/* ════════════════════════════════════════
   추천 피드 유닛
   ════════════════════════════════════════ */

/** 라이브 유닛 (가로형) */
function renderUnitLive(d) {
  return `
  <div class="unit-card-h" onclick="alert('라이브 시청')">
    <div class="unit-thumb-h ${d.bg || 'bg-live1'}">${d.emoji || '🏋️'}</div>
    <div class="unit-content-h">
      <div>
        <div class="mini-live-badge"><div class="dot"></div>LIVE</div>
        <div class="unit-title">${d.title}</div>
      </div>
      <div>
        <div class="unit-author">@${d.author}</div>
        <div class="unit-bottom-row">
          <div class="unit-hashtags">${renderUnitTags(d.tags)}</div>
          <div class="unit-stat-live"><i class="fa-solid fa-eye" style="font-size:9px"></i>${d.viewers_fmt || fmtNum(d.viewers)}명</div>
        </div>
      </div>
    </div>
  </div>`;
}

/** VOD 유닛 (가로형) */
function renderUnitVod(d) {
  return `
  <div class="unit-card-h" onclick="alert('VOD 시청')">
    <div class="unit-thumb-h ${d.bg || 'bg-vod1'}" style="position:relative">
      ${d.emoji || '🎬'}
      <div style="position:absolute;bottom:5px;right:5px;background:rgba(0,0,0,0.65);color:#fff;
        font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px">▶</div>
    </div>
    <div class="unit-content-h">
      <div class="unit-title">${d.title}</div>
      <div>
        <div class="unit-author">@${d.author}</div>
        <div class="unit-bottom-row">
          <div class="unit-hashtags">${renderUnitTags(d.tags)}</div>
          <div class="unit-stat-vod"><i class="fa-solid fa-play" style="font-size:9px"></i>${d.views_fmt || fmtNum(d.views)}</div>
        </div>
      </div>
    </div>
  </div>`;
}

/** FITS 유닛 그룹 (3열 또는 2열) */
function renderUnitFitsGroup(items, cols = 3) {
  const cls = cols === 2 ? 'fits-2col' : 'fits-3col';
  const cards = items.map(d => `
    <div class="unit-fits-item" onclick="alert('FITS 시청')">
      <div class="fits-thumb">
        <div class="fits-thumb-inner ${d.bg || 'bg-fits1'}">${d.emoji || '⚡'}</div>
      </div>
      <div class="fits-overlay"></div>
      <div class="fits-info">
        <div class="fits-title">${d.title}</div>
        <div class="fits-author-row">
          <div class="avatar-xs">${(d.author || '?')[0]}</div>
          <span>@${d.author}</span>
        </div>
      </div>
    </div>`).join('');
  return `<div class="unit-fits-group ${cls}">${cards}</div>`;
}

/** 커뮤니티 유닛 (카드형) */
function renderUnitCommunity(d) {
  return `
  <div class="unit-community" onclick="alert('커뮤니티 게시글')">
    <div class="comm-header">
      <div class="comm-author-row">
        <div class="avatar-sm">${d.avatar || '?'}</div>
        <div>
          <div class="comm-name">${d.name}</div>
          <div class="comm-time">${d.time}</div>
        </div>
      </div>
      <div style="font-size:16px;cursor:pointer;color:var(--text-muted)">···</div>
    </div>
    <div class="comm-body">
      <div class="comm-text">${d.text}</div>
      <div class="comm-img ${d.bg || 'bg-comm1'}">${d.emoji || '💪'}</div>
    </div>
    ${renderFeedTags(d.tags)}
    <div class="reaction-row">
      <div class="reaction-item liked"><i class="fa-solid fa-heart"></i>${fmtNum(d.likes)}</div>
      <div class="reaction-item"><i class="fa-regular fa-comment"></i>${fmtNum(d.comments)}</div>
      <div class="reaction-item"><i class="fa-regular fa-bookmark"></i>${fmtNum(d.bookmarks)}</div>
    </div>
  </div>`;
}

/** 커뮤니티 2열 masonry grid */
function renderCommunityGrid(items) {
  const col1 = [], col2 = [];
  items.forEach((d, i) => {
    const h = 90 + (i % 3) * 30;
    const card = `
    <div class="comm-grid-item" onclick="alert('커뮤니티 게시글')">
      <div class="comm-grid-thumb ${d.bg || 'bg-comm1'}" style="height:${h}px">${d.emoji || '💪'}</div>
      <div class="comm-grid-info">
        <div class="comm-grid-author">
          <div class="avatar-xs">${d.avatar || '?'}</div>
          <span>${d.name}</span>
        </div>
        <div class="comm-grid-stats">
          <span>❤️ ${fmtNum(d.likes)}</span>
          <span>💬 ${fmtNum(d.comments)}</span>
        </div>
      </div>
    </div>`;
    if (i % 2 === 0) col1.push(card);
    else             col2.push(card);
  });
  return `
  <div class="comm-grid">
    <div class="comm-grid-col">${col1.join('')}</div>
    <div class="comm-grid-col offset">${col2.join('')}</div>
  </div>`;
}

/** 질문 유닛 */
function renderUnitQuestion(d) {
  return `
  <div class="unit-question" onclick="alert('질문 게시글')">
    <div class="q-title">${d.title}</div>
    <div class="q-body">${d.body}</div>
    ${renderFeedTags(d.tags)}
    <div class="reaction-row">
      <div class="reaction-item"><i class="fa-regular fa-heart"></i>${d.likes}</div>
      <div class="reaction-item"><i class="fa-regular fa-comment"></i>${d.comments}</div>
      <div class="reaction-item"><i class="fa-regular fa-bookmark"></i>${d.bookmarks}</div>
      <div class="q-time">${d.time}</div>
    </div>
  </div>`;
}

/* ════════════════════════════════════════
   스와이프 dot 렌더
   ════════════════════════════════════════ */
function renderDots(count, dotsEl) {
  dotsEl.innerHTML = Array.from({length: count}, (_, i) =>
    `<div class="swipe-dot ${i === 0 ? 'active' : ''}"></div>`
  ).join('');
}

function bindSwipeDots(trackEl, dotsEl) {
  const dots = dotsEl.querySelectorAll('.swipe-dot');
  if (!dots.length) return;
  trackEl.addEventListener('scroll', () => {
    const idx = Math.round(trackEl.scrollLeft / trackEl.clientWidth);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, { passive: true });
}
