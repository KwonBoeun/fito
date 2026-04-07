/* ===========================
   FITO - 공용 캘린더 모달 JS v2
   initCalendar(options) 호출로 초기화
   =========================== */

function initCalendar(opts) {
  var overlay      = document.getElementById(opts.overlayId);
  var modal        = document.getElementById(opts.modalId);
  var gridEl       = document.getElementById(opts.gridId);
  var titleBtn     = document.getElementById(opts.titleId);
  var pickerEl     = document.getElementById(opts.monthPickerId);
  var confirmBtn   = document.getElementById(opts.confirmId);
  var cancelBtn    = document.getElementById(opts.cancelId);
  var dayLabelsEl  = modal.querySelector('.cal-day-labels');

  var today       = new Date();
  var curYear     = today.getFullYear();
  var curMonth    = today.getMonth();
  var selPeriod   = null;   // 현재 활성 기간 탭 ('week'|'month'|...|null)
  var rangeStart  = null;   // Date
  var rangeEnd    = null;   // Date
  var pickStep    = 0;      // 직접선택: 0=시작대기 1=종료대기
  var monthPickerOpen = false;

  /* ════════════════
     열기 / 닫기
     ════════════════ */
  function open() {
    overlay.classList.add('open');
    modal.style.display = 'block';
    requestAnimationFrame(function() { modal.classList.add('open'); });
    // 오늘 달로 이동
    curYear  = today.getFullYear();
    curMonth = today.getMonth();
    renderCalendar();
  }
  function close() {
    modal.classList.remove('open');
    overlay.classList.remove('open');
    setTimeout(function() { modal.style.display = 'none'; }, 230);
    // 월 선택 뷰 닫기
    exitMonthPicker();
  }

  overlay.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  confirmBtn.addEventListener('click', function() {
    if (!rangeStart || !rangeEnd) return; // 둘 다 선택 안 됐으면 무시
    // 항상 이른 날짜가 start, 늦은 날짜가 end
    var s = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
    var e = rangeStart <= rangeEnd ? rangeEnd   : rangeStart;
    if (opts.onConfirm) opts.onConfirm(s, e, selPeriod);
    close();
  });

  /* ════════════════
     기간 탭
     ════════════════ */
  var periodTabs = modal.querySelectorAll('.cal-period-tab');
  periodTabs.forEach(function(btn) {
    btn.addEventListener('click', function() {
      // 탭 활성화
      periodTabs.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selPeriod = btn.dataset.period;
      pickStep  = 0;
      // 오늘 기준 역방향 범위 계산
      calcPeriodRange(selPeriod);
      // 시작일 달로 이동
      curYear  = rangeStart.getFullYear();
      curMonth = rangeStart.getMonth();
      renderCalendar();
    });
  });

  function calcPeriodRange(period) {
    var endD  = stripTime(new Date(today));
    var startD;
    var d     = new Date(today);

    if (period === 'week') {
      d.setDate(d.getDate() - 6);
      startD = stripTime(d);
    } else if (period === 'month') {
      d.setDate(d.getDate() - 29);
      startD = stripTime(d);
    } else if (period === '3month') {
      var y3 = today.getFullYear(), m3 = today.getMonth() - 3;
      if (m3 < 0) { m3 += 12; y3--; }
      startD = new Date(y3, m3, today.getDate());
    } else if (period === '6month') {
      var y6 = today.getFullYear(), m6 = today.getMonth() - 6;
      if (m6 < 0) { m6 += 12; y6--; }
      startD = new Date(y6, m6, today.getDate());
    } else if (period === 'year') {
      startD = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    }
    // 항상 이른 날짜가 start
    if (startD <= endD) {
      rangeStart = startD;
      rangeEnd   = endD;
    } else {
      rangeStart = endD;
      rangeEnd   = startD;
    }
  }

  /* ════════════════
     월 네비
     ════════════════ */
  modal.querySelector('.cal-prev').addEventListener('click', function() {
    if (monthPickerOpen) return;
    curMonth--;
    if (curMonth < 0) { curMonth = 11; curYear--; }
    renderCalendar();
  });
  modal.querySelector('.cal-next').addEventListener('click', function() {
    if (monthPickerOpen) return;
    curMonth++;
    if (curMonth > 11) { curMonth = 0; curYear++; }
    renderCalendar();
  });

  /* ════════════════
     월 제목 클릭 → 월 선택 뷰
     ════════════════ */
  titleBtn.addEventListener('click', function() {
    monthPickerOpen = !monthPickerOpen;
    if (monthPickerOpen) {
      // 요일행 + 날짜 그리드 숨기기
      if (dayLabelsEl) dayLabelsEl.style.display = 'none';
      gridEl.style.display = 'none';
      pickerEl.classList.add('open');
      renderMonthPicker();
    } else {
      exitMonthPicker();
    }
  });

  function exitMonthPicker() {
    monthPickerOpen = false;
    if (dayLabelsEl) dayLabelsEl.style.display = '';
    gridEl.style.display = '';
    pickerEl.classList.remove('open');
  }

  function renderMonthPicker() {
    pickerEl.innerHTML = '';
    var months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    months.forEach(function(m, i) {
      var cell = document.createElement('div');
      cell.className = 'cal-month-cell' + (i === curMonth ? ' selected' : '');
      cell.textContent = m;
      cell.addEventListener('click', function() {
        curMonth = i;
        exitMonthPicker();
        renderCalendar();
      });
      pickerEl.appendChild(cell);
    });
  }

  /* ════════════════
     날짜 그리드 렌더
     ════════════════ */
  function renderCalendar() {
    titleBtn.textContent = (curMonth + 1) + '월';

    var firstDay    = new Date(curYear, curMonth, 1).getDay();
    var daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    var prevDays    = new Date(curYear, curMonth, 0).getDate();

    gridEl.innerHTML = '';

    // 이전 달 빈칸
    for (var p = firstDay - 1; p >= 0; p--) {
      var pm = curMonth - 1 < 0 ? 11 : curMonth - 1;
      var py = curMonth - 1 < 0 ? curYear - 1 : curYear;
      gridEl.appendChild(makeCell(prevDays - p, py, pm, true));
    }
    // 이번 달
    for (var d = 1; d <= daysInMonth; d++) {
      gridEl.appendChild(makeCell(d, curYear, curMonth, false));
    }
    // 다음 달 빈칸
    var remain = gridEl.children.length % 7;
    if (remain > 0) {
      var nm = curMonth + 1 > 11 ? 0  : curMonth + 1;
      var ny = curMonth + 1 > 11 ? curYear + 1 : curYear;
      for (var n = 1; n <= 7 - remain; n++) {
        gridEl.appendChild(makeCell(n, ny, nm, true));
      }
    }
  }

  function makeCell(day, year, month, isOther) {
    var cell     = document.createElement('div');
    var cellDate = new Date(year, month, day);
    var cd       = stripTime(cellDate);

    cell.className = 'cal-cell' + (isOther ? ' other-month' : '');
    if (sameDay(cellDate, today)) cell.classList.add('today');

    // 범위 하이라이트
    if (rangeStart && rangeEnd) {
      var rs = stripTime(rangeStart), re = stripTime(rangeEnd);
      if (cd >= rs && cd <= re) {
        cell.classList.add('in-range');
        if (cd.getTime() === rs.getTime()) cell.classList.add('range-start');
        if (cd.getTime() === re.getTime()) cell.classList.add('range-end');
        if (rs.getTime() === re.getTime()) {
          cell.classList.remove('range-start','range-end');
          cell.classList.add('range-single');
        }
      }
    } else if (rangeStart && sameDay(cellDate, rangeStart)) {
      cell.classList.add('range-single', 'in-range');
    }

    var span = document.createElement('span');
    span.textContent = day;
    cell.appendChild(span);

    if (!isOther) {
      cell.addEventListener('click', function() {
        handleDateClick(cd);
        renderCalendar();
      });
    }
    return cell;
  }

  /* ════════════════
     날짜 직접 클릭
     ════════════════ */
  function handleDateClick(cd) {
    // 탭 비활성화
    periodTabs.forEach(function(b) { b.classList.remove('active'); });
    selPeriod = null;

    if (pickStep === 0) {
      // 시작일 선택
      rangeStart = cd;
      rangeEnd   = null;
      pickStep   = 1;
    } else {
      // 종료일 선택
      if (cd < rangeStart) {
        // 시작보다 이전 → 순서 반전
        rangeEnd   = rangeStart;
        rangeStart = cd;
      } else {
        rangeEnd = cd;
      }
      pickStep = 0;
    }
  }

  /* ── 유틸 ── */
  function sameDay(a, b) {
    return a.getFullYear()===b.getFullYear() &&
           a.getMonth()===b.getMonth() &&
           a.getDate()===b.getDate();
  }
  function stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return { open: open, close: close };
}