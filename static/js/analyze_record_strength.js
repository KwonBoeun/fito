/* FITO - 강점과 취약점 분석 JS */

let strengthChart, weakChart;

/* ── 정규분포 곡선 유틸 ── */
function normalPdf(x, mean, std) {
  return (1/(std*Math.sqrt(2*Math.PI))) * Math.exp(-0.5*((x-mean)/std)**2);
}
function buildNormalData(mean, std, userScore) {
  const xs = [], ys = [];
  for (let x = 0; x <= 100; x += 2) {
    xs.push(x);
    ys.push(normalPdf(x, mean, std));
  }
  return { xs, ys, userScore };
}

/* ── 정규분포 차트 렌더 ── */
function renderDistribChart(canvasId, mean, std, userScore, color) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  const { xs, ys } = buildNormalData(mean, std, userScore);
  const maxY = Math.max(...ys);

  // 유저 위치의 y값
  const userY = normalPdf(userScore, mean, std);

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [
        {
          label:'분포',
          data: ys,
          borderColor: color,
          backgroundColor: `${color}22`,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label:'나의 위치',
          data: xs.map(x => Math.abs(x - userScore) < 1.5 ? userY : null),
          borderColor: 'transparent',
          backgroundColor: '#f5a623',
          pointRadius: xs.map(x => Math.abs(x - userScore) < 1.5 ? 7 : 0),
          pointBackgroundColor: '#f5a623',
          showLine: false,
        }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: {
        x:{ display:false },
        y:{ display:false, min:0 }
      },
      plugins: { legend:{display:false}, tooltip:{enabled:false} }
    }
  });
}

/* ── 추천 운동 카드 ── */
const REC_WORKOUTS = [
  { title:'유산소 인터벌 트레이닝', time:'30분', level:'hard' },
  { title:'런닝 페이스 훈련',       time:'25분', level:'normal' },
  { title:'전신 스트레칭 루틴',     time:'15분', level:'easy' },
  { title:'버피 챌린지',           time:'20분', level:'hard' },
  { title:'플랭크 변형 10가지',     time:'15분', level:'normal' },
];

function renderRecCards() {
  const row = document.getElementById('recCardRow');
  row.innerHTML = REC_WORKOUTS.map(w => `
    <div class="rec-card">
      <div class="rec-card-thumb">
        <span class="rec-badge badge-${w.level}">${w.level==='easy'?'입문':w.level==='normal'?'보통':'어려움'}</span>
      </div>
      <div class="rec-card-body">
        <div class="rec-card-title">${w.title}</div>
        <div class="rec-card-meta">⏱ ${w.time}</div>
      </div>
    </div>`).join('');
}

/* ── 트레이너 카드 ── */
const TRAINERS = [
  { name:'김지훈 트레이너', spec:'유산소 · 다이어트 전문', intro:'지구력 향상을 통한 체지방 감량을 도와드려요.' },
  { name:'박소연 트레이너', spec:'체형 교정 · 코어 강화', intro:'집중도와 균형감을 높이는 루틴 전문입니다.' },
  { name:'이민호 트레이너', spec:'근력 · 기능성 운동',     intro:'효율적인 시간 내 최대 운동 효과를 드려요.' },
];

function renderTrainers() {
  const row = document.getElementById('trainerRow');
  row.innerHTML = TRAINERS.map(t => `
    <div class="trainer-card">
      <div class="trainer-avatar"></div>
      <div class="trainer-name">${t.name}</div>
      <div class="trainer-spec">${t.spec}</div>
      <div class="trainer-intro">${t.intro}</div>
      <button class="trainer-go">보러가기</button>
    </div>`).join('');
}

/* ── 기간 변경 ── */
function onPeriodChange(p) {
  // 기간별 데이터 달라지는 부분 (mock)
  const data = {
    week:  { sScore:72, wScore:35, sTitle:'나의 강점은 꾸준한 운동 빈도이에요', wTitle:'나의 취약점은 운동 집중도이에요' },
    month: { sScore:78, wScore:30, sTitle:'나의 강점은 높은 운동량이에요',   wTitle:'나의 취약점은 낮은 목표 달성률이에요' },
    '3month':{ sScore:80, wScore:28, sTitle:'나의 강점은 탁월한 성취도이에요', wTitle:'나의 취약점은 부위 균형도이에요' },
  };
  const d = data[p] || data['month'];
  document.getElementById('strengthTitle').textContent = d.sTitle;
  document.getElementById('weaknessTitle').textContent = d.wTitle;
  if (strengthChart) strengthChart.destroy();
  if (weakChart) weakChart.destroy();
  strengthChart = renderDistribChart('strengthDistrib', 60, 15, d.sScore, '#2d9e5e');
  weakChart     = renderDistribChart('weakDistrib',     60, 15, d.wScore, '#e05c4b');
  document.getElementById('strengthPctLabel').textContent = `상위 ${Math.round((1 - d.sScore/100)*100)}%`;
  document.getElementById('weakPctLabel').textContent     = `하위 ${Math.round(d.wScore)}%`;
}

document.addEventListener('DOMContentLoaded', () => {
  onPeriodChange('month');
  renderRecCards();
  renderTrainers();
});