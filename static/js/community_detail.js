/* ── FITO Community Detail JS ── */

const COM_DATA = [
  { id:1,  author:'nayeonny',  content:'한동안 일정 과다로\n가족바프 이후 첫 운동 기록\n시간 참 빠르다!', tags:['#오운완'], likes:212, comments:16, bookmarks:3,  h:7,  imgCount:2 },
  { id:2,  author:'fitking',   content:'오늘도 완료 💪 데드 120kg 처음 성공했어요!', tags:['#데드리프트','#PR'], likes:341, comments:28, bookmarks:12, h:3,  imgCount:1 },
  { id:3,  author:'pilates_j', content:'필라테스 3개월 차 몸 변화 공유해요. 확실히 코어가 강해진 게 느껴져요', tags:['#필라테스','#바디체인지'], likes:1204, comments:87, bookmarks:54, h:15, imgCount:3 },
  { id:4,  author:'diet_min',  content:'오늘 식단 공유! 닭가슴살은 이제 지겨워서 색다르게 해봤어요', tags:['#식단','#다이어트'], likes:567, comments:43, bookmarks:21, h:22, imgCount:2 },
  { id:5,  author:'runnerkim', content:'첫 하프마라톤 완주! 2시간 12분 기록 달성 🏃', tags:['#마라톤','#달리기'], likes:892, comments:61, bookmarks:38, h:10, imgCount:1 },
];

const MOCK_COMMENTS = [
  { name:'momo', text:'잘보고 갑니다~^^', likes:3, isOwner:false,
    replies:[{ name:'nayeonny', text:'감사해요 ☺️', likes:1, isOwner:true }] },
  { name:'m.by_sana', text:'바프 어쨌어!?', likes:2, isOwner:false, replies:[] },
  { name:'coreking', text:'같이 운동해요 💪', likes:1, isOwner:false, replies:[] },
];

const fmt = n => {
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

let post = null;

/* 이미지 슬라이더 */
function initImageSlider(imgCount) {
  const track = document.getElementById('img-track');
  const dotsEl = document.getElementById('img-dots');
  if (imgCount <= 1) { dotsEl.style.display = 'none'; return; }

  track.innerHTML = '';
  for (let i = 0; i < imgCount; i++) {
    track.innerHTML += `<div class="com-img-item"></div>`;
  }
  dotsEl.innerHTML = Array.from({length:imgCount},(_,i)=>
    `<div class="com-img-dot${i===0?' active':''}"></div>`).join('');

  let cur = 0, tx = 0;
  const dots = dotsEl.querySelectorAll('.com-img-dot');

  function go(n) {
    cur = Math.max(0, Math.min(imgCount-1, n));
    track.style.transform = `translateX(-${cur*100}%)`;
    dots.forEach((d,i) => d.classList.toggle('active', i===cur));
  }

  const slider = document.getElementById('img-slider');
  slider.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
  slider.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 30) go(cur + (dx > 0 ? 1 : -1));
  });
}

/* 댓글 렌더 */
function renderComment(c, isOwner) {
  const HEART_IC = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  const authorClass = isOwner ? 'owner' : '';
  let repliesHtml = '';
  if (c.replies && c.replies.length) {
    repliesHtml = `<div class="reply-list">
      ${c.replies.map(r => `
        <div class="reply-item">
          <div class="reply-pic"></div>
          <div class="comment-body">
            <div class="comment-author"><span class="${r.isOwner?'owner':''}">${r.name}</span></div>
            <div class="comment-text">${r.text}</div>
          </div>
        </div>`).join('')}
    </div>`;
  }
  return `
    <div class="comment-item">
      <div class="comment-pic"></div>
      <div class="comment-body">
        <div class="comment-author"><span class="${authorClass}">${c.name}</span></div>
        <div class="comment-text">${c.text}</div>
        <div class="comment-meta">
          <span>${fmt(c.likes)} ${HEART_IC}</span>
          <button class="reply-toggle" onclick="toggleReply(this)">
            답글 달기
          </button>
        </div>
        <div class="reply-input" style="display:none;margin-top:6px">
          <input type="text" placeholder="답글을 입력하세요" style="
            width:100%;border:none;border-bottom:1px solid var(--gray-300);
            outline:none;font-size:12px;padding:4px 0;font-family:inherit;background:none"/>
        </div>
        ${repliesHtml}
      </div>
    </div>`;
}

window.toggleReply = function(btn) {
  const wrap = btn.closest('.comment-body').querySelector('.reply-input');
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'block' : 'none';
  if (open) wrap.querySelector('input').focus();
};

