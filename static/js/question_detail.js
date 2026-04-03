/* ── FITO Question Detail JS ── */

const Q_DATA = [
  { id:1,  author:'jy_piece',   title:'스쿼트할 때 무릎이 아픈데 자세 문제일까요?', body:'스쿼트 할 때마다 무릎 안쪽이 아파서요. 발 너비나 발끝 방향 문제인지 궁금합니다.', tags:['#스쿼트','#자세교정'], likes:34, comments:12, bookmarks:8,  hasImg:true },
  { id:2,  author:'runnerkim',  title:'데드리프트 vs 스쿼트 뭘 먼저 하는게 좋아요?', body:'초보자인데 하체 운동 순서가 궁금합니다. 둘 다 중요해서 뭘 먼저 해야 할지 모르겠어요.', tags:['#데드리프트','#루틴'], likes:28, comments:9,  bookmarks:5,  hasImg:false },
  { id:3,  author:'diet_j',     title:'단백질 섭취 타이밍이 운동 전후 언제가 더 좋나요?', body:'운동 전에 먹으면 소화가 안 될 것 같고 운동 후에 먹으면 효과가 더 좋다고 하는데 실제로 차이 있나요?', tags:['#단백질','#영양'], likes:41, comments:22, bookmarks:15, hasImg:false },
  { id:4,  author:'homefit',    title:'하루에 유산소 몇 분이 적당한가요?', body:'다이어트 목적으로 유산소 운동을 하려고 하는데, 너무 많이 하면 근손실이 온다고 해서요.', tags:['#유산소','#다이어트'], likes:19, comments:7,  bookmarks:3,  hasImg:false },
  { id:5,  author:'squat_q',    title:'운동 루틴 좀 알려주세요 (주 3회)', body:'운동 시작한지 한 달 됐는데 어떤 순서로 운동해야 효과적인지 모르겠어요.', tags:['#초보자','#루틴'], likes:52, comments:31, bookmarks:18, hasImg:false },
  { id:8,  author:'jy_piece',   title:'이하은을 고발합니다', body:'pt 비용은 다 받아먹고 수업은 매번 지각하고 솔직히 뭘 가르치는지도 잘 모르겠네요. 혹시 저 트레이너 피해받으신 있으신가요? 있다면 같이 힘 합쳐서 환불 받고 싶어요 ㅠㅠ', tags:['#고발','#정트레'], likes:22, comments:4,  bookmarks:3,  hasImg:true },
];

