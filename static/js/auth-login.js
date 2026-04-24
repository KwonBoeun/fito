const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

function setLoginMessage(message, type = "") {
  loginMessage.textContent = message;
  loginMessage.className = `feedback${type ? ` is-${type}` : ""}`;
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoginMessage("");

  const formData = new FormData(loginForm);
  const payload = {
    username: String(formData.get("username") || "").trim(),
    password: String(formData.get("password") || ""),
  };

  if (!payload.username || !payload.password) {
    setLoginMessage("아이디와 비밀번호를 모두 입력해 주세요.", "error");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setLoginMessage(result.message || "로그인에 실패했습니다.", "error");
      return;
    }

    setLoginMessage(result.message, "success");
    window.location.href = result.redirectUrl || "/analyze";
  } catch (error) {
    setLoginMessage("서버와 통신하지 못했습니다.", "error");
  }
});