function init() {
  const path = window.location.pathname;
  const id = parseInt(path.split('/').pop()) || 1;

  /* id >= 10001 이면 유저 업로드 커뮤니티 → localStorage 탐색 */
  if (id >= 10001) {
    try {
      const stored = JSON.parse(localStorage.getItem('fito_user_community') || '[]');
      const idx    = id - 10001;
      const v      = stored[idx];
      if (v) {
        post = {
          id,
          author:   v.author   || '나',
          content:  v.content  || '',
          tags:     v.tags     || [],
          likes:    0, comments: 0, bookmarks: 0, h: 0,
          imgCount: v.hasImg ? 1 : 0,
          isUserUploaded: true,
          _storageIdx: idx,
        };
      }
    } catch(e) {}
  }

  if (!post) post = COM_DATA.find(d => d.id === id) || COM_DATA[0];

  document.title = `FITO - ${post.author}`;
  document.getElementById('com-author').textContent = post.author;
  document.getElementById('com-time').textContent = timeAgo(post.h);
  document.getElementById('com-content').textContent = post.content;
  document.getElementById('like-cnt').textContent = fmt(post.likes);
  document.getElementById('comment-cnt').textContent = fmt(post.comments);
  document.getElementById('bookmark-cnt').textContent = fmt(post.bookmarks);
  document.getElementById('comment-title').textContent = `댓글 ${fmt(post.comments)}개`;

  const tagsEl = document.getElementById('com-tags');
  post.tags.forEach(t => {
    const s = document.createElement('span'); s.className = 'hashtag'; s.textContent = t;
    tagsEl.appendChild(s);
  });

  initImageSlider(post.imgCount || 1);

  /* 댓글 */
  const list = document.getElementById('comment-list');
  MOCK_COMMENTS.forEach(c => {
    list.innerHTML += renderComment(c, c.name === post.author);
  });

  /* 좋아요 */
  let liked = false;
  document.getElementById('like-btn').addEventListener('click', function() {
    liked = !liked;
    post.likes += liked ? 1 : -1;
    document.getElementById('like-cnt').textContent = fmt(post.likes);
    this.classList.toggle('liked', liked);
  });

  /* 북마크 */
  let bookmarked = false;
  document.getElementById('bookmark-btn').addEventListener('click', function() {
    bookmarked = !bookmarked;
    post.bookmarks += bookmarked ? 1 : -1;
    document.getElementById('bookmark-cnt').textContent = fmt(post.bookmarks);
    this.classList.toggle('bookmarked', bookmarked);
  });

  /* 구독 토글 */
  const subBtn = document.getElementById('sub-btn');
  let subscribed = false;
  subBtn.addEventListener('click', () => {
    subscribed = !subscribed;
    subBtn.textContent = subscribed ? '구독 중' : '구독';
    subBtn.style.background = subscribed ? 'var(--black)' : 'var(--white)';
    subBtn.style.color = subscribed ? 'var(--white)' : 'var(--black)';
  });
  /* 댓글 작성 */
  const input = document.getElementById('comment-input');
  document.getElementById('comment-send').addEventListener('click', () => {
    if (!input.value.trim()) return;
    list.innerHTML += renderComment({ name:'나', text:input.value.trim(), likes:0, replies:[] }, false);
    post.comments++;
    document.getElementById('comment-cnt').textContent = fmt(post.comments);
    document.getElementById('comment-title').textContent = `댓글 ${fmt(post.comments)}개`;
    input.value = '';
  });
  input.addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('comment-send').click(); });

  /* 더보기 팝업 */
  document.getElementById('more-btn').addEventListener('click', () =>
    document.getElementById('more-popup').classList.add('open'));
  document.getElementById('more-bg').addEventListener('click', () =>
    document.getElementById('more-popup').classList.remove('open'));

  /* 내 게시물이면 삭제 메뉴 추가 */
  if (post.isUserUploaded) {
    const moreBox = document.getElementById('more-box');
    const delItem = document.createElement('div');
    delItem.className = 'more-popup-item danger';
    delItem.textContent = '삭제하기';
    delItem.addEventListener('click', () => {
      if (!confirm('게시물을 삭제할까요?')) return;
      try {
        const stored = JSON.parse(localStorage.getItem('fito_user_community') || '[]');
        stored.splice(post._storageIdx, 1);
        localStorage.setItem('fito_user_community', JSON.stringify(stored));
      } catch(e) {}
      location.href = '/';
    });
    moreBox.appendChild(delItem);
  }
}

document.addEventListener('DOMContentLoaded', init);
