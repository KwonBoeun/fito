/* FITO - 사용자 기록 변화 JS */

let weightChart, timeChart, kcalChart;
let currentStartDate = null;
let currentEndDate   = null;
let currentPeriod    = 'week';

function renderDate() {
  const days = ['일','월','화','수','목','금','토'];
  const now = new Date();
  const y = now.getFullYear(),
        m = String(now.getMonth()+1).padStart(2,'0'),
        d = String(now.getDate()).padStart(2,'0');
  document.getElementById('rcDate').textContent = `${y}.${m}.${d} (${days[now.getDay()]})`;
}

// 로컬 날짜 포맷 (timezone 문제 방지)
function fmtDate(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}

async function updateChartsByPeriod(startDate, endDate, period) {
  currentPeriod    = period || 'week';
  currentStartDate = startDate || null;
  currentEndDate   = endDate   || null;

  const label = document.getElementById('selectedPeriodLabel');
  if (startDate && endDate) {
    const fmt = d => (d.getMonth()+1) + '.' + d.getDate();
    const s = startDate <= endDate ? startDate : endDate;
    const e = startDate <= endDate ? endDate   : startDate;
    label.textContent = '기간: ' + fmt(s) + ' ~ ' + fmt(e);
  } else {
    const map = { week:'이번 주', month:'1개월', '3month':'3개월', '6month':'6개월', year:'1년' };
    label.textContent = '기간: ' + (map[currentPeriod] || currentPeriod);
  }

  await Promise.all([loadWorkoutCharts(), loadWeightChart()]);
}


function renderWorkoutCharts(d) {
  const hasTime = d.time.some(v => v > 0);
  const hasKcal = d.kcal.some(v => v > 0);

  // 운동 시간
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
}

async function updateChartsByPeriod(startDate, endDate, period) {
  currentPeriod    = period || 'week';
  currentStartDate = startDate || null;
  currentEndDate   = endDate   || null;

  const label = document.getElementById('selectedPeriodLabel');
  if (startDate && endDate) {
    const fmt = d => (d.getMonth()+1) + '.' + d.getDate();
    const s = startDate <= endDate ? startDate : endDate;
    const e = startDate <= endDate ? endDate   : startDate;
    label.textContent = '기간: ' + fmt(s) + ' ~ ' + fmt(e);
  } else {
    const map = { week:'이번 주', month:'1개월', '3month':'3개월', '6month':'6개월', year:'1년' };
    label.textContent = '기간: ' + (map[currentPeriod] || currentPeriod);
  }

  // 통합된 하나의 함수만 호출합니다.
  await loadAllCharts();
}

// ── [통합] 모든 차트 데이터 로드 ─────────────────────
async function loadAllCharts() {
  try {
    let url = `/api/workout/history?period=${currentPeriod}`;
    if (currentStartDate && currentEndDate) {
      url += `&start=${fmtDate(currentStartDate)}&end=${fmtDate(currentEndDate)}`;
    }

    const res = await fetch(url);
    const json = await res.json();
    
    if (!json.ok) return;

    const d = json.data;
    // 1. 운동 시간 & 칼로리 차트 렌더링
    renderWorkoutCharts(d);
    // 2. 체중 차트 렌더링 (통합된 데이터 d를 그대로 넘김)
    renderWeightChartsUnified(d);

  } catch(e) { 
    console.error('데이터 로드 실패:', e); 
  }
}

