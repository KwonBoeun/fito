/* FITO - 사용자 기록 변화 JS */

let weightChart, timeChart, kcalChart;

function renderDate() {
  const days = ['일','월','화','수','목','금','토'];
  const now = new Date();
  const y = now.getFullYear(),
        m = String(now.getMonth()+1).padStart(2,'0'),
        d = String(now.getDate()).padStart(2,'0');
  document.getElementById('rcDate').textContent = `${y}.${m}.${d} (${days[now.getDay()]})`;
}

async function updateChartsByPeriod(startDate, endDate, period) {
  const p = period || 'week';
  document.getElementById('selectedPeriodLabel').textContent =
    { week:'이번 주', month:'1개월', '3month':'3개월', '6month':'6개월', year:'1년' }[p] || p;
  try {
    const res  = await fetch(`/api/workout/history?period=${p}`);
    const json = await res.json();
    if (!json.ok) return;
    renderCharts(json.data);
  } catch(e) { console.error('history 로드 실패:', e); }
}

function renderCharts(d) {
  const hasTime = d.time.some(v => v > 0);
  const hasKcal = d.kcal.some(v => v > 0);

  // 운동 시간 막대
  if (timeChart) timeChart.destroy();
  document.getElementById('timeEmpty').style.display = hasTime ? 'none' : 'flex';
  if (hasTime) {
    const avg    = d.time.reduce((a,b)=>a+b,0) / d.time.length;
    const colors = d.time.map(v => v >= avg ? '#000' : '#ccc');
    timeChart = new Chart(document.getElementById('timeChart').getContext('2d'), {
      type: 'bar',
      data: { labels: d.labels, datasets:[{ data: d.time, backgroundColor: colors, borderRadius:4 }] },
      options: {
        responsive:true, maintainAspectRatio:false,
        scales: {
          y:{ ticks:{ font:{size:10}, callback: v=>v+'분' }, grid:{ color:'rgba(0,0,0,0.05)' } },
          x:{ ticks:{ font:{size:10}, maxRotation:0 }, grid:{ display:false } }
        },
        plugins:{ legend:{ display:false } }
      }
    });
  }

  // 칼로리
  if (kcalChart) kcalChart.destroy();
  document.getElementById('kcalEmpty').style.display = hasKcal ? 'none' : 'flex';
  if (hasKcal) {
    kcalChart = new Chart(document.getElementById('kcalChart').getContext('2d'), {
      type: 'line',
      data: { labels: d.labels, datasets:[{
        data: d.kcal, borderColor:'#f5a623', backgroundColor:'rgba(245,166,35,0.15)',
        borderWidth:2, fill:true, tension:0.4, pointRadius:4, pointBackgroundColor:'#f5a623'
      }]},
      options: {
        responsive:true, maintainAspectRatio:false,
        scales: {
          y:{ min:0, ticks:{ font:{size:10}, callback: v=>v+'kcal' }, grid:{ color:'rgba(0,0,0,0.05)' } },
          x:{ ticks:{ font:{size:10}, maxRotation:0 }, grid:{ display:false } }
        },
        plugins:{ legend:{ display:false } }
      }
    });
  }

  // 체중은 별도 테이블 없으므로 empty
  document.getElementById('weightEmpty').style.display = 'flex';
  if (weightChart) weightChart.destroy();
}

document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  updateChartsByPeriod(null, null, 'week');
});