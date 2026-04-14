const chats = {
  private: {
    title: "김트레 트레이너 (1:1)",
    messages: [
      { author: "trainer", name: "김트레", text: "오늘 운동 후 무릎 통증은 괜찮으셨어요?", time: "오후 2:10" },
      { author: "me", name: "나", text: "네, 어제보다 훨씬 괜찮아요.", time: "오후 2:12" },
      { author: "trainer", name: "김트레", text: "좋아요. 오늘은 스쿼트 중량은 유지하고 반복 수만 줄여볼게요.", time: "오후 2:13" }
    ]
  },
  group: {
    title: "구독자 그룹 채팅",
    messages: [
      { author: "trainer", name: "김트레", text: "오늘 저녁 8시에 하체 루틴 라이브 시작합니다.", time: "오전 11:20" },
      { author: "member", name: "민지", text: "준비해서 들어갈게요!", time: "오전 11:23" },
      { author: "me", name: "나", text: "식단 사진도 여기 올리면 될까요?", time: "오전 11:25" }
    ]
  }
};

let currentChat = "private";

const chatTitle = document.getElementById("chatTitle");
const chatContainer = document.getElementById("chatContainer");
const chatExtra = document.getElementById("chatExtra");
const extraToggle = document.getElementById("extraToggle");
const fileInput = document.getElementById("fileInput");
const cameraInput = document.getElementById("cameraInput");
const cameraReview = document.getElementById("cameraReview");
const cameraTitle = document.getElementById("cameraTitle");
const cameraStream = document.getElementById("cameraStream");
const cameraStatus = document.getElementById("cameraStatus");
const cameraCanvas = document.getElementById("cameraCanvas");
const cameraPreview = document.getElementById("cameraPreview");
const cameraClose = document.getElementById("cameraClose");
const cameraRetry = document.getElementById("cameraRetry");
const cameraCapture = document.getElementById("cameraCapture");
const cameraSend = document.getElementById("cameraSend");
const voiceReview = document.getElementById("voiceReview");
const voiceClose = document.getElementById("voiceClose");
const voiceTitle = document.getElementById("voiceTitle");
const voiceTimer = document.getElementById("voiceTimer");
const voiceStatus = document.getElementById("voiceStatus");
const voicePlayer = document.getElementById("voicePlayer");
const voiceRetry = document.getElementById("voiceRetry");
const voiceStop = document.getElementById("voiceStop");
const voiceSend = document.getElementById("voiceSend");
const scheduleModal = document.getElementById("scheduleModal");
const scheduleClose = document.getElementById("scheduleClose");
const scheduleAccept = document.getElementById("scheduleAccept");
const scheduleReject = document.getElementById("scheduleReject");
const scheduleTimeButton = document.getElementById("scheduleTimeButton");
const scheduleTimeInput = document.getElementById("scheduleTimeInput");
const scheduleTimeText = document.getElementById("scheduleTimeText");
const messageForm = document.getElementById("messageForm");
const msgInput = document.getElementById("msgInput");
const sendButton = document.getElementById("sendButton");
const tabs = Array.from(document.querySelectorAll(".tab"));
let pendingCameraSrc = "";
let cameraMediaStream = null;
let cameraOpenAttempt = 0;
let voiceMediaStream = null;
let voiceRecorder = null;
let voiceChunks = [];
let voiceBlobUrl = "";
let voiceStartedAt = 0;
let voiceTimerId = null;
let selectedScheduleText = "6월 15일 (수) 18:00";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCurrentTime() {
  const now = new Date();
  const period = now.getHours() >= 12 ? "오후" : "오전";
  const hour = now.getHours() % 12 || 12;
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${period} ${hour}:${minute}`;
}

function renderMessages() {
  const items = chats[currentChat].messages.map(message => {
    const isMe = message.author === "me";
    const initial = escapeHtml(message.name.slice(0, 1));

    if (message.type === "image") {
      return `
        <article class="message ${isMe ? "me" : "other"}">
          <div class="avatar">${initial}</div>
          <div class="msg-body">
            <div class="msg-name">${escapeHtml(message.name)}</div>
            <img class="msg-image" src="${message.src}" alt="전송한 이미지">
            <div class="msg-time">${message.time}</div>
          </div>
        </article>
      `;
    }

    if (message.type === "audio") {
      return `
        <article class="message ${isMe ? "me" : "other"}">
          <div class="avatar">${initial}</div>
          <div class="msg-body">
            <div class="msg-name">${escapeHtml(message.name)}</div>
            <div class="msg">
              <audio class="msg-audio" src="${message.src}" controls></audio>
            </div>
            <div class="msg-time">${message.time}</div>
          </div>
        </article>
      `;
    }

    return `
      <article class="message ${isMe ? "me" : "other"}">
        <div class="avatar">${initial}</div>
        <div class="msg-body">
          <div class="msg-name">${escapeHtml(message.name)}</div>
          <div class="msg">${escapeHtml(message.text)}</div>
          <div class="msg-time">${message.time}</div>
        </div>
      </article>
    `;
  }).join("");

  chatContainer.innerHTML = items;
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function switchChat(type) {
  if (!chats[type]) return;

  currentChat = type;
  chatTitle.textContent = chats[type].title;
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.chat === type));
  closeExtra();
  renderMessages();
}

function closeExtra() {
  chatExtra.classList.remove("active");
  extraToggle.classList.remove("active");
  extraToggle.setAttribute("aria-label", "추가 기능 열기");
}

function toggleExtra() {
  const isOpen = chatExtra.classList.toggle("active");
  extraToggle.classList.toggle("active", isOpen);
  extraToggle.setAttribute("aria-label", isOpen ? "추가 기능 닫기" : "추가 기능 열기");
}

function sendTextMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  chats[currentChat].messages.push({
    author: "me",
    name: "나",
    text,
    time: getCurrentTime()
  });

  msgInput.value = "";
  sendButton.disabled = true;
  closeExtra();
  renderMessages();
}

function sendImage(file) {
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = event => {
    chats[currentChat].messages.push({
      author: "me",
      name: "나",
      type: "image",
      src: event.target.result,
      time: getCurrentTime()
    });
    closeExtra();
    renderMessages();
    fileInput.value = "";
  };
  reader.readAsDataURL(file);
}

function addImageMessage(src) {
  chats[currentChat].messages.push({
    author: "me",
    name: "나",
    type: "image",
    src,
    time: getCurrentTime()
  });
  closeExtra();
  renderMessages();
}

function addAudioMessage(src) {
  chats[currentChat].messages.push({
    author: "me",
    name: "나",
    type: "audio",
    src,
    time: getCurrentTime()
  });
  closeExtra();
  renderMessages();
}

async function openCamera() {
  const attemptId = ++cameraOpenAttempt;
  closeExtra();
  pendingCameraSrc = "";
  cameraReview.classList.remove("captured");
  cameraStatus.classList.remove("hidden");
  cameraStatus.textContent = "카메라를 여는 중...";
  cameraPreview.removeAttribute("src");
  cameraTitle.textContent = "카메라";
  cameraReview.classList.add("active");
  cameraReview.setAttribute("aria-hidden", "false");
  cameraStream.onplaying = null;
  cameraStream.onerror = null;
  cameraStream.srcObject = null;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    closeCameraReview();
    cameraInput.value = "";
    cameraInput.click();
    return;
  }

  try {
    const stream = await getWorkingCameraStream();
    if (attemptId !== cameraOpenAttempt) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    await attachCameraStream(stream);
    setTimeout(() => {
      if (attemptId !== cameraOpenAttempt) return;
      if (!cameraReview.classList.contains("active") || cameraReview.classList.contains("captured")) return;
      if (cameraStream.videoWidth > 0 && cameraStream.readyState >= 3) return;
      cameraStatus.classList.remove("hidden");
      cameraStatus.textContent = "카메라 화면이 들어오지 않아요. 다른 앱이 카메라를 사용 중인지 확인해주세요.";
    }, 2500);
  } catch (error) {
    stopCameraStream();
    cameraStream.srcObject = null;
    cameraStatus.classList.remove("hidden");
    cameraStatus.textContent = cameraErrorMessage(error);
    console.error("Camera open failed:", error);
  }
}

async function getWorkingCameraStream() {
  const errors = [];
  const constraintsList = [{ video: true, audio: false }];

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices
      .filter(device => device.kind === "videoinput" && device.deviceId)
      .forEach(device => {
        constraintsList.push({
          video: { deviceId: { exact: device.deviceId } },
          audio: false
        });
      });
  } catch (error) {
    errors.push(error);
  }

  for (const constraints of constraintsList) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      errors.push(error);
    }
  }

  throw errors[errors.length - 1] || new Error("No camera stream available");
}

async function attachCameraStream(stream) {
  cameraMediaStream = stream;
  cameraStream.srcObject = stream;
  cameraStatus.textContent = "카메라 화면을 준비하는 중...";
  cameraStream.onplaying = () => {
    cameraStatus.classList.add("hidden");
  };
  cameraStream.onerror = () => {
    cameraStatus.classList.remove("hidden");
    cameraStatus.textContent = "카메라 화면을 표시하지 못했어요. 카메라가 다른 앱에서 사용 중인지 확인해주세요.";
  };
  await cameraStream.play();
  if (cameraStream.readyState >= 3 && cameraStream.videoWidth > 0) {
    cameraStatus.classList.add("hidden");
  }
}

function cameraErrorMessage(error) {
  const name = error && error.name ? error.name : "UnknownError";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "카메라 권한이 차단됐어요. 주소창 왼쪽 카메라 아이콘에서 허용으로 바꿔주세요.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "연결된 카메라를 찾지 못했어요. PC 카메라 연결과 Windows 카메라 설정을 확인해주세요.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "카메라를 다른 앱이 사용 중이거나 Windows에서 접근을 막고 있어요. 카메라 앱/회의 앱을 닫고 다시 시도해주세요.";
  }
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return "현재 카메라 설정을 사용할 수 없어요. 다른 카메라 장치로 다시 시도해주세요.";
  }
  return `카메라를 열 수 없어요. 오류: ${name}`;
}

function showCameraReview(src) {
  pendingCameraSrc = src;
  cameraPreview.src = src;
  cameraReview.classList.add("active");
  cameraReview.classList.add("captured");
  cameraReview.setAttribute("aria-hidden", "false");
  cameraTitle.textContent = "사진을 전송할까요?";
}

function closeCameraReview() {
  cameraOpenAttempt++;
  stopCameraStream();
  cameraReview.classList.remove("active");
  cameraReview.classList.remove("captured");
  cameraStatus.classList.remove("hidden");
  cameraReview.setAttribute("aria-hidden", "true");
  pendingCameraSrc = "";
  cameraStream.srcObject = null;
  cameraStream.onplaying = null;
  cameraStream.onerror = null;
  cameraPreview.removeAttribute("src");
}

function stopCameraStream() {
  if (!cameraMediaStream) return;
  cameraMediaStream.getTracks().forEach(track => track.stop());
  cameraMediaStream = null;
}

function captureCameraFrame() {
  if (!cameraStream.videoWidth || !cameraStream.videoHeight) return;

  cameraCanvas.width = cameraStream.videoWidth;
  cameraCanvas.height = cameraStream.videoHeight;
  const context = cameraCanvas.getContext("2d");
  context.drawImage(cameraStream, 0, 0, cameraCanvas.width, cameraCanvas.height);
  stopCameraStream();
  cameraStream.srcObject = null;
  showCameraReview(cameraCanvas.toDataURL("image/jpeg", 0.92));
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => switchChat(tab.dataset.chat));
});

extraToggle.addEventListener("click", toggleExtra);

document.querySelectorAll(".extra-item").forEach(item => {
  item.addEventListener("click", () => {
    if (item.dataset.action === "image") {
      fileInput.click();
      return;
    }

    if (item.dataset.action === "camera") {
      openCamera();
      return;
    }

    if (item.dataset.action === "voice") {
      startVoiceRecording();
      return;
    }

    if (item.dataset.action === "schedule") {
      openScheduleModal();
      return;
    }

    const label = item.querySelector("span:last-child").textContent;
    chats[currentChat].messages.push({
      author: "me",
      name: "나",
      text: `${label} 기능을 선택했어요.`,
      time: getCurrentTime()
    });
    closeExtra();
    renderMessages();
  });
});

fileInput.addEventListener("change", event => {
  sendImage(event.target.files[0]);
});

cameraInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = previewEvent => {
    showCameraReview(previewEvent.target.result);
  };
  reader.readAsDataURL(file);
});

cameraClose.addEventListener("click", closeCameraReview);

cameraCapture.addEventListener("click", captureCameraFrame);

cameraRetry.addEventListener("click", async () => {
  closeCameraReview();
  await openCamera();
});

cameraSend.addEventListener("click", () => {
  if (!pendingCameraSrc) return;
  addImageMessage(pendingCameraSrc);
  closeCameraReview();
  cameraInput.value = "";
});

async function startVoiceRecording() {
  closeExtra();
  resetVoiceRecording();
  voiceReview.classList.add("active");
  voiceReview.classList.remove("recorded");
  voiceReview.setAttribute("aria-hidden", "false");
  voiceTitle.textContent = "음성 녹음 중";
  voiceStatus.textContent = "마이크 권한을 확인하는 중...";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    voiceStatus.textContent = "이 브라우저에서는 음성 녹음을 지원하지 않아요.";
    voiceStop.disabled = true;
    return;
  }

  try {
    voiceMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    voiceChunks = [];
    voiceRecorder = new MediaRecorder(voiceMediaStream);
    voiceRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) voiceChunks.push(event.data);
    };
    voiceRecorder.onstop = finishVoiceRecording;
    voiceRecorder.start();
    voiceStartedAt = Date.now();
    voiceStatus.textContent = "녹음 중입니다.";
    voiceStop.disabled = false;
    updateVoiceTimer();
    voiceTimerId = setInterval(updateVoiceTimer, 500);
  } catch (error) {
    stopVoiceStream();
    voiceStatus.textContent = voiceErrorMessage(error);
    voiceStop.disabled = true;
    console.error("Voice recording failed:", error);
  }
}

function stopVoiceRecording() {
  if (!voiceRecorder || voiceRecorder.state === "inactive") return;
  voiceStatus.textContent = "녹음을 정리하는 중...";
  voiceRecorder.stop();
}

function finishVoiceRecording() {
  clearInterval(voiceTimerId);
  voiceTimerId = null;
  stopVoiceStream();

  if (voiceChunks.length === 0) {
    voiceStatus.textContent = "녹음된 음성이 없어요. 다시 시도해주세요.";
    return;
  }

  const blob = new Blob(voiceChunks, { type: voiceRecorder.mimeType || "audio/webm" });
  voiceBlobUrl = URL.createObjectURL(blob);
  voicePlayer.src = voiceBlobUrl;
  voiceReview.classList.add("recorded");
  voiceTitle.textContent = "음성을 전송할까요?";
  voiceStatus.textContent = "전송 전 녹음 파일을 재생해볼 수 있어요.";
}

function resetVoiceRecording() {
  clearInterval(voiceTimerId);
  voiceTimerId = null;
  if (voiceRecorder && voiceRecorder.state !== "inactive") {
    voiceRecorder.onstop = null;
    voiceRecorder.stop();
  }
  stopVoiceStream();
  if (voiceBlobUrl) URL.revokeObjectURL(voiceBlobUrl);
  voiceBlobUrl = "";
  voiceChunks = [];
  voiceRecorder = null;
  voiceTimer.textContent = "00:00";
  voicePlayer.removeAttribute("src");
  voiceStop.disabled = false;
}

function closeVoiceReview() {
  resetVoiceRecording();
  voiceReview.classList.remove("active");
  voiceReview.classList.remove("recorded");
  voiceReview.setAttribute("aria-hidden", "true");
}

function stopVoiceStream() {
  if (!voiceMediaStream) return;
  voiceMediaStream.getTracks().forEach(track => track.stop());
  voiceMediaStream = null;
}

function updateVoiceTimer() {
  const elapsed = Math.floor((Date.now() - voiceStartedAt) / 1000);
  const min = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const sec = String(elapsed % 60).padStart(2, "0");
  voiceTimer.textContent = `${min}:${sec}`;
}

function voiceErrorMessage(error) {
  const name = error && error.name ? error.name : "UnknownError";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "마이크 권한이 차단됐어요. 주소창 왼쪽 마이크 권한을 허용해주세요.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "연결된 마이크를 찾지 못했어요. PC 마이크 연결을 확인해주세요.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "마이크를 다른 앱이 사용 중이거나 Windows에서 접근을 막고 있어요.";
  }
  return `음성 녹음을 시작할 수 없어요. 오류: ${name}`;
}

voiceClose.addEventListener("click", closeVoiceReview);
voiceStop.addEventListener("click", stopVoiceRecording);
voiceRetry.addEventListener("click", startVoiceRecording);
voiceSend.addEventListener("click", () => {
  if (!voiceBlobUrl) return;
  addAudioMessage(voiceBlobUrl);
  voiceReview.classList.remove("active");
  voiceReview.classList.remove("recorded");
  voiceReview.setAttribute("aria-hidden", "true");
  voiceBlobUrl = "";
  voiceChunks = [];
  voiceRecorder = null;
});

function openScheduleModal() {
  closeExtra();
  scheduleModal.classList.add("active");
  scheduleModal.setAttribute("aria-hidden", "false");
}

function closeScheduleModal() {
  scheduleModal.classList.remove("active");
  scheduleModal.setAttribute("aria-hidden", "true");
}

function sendScheduleResponse(accepted) {
  chats[currentChat].messages.push({
    author: "me",
    name: "나",
    text: accepted
      ? `정기 트레이너 라이브 일정을 추가했어요. (${selectedScheduleText})`
      : "정기 트레이너 라이브 일정 추가를 거절했어요.",
    time: getCurrentTime()
  });
  closeScheduleModal();
  renderMessages();
}

function openSchedulePicker() {
  if (typeof scheduleTimeInput.showPicker === "function") {
    scheduleTimeInput.showPicker();
    return;
  }
  scheduleTimeInput.click();
  scheduleTimeInput.focus();
}

function formatScheduleDate(value) {
  if (!value) return selectedScheduleText;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return selectedScheduleText;
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}월 ${day}일 (${weekday}) ${hour}:${minute}`;
}

scheduleTimeButton.addEventListener("click", openSchedulePicker);
scheduleTimeInput.addEventListener("change", () => {
  selectedScheduleText = formatScheduleDate(scheduleTimeInput.value);
  scheduleTimeText.textContent = selectedScheduleText;
});

scheduleClose.addEventListener("click", closeScheduleModal);
scheduleAccept.addEventListener("click", () => sendScheduleResponse(true));
scheduleReject.addEventListener("click", () => sendScheduleResponse(false));

msgInput.addEventListener("input", () => {
  sendButton.disabled = msgInput.value.trim().length === 0;
});

msgInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendTextMessage();
  }
});

messageForm.addEventListener("submit", event => {
  event.preventDefault();
  sendTextMessage();
});

renderMessages();
