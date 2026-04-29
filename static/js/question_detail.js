/* ── FITO Question Detail JS ── */

/* ── 임시 로그인 유저 ID (추후 세션으로 교체) ── */
const CURRENT_USER_ID = 1;

/* ── Q_DATA: API에 없을 때 폴백용 ── */
const Q_DATA = [
  { id:1,  author:'jy_piece',   title:'스쿼트할 때 무릎이 아픈데 자세 문제일까요?', body:'스쿼트 할 때마다 무릎 안쪽이 아파서요. 발 너비나 발끝 방향 문제인지 궁금합니다.', tags:['#스쿼트','#자세교정'], likes:34, comments:12, bookmarks:8,  hasImg:true },
  { id:2,  author:'runnerkim',  title:'데드리프트 vs 스쿼트 뭘 먼저 하는게 좋아요?', body:'초보자인데 하체 운동 순서가 궁금합니다. 둘 다 중요해서 뭘 먼저 해야 할지 모르겠어요.', tags:['#데드리프트','#루틴'], likes:28, comments:9,  bookmarks:5,  hasImg:false },
  { id:3,  author:'diet_j',     title:'단백질 섭취 타이밍이 운동 전후 언제가 더 좋나요?', body:'운동 전에 먹으면 소화가 안 될 것 같고 운동 후에 먹으면 효과가 더 좋다고 하는데 실제로 차이 있나요?', tags:['#단백질','#영양'], likes:41, comments:22, bookmarks:15, hasImg:false },
  { id:4,  author:'homefit',    title:'하루에 유산소 몇 분이 적당한가요?', body:'다이어트 목적으로 유산소 운동을 하려고 하는데, 너무 많이 하면 근손실이 온다고 해서요.', tags:['#유산소','#다이어트'], likes:19, comments:7,  bookmarks:3,  hasImg:false },
  { id:5,  author:'squat_q',    title:'운동 루틴 좀 알려주세요 (주 3회)', body:'운동 시작한지 한 달 됐는데 어떤 순서로 운동해야 효과적인지 모르겠어요.', tags:['#초보자','#루틴'], likes:52, comments:31, bookmarks:18, hasImg:false },
  { id:8,  author:'jy_piece',   title:'이하은을 고발합니다', body:'pt 비용은 다 받아먹고 수업은 매번 지각하고 솔직히 뭘 가르치는지도 잘 모르겠네요. 혹시 저 트레이너 피해받으신 있으신가요? 있다면 같이 힘 합쳐서 환불 받고 싶어요 ㅠㅠ', tags:['#고발','#정트레'], likes:22, comments:4,  bookmarks:3,  hasImg:true },
];

const fmt = n => {
  if (n >= 1e9) return (n/1e9).toFixed(1).replace(/\.0$/,'')+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
};
const timeAgo = h => {
  if (h < 1)    return `${Math.floor(h*60)}분 전`;
  if (h < 24)   return `${Math.floor(h)}시간 전`;
  if (h < 168)  return `${Math.floor(h/24)}일 전`;
  return `${Math.floor(h/168)}주 전`;
};

const HEART_IC = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

const questionId = parseInt(window.location.pathname.split('/').pop()) || 1;

