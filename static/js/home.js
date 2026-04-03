/**
 * home.js
 * FITO 메인 홈 화면 로직.
 * - 카테고리 전환
 * - 인기 / 추천 데이터 fetch → render
 * - 스크롤 숨김/표시
 * - 검색 오버레이
 * - 하단 네비게이션
 */

'use strict';

/* ════════════════════════════════════════
   상수
   ════════════════════════════════════════ */
const CAT_DEBOUNCE_MS = 500;

/* ════════════════════════════════════════
   상태
   ════════════════════════════════════════ */
let currentCat    = 'all';
let catDebouncing = false;
let lastScrollY   = 0;
let suggestTimer  = null;

/* ════════════════════════════════════════
   API 호출
   ════════════════════════════════════════ */
async function fetchPopular(category) {
  try {
    const res = await fetch(`/api/popular?category=${category}`);
    const json = await res.json();
    return json.data || {};
  } catch (e) {
    console.error('[fetchPopular]', e);
    return {};
  }
}

async function fetchRecommend(category, page = 1) {
  try {
    const res = await fetch(`/api/recommend?category=${category}&page=${page}`);
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('[fetchRecommend]', e);
    return [];
  }
}

async function fetchSuggest(q) {
  try {
    const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('[fetchSuggest]', e);
    return [];
  }
}

/* ════════════════════════════════════════
   인기 섹션 렌더
   ════════════════════════════════════════ */
function renderPopularAll(data, trackEl, dotsEl) {
  const parts = [];

  // 라이브
  if (data.live?.length)
    parts.push(renderPopLive(data.live[0]));

  // VOD
  if (data.vod?.length)
    parts.push(renderPopVod(data.vod[0]));

  // FITS (2개 한 카드)
  if (data.fits?.length)
    parts.push(renderPopFits(data.fits.slice(0, 2)));

  // 커뮤니티 (TOP1 단일)
  if (data.community?.length)
    parts.push(renderPopCommunity(data.community[0]));

  // 질문 (TOP2 박스)
  if (data.question?.length)
    parts.push(renderPopQuestion(data.question.slice(0, 2)));

  trackEl.innerHTML = parts.join('');
  renderDots(parts.length, dotsEl);
  bindSwipeDots(trackEl, dotsEl);
}

function renderPopularLive(data, trackEl, dotsEl) {
  const items = data.live || [];
  trackEl.innerHTML = items.map(d => renderPopLive(d)).join('');
  renderDots(items.length, dotsEl);
  bindSwipeDots(trackEl, dotsEl);
}

function renderPopularVod(data, trackEl, dotsEl) {
  const items = data.vod || [];
  trackEl.innerHTML = items.map(d => renderPopVod(d)).join('');
  renderDots(items.length, dotsEl);
  bindSwipeDots(trackEl, dotsEl);
}

function renderPopularFits(data, trackEl, dotsEl) {
  const items = data.fits || [];
  // 2개씩 묶어서 카드
  const cards = [];
  for (let i = 0; i < items.length; i += 2) {
    cards.push(renderPopFits(items.slice(i, i + 2)));
  }
  trackEl.innerHTML = cards.join('');
  renderDots(cards.length, dotsEl);
  bindSwipeDots(trackEl, dotsEl);
}

function renderPopularCommunity(data, trackEl, dotsEl) {
  const items = data.community || [];
  trackEl.innerHTML = items.map(d => renderPopCommunity(d)).join('');
  renderDots(items.length, dotsEl);
  bindSwipeDots(trackEl, dotsEl);
}

function renderPopularQuestion(data, trackEl, dotsEl) {
  const items = data.question || [];
  // TOP2 씩 묶어서 카드
  const cards = [];
  for (let i = 0; i < items.length; i += 2) {
    cards.push(renderPopQuestion(items.slice(i, i + 2)));
  }
  trackEl.innerHTML = cards.join('');
  renderDots(cards.length, dotsEl);
  bindSwipeDots(trackEl, dotsEl);
}

/* ════════════════════════════════════════
   추천 피드 렌더
   ════════════════════════════════════════ */