// ── 운동 시간 / 칼로리 차트 (기존 유지) ─────────────────────
function renderWorkoutCharts(d) {
  const hasTime = d.time && d.time.some(v => v > 0);
  const hasKcal = d.kcal && d.kcal.some(v => v > 0);

  // 운동 시간 차트 로직 (기존과 동일)
  if (timeChart) timeChart.destroy();
  document.getElementById('timeEmpty').style.display = hasTime ? 'none' : 'flex';
  if (hasTime) {
    const avg = d.time.reduce((a,b)=>a+b,0) / d.time.length;
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

  // 칼로리 차트 로직 (기존과 동일)
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
}

// ── 체중 차트 (통합 데이터용으로 수정) ─────────────────────
function renderWeightChartsUnified(d) {
  const empty = document.getElementById('weightEmpty');
  if (weightChart) weightChart.destroy();

  // weights 데이터가 없거나 모두 0이면 비어있음 표시
  const hasWeight = d.weights && d.weights.some(v => v > 0);

  if (!hasWeight) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  const labels  = d.labels;
  const weights = d.weights;

  // 변화량 뱃지 계산
  const validWeights = weights.filter(v => v > 0);
  const firstW = validWeights[0];
  const lastW  = validWeights[validWeights.length - 1];
  const diff   = (lastW - firstW).toFixed(1);
  
  const badge = document.getElementById('weightBadge');
  if (diff < 0) {
    badge.textContent = `총 ${Math.abs(diff)}kg 감량`;
    badge.className   = 'change-badge badge-down';
  } else if (diff > 0) {
    badge.textContent = `총 ${diff}kg 증량`;
    badge.className   = 'change-badge badge-up';
  } else {
    badge.textContent = '변화 없음';
    badge.className   = 'change-badge badge-none';
  }

  const minW = Math.min(...validWeights) - 2;
  const maxW = Math.max(...validWeights) + 2;

  weightChart = new Chart(document.getElementById('weightChart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets:[{
        data: weights, borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.08)',
        borderWidth:2, pointRadius:5, pointHoverRadius:7,
        pointBackgroundColor:'#3b82f6', fill:true, tension:0.4,
        spanGaps: true // 데이터가 없는 날(0)을 건너뛰고 선을 이으려면 true
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: {
        y:{ min:minW, max:maxW, ticks:{ font:{size:10} }, grid:{ color:'rgba(0,0,0,0.05)' } },
        x:{ ticks:{ font:{size:10}, maxRotation:0 }, grid:{ display:false } }
      },
      plugins: {
        legend:{ display:false },
        tooltip:{ callbacks:{ label: ctx => `${ctx.parsed.y}kg` } }
      }
    }
  });
}

function renderWeightChart(data) {
  const empty = document.getElementById('weightEmpty');
  if (weightChart) weightChart.destroy();

  if (!data || data.length === 0) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  const labels  = data.map(d => d.date.slice(5).replace('-', '.'));
  const weights = data.map(d => d.weight);

  // 변화량 뱃지
  const diff  = (weights[weights.length-1] - weights[0]).toFixed(1);
  const badge = document.getElementById('weightBadge');
  if (diff < 0) {
    badge.textContent = `총 ${Math.abs(diff)}kg 감량`;
    badge.className   = 'change-badge badge-down';
  } else if (diff > 0) {
    badge.textContent = `총 ${diff}kg 증량`;
    badge.className   = 'change-badge badge-up';
  } else {
    badge.textContent = '변화 없음';
    badge.className   = 'change-badge badge-none';
  }

  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;

  weightChart = new Chart(document.getElementById('weightChart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets:[{
        data: weights, borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.08)',
        borderWidth:2, pointRadius:5, pointHoverRadius:7,
        pointBackgroundColor:'#3b82f6', fill:true, tension:0.4
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: {
        y:{ min:minW, max:maxW,
            ticks:{ font:{size:10} }, grid:{ color:'rgba(0,0,0,0.05)' } },
        x:{ ticks:{ font:{size:10}, maxRotation:0 }, grid:{ display:false } }
      },
      plugins: {
        legend:{ display:false },
        tooltip:{ callbacks:{ label: ctx => `${ctx.parsed.y}kg` } }
      },
      onClick(e, items) {
        if (!items.length) return;
        const i   = items[0].index;
        const el  = document.getElementById('weightTooltip');
        const prev = i > 0 ? (weights[i] - weights[i-1]).toFixed(1) : null;
        const diff = prev !== null
          ? (prev < 0 ? `전일 대비 ${prev}kg` : `전일 대비 +${prev}kg`)
          : '첫 기록';
        el.style.display = 'block';
        el.textContent   = `[${labels[i]}] 체중: ${weights[i]}kg (${diff})`;
      }
    }
  });
}

// ── 체중 입력 모달 ────────────────────────────────
function openWeightModal() {
  const today = new Date();
  document.getElementById('weightDate').value  = fmtDate(today);
  document.getElementById('weightInput').value = '';
  document.getElementById('weightModal').classList.add('open');
}

function closeWeightModal() {
  document.getElementById('weightModal').classList.remove('open');
}

async function saveWeight() {
  const date   = document.getElementById('weightDate').value;
  const weight = parseFloat(document.getElementById('weightInput').value);

  if (!date)          return alert('날짜를 선택해주세요.');
  if (isNaN(weight))  return alert('체중을 입력해주세요.');
  if (weight <= 0 || weight > 300) return alert('올바른 체중을 입력해주세요.');

  try {
    const res = await fetch('/api/weight/add', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ date, weight })
    });
    const json = await res.json();
    if (json.ok) {
      closeWeightModal();
      loadAllCharts();
    } else {
      alert(json.message || '저장에 실패했습니다.');
    }
  } catch(e) { console.error('weight 저장 실패:', e); }
}

document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  updateChartsByPeriod(null, null, 'week');
});