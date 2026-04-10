/* ===========================
   FITO - 트레이너 홈 JS
   =========================== */

/* ── 댓글 기능 ── */
function addComment() {
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  
  if (!text) {
    alert('댓글을 입력해주세요.');
    return;
  }

  const commentList = document.getElementById('commentList');
  const newComment = document.createElement('div');
  newComment.className = 'comment-item';
  newComment.innerHTML = `
    <div class="comment-avatar">나</div>
    <div class="comment-body">
      <div class="comment-top">
        <span class="comment-name">나</span>
        <span class="comment-time">방금</span>
      </div>
      <div class="comment-text">${text}</div>
    </div>
  `;

  commentList.insertBefore(newComment, commentList.firstChild);
  input.value = '';
}

/* ── 엔터키로 댓글 등록 ── */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('commentInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addComment();
      }
    });
  }

  // 진행중인 라이브 참여하기 버튼
  const liveJoinBtn = document.querySelector('.live-join');
  if (liveJoinBtn) {
    liveJoinBtn.addEventListener('click', () => {
      // URL 파라미터에서 트레이너 ID 가져오기
      const urlParams = new URLSearchParams(window.location.search);
      const trainerId = urlParams.get('id') || '1';
      window.location.href = `/pt/live?id=${trainerId}`;
    });
  }
});

function goToChat() {
  window.location.href = "/trainer/chat";
}