let currentChat = "private";

function switchChat(type) {
  currentChat = type;

  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));

  if (type === "private") {
    document.querySelectorAll(".tab")[0].classList.add("active");
    document.getElementById("chatTitle").innerText = "김트레 트레이너 (1:1)";
  } else {
    document.querySelectorAll(".tab")[1].classList.add("active");
    document.getElementById("chatTitle").innerText = "구독자 그룹 채팅";
  }

  // 실제로는 여기서 채팅 데이터 다시 불러오기
}

function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value;

  if (!text) return;

  const container = document.getElementById("chatContainer");

  const msg = document.createElement("div");
  msg.className = "message me";
  msg.innerHTML = `<div class="msg">${text}</div>`;

  container.appendChild(msg);
  input.value = "";

  container.scrollTop = container.scrollHeight;
}