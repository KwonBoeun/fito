/* FITO - 사용자 기록 변화 JS */

let weightChart, timeChart, kcalChart;
let currentPeriod = 'week';

/* ── Mock 데이터 ── */
const MOCK = {
  week: {
    labels: ['03.21','03.22','03.23','03.24','03.25','03.26','03.27'],
    weight: [68.2, 68.0, 67.8, 67.9, 68.1, 67.7, 67.5],
    time:   [45,   60,   0,    90,   30,   75,   80],
    kcal:   [320,  410,  0,    580,  220,  500,  530],
  },
  month: {
    labels: ['03.01','03.05','03.10','03.15','03.20','03.27'],
    weight: [69.2, 68.8, 68.5, 68.1, 67.9, 67.5],
    time:   [55,   48,   62,   70,   58,   75],
    kcal:   [380,  340,  420,  470,  400,  530],
  },
  '3month': {
    labels: ['2025.01','2025.02','2025.03'],
    weight: [70.1, 69.0, 67.5],
    time:   [52,   58,   66],
    kcal:   [360,  400,  460],
  },
  '6month': {
    labels: ['2024.10','2024.11','2024.12','2025.01','2025.02','2025.03'],
    weight: [71.5, 71.0, 70.5, 70.1, 69.0, 67.5],
    time:   [40,   45,   50,   52,   58,   66],
    kcal:   [280,  310,  340,  360,  400,  460],
  },
  year: {
    labels: ['04','05','06','07','08','09','10','11','12','01','02','03'],
    weight: [73,  72.5,72,  71.8,71.2,71,  71.5,71,  70.5,70.1,69,  67.5],
    time:   [35,  38,  42,  44,  46,  48,  40,  45,  50,  52,  58,  66],
    kcal:   [240, 260, 280, 300, 310, 320, 280, 310, 340, 360, 400, 460],
  }
};

/* ── 날짜 ── */
function renderDate() {
  const days = ['일','월','화','수','목','금','토'];
  const now = new Date();
  const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0'), d = String(now.getDate()).padStart(2,'0');
  document.getElementById('rcDate').textContent = `${y}.${m}.${d} (${days[now.getDay()]})`;
}

/* ── 기간 선택 ── */
function setPeriod(p, btn) {
  currentPeriod = p;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  updateAllCharts();
}

/* ── 체중 변화량 뱃지 ── */
function updateWeightBadge(data) {
  const diff = (data[data.length-1] - data[0]).toFixed(1);
  const badge = document.getElementById('weightBadge');
  if (diff < 0) {
    badge.textContent = `총 ${Math.abs(diff)}kg 감량`;
    badge.className = 'change-badge badge-down';
  } else if (diff > 0) {
    badge.textContent = `총 ${diff}kg 증량`;
    badge.className = 'change-badge badge-up';
  } else {
    badge.textContent = '변화 없음';
    badge.className = 'change-badge badge-none';
  }
}

