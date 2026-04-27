/* FITO - 기록분석 메인 JS */

function renderDate() {
  const days = ['일','월','화','수','목','금','토'];
  const now = new Date();
  const y = now.getFullYear(),
        m = String(now.getMonth()+1).padStart(2,'0'),
        d = String(now.getDate()).padStart(2,'0');
  document.getElementById('rcDate').textContent = `${y}.${m}.${d} (${days[now.getDay()]})`;
}

async function loadSummary() {
  try {
    const res  = await fetch('/api/workout/summary');
    const json = await res.json();
    if (!json.ok) return;
    const d = json.data;

    // 스탯
    document.getElementById('statTime').textContent = d.stats.time;
    document.getElementById('statKcal').textContent = d.stats.kcal;

    // 레이더 미리보기
    const ctx = document.getElementById('radarPreviewChart').getContext('2d');
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['지속시간','칼로리','강도','운동량','집중도','달성률'],
        datasets: [
          { label:'나', data: d.radarScores,
            backgroundColor:'rgba(45,158,94,0.2)', borderColor:'#2d9e5e',
            borderWidth:2, pointRadius:3 },
          { label:'평균', data: [60,60,60,60,60,60],
            backgroundColor:'rgba(0,0,0,0)', borderColor:'#ccc',
            borderWidth:1.5, borderDash:[4,4], pointRadius:2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        scales: { r: { min:0, max:110, ticks:{ display:false },
          pointLabels:{ font:{size:11, weight:'600'}, color:'#555' } } },
        plugins: { legend:{ display:false } }
      }
    });

    // 데이터 없으면 empty 메시지 표시
    const hasData = d.radarScores.some(v => v > 0);
    document.getElementById('radarEmptyMsg').style.display = hasData ? 'none' : 'flex';
    document.getElementById('workoutSummaryText').textContent = d.workoutSummaryText;

    // 균형도
    const b = d.balance;
    document.getElementById('upperPct').textContent  = b.upper  + '%';
    document.getElementById('lowerPct').textContent  = b.lower  + '%';
    document.getElementById('corePct').textContent   = b.core   + '%';
    document.getElementById('cardPct').textContent   = b.cardio + '%';
    document.getElementById('balanceStatusMsg').textContent = d.balanceMsg;

    // 강점/취약점
    document.getElementById('strengthText').textContent = d.strengthText;
    document.getElementById('weaknessText').textContent = d.weaknessText;

  } catch(e) {
    console.error('summary 로드 실패:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  loadSummary();
});