const MOCK_ANSWERS = [
  { name:'momo', text:'저도 정트레한테 수업 받았어요 ㅠㅠ',
    likes:5, time:'3시간 전', accepted:false,
    replies:[
      { name:'jy_piece', text:'개인 연락 드렸어요.', likes:2, time:'2시간 전' },
      { name:'nayeonny', text:'수업 할때 항상 늦더라고 저 인간', likes:3, time:'1시간 전' },
    ]},
  { name:'m.by_sana', text:'무슨 저런 트레이너가 다 있데요...', likes:8, time:'4시간 전', accepted:false, replies:[] },
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

const HEART_IC = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

function renderAnswer(ans) {
  const repliesHtml = ans.replies.map(r => `
    <div class="reply-item">
      <div class="reply-pic"></div>
      <div class="comment-body">
        <div class="comment-author">${r.name}</div>
        <div class="comment-text">${r.text}</div>
        <div class="comment-meta"><span>${r.time}</span></div>
      </div>
    </div>`).join('');

  return `
    <div class="comment-item answer-item${ans.accepted?' accepted':''}">
      <div class="comment-pic"></div>
      <div class="comment-body">
        <div class="comment-author">
          ${ans.name}
          ${ans.accepted ? '<span class="accepted-badge">✓ 채택</span>' : ''}
        </div>
        <div class="comment-text">${ans.text}</div>
        <div class="comment-meta">
          <span>${fmt(ans.likes)} ${HEART_IC}</span>
          <span>${ans.time}</span>
          <button class="reply-toggle" onclick="toggleReplyQ(this)">답글 달기</button>
        </div>
        <div class="reply-input-q" style="display:none;margin-top:6px">
          <input type="text" placeholder="답글을 입력하세요" style="
            width:100%;border:none;border-bottom:1px solid var(--gray-300);
            outline:none;font-size:12px;padding:4px 0;font-family:inherit;background:none"/>
        </div>
        ${repliesHtml ? `<div class="reply-list">${repliesHtml}</div>` : ''}
      </div>
    </div>`;
}

window.toggleReplyQ = function(btn) {
  const wrap = btn.closest('.comment-body').querySelector('.reply-input-q');
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'block' : 'none';
  if (open) wrap.querySelector('input').focus();
};

function init() {
  const path = window.location.pathname;
  const id = parseInt(path.split('/').pop()) || 1;
  const post = Q_DATA.find(d => d.id === id) || Q_DATA[0];

  document.title = `FITO - ${post.title}`;
  document.getElementById('q-author').textContent = post.author;
  document.getElementById('q-title').textContent = post.title;
  document.getElementById('q-body').textContent = post.body;
  document.getElementById('like-cnt').textContent = fmt(post.likes);
  document.getElementById('comment-cnt').textContent = fmt(post.comments);
  document.getElementById('bookmark-cnt').textContent = fmt(post.bookmarks);
  document.getElementById('answer-title').textContent = `답변 ${MOCK_ANSWERS.length}개`;

  if (post.hasImg) document.getElementById('q-imgs').style.display = 'grid';

  const tagsEl = document.getElementById('q-tags');
  post.tags.forEach(t => {
    const s = document.createElement('span'); s.className = 'hashtag'; s.textContent = t;
    tagsEl.appendChild(s);
  });

  const answerList = document.getElementById('answer-list');
  MOCK_ANSWERS.forEach(a => { answerList.innerHTML += renderAnswer(a); });

  /* 좋아요 */
  let liked = false, likes = post.likes;
  document.getElementById('like-btn').addEventListener('click', function() {
    liked = !liked; likes += liked ? 1 : -1;
    document.getElementById('like-cnt').textContent = fmt(likes);
    this.classList.toggle('liked', liked);
  });

  /* 북마크 */
  let bookmarked = false, bookmarks = post.bookmarks;
  document.getElementById('bookmark-btn').addEventListener('click', function() {
    bookmarked = !bookmarked; bookmarks += bookmarked ? 1 : -1;
    document.getElementById('bookmark-cnt').textContent = fmt(bookmarks);
    this.classList.toggle('bookmarked', bookmarked);
  });

  /* 답변 작성 */
  const input = document.getElementById('comment-input');
  document.getElementById('comment-send').addEventListener('click', () => {
    if (!input.value.trim()) return;
    answerList.innerHTML += renderAnswer({
      name:'나', text:input.value.trim(), likes:0,
      time:'방금 전', accepted:false, replies:[]
    });
    input.value = '';
  });
  input.addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('comment-send').click(); });

  /* 더보기 팝업 */
  document.getElementById('more-btn').addEventListener('click', () =>
    document.getElementById('more-popup').classList.add('open'));
  document.getElementById('more-bg').addEventListener('click', () =>
    document.getElementById('more-popup').classList.remove('open'));

  /* 구독 토글 */
  const subBtn = document.getElementById('sub-btn');
  let subscribed = false;
  subBtn.addEventListener('click', () => {
    subscribed = !subscribed;
    subBtn.textContent = subscribed ? '구독 중' : '구독';
    subBtn.style.background = subscribed ? 'var(--black)' : 'var(--white)';
    subBtn.style.color = subscribed ? 'var(--white)' : 'var(--black)';
  });
}

document.addEventListener('DOMContentLoaded', init);
