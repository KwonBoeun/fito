/* FITO - 운동 균형도 JS */

let donutChart, freqChart, fatigueChart;
let currentPeriod = 'week';

const PART_COLORS = { 상체:'#3b82f6', 하체:'#2d9e5e', 코어:'#f5a623', 전신:'#8b5cf6' };

const MOCK_DATA = {
  week: { upper:75, lower:55, core:40, cardio:30,
    donut:[40,25,20,15], freq:[12,8,6,10], fatigue:[72,48,35,25] },
  month: { upper:65, lower:60, core:45, cardio:35,
    donut:[35,30,22,13], freq:[48,36,28,40], fatigue:[65,58,40,30] },
  '3month': { upper:60, lower:65, core:50, cardio:40,
    donut:[32,34,22,12], freq:[145,155,85,125], fatigue:[60,62,45,35] },
};

function getMockData(p) {
  return MOCK_DATA[p] || MOCK_DATA['week'];
}

/* ── 기간 선택 ── */
function setPeriod(p, btn) {
  currentPeriod = p;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  update(getMockData(p));
}

/* ── 바디맵 색상 업데이트 ── */
function bodyColor(score) {
  if (score >= 71) return '#2d9e5e';
  if (score >= 31) return '#f5a623';
  return '#e05c4b';
}

function update(d) {
  // 바디맵
  document.getElementById('bUpper').setAttribute('fill', bodyColor(d.upper));
  document.getElementById('bCore').setAttribute('fill',  bodyColor(d.core));
  document.getElementById('bLower').setAttribute('fill', bodyColor(d.lower));

  // 점수 목록
  const items = [
    { label:'상체', score:d.upper, color:PART_COLORS.상체 },
    { label:'하체', score:d.lower, color:PART_COLORS.하체 },
    { label:'코어', score:d.core,  color:PART_COLORS.코어 },
    { label:'유산소', score:d.cardio, color:PART_COLORS.전신 },
  ];
  document.getElementById('balScores').innerHTML = items.map(item => `
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:10px;height:10px;border-radius:50%;background:${item.color};flex-shrink:0"></div>
      <span style="font-size:12px;color:#666;flex:1">${item.label}</span>
      <span style="font-size:14px;font-weight:700;color:${bodyColor(item.score)}">${item.score}%</span>
    </div>`).join('');

  // 균형 메시지
  const scores = [d.upper, d.lower, d.core, d.cardio];
  const diff = Math.max(...scores) - Math.min(...scores);
  const msg = diff >= 50
    ? '상체는 뜨겁지만 하체는 차가워요! 균형을 맞춰주세요.'
    : '균형이 아주 잘 잡힌 건강한 루틴입니다!';
  document.getElementById('balMsg').textContent = msg;
  const badge = document.getElementById('balBadge');
  if (diff >= 50) { badge.textContent='불균형 ⚠'; badge.style.background='#fdecea'; badge.style.color='#e05c4b'; }
  else            { badge.textContent='균형 ✓';   badge.style.background='#e8f7ef'; badge.style.color='#2d9e5e'; }

  // 도넛 차트
  if (donutChart) donutChart.destroy();
  const dCtx = document.getElementById('donutChart').getContext('2d');
  const parts = ['상체','하체','코어','전신'];
  donutChart = new Chart(dCtx, {
    type:'doughnut',
    data:{
      labels: parts,
      datasets:[{ data: d.donut, backgroundColor: Object.values(PART_COLORS),
        borderWidth:2, borderColor:'#fff', hoverOffset:4 }]
    },
    options:{
      responsive:true, maintainAspectRatio:true, cutout:'62%',
      plugins:{ legend:{ display:false } }
    }
  });
  document.getElementById('donutLegend').innerHTML = parts.map((p,i) => `
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:10px;height:10px;border-radius:50%;background:${Object.values(PART_COLORS)[i]};flex-shrink:0"></div>
      <span style="font-size:12px;color:#555;flex:1">${p}</span>
      <span style="font-size:13px;font-weight:700">${d.donut[i]}%</span>
    </div>`).join('');

  // 빈도 막대 차트
  if (freqChart) freqChart.destroy();
  const fCtx = document.getElementById('freqChart').getContext('2d');
  freqChart = new Chart(fCtx, {
    type:'bar',
    data:{
      labels:['상체','하체','코어','전신'],
      datasets:[{ data: d.freq, backgroundColor: Object.values(PART_COLORS), borderRadius:4 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, indexAxis:'x',
      scales:{
        y:{ ticks:{font:{size:10}}, grid:{color:'rgba(0,0,0,0.05)'} },
        x:{ ticks:{font:{size:11,weight:'600'}}, grid:{display:false} }
      },
      plugins:{ legend:{display:false} }
    }
  });

  // 피로도 가로 막대
  if (fatigueChart) fatigueChart.destroy();
  const ftCtx = document.getElementById('fatigueChart').getContext('2d');
  const fatColors = d.fatigue.map(v => v >= 80 ? '#e05c4b' : v >= 50 ? '#f5a623' : '#2d9e5e');
  fatigueChart = new Chart(ftCtx, {
    type:'bar',
    data:{
      labels:['상체','하체','코어','전신'],
      datasets:[{ data: d.fatigue, backgroundColor: fatColors, borderRadius:4 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, indexAxis:'y',
      scales:{
        x:{ min:0, max:100, ticks:{ font:{size:10}, callback: v=>v+'%' }, grid:{color:'rgba(0,0,0,0.05)'} },
        y:{ ticks:{font:{size:11,weight:'600'}}, grid:{display:false} }
      },
      plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label: ctx=>`피로도 ${ctx.parsed.x}%` } } }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  update(getMockData('week'));
});