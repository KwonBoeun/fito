function addComment() {
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  if (!text) return;

  const list = document.getElementById('commentList');

  const item = document.createElement('div');
  item.className = 'comment-item';

  item.innerHTML = `
    <div class="comment-avatar">나</div>
    <div class="comment-body">
      <div class="comment-top">
        <span class="comment-name">나</span>
        <span class="comment-time">방금</span>
      </div>
      <div class="comment-text">${text}</div>
    </div>
  `;

  list.appendChild(item);
  input.value = '';
}