function renderFeed(feedEl, units, category) {
  if (!units.length) {
    feedEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px">콘텐츠가 없습니다</div>';
    return;
  }

  // community 탭 → 2열 masonry
  if (category === 'community') {
    const items = units.map(u => u.data || u);
    feedEl.innerHTML = renderCommunityGrid(items);
    return;
  }

  let html = '';
  units.forEach(unit => {
    const t = unit.type;
    const d = unit.data;

    if (t === 'live')       html += renderUnitLive(d);
    else if (t === 'vod')   html += renderUnitVod(d);
    else if (t === 'fits_group') html += renderUnitFitsGroup(d, 3);  // 전체탭 3열
    else if (t === 'fits_pair')  html += renderUnitFitsGroup(d, 2);  // FITS탭 2열
    else if (t === 'community')  html += renderUnitCommunity(d);
    else if (t === 'question')   html += renderUnitQuestion(d);
  });

  feedEl.innerHTML = html;
}

/* ════════════════════════════════════════
   카테고리 로드
   ════════════════════════════════════════ */
async function loadCategory(cat) {
  const popTrack  = document.getElementById(`pop${cap(cat)}`);
  const popDots   = document.getElementById(`dots${cap(cat)}`);
  const feedEl    = document.getElementById(`feed${cap(cat)}`);

  if (!popTrack || !feedEl) return;

  // 로딩 스켈레톤
  feedEl.innerHTML = skeletonHTML();

  const [popData, feedUnits] = await Promise.all([
    fetchPopular(cat),
    fetchRecommend(cat),
  ]);

  // 인기 렌더
  if      (cat === 'all')       renderPopularAll(popData, popTrack, popDots);
  else if (cat === 'live')      renderPopularLive(popData, popTrack, popDots);
  else if (cat === 'vod')       renderPopularVod(popData, popTrack, popDots);
  else if (cat === 'fits')      renderPopularFits(popData, popTrack, popDots);
  else if (cat === 'community') renderPopularCommunity(popData, popTrack, popDots);
  else if (cat === 'question')  renderPopularQuestion(popData, popTrack, popDots);

  // 추천 렌더
  renderFeed(feedEl, feedUnits, cat);
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function skeletonHTML() {
  return Array.from({length: 4}, () => `
    <div style="display:flex;gap:12px;margin-bottom:12px;height:90px;background:var(--glass-bg);
      border:1.5px solid var(--glass-border);border-radius:18px;overflow:hidden">
      <div class="skeleton" style="width:120px;flex-shrink:0;height:100%"></div>
      <div style="flex:1;padding:12px;display:flex;flex-direction:column;gap:8px">
        <div class="skeleton" style="height:14px;width:80%"></div>
        <div class="skeleton" style="height:12px;width:50%"></div>
        <div class="skeleton" style="height:10px;width:40%"></div>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════════
   카테고리 탭 전환
   ════════════════════════════════════════ */
function switchCat(btn, cat) {
  if (catDebouncing || cat === currentCat) return;

  catDebouncing = true;
  setTimeout(() => { catDebouncing = false; }, CAT_DEBOUNCE_MS);

  // 버튼 활성화
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // 패널 전환
  document.querySelectorAll('.screen-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`panel-${cat}`);
  if (panel) panel.classList.add('active');

  // 스크롤 초기화
  document.getElementById('scrollArea').scrollTop = 0;

  currentCat = cat;

  // 데이터 로드 (패널 내 피드가 비어있으면 로드)
  const feedEl = document.getElementById(`feed${cap(cat)}`);
  if (feedEl && !feedEl.innerHTML.trim()) {
    loadCategory(cat);
  }
}

/* ════════════════════════════════════════
   스크롤 → 카테고리탭 숨김/표시
   ════════════════════════════════════════ */
function initScrollBehavior() {
  const scrollArea = document.getElementById('scrollArea');
  const categoryTab = document.getElementById('categoryTab');

  scrollArea.addEventListener('scroll', () => {
    const curr = scrollArea.scrollTop;
    if (curr > lastScrollY && curr > 40) {
      categoryTab.classList.add('hidden');
    } else {
      categoryTab.classList.remove('hidden');
    }
    lastScrollY = curr;
  }, { passive: true });
}

/* ════════════════════════════════════════
   하단 네비게이션
   ════════════════════════════════════════ */
function initBottomNav() {
  const navLabels = { workout: '운동', group: '그룹', my: 'MY' };
  const navIcons  = { workout: '🏋️', group: '👥', my: '👤' };

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;

      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      if (nav === 'all') {
        // 홈으로 복귀
        document.querySelectorAll('.screen-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-all').classList.add('active');
        // 카테고리 탭도 '전체'로 복귀
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-cat="all"]').classList.add('active');
        currentCat = 'all';
        return;
      }

      // 기타 화면 (준비중)
      document.querySelectorAll('.screen-panel').forEach(p => p.classList.remove('active'));
      let tmpPanel = document.getElementById(`panel-${nav}`);
      if (!tmpPanel) {
        tmpPanel = document.createElement('div');
        tmpPanel.id = `panel-${nav}`;
        tmpPanel.className = 'screen-panel';
        tmpPanel.innerHTML = `
          <div class="coming-soon">
            <div class="cs-icon">${navIcons[nav] || '🔜'}</div>
            <h3>${navLabels[nav] || nav} 준비중</h3>
            <p>해당 화면의 기획서를<br>보내주시면 구현해드릴게요!</p>
          </div>`;
        document.getElementById('scrollArea').appendChild(tmpPanel);
      }
      tmpPanel.classList.add('active');
    });
  });

  // 업로드 버튼 (중앙)
  document.getElementById('navUpload').addEventListener('click', () => {
    alert('콘텐츠 업로드');
  });
}

/* ════════════════════════════════════════
   검색 오버레이
   ════════════════════════════════════════ */
function initSearch() {
  const overlay     = document.getElementById('searchOverlay');
  const input       = document.getElementById('searchInput');
  const cancelBtn   = document.getElementById('searchCancel');
  const recentSec   = document.getElementById('recentSection');
  const suggestList = document.getElementById('suggestList');
  const suggestItems = document.getElementById('suggestItems');

  // 검색 열기
  document.getElementById('btnSearch').addEventListener('click', openSearch);

  // 취소
  cancelBtn.addEventListener('click', closeSearch);

  // 입력
  input.addEventListener('input', () => {
    clearTimeout(suggestTimer);
    const val = input.value.trim();

    if (!val) {
      recentSec.style.display = '';
      suggestList.classList.remove('active');
      return;
    }

    recentSec.style.display = 'none';
    suggestTimer = setTimeout(async () => {
      const results = await fetchSuggest(val);
      if (results.length) {
        suggestItems.innerHTML = results.map(k =>
          `<div class="suggest-item">
             <i class="fa-solid fa-magnifying-glass"></i>
             ${k.replace(val, `<strong>${val}</strong>`)}
           </div>`
        ).join('');
      } else {
        suggestItems.innerHTML = '<div class="suggest-no-result">연관 검색어가 없습니다</div>';
      }
      suggestList.classList.add('active');
    }, 200);
  });

  function openSearch() {
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 120);
  }

  function closeSearch() {
    overlay.classList.remove('open');
    input.value = '';
    recentSec.style.display = '';
    suggestList.classList.remove('active');
  }
}

/* ════════════════════════════════════════
   카테고리 탭 버튼 이벤트
   ════════════════════════════════════════ */
function initCategoryTab() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => switchCat(btn, btn.dataset.cat));
  });
}

/* ════════════════════════════════════════
   상단바 버튼
   ════════════════════════════════════════ */
function initTopBar() {
  document.getElementById('btnAlarm').addEventListener('click',  () => alert('알림'));
  document.getElementById('btnUpload').addEventListener('click', () => alert('업로드'));
}

/* ════════════════════════════════════════
   초기화
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTopBar();
  initCategoryTab();
  initScrollBehavior();
  initBottomNav();
  initSearch();

  // 첫 진입 시 전체 탭 로드
  loadCategory('all');
});
