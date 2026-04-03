/* FITO - 나의 운동 분석 JS */

/* ── Mock 데이터 ── */
const MY_SCORES  = [80, 65, 70, 55, 90, 75];   // 6항목
const AVG_SCORES = [60, 60, 60, 60, 60, 60];   // 평균
const LABELS6    = ['지속시간','칼로리','강도','운동량','집중도','달성률'];

const WORKOUTS = [
  { name:'스쿼트', sub:'15회', set:'3 SET', type:'세트형' },
  { name:'런닝머신', sub:'30분', set:'', type:'시간형' },
  { name:'벤치프레스', sub:'60kg', set:'(60kg × 10회)', type:'무게형' },
  { name:'플랭크', sub:'1분 30초', set:'', type:'시간형' },
];

/* ── 날짜 ── */
function renderDate() {
  const days = ['일','월','화','수','목','금','토'];
  const n = new Date();
  document.getElementById('rcDate').textContent =
    `${n.getFullYear()}.${String(n.getMonth()+1).padStart(2,'0')}.${String(n.getDate()).padStart(2,'0')} (${days[n.getDay()]})`;
}

/* ── 레이더 차트 ── */
function renderRadar() {
  const ctx = document.getElementById('radarChart').getContext('2d');
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: LABELS6,
      datasets: [
        { label:'나', data: MY_SCORES,
          backgroundColor:'rgba(45,158,94,0.2)', borderColor:'#2d9e5e',
          borderWidth:2.5, pointBackgroundColor:'#2d9e5e', pointRadius:4 },
        { label:'또래 평균', data: AVG_SCORES,
          backgroundColor:'rgba(0,0,0,0)', borderColor:'#ccc',
          borderWidth:1.5, borderDash:[5,4], pointRadius:2, pointBackgroundColor:'#ccc' }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:true,
      scales: { r: { min:0, max:110,
        ticks:{ display:false, stepSize:25 },
        grid:{ color:'rgba(0,0,0,0.07)' },
        pointLabels:{ font:{size:11,weight:'700'}, color: (ctx) => {
          const i = ctx.index;
          if (MY_SCORES[i] >= AVG_SCORES[i]+10) return '#2d9e5e';
          if (MY_SCORES[i] <= AVG_SCORES[i]-10) return '#e05c4b';
          return '#555';
        }}
      }},
      plugins: { legend:{ position:'bottom', labels:{ font:{size:11}, boxWidth:12 } } }
    }
  });

  // 항목별 점수 그리드
  const grid = document.getElementById('radarScores');
  grid.innerHTML = LABELS6.map((l,i) => {
    const score = MY_SCORES[i], avg = AVG_SCORES[i];
    const color = score >= avg+10 ? '#2d9e5e' : score <= avg-10 ? '#e05c4b' : '#555';
    return `<div style="background:#f9f9f9;border-radius:8px;padding:8px 6px;text-align:center">
      <div style="font-size:10px;color:#999;margin-bottom:2px">${l}</div>
      <div style="font-size:16px;font-weight:900;color:${color}">${score}</div>
    </div>`;
  }).join('');

  // 상위 %  (종합점수 기준 mock)
  document.getElementById('topPct').textContent = '상위 12%';
  // 한 줄 요약
  const maxIdx = MY_SCORES.indexOf(Math.max(...MY_SCORES));
  const minIdx = MY_SCORES.indexOf(Math.min(...MY_SCORES));
  document.getElementById('radarSummary').textContent =
    `${LABELS6[maxIdx]}는 최고지만, ${LABELS6[minIdx]}가 낮아요.`;
}

/* ── 운동 리스트 ── */
function renderWorkoutList() {
  const list = document.getElementById('workoutList');
  if (!WORKOUTS.length) {
    list.innerHTML = `<div class="workout-empty">오늘 등록된 운동이 없어요</div>`;
    return;
  }
  list.innerHTML = WORKOUTS.map(w => `
    <div class="workout-item">
      <div>
        <div class="workout-name">${w.name} ${w.sub ? '('+w.sub+')' : ''}</div>
        ${w.set ? `<div class="workout-sub">${w.set}</div>` : ''}
      </div>
      <div class="workout-set">${w.set || w.type}</div>
    </div>
  `).join('');
}

/* ── 분석 텍스트 ── */
function renderAnalysis() {
  const el = document.getElementById('analysisBox');
  el.innerHTML = `내 목표 대비 <b>75%</b> 달성했어요.<br>
오늘의 운동 부위는 <b>하체, 전신, 상체</b>이에요.<br>
전일 대비 체중은 <b>0.2kg 감소</b>했어요.<br>
전일 대비 <b>120kcal</b> 더 소비했어요.`;
}

/* ── 더보기 메뉴 ── */
function toggleMore() {
  document.getElementById('moreDropdown').classList.toggle('open');
}
function closeMore() {
  document.getElementById('moreDropdown').classList.remove('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.more-btn')) closeMore();
});

/* ── 초기화 모달 ── */
function showResetModal() { closeMore(); document.getElementById('resetModal').classList.add('open'); }
function closeReset()     { document.getElementById('resetModal').classList.remove('open'); }
function confirmReset() {
  closeReset();
  document.getElementById('workoutList').innerHTML = `<div class="workout-empty">오늘 등록된 운동이 없어요</div>`;
  document.getElementById('analysisBox').textContent = '기록이 없어 분석할 내용이 없습니다.';
  document.getElementById('topPct').textContent = '상위 --%';
  document.getElementById('radarSummary').textContent = '오늘 운동 기록이 없어요.';
}

document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  renderRadar();
  renderWorkoutList();
  renderAnalysis();
});