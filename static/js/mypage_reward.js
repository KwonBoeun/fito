/* ===========================
   FITO - 리워드 JS
   =========================== */

function finish() {
  history.back();
}

function goEarnMore() {
  location.href = '/reward/earn';
}

function goHistoryMore() {
  location.href = '/reward/history';
}

/* 기간 필터 (리워드 내역 페이지) */
function selectPeriod(btn, period) {
  document.querySelectorAll('.rw-period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const today = new Date();
  const from  = new Date();

  if (period === '1주일')  from.setDate(today.getDate() - 7);
  if (period === '1개월')  from.setMonth(today.getMonth() - 1);
  if (period === '3개월')  from.setMonth(today.getMonth() - 3);
  if (period === '6개월')  from.setMonth(today.getMonth() - 6);
  if (period === '1년')    from.setFullYear(today.getFullYear() - 1);

  const fmt = d => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  const el = document.getElementById('dateRangeText');
  if (el) el.textContent = `${fmt(from)} ~ ${fmt(today)}`;
}