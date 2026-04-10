let currentChat = "private";

function switchChat(type) {
  currentChat = type;

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => tab.classList.remove("active"));

  if (type === "private") {
    tabs[0].classList.add("active");
    document.getElementById("chatTitle").innerText = "김트레 트레이너 (1:1)";
  } else {
    tabs[1].classList.add("active");
    document.getElementById("chatTitle").innerText = "구독자 그룹 채팅";
  }
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

function toggleExtra(){
  const extra = document.getElementById("chatExtra");
  const container = document.getElementById("chatContainer");

  extra.classList.toggle("active");
  container.classList.toggle("extra-open");
}

function selectFile(){
  document.getElementById("fileInput").click();
}

function selectImage(){
  const input = document.getElementById("fileInput");
  input.accept = "image/*";
  input.click();
}

document.addEventListener("DOMContentLoaded", function(){

  document.getElementById("fileInput").addEventListener("change", function(e){
    const file = e.target.files[0];

    if(file && file.type.startsWith("image/")){
      const reader = new FileReader();

      reader.onload = function(){
        const container = document.getElementById("chatContainer");

        const msg = document.createElement("div");
        msg.className = "message me";
        msg.innerHTML = `<img src="${reader.result}" style="max-width:150px;border-radius:10px;">`;

        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
      };

      reader.readAsDataURL(file);
    }
  });

});