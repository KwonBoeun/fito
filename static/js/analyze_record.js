/* FITO - 기록분석 메인 JS */

/* ── 날짜 ── */
function renderDate() {
  const days = ['일','월','화','수','목','금','토'];
  const now = new Date();
  const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0'), d = String(now.getDate()).padStart(2,'0');
  document.getElementById('rcDate').textContent = `${y}.${m}.${d} (${days[now.getDay()]})`;
}

/* ── 스탯 ── */
function renderStats() {
  document.getElementById('statHeight').textContent = '175cm';
  document.getElementById('statWeight').textContent = '68kg';
  document.getElementById('statTime').textContent   = '01H 20M';
  document.getElementById('statKcal').textContent   = '0420kcal';
}

/* ── 레이더 차트 미리보기 ── */
function renderRadarPreview() {
  const MOCK_ME  = [80, 65, 70, 55, 90, 75];
  const MOCK_AVG = [60, 60, 60, 60, 60, 60];
  const LABELS   = ['지속시간','칼로리','강도','운동량','집중도','달성률'];

  const ctx = document.getElementById('radarPreviewChart').getContext('2d');
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: LABELS,
      datasets: [
        { label:'나', data: MOCK_ME,
          backgroundColor:'rgba(45,158,94,0.2)', borderColor:'#2d9e5e',
          borderWidth:2, pointBackgroundColor:'#2d9e5e', pointRadius:3 },
        { label:'평균', data: MOCK_AVG,
          backgroundColor:'rgba(0,0,0,0)', borderColor:'#ccc',
          borderWidth:1.5, borderDash:[4,4], pointRadius:2,
          pointBackgroundColor:'#ccc' }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:true,
      scales: { r: { min:0, max:110, ticks:{ display:false, stepSize:25 },
        grid:{ color:'rgba(0,0,0,0.08)' }, pointLabels:{ font:{size:11,weight:'600'}, color:'#555' } } },
      plugins: { legend:{ display:false } }
    }
  });

  // 한 줄 요약
  document.getElementById('workoutSummaryText').textContent = '지구력은 최고지만, 집중도가 낮아요.';
}

/* ── 균형도 색상 업데이트 ── */
function renderBalanceMap() {
  const scores = { upper:75, lower:55, core:40, cardio:30 };
  function color(s) {
    if (s >= 71) return '#2d9e5e';
    if (s >= 31) return '#f5a623';
    return '#e05c4b';
  }
  document.getElementById('upperPct').textContent = scores.upper + '%';
  document.getElementById('lowerPct').textContent = scores.lower + '%';
  document.getElementById('corePct').textContent  = scores.core  + '%';
  document.getElementById('cardPct').textContent  = scores.cardio+ '%';

  // 균형 여부 메시지
  const max = Math.max(...Object.values(scores));
  const min = Math.min(...Object.values(scores));
  const diff = max - min;
  let msg;
  if (diff >= 50) msg = '상체는 뜨겁지만 하체는 차가워요! 균형을 맞춰주세요.';
  else            msg = '균형이 아주 잘 잡힌 건강한 루틴입니다!';
  document.getElementById('balanceStatusMsg').textContent = msg;
}

/* ── 강점/취약점 미리보기 ── */
function renderStrengthPreview() {
  document.getElementById('strengthText').textContent =
    '꾸준함이 최고의 무기입니다. 최근 4주간 운동 빈도 지표가 매우 높습니다.';
  document.getElementById('weaknessText').textContent =
    '하체 운동량이 상체 대비 40% 부족합니다. 균형을 위해 스쿼트 비중을 높여보세요.';
}

document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  renderStats();
  renderRadarPreview();
  renderBalanceMap();
  renderStrengthPreview();
});