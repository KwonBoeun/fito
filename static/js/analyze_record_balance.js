/* FITO - 운동 균형도 JS */

let donutChart, freqChart, fatigueChart;
let currentPeriod = 'week';

const PART_COLORS = { 상체:'#3b82f6', 하체:'#2d9e5e', 코어:'#f5a623', 전신:'#8b5cf6' };

function bodyColor(s) {
  return s >= 71 ? '#2d9e5e' : s >= 31 ? '#f5a623' : '#e05c4b';
}

async function updateBalanceByPeriod(startDate, endDate, period) {
  try {
    const res  = await fetch(`/api/workout/balance?period=${period || 'week'}`);
    const json = await res.json();
    if (!json.ok) return;
    update(json.data);
  } catch(e) { console.error('balance 로드 실패:', e); }
}



function update(d) {
  // 바디맵
  document.getElementById('bUpper').setAttribute('fill', bodyColor(d.upper));
  document.getElementById('bCore').setAttribute('fill',  bodyColor(d.core));
  document.getElementById('bLower').setAttribute('fill', bodyColor(d.lower));

  // 점수 목록
  const items = [
    { label:'상체',   score:d.upper,  color:PART_COLORS.상체 },
    { label:'하체',   score:d.lower,  color:PART_COLORS.하체 },
    { label:'코어',   score:d.core,   color:PART_COLORS.코어 },
    { label:'유산소', score:d.cardio, color:PART_COLORS.전신 },
  ];
  document.getElementById('balScores').innerHTML = items.map(item => `
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:10px;height:10px;border-radius:50%;background:${item.color};flex-shrink:0"></div>
      <span style="font-size:12px;color:#666;flex:1">${item.label}</span>
      <span style="font-size:14px;font-weight:700;color:${bodyColor(item.score)}">${item.score}%</span>
    </div>`).join('');

  document.getElementById('balMsg').textContent = d.balMsg;
  const badge = document.getElementById('balBadge');
  if (!d.balanced) { badge.textContent='불균형 ⚠'; badge.style.background='#fdecea'; badge.style.color='#e05c4b'; }
  else             { badge.textContent='균형 ✓';   badge.style.background='#e8f7ef'; badge.style.color='#2d9e5e'; }

  // 도넛
  if (donutChart) donutChart.destroy();
  const parts = ['상체','하체','코어','전신'];
  donutChart = new Chart(document.getElementById('donutChart').getContext('2d'), {
    type:'doughnut',
    data:{ labels:parts, datasets:[{
      data: d.donut, backgroundColor: Object.values(PART_COLORS), borderWidth:2, borderColor:'#fff'
    }]},
    options:{ responsive:true, maintainAspectRatio:true, cutout:'62%', plugins:{ legend:{ display:false } } }
  });
  document.getElementById('donutLegend').innerHTML = parts.map((p,i) => `
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:10px;height:10px;border-radius:50%;background:${Object.values(PART_COLORS)[i]};flex-shrink:0"></div>
      <span style="font-size:12px;color:#555;flex:1">${p}</span>
      <span style="font-size:13px;font-weight:700">${d.donut[i]}%</span>
    </div>`).join('');

  // 빈도
  if (freqChart) freqChart.destroy();
  freqChart = new Chart(document.getElementById('freqChart').getContext('2d'), {
    type:'bar',
    data:{ labels:['상체','하체','코어','전신'], datasets:[{ data: d.freq, backgroundColor: Object.values(PART_COLORS), borderRadius:4 }] },
    options:{ responsive:true, maintainAspectRatio:false,
      scales:{ y:{ ticks:{font:{size:10}}, grid:{color:'rgba(0,0,0,0.05)'} }, x:{ ticks:{font:{size:11,weight:'600'}}, grid:{display:false} } },
      plugins:{ legend:{display:false} }
    }
  });

  // 피로도
  if (fatigueChart) fatigueChart.destroy();
  const fatColors = d.fatigue.map(v => v >= 80 ? '#e05c4b' : v >= 50 ? '#f5a623' : '#2d9e5e');
  fatigueChart = new Chart(document.getElementById('fatigueChart').getContext('2d'), {
    type:'bar',
    data:{ labels:['상체','하체','코어','전신'], datasets:[{ data: d.fatigue, backgroundColor: fatColors, borderRadius:4 }] },
    options:{ responsive:true, maintainAspectRatio:false, indexAxis:'y',
      scales:{ x:{ min:0, max:100, ticks:{font:{size:10}, callback:v=>v+'%'}, grid:{color:'rgba(0,0,0,0.05)'} }, y:{ ticks:{font:{size:11,weight:'600'}}, grid:{display:false} } },
      plugins:{ legend:{display:false} }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateBalanceByPeriod(null, null, 'week');
});