/* ── 차트 업데이트 ── */
function updateAllCharts() {
  const d = MOCK[currentPeriod];

  // 체중 선 그래프
  if (weightChart) weightChart.destroy();
  const wCtx = document.getElementById('weightChart').getContext('2d');
  const minW = Math.min(...d.weight) - 2;
  const maxW = Math.max(...d.weight) + 2;
  weightChart = new Chart(wCtx, {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [{
        data: d.weight, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)',
        borderWidth: 2, pointRadius: 5, pointHoverRadius: 7,
        pointBackgroundColor: '#3b82f6', fill: true, tension: 0.4
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: {
        y: { min: minW, max: maxW, ticks:{ font:{size:10} }, grid:{ color:'rgba(0,0,0,0.05)' } },
        x: { ticks:{ font:{size:10}, maxRotation:0 }, grid:{ display:false } }
      },
      plugins: {
        legend:{ display:false },
        tooltip:{ callbacks:{ label: ctx => `${ctx.parsed.y}kg` } }
      },
      onClick(e, items) {
        if (!items.length) return;
        const i = items[0].index;
        const el = document.getElementById('weightTooltip');
        const prev = i > 0 ? (d.weight[i] - d.weight[i-1]).toFixed(1) : null;
        const diff = prev !== null ? (prev < 0 ? `전일 대비 ${prev}kg` : `전일 대비 +${prev}kg`) : '첫 기록';
        el.style.display = 'block';
        el.textContent = `[${d.labels[i]}] 체중: ${d.weight[i]}kg (${diff})`;
      }
    }
  });
  updateWeightBadge(d.weight);

  // 운동 시간 막대 그래프
  if (timeChart) timeChart.destroy();
  const tCtx = document.getElementById('timeChart').getContext('2d');
  const avgPrev = d.time.reduce((a,b)=>a+b,0)/d.time.length;
  const colors = d.time.map(v => v >= avgPrev ? '#000' : '#ccc');
  timeChart = new Chart(tCtx, {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [{
        data: d.time, backgroundColor: colors, borderRadius: 4
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: {
        y: { ticks:{ font:{size:10}, callback: v => v+'분' }, grid:{ color:'rgba(0,0,0,0.05)' } },
        x: { ticks:{ font:{size:10}, maxRotation:0 }, grid:{ display:false } }
      },
      plugins: {
        legend:{ display:false },
        tooltip:{ callbacks:{ label: ctx => `${ctx.parsed.y}분` } }
      }
    }
  });

  // 칼로리 영역 그래프
  if (kcalChart) kcalChart.destroy();
  const kCtx = document.getElementById('kcalChart').getContext('2d');
  kcalChart = new Chart(kCtx, {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [{
        data: d.kcal, borderColor: '#f5a623',
        backgroundColor: 'rgba(245,166,35,0.15)',
        borderWidth: 2, fill: true, tension: 0.4,
        pointRadius: 4, pointBackgroundColor: '#f5a623'
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: {
        y: { min:0, ticks:{ font:{size:10}, callback: v => v+'kcal' }, grid:{ color:'rgba(0,0,0,0.05)' } },
        x: { ticks:{ font:{size:10}, maxRotation:0 }, grid:{ display:false } }
      },
      plugins: { legend:{ display:false }, tooltip:{ callbacks:{ label: ctx=>`${ctx.parsed.y}kcal` } } }
    }
  });
}

/* ── 달력 ── */
let calYear, calMonth;
function openCal() {
  const now = new Date();
  calYear = now.getFullYear(); calMonth = now.getMonth();
  renderCalGrid();
  document.getElementById('calOverlay').classList.add('open');
  document.getElementById('calPopup').classList.add('open');
}
function closeCal() {
  document.getElementById('calOverlay').classList.remove('open');
  document.getElementById('calPopup').classList.remove('open');
}
function prevMonth() { calMonth--; if (calMonth < 0) { calMonth=11; calYear--; } renderCalGrid(); }
function nextMonth() { calMonth++; if (calMonth > 11) { calMonth=0; calYear++; } renderCalGrid(); }
function setCalPeriod(p, btn) {
  document.querySelectorAll('.cal-period-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  setPeriod(p, document.querySelector(`.period-btn[onclick*="${p}"]`));
  closeCal();
}
function renderCalGrid() {
  document.getElementById('calTitle').textContent = `${calYear}년 ${calMonth+1}월`;
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const lastDate = new Date(calYear, calMonth+1, 0).getDate();
  const today = new Date();
  const grid = document.getElementById('calGrid');
  // 요일 헤더
  const dayLabels = ['일','월','화','수','목','금','토'];
  let html = dayLabels.map(d=>`<div class="cal-day-label">${d}</div>`).join('');
  // 빈 칸
  for (let i=0; i<firstDay; i++) html += `<div></div>`;
  for (let d=1; d<=lastDate; d++) {
    const isToday = (calYear===today.getFullYear() && calMonth===today.getMonth() && d===today.getDate());
    const isFuture = new Date(calYear,calMonth,d) > today;
    const cls = isFuture ? 'cal-day disabled' : isToday ? 'cal-day today' : 'cal-day';
    const onClick = isFuture ? '' : `onclick="selectCalDay(${calYear},${calMonth+1},${d})"`;
    html += `<div class="${cls}" ${onClick}>${d}</div>`;
  }
  grid.innerHTML = html;
}
function selectCalDay(y,m,d) { closeCal(); }

document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  updateAllCharts();
});