/* ── renderAnswer: 기존 구조 유지 + data-answer-id + 답글 등록 버튼 추가 ── */
function renderAnswer(ans) {
  const repliesHtml = (ans.replies || []).map(r => `
    <div class="reply-item">
      <div class="reply-pic"></div>
      <div class="comment-body">
        <div class="comment-author">${r.name}</div>
        <div class="comment-text">${r.text}</div>
        <div class="comment-meta">
            <span>${r.time}</span>
            ${r._is_mine ? `<button onclick="deleteReply('${r._id}', this)" style="
              background:none;border:none;cursor:pointer;font-size:11px;
              color:#999;font-family:inherit;padding:0">삭제</button>` : ''}
          </div>
      </div>
    </div>`).join('');

  return `
    <div class="comment-item answer-item${ans.accepted?' accepted':''}" data-answer-id="${ans._id||''}">
      <div class="comment-pic"></div>
      <div class="comment-body">
        <div class="comment-author">
          ${ans.name}
          ${ans.accepted ? '<span class="accepted-badge">✓ 채택</span>' : ''}
        </div>
        <div class="comment-text">${ans.text}</div>
        <div class="comment-meta">
          <button class="ans-like-btn${ans._is_liked ? ' liked' : ''}" onclick="toggleAnswerLike(this)" style="
            background:none;border:none;cursor:pointer;padding:0;
            display:inline-flex;align-items:center;gap:3px;
            font-size:12px;color:${ans._is_liked ? '#e8161c' : '#999'};font-family:inherit">
            <svg width="12" height="12" viewBox="0 0 24 24"
              fill="${ans._is_liked ? '#e8161c' : 'none'}"
              stroke="${ans._is_liked ? '#e8161c' : 'currentColor'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="ans-like-cnt">${fmt(ans.likes)}</span>
          </button>
          <span>${ans.time}</span>
          <button class="reply-toggle" onclick="toggleReplyQ(this)">답글 달기</button>
          ${ans._is_mine ? `<button class="ans-del-btn" onclick="deleteAnswer('${ans._id}', this)" style="
            background:none;border:none;cursor:pointer;font-size:11px;
            color:#999;font-family:inherit;padding:0">삭제</button>` : ''}
          ${window._isQuestionAuthor && !ans._is_mine ? `<button onclick="acceptAnswer('${ans._id}', this)" style="
            background:none;border:none;cursor:pointer;font-size:11px;font-weight:700;
            color:${ans.accepted ? '#1a6b40' : '#999'};font-family:inherit;padding:0">
            ${ans.accepted ? '✓ 채택됨' : '채택하기'}</button>` : ''}
        </div>
        <div class="reply-input-q" style="display:none;margin-top:6px;flex-direction:row;align-items:center;gap:6px">
          <input type="text" placeholder="답글을 입력하세요" style="
            flex:1;border:none;border-bottom:1px solid var(--gray-300);
            outline:none;font-size:12px;padding:4px 0;font-family:inherit;background:none"/>
          <button onclick="submitReply(this)" style="
            flex-shrink:0;width:48px;border:none;background:var(--black);color:#fff;
            font-size:11px;font-weight:700;padding:5px 0;border-radius:4px;
            cursor:pointer;font-family:inherit">등록</button>
        </div>
        ${repliesHtml ? `<div class="reply-list">${repliesHtml}</div>` : '<div class="reply-list"></div>'}
      </div>
    </div>`;
}

/* ── 답변 좋아요 토글 ── */
window.toggleAnswerLike = async function(btn) {
  const answerItem = btn.closest('.answer-item');
  const answerId   = answerItem ? answerItem.dataset.answerId : null;
  if (!answerId) return;

  try {
    const res  = await fetch(`/api/questions/${questionId}/answers/${answerId}/like`, {
      method: 'POST', headers: { 'X-User-Id': String(CURRENT_USER_ID) },
    });
    const json = await res.json();
    if (json.status !== 'ok') return;

    const isLiked = json.data.is_liked;
    const count   = json.data.likes;
    const color   = isLiked ? '#e8161c' : '#999';
    const fill    = isLiked ? '#e8161c' : 'none';

    btn.style.color = color;
    btn.querySelector('svg').setAttribute('fill', fill);
    btn.querySelector('svg').setAttribute('stroke', color);
    btn.querySelector('.ans-like-cnt').textContent = fmt(count);
    btn.classList.toggle('liked', isLiked);
  } catch(e) {}
};

/* ── 답변 삭제 ── */
window.deleteAnswer = async function(answerId, btn) {
  if (!confirm('답변을 삭제할까요?')) return;
  try {
    const res  = await fetch(`/api/questions/${questionId}/answers/${answerId}`, {
      method: 'DELETE', headers: { 'X-User-Id': String(CURRENT_USER_ID) },
    });
    const json = await res.json();
    if (json.status !== 'ok') { alert(json.message); return; }

    btn.closest('.answer-item').remove();

    const cntEl = document.getElementById('comment-cnt');
    const raw   = Math.max(0, parseInt(cntEl.dataset.raw || 0) - 1);
    cntEl.dataset.raw = raw;
    cntEl.textContent = fmt(raw);

    const titleEl = document.getElementById('answer-title');
    const cur = parseInt(titleEl.textContent.replace(/[^0-9]/g, '')) - 1;
    titleEl.textContent = `답변 ${Math.max(0, cur)}개`;
  } catch(e) { alert('오류가 발생했습니다.'); }
};

/* ── 대댓글 삭제 ── */
window.deleteReply = async function(replyId, btn) {
  if (!confirm('대댓글을 삭제할까요?')) return;
  try {
    const answerItem = btn.closest('.answer-item');
    const answerId   = answerItem ? answerItem.dataset.answerId : null;
    if (!answerId) return;

    const res  = await fetch(`/api/questions/${questionId}/answers/${answerId}/replies/${replyId}`, {
      method: 'DELETE', headers: { 'X-User-Id': String(CURRENT_USER_ID) },
    });
    const json = await res.json();
    if (json.status !== 'ok') { alert(json.message); return; }

    btn.closest('.reply-item').remove();

    const cntEl = document.getElementById('comment-cnt');
    const raw   = Math.max(0, parseInt(cntEl.dataset.raw || 0) - 1);
    cntEl.dataset.raw = raw;
    cntEl.textContent = fmt(raw);
  } catch(e) { alert('오류가 발생했습니다.'); }
};

/* ── 답변 채택 ── */
window.acceptAnswer = async function(answerId, btn) {
  try {
    const res  = await fetch(`/api/questions/${questionId}/answers/${answerId}/accept`, {
      method: 'POST', headers: { 'X-User-Id': String(CURRENT_USER_ID) },
    });
    const json = await res.json();
    if (json.status !== 'ok') { alert(json.message); return; }

    const isAccepted = json.data.accepted;
    btn.textContent = isAccepted ? '✓ 채택됨' : '채택하기';
    btn.style.color  = isAccepted ? '#1a6b40' : '#999';

    // 채택 배지 업데이트
    const answerItem  = btn.closest('.answer-item');
    const authorEl    = answerItem.querySelector('.comment-author');
    const existBadge  = answerItem.querySelector('.accepted-badge');
    if (isAccepted && !existBadge) {
      const badge = document.createElement('span');
      badge.className   = 'accepted-badge';
      badge.textContent = '✓ 채택';
      authorEl.appendChild(badge);
    } else if (!isAccepted && existBadge) {
      existBadge.remove();
    }
  } catch(e) { alert('오류가 발생했습니다.'); }
};

/* ── 답글 입력창 토글 (기존 유지) ── */
window.toggleReplyQ = function(btn) {
  const wrap = btn.closest('.comment-body').querySelector('.reply-input-q');
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'flex' : 'none';
  if (open) wrap.querySelector('input').focus();
};

/* ── 답글 등록 (신규) ── */
window.submitReply = async function(btn) {
  const wrap     = btn.closest('.reply-input-q');
  const input    = wrap.querySelector('input');
  const body     = input.value.trim();
  const answerId = btn.closest('.answer-item').dataset.answerId;

  if (!body) return;

  /* answerId 없으면 (폴백 Q_DATA) 로컬만 추가 */
  if (!answerId) {
    const replyList = btn.closest('.comment-body').querySelector('.reply-list');
    const div = document.createElement('div');
    div.className = 'reply-item';
    div.innerHTML = `
      <div class="reply-pic"></div>
      <div class="comment-body">
        <div class="comment-author">나</div>
        <div class="comment-text">${body}</div>
        <div class="comment-meta"><span>방금 전</span></div>
      </div>`;
    replyList.appendChild(div);
    input.value = '';
    wrap.style.display = 'none';
    return;
  }

  try {
    const res  = await fetch(`/api/questions/${questionId}/answers/${answerId}/replies`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': String(CURRENT_USER_ID) },
      body:    JSON.stringify({ body }),
    });
    const json = await res.json();
    if (json.status !== 'ok') { alert(json.message); return; }

    const replyList = btn.closest('.comment-body').querySelector('.reply-list');
    const div = document.createElement('div');
    div.className = 'reply-item';
    div.innerHTML = `
      <div class="reply-pic"></div>
      <div class="comment-body">
        <div class="comment-author">${json.data.name}</div>
        <div class="comment-text">${json.data.text}</div>
        <div class="comment-meta"><span>${json.data.time}</span></div>
      </div>`;
    replyList.appendChild(div);

    /* 댓글 수 +1 */
    const cntEl = document.getElementById('comment-cnt');
    const raw   = parseInt(cntEl.dataset.raw || 0) + 1;
    cntEl.dataset.raw = raw;
    cntEl.textContent = fmt(raw);

    input.value = '';
    wrap.style.display = 'none';
  } catch(e) {
    alert('오류가 발생했습니다.');
  }
};

/* ── init ── */
async function init() {
  const id = questionId;

  /* 1. localStorage 질문 (id >= 20001) */
  if (id >= 20001) {
    let post = null;
    try {
      const stored = JSON.parse(localStorage.getItem('fito_user_question') || '[]');
      const v      = stored[id - 20001];
      if (v) post = { id, author:'나', title:v.title||'내 질문', body:v.body||'',
                      tags:v.tags||[], likes:0, comments:0, bookmarks:0, h:0,
                      hasImg:v.hasImg||false, isUserUploaded:true, _storageIdx:id-20001 };
    } catch(e) {}
    if (post) { renderPage(post, [], null); return; }
  }

  /* 2. API 호출 */
  try {
    const res  = await fetch(`/api/questions/${id}`, {
      headers: { 'X-User-Id': String(CURRENT_USER_ID) },
    });
    const json = await res.json();
    console.log('[질문 API 응답]', json);
    if (json.status === 'ok') { renderPage(json.data, json.data.answers || [], json.data); return; }
  } catch(e) {}

  /* 3. Q_DATA 폴백 */
  const post = Q_DATA.find(d => d.id === id) || Q_DATA[0];
  renderPage(post, [], null);
}

/* ── 페이지 렌더링 ── */
function renderPage(post, answers, apiData) {
  document.title = `FITO - ${post.title}`;
  window._isQuestionAuthor = apiData ? apiData.is_author : false;
  document.getElementById('q-author').textContent = post.author;
  document.getElementById('q-title').textContent  = post.title;
  document.getElementById('q-body').textContent   = post.body;

  const likeCntEl     = document.getElementById('like-cnt');
  const commentCntEl  = document.getElementById('comment-cnt');
  const bookmarkCntEl = document.getElementById('bookmark-cnt');

  likeCntEl.textContent     = fmt(post.likes     || 0);  likeCntEl.dataset.raw     = post.likes     || 0;
  commentCntEl.textContent  = fmt(post.comments  || 0);  commentCntEl.dataset.raw  = post.comments  || 0;
  bookmarkCntEl.textContent = fmt(post.bookmarks || 0);  bookmarkCntEl.dataset.raw = post.bookmarks || 0;

  // 댓글 아이콘 숫자와 '답변 N개' 텍스트를 실제 answers 수 기준으로 통일
  const actualCount = post.comments !== undefined ? post.comments : answers.length;
  commentCntEl.textContent  = fmt(actualCount);
  commentCntEl.dataset.raw  = actualCount;
  document.getElementById('answer-title').textContent = `답변 ${answers.length}개`;

  if (post.hasImg) document.getElementById('q-imgs').style.display = 'grid';

  const tagsEl = document.getElementById('q-tags');
  (post.tags || []).forEach(t => {
    const s = document.createElement('span'); s.className = 'hashtag'; s.textContent = t;
    tagsEl.appendChild(s);
  });

  /* 답변 목록 */
  const answerList = document.getElementById('answer-list');
  answerList.innerHTML = '';
  answers.forEach(a => { answerList.innerHTML += renderAnswer(a); });

  /* ── 좋아요 ── */
  let isLiked = apiData ? apiData.is_liked : false;
  const likeBtn = document.getElementById('like-btn');
  likeBtn.classList.toggle('liked', isLiked);

  likeBtn.addEventListener('click', async function() {
    if (!apiData) {
      isLiked = !isLiked;
      const raw = parseInt(likeCntEl.dataset.raw) + (isLiked ? 1 : -1);
      likeCntEl.dataset.raw = raw; likeCntEl.textContent = fmt(raw);
      likeBtn.classList.toggle('liked', isLiked);
      return;
    }
    try {
      const res  = await fetch(`/api/questions/${post.id}/like`, {
        method: 'POST', headers: { 'X-User-Id': String(CURRENT_USER_ID) },
      });
      const json = await res.json();
      console.log('[좋아요 API 응답]', json);
      if (json.status !== 'ok') { console.error('[좋아요 실패]', json.message); return; }
      isLiked = json.data.is_liked;
      likeCntEl.dataset.raw = json.data.likes; likeCntEl.textContent = fmt(json.data.likes);
      likeBtn.classList.toggle('liked', isLiked);
    } catch(e) {}
  });

  /* ── 북마크 ── */
  let isBookmarked = apiData ? apiData.is_bookmarked : false;
  const bookmarkBtn = document.getElementById('bookmark-btn');
  bookmarkBtn.classList.toggle('bookmarked', isBookmarked);

  bookmarkBtn.addEventListener('click', async function() {
    if (!apiData) {
      isBookmarked = !isBookmarked;
      const raw = parseInt(bookmarkCntEl.dataset.raw) + (isBookmarked ? 1 : -1);
      bookmarkCntEl.dataset.raw = raw; bookmarkCntEl.textContent = fmt(raw);
      bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
      return;
    }
    try {
      const res  = await fetch(`/api/questions/${post.id}/bookmark`, {
        method: 'POST', headers: { 'X-User-Id': String(CURRENT_USER_ID) },
      });
      const json = await res.json();
      if (json.status !== 'ok') return;
      isBookmarked = json.data.is_bookmarked;
      bookmarkCntEl.dataset.raw = json.data.bookmarks; bookmarkCntEl.textContent = fmt(json.data.bookmarks);
      bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
    } catch(e) {}
  });

  /* ── 답변 작성 ── */
  const input   = document.getElementById('comment-input');
  const sendBtn = document.getElementById('comment-send');

  const submitAnswer = async () => {
    const body = input.value.trim();
    if (!body) return;

    if (!apiData) {
      answerList.innerHTML += renderAnswer({ name:'나', text:body, likes:0, time:'방금 전', accepted:false, replies:[], _id:'' });
      const raw = parseInt(commentCntEl.dataset.raw) + 1;
      commentCntEl.dataset.raw = raw; commentCntEl.textContent = fmt(raw);
      document.getElementById('answer-title').textContent = `답변 ${answerList.querySelectorAll('.answer-item').length}개`;
      input.value = '';
      return;
    }

    try {
      const res  = await fetch(`/api/questions/${post.id}/answers`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': String(CURRENT_USER_ID) },
        body:    JSON.stringify({ body }),
      });
      const json = await res.json();
      if (json.status !== 'ok') { alert(json.message); return; }
      answerList.innerHTML += renderAnswer(json.data);
      const raw = parseInt(commentCntEl.dataset.raw) + 1;
      commentCntEl.dataset.raw = raw; commentCntEl.textContent = fmt(raw);
      document.getElementById('answer-title').textContent = `답변 ${answerList.querySelectorAll('.answer-item').length}개`;
      input.value = '';
    } catch(e) { alert('오류가 발생했습니다.'); }
  };

  sendBtn.addEventListener('click', submitAnswer);
  input.addEventListener('keydown', e => { if(e.key==='Enter') submitAnswer(); });

  /* ── 뒤로가기 → 질문 탭으로 이동 ── */
  const backBtn = document.querySelector('.back-btn, [onclick*="history.back"], .upost-back, .hdr-back');
  if (backBtn) {
    backBtn.removeAttribute('onclick');
    backBtn.addEventListener('click', e => {
      e.preventDefault();
      location.href = '/home?cat=question';
    });
  }

  /* ── 더보기 팝업 (기존 유지) ── */
  document.getElementById('more-btn').addEventListener('click', () =>
    document.getElementById('more-popup').classList.add('open'));
  document.getElementById('more-bg').addEventListener('click', () =>
    document.getElementById('more-popup').classList.remove('open'));

  /* ── 신고하기 (API 연동) ── */
  if (apiData) {
    const reportEl = [...document.querySelectorAll('.more-popup-item')]
                       .find(el => el.textContent.trim().includes('신고'));
    if (reportEl) {
      reportEl.addEventListener('click', async () => {
        document.getElementById('more-popup').classList.remove('open');
        const reason = prompt('신고 사유를 입력하세요.\n(spam / adult / abuse / other)');
        if (!reason) return;
        try {
          const res  = await fetch(`/api/questions/${post.id}/report`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'X-User-Id': String(CURRENT_USER_ID) },
            body:    JSON.stringify({ reason: reason.trim() }),
          });
          const json = await res.json();
          alert(json.status === 'ok' ? '신고가 접수되었습니다.' : json.message);
        } catch(e) { alert('오류가 발생했습니다.'); }
      });
    }
  }

  /* ── 삭제 메뉴 ── */
  const moreBox = document.querySelector('.more-popup-box');
  if (moreBox && (post.isUserUploaded || (apiData && apiData.is_author))) {
    const delItem = document.createElement('div');
    delItem.className = 'more-popup-item danger';
    delItem.textContent = '삭제하기';
    delItem.addEventListener('click', async () => {
      if (!confirm('질문을 삭제할까요?')) return;
      if (post.isUserUploaded) {
        try {
          const stored = JSON.parse(localStorage.getItem('fito_user_question') || '[]');
          stored.splice(post._storageIdx, 1);
          localStorage.setItem('fito_user_question', JSON.stringify(stored));
        } catch(e) {}
        location.href = '/'; return;
      }
      try {
        const res  = await fetch(`/api/questions/${post.id}`, {
          method: 'DELETE', headers: { 'X-User-Id': String(CURRENT_USER_ID) },
        });
        const json = await res.json();
        if (json.status === 'ok') location.href = '/';
        else alert(json.message);
      } catch(e) { alert('오류가 발생했습니다.'); }
    });
    moreBox.appendChild(delItem);
  }

  /* ── 구독 토글 (기존 유지) ── */
  const subBtn = document.getElementById('sub-btn');
  let subscribed = false;
  subBtn.addEventListener('click', () => {
    subscribed = !subscribed;
    subBtn.textContent = subscribed ? '구독 중' : '구독';
    subBtn.style.background = subscribed ? 'var(--black)' : 'var(--white)';
    subBtn.style.color       = subscribed ? 'var(--white)' : 'var(--black)';
  });
}

document.addEventListener('DOMContentLoaded', init);