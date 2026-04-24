const signupForm = document.getElementById("signup-form");
const sendCodeButton = document.getElementById("send-code-btn");
const checkUsernameButton = document.getElementById("check-username-btn");
const codeHelp = document.getElementById("code-help");
const usernameHelp = document.getElementById("username-help");
const signupMessage = document.getElementById("signup-message");

let verificationSent = false;
let verificationComplete = false;
let verifiedContact = "";

function getField(name) {
  return signupForm?.elements.namedItem(name);
}

function setMessage(element, message, type = "") {
  if (!element) return;
  element.textContent = message;
  element.className = `${element.className.split(" ")[0]}${type ? ` is-${type}` : ""}`;
}

function clearErrors() {
  document.querySelectorAll("[data-error-for]").forEach((node) => {
    node.textContent = "";
  });
}

function renderErrors(errors = {}) {
  clearErrors();
  Object.entries(errors).forEach(([field, message]) => {
    const target = document.querySelector(`[data-error-for="${field}"]`);
    if (target) target.textContent = message;
  });
}

function resetVerificationState() {
  verificationSent = false;
  verificationComplete = false;
  verifiedContact = "";
  if (sendCodeButton) {
    sendCodeButton.textContent = "인증";
    sendCodeButton.classList.remove("is-verified");
  }
  const contactField = getField("contact");
  const codeField = getField("verificationCode");
  if (contactField) contactField.readOnly = false;
  if (codeField) codeField.readOnly = false;
}

getField("contact")?.addEventListener("input", () => {
  if (verificationComplete || verificationSent) {
    resetVerificationState();
    setMessage(codeHelp, "연락처가 변경되어 인증을 다시 진행해 주세요.");
  }
});

sendCodeButton?.addEventListener("click", async (event) => {
  event.preventDefault();

  const contactField = getField("contact");
  const codeField = getField("verificationCode");
  const contact = String(contactField?.value || "").trim();
  const verificationCode = String(codeField?.value || "").trim();
  setMessage(codeHelp, "");

  if (verificationComplete && verifiedContact === contact) {
    setMessage(codeHelp, "이미 인증이 완료되었습니다.", "success");
    return;
  }

  try {
    if (!verificationSent) {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setMessage(codeHelp, result.message || "인증번호 발송에 실패했습니다.", "error");
        return;
      }

      verificationSent = true;
      sendCodeButton.textContent = "확인";
      codeField?.focus();
      setMessage(codeHelp, `${result.message} 인증번호: ${result.code}`, "success");
      return;
    }

    const response = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, verificationCode }),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setMessage(codeHelp, result.message || "인증번호 확인에 실패했습니다.", "error");
      return;
    }

    verificationComplete = true;
    verifiedContact = contact;
    sendCodeButton.textContent = "완료";
    sendCodeButton.classList.add("is-verified");
    contactField.readOnly = true;
    codeField.readOnly = true;
    setMessage(codeHelp, result.message, "success");
  } catch (error) {
    setMessage(codeHelp, "서버와 통신하지 못했습니다.", "error");
  }
});

checkUsernameButton?.addEventListener("click", async (event) => {
  event.preventDefault();

  const username = String(getField("username")?.value || "").trim();
  setMessage(usernameHelp, "");

  try {
    const response = await fetch("/api/auth/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const result = await response.json();
    setMessage(usernameHelp, result.message || "확인할 수 없습니다.", response.ok && result.ok ? "success" : "error");
  } catch (error) {
    setMessage(usernameHelp, "서버와 통신하지 못했습니다.", "error");
  }
});

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();
  setMessage(signupMessage, "");

  if (!verificationComplete) {
    renderErrors({ verificationCode: "본인 인증을 완료해 주세요." });
    setMessage(signupMessage, "인증번호 확인을 먼저 완료해 주세요.", "error");
    return;
  }

  const formData = new FormData(signupForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      renderErrors(result.errors || {});
      setMessage(signupMessage, "입력값을 확인해 주세요.", "error");
      return;
    }

    setMessage(signupMessage, "회원가입이 완료되었습니다. 완료 화면으로 이동합니다.", "success");
    window.location.href = result.redirectUrl || "/signup/complete";
  } catch (error) {
    setMessage(signupMessage, "서버와 통신하지 못했습니다.", "error");
  }
});
