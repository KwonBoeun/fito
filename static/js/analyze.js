/* ===========================
   FITO - 분석 메인 JS
   =========================== */

/* ── 날짜 표기 ── */
function renderDate() {
  const days = ['일','월','화','수','목','금','토'];
  const now  = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const day = days[now.getDay()];
  document.getElementById('az-date').textContent = `${y}.${m}.${d} (${day})`;
}

/* ── 오늘 운동 분석 - 미니 바 차트 ── */
function renderTodayChart() {
  const PARTS = [
    { label:'상체', val:75, color:'#222' },
    { label:'하체', val:55, color:'#555' },
    { label:'코어', val:40, color:'#888' },
    { label:'유산소', val:85, color:'#333' },
    { label:'유연성', val:30, color:'#aaa' },
  ];
  const maxH = 44;
  const maxVal = Math.max(...PARTS.map(p=>p.val));

  const wrap = document.getElementById('today-chart');
  wrap.innerHTML = PARTS.map(p => {
    const h = Math.round((p.val / maxVal) * maxH);
    return `<div class="az-today-bar-wrap">
      <div class="az-today-bar" style="height:${h}px;background:${p.color}"></div>
      <span class="az-today-bar-label">${p.label}</span>
    </div>`;
  }).join('');

  // 텍스트 보조
  const infoEl = document.getElementById('today-info');
  if (infoEl) {
    infoEl.innerHTML = `<span style="font-size:12px;color:#555;margin-top:6px;display:block">오늘 <b>유산소</b>가 가장 활발했어요 💪</span>`;
  }
}

/* ── 운동 균형도 - SVG 레이더 차트 ── */
function renderRadar() {
  const DATA = [
    { label:'상체', val:0.75 },
    { label:'하체', val:0.55 },
    { label:'코어', val:0.40 },
    { label:'유산소', val:0.80 },
    { label:'유연성', val:0.30 },
  ];
  const cx = 60, cy = 60, r = 48;
  const n  = DATA.length;

  function polar(idx, ratio) {
    const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
    return {
      x: cx + r * ratio * Math.cos(angle),
      y: cy + r * ratio * Math.sin(angle),
    };
  }

  // 배경 그리드 (3단계)
  let gridSvg = '';
  [1, 0.66, 0.33].forEach(ratio => {
    const pts = DATA.map((_,i) => {
      const p = polar(i, ratio);
      return `${p.x},${p.y}`;
    }).join(' ');
    gridSvg += `<polygon points="${pts}" fill="none" stroke="#ddd" stroke-width="1"/>`;
  });
  // 축선
  DATA.forEach((_,i) => {
    const p = polar(i, 1);
    gridSvg += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#ddd" stroke-width="1"/>`;
  });

  // 데이터 폴리곤
  const dataPts = DATA.map((d,i) => {
    const p = polar(i, d.val);
    return `${p.x},${p.y}`;
  }).join(' ');

  // 라벨
  let labelSvg = '';
  DATA.forEach((d, i) => {
    const p = polar(i, 1.28);
    labelSvg += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#888" font-family="Noto Sans KR">${d.label}</text>`;
  });

  const svg = `<svg width="120" height="120" viewBox="0 0 120 120" class="az-balance-radar">
    ${gridSvg}
    <polygon class="az-radar-poly" points="${dataPts}" fill="rgba(0,0,0,0.12)" stroke="#000" stroke-width="1.5"/>
    ${labelSvg}
  </svg>`;

  document.getElementById('balance-radar').innerHTML = svg;
}

/* ── 강점 / 취약점 ── */
function renderStrength() {
  const GOOD = ['유산소', '상체 지구력', '유연성'];
  const WEAK = ['하체 근력', '코어 안정성'];

  const goodHtml = GOOD.map(t => `<span class="az-strength-tag good">✓ ${t}</span>`).join('');
  const weakHtml = WEAK.map(t => `<span class="az-strength-tag weak">✗ ${t}</span>`).join('');

  document.getElementById('strength-good').innerHTML = `<div class="az-strength-label good">강점</div>${goodHtml}`;
  document.getElementById('strength-weak').innerHTML = `<div class="az-strength-label weak">취약점</div>${weakHtml}`;
}

/* ── 최근 분석 기록 ── */
function renderRecentRecords() {
  const RECORDS = [
    { type:'실시간', name:'스쿼트 (2시간)', date:'03월 14일' },
    { type:'영상',   name:'데드리프트 (45분)', date:'03월 10일' },
    { type:'실시간', name:'런지 (1시간)', date:'03월 08일' },
  ];
  const list = document.getElementById('recent-list');
  list.innerHTML = RECORDS.map(r => `
    <div class="az-recent-item">
      <span class="az-recent-badge">${r.type}</span>
      <div class="az-recent-info">
        <div class="az-recent-name">${r.name}</div>
      </div>
      <span class="az-recent-date">${r.date}</span>
    </div>
  `).join('');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  renderTodayChart();
  renderRadar();
  renderStrength();
  renderRecentRecords();
});