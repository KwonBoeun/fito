/* ===========================
   FITO - 자세 분석 리포트 JS
   =========================== */

/* ── Mock 리포트 데이터 ── */
const REPORT = {
  completion: 87.5,
  score:      76.4,
  time:       '00:01:24',
  fixSegments: [
    { time: '00:12', content: '무릎 각도 조절 필요' },
    { time: '00:34', content: '등 자세 교정 필요' },
    { time: '01:02', content: '발 너비 조정 필요' },
  ],
  feedback: [
    { name: '스쿼트', score: 62, text: '무릎이 발끝보다 앞으로 나오고 있어요. 무게 중심을 뒤로 더 이동하고, 엉덩이를 뒤쪽으로 빼는 느낌으로 내려가세요.', level: 'low' },
    { name: '런지',   score: 78, text: '앞 무릎 각도가 약 95°로 적당하나, 상체가 앞으로 기울어지는 경향이 있어요. 코어에 힘을 주고 상체를 세워주세요.', level: 'mid' },
    { name: '플랭크', score: 91, text: '엉덩이 높이가 일정하게 잘 유지되고 있어요.', level: 'high' },
  ],
  recommendations: `1. 스쿼트 시 발뒤꿈치에 체중을 싣는 연습을 해보세요.\n2. 런지 동작에서 코어 근육을 충분히 활성화하면 상체 기울기를 잡을 수 있어요.\n3. 기초 하체 근력을 높이기 위해 레그프레스, 힙 힌지 동작을 추가로 훈련해 보세요.\n4. 운동 전 폼롤러로 대퇴사두근과 햄스트링을 5분 이상 이완시키는 것을 권장합니다.`,
  videos: [
    { title: '스쿼트 자세 완전 정복 (초보자)', author: '피트니스TV', views: '84K' },
    { title: '런지 올바른 자세 가이드',         author: '트레이너박', views: '42K' },
    { title: '코어 강화 플랭크 루틴',           author: '코어킹',    views: '31K' },
  ],
};

/* ── 날짜 & 분석 구분 ── */
function renderHeader() {
  const mode = new URLSearchParams(location.search).get('mode') || 'upload';
  const now  = new Date();
  const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0'), d = String(now.getDate()).padStart(2,'0');
  document.getElementById('reportDate').textContent = `${y}-${m}-${d}`;
  document.getElementById('reportMode').textContent = mode === 'realtime' ? '실시간 분석' : '영상 분석';
}

/* ── 요약 ── */
function renderSummary() {
  document.getElementById('summaryCompletion').textContent = REPORT.completion;
  document.getElementById('summaryScore').textContent      = REPORT.score;

  // 시간 포맷
  const t = REPORT.time.split(':');
  document.getElementById('summaryTime').textContent = t.length === 3 ? `${t[1]}:${t[2]}` : REPORT.time;

  // 보완 구간
  const list = document.getElementById('fixList');
  if (!REPORT.fixSegments.length) {
    list.innerHTML = `<div class="report-fix-empty">✓ 보완할 부분이 없습니다.</div>`;
    return;
  }
  list.innerHTML = REPORT.fixSegments.map(s => `
    <div class="report-fix-item">
      <span class="report-fix-time">${s.time}</span>
      <span class="report-fix-content">${s.content}</span>
    </div>
  `).join('');
}

/* ── 자세 피드백 ── */
function renderFeedback() {
  const sorted = [...REPORT.feedback].sort((a,b) => a.score - b.score);
  document.getElementById('feedbackList').innerHTML = sorted.map(f => `
    <div class="report-feedback-item">
      <div class="report-feedback-score-wrap">
        <div class="report-feedback-score ${f.level}">${f.score}</div>
      </div>
      <div>
        <div class="report-feedback-name">${f.name}</div>
        <div class="report-feedback-text">${f.text}</div>
      </div>
    </div>
  `).join('');
}

/* ── 레이더 차트 ── */
function renderRadar() {
  const DATA = REPORT.feedback.map(f => ({ label: f.name, val: f.score / 100 }));
  const cx = 70, cy = 70, r = 54;
  const n  = DATA.length;
  const COLORS = ['#2d9e5e', '#4b668b', '#e05c4b'];

  function polar(idx, ratio) {
    const angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  }

  // 배경 그리드
  let grid = '';
  [1, .66, .33].forEach(ratio => {
    const pts = DATA.map((_,i) => { const p = polar(i,ratio); return `${p.x},${p.y}`; }).join(' ');
    grid += `<polygon points="${pts}" fill="none" stroke="#e5e5e5" stroke-width="1"/>`;
  });
  DATA.forEach((_,i) => {
    const p = polar(i,1);
    grid += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#e5e5e5" stroke-width="1"/>`;
  });

  // 데이터
  const dataPts = DATA.map((d,i) => { const p = polar(i, d.val); return `${p.x},${p.y}`; }).join(' ');

  // 라벨
  let labels = '';
  DATA.forEach((d,i) => {
    const p = polar(i, 1.3);
    labels += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#666" font-family="Noto Sans KR">${d.label}</text>`;
  });

  document.getElementById('reportRadar').innerHTML = `
    <svg width="140" height="140" viewBox="0 0 140 140">
      ${grid}
      <polygon points="${dataPts}" fill="rgba(75,102,139,.2)" stroke="#4b668b" stroke-width="1.5"/>
      ${labels}
    </svg>`;

  // 범례
  document.getElementById('radarLegend').innerHTML = DATA.map((d,i) => `
    <div class="report-radar-item">
      <div class="report-radar-dot" style="background:${COLORS[i]}"></div>
      ${d.label} · <b>${Math.round(d.val*100)}점</b>
    </div>
  `).join('');
}

/* ── 추천 사항 ── */
function renderReco() {
  document.getElementById('recoBox').innerHTML = REPORT.recommendations
    .split('\n')
    .map(l => `<div>${l}</div>`)
    .join('');
}

/* ── 추천 영상 ── */
function renderVideos() {
  document.getElementById('videoList').innerHTML = REPORT.videos.map(v => `
    <div class="report-video-item" onclick="location.href='/analyze/posture'">
      <div class="report-video-thumb"></div>
      <div class="report-video-info">
        <div class="report-video-title">${v.title}</div>
        <div class="report-video-author">${v.author} · 조회수 ${v.views}</div>
      </div>
    </div>
  `).join('');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderSummary();
  renderFeedback();
  renderRadar();
  renderReco();
  renderVideos();
});