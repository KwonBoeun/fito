/* ===========================
   FITO - 자세 분석 로딩 JS
   (URL 변수는 HTML에서 주입됨:
    URL_REALTIME, URL_REPORT, URL_POSTURE, MODE, isRealtime)
   =========================== */
// upload: 영상 업로드 분석, realtime: 실시간 분석 준비

  // 화면 텍스트 설정
  if (isRealtime) {
    document.getElementById('loadingHeaderTitle').textContent = '분석 준비 중';
    document.getElementById('loadingTitle').textContent = '실시간 분석을 준비하고 있어요';
    document.getElementById('exitModalTitle').textContent = '준비를 종료할까요?';
    document.getElementById('exitModalBody').textContent  = '지금 종료하면 분석 데이터가 삭제됩니다.';
    document.getElementById('continueBtn').textContent    = '분석 준비 기다리기';
  } else {
    document.getElementById('loadingTitle').textContent = '영상을 분석하고 있어요';
    document.getElementById('continueBtn').textContent  = '분석 이어서 하기';
  }

  /* ── 프로그레스 시뮬레이션 ── */
  let pct = 0;
  const labels = [
    '데이터를 불러오는 중입니다...',
    '골격 포인트를 인식하고 있어요...',
    '자세 각도를 계산하는 중이에요...',
    '결과를 정리하고 있어요...',
    '거의 다 됐어요!',
  ];
  let totalSec = isRealtime ? 20 : 120;
  let elapsed = 0;
  let warnShown = false, timeoutShown = false;

  const fill  = document.getElementById('progressFill');
  const pctEl = document.getElementById('progressPct');
  const timeEl= document.getElementById('progressTime');
  const lblEl = document.getElementById('progressLabel');

  function showSnackbar(msg) {
    const sb = document.getElementById('snackbar');
    sb.textContent = msg;
    sb.classList.add('show');
    setTimeout(() => sb.classList.remove('show'), 3000);
  }

  function formatSec(s) {
    const m = Math.floor(s / 60).toString().padStart(2,'0');
    const sec = (s % 60).toString().padStart(2,'0');
    return `${m}:${sec}`;
  }

  const timer = setInterval(() => {
    elapsed++;
    const remaining = Math.max(0, totalSec - elapsed);

    // 진행률 계산 (실제는 서버에서 받아야 하나, 시뮬레이션)
    pct = Math.min(Math.round((elapsed / totalSec) * 100), 99);
    fill.style.width = pct + '%';
    pctEl.textContent = pct + '%';
    timeEl.textContent = remaining > 0 ? `예상 ${formatSec(remaining)} 남음` : '거의 완료됐어요!';
    lblEl.textContent = labels[Math.min(Math.floor(pct/25), labels.length-1)];

    // 경고 문구 (영상: 4분, 실시간: 30초)
    const warnAt = isRealtime ? 30 : 240;
    if (elapsed === warnAt && !warnShown) {
      warnShown = true;
      document.getElementById('loadingSub').textContent =
        isRealtime
          ? '실시간 분석을 준비 중이에요. 조금만 더 기다려주세요.'
          : '영상 분석이 지연되고 있어요. 조금만 더 기다려주세요.';
    }

    // 타임아웃 (영상: 5분, 실시간: 1분)
    const timeoutAt = isRealtime ? 60 : 300;
    if (elapsed >= timeoutAt && !timeoutShown) {
      timeoutShown = true;
      clearInterval(timer);
      document.getElementById('errorTitle').textContent =
        isRealtime ? '분석 준비를 실패하였습니다' : '영상 분석을 실패하였습니다';
      document.getElementById('errorBody').textContent = '다시 시도해 주세요.';
      document.getElementById('errorModal').classList.add('open');
      return;
    }

    // 완료
    if (elapsed >= totalSec - 2) {
      clearInterval(timer);
      pct = 100;
      fill.style.width = '100%';
      pctEl.textContent = '100%';
      lblEl.textContent = '분석 완료!';
      setTimeout(() => {
        if (isRealtime) {
          location.href = URL_REALTIME;
        } else {
          location.href = URL_REPORT + "?mode=upload";
        }
      }, 600);
    }
  }, 1000);

  function showExitModal()  { document.getElementById('exitModal').classList.add('open'); }
  function closeExitModal() { document.getElementById('exitModal').classList.remove('open'); }
  function exitAnalysis()   { clearInterval(timer); location.href = URL_POSTURE; }
  function retryAnalysis()  {
    document.getElementById('errorModal').classList.remove('open');
    location.reload();
  }