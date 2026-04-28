/* ===========================
   FITO - 공용 캘린더 모달 JS v3
   =========================== */

function initCalendar(opts) {
  var overlay      = document.getElementById(opts.overlayId);
  var modal        = document.getElementById(opts.modalId);
  var gridEl       = document.getElementById(opts.gridId);
  var titleBtn     = document.getElementById(opts.titleId);
  var pickerEl     = document.getElementById(opts.monthPickerId);
  var confirmBtn   = document.getElementById(opts.confirmId);
  var cancelBtn    = document.getElementById(opts.cancelId);
  var dayLabelsEl  = modal ? modal.querySelector('.cal-day-labels') : null;

  var today       = new Date();
  var curYear     = today.getFullYear();
  var curMonth    = today.getMonth();
  var selPeriod   = null;
  var rangeStart  = null;
  var rangeEnd    = null;
  var pickStep    = 0;
  var monthPickerOpen = false;
  var activeDates = new Set();  // ★ 운동 기록 있는 날짜
  var selectMode  = 'range';    // ★ 'range' | 'single'

  /* ════════════════
     ★ 활성 날짜 fetch
     ════════════════ */
  function fetchActiveDates(year, month, callback) {
    fetch('/api/workout/active-dates?year=' + year + '&month=' + (month + 1))
      .then(function(res) { return res.json(); })
      .then(function(json) {
        activeDates = json.ok ? new Set(json.dates) : new Set();
        if (callback) callback();
      })
      .catch(function() {
        activeDates = new Set();
        if (callback) callback();
      });
  }

  /* ════════════════
     열기 / 닫기
     ════════════════ */
  function open() {
    overlay.classList.add('open');
    modal.style.display = 'block';
    requestAnimationFrame(function() { modal.classList.add('open'); });
    curYear  = today.getFullYear();
    curMonth = today.getMonth();

    // ★ 첫 탭 period/mode 읽기
    var firstTab = modal.querySelector('.cal-period-tab');
    if (firstTab) {
      modal.querySelectorAll('.cal-period-tab').forEach(function(t, i) {
        t.classList.toggle('active', i === 0);
      });
      selPeriod  = firstTab.dataset.period;
      selectMode = (selPeriod === 'today') ? 'single' : 'range';
    }

    rangeStart = null;
    rangeEnd   = null;
    pickStep   = 0;
    renderCalendar();
  }

  function close() {
    modal.classList.remove('open');
    overlay.classList.remove('open');
    setTimeout(function() { modal.style.display = 'none'; }, 230);
    exitMonthPicker();
  }

  overlay.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);

  confirmBtn.addEventListener('click', function() {
    if (selPeriod && !rangeStart) {
      // 기간 탭만 선택
      if (opts.onConfirm) opts.onConfirm(null, null, selPeriod);
      close();
      return;
    }
    if (!rangeStart) return;
    var s = rangeStart;
    var e = rangeEnd || rangeStart;
    if (s > e) { var tmp = s; s = e; e = tmp; }
    if (opts.onConfirm) opts.onConfirm(s, e, selPeriod);
    close();
  });

  /* ════════════════
     기간 탭
     ════════════════ */
  var periodTabs = modal.querySelectorAll('.cal-period-tab');
  periodTabs.forEach(function(btn) {
    btn.addEventListener('click', function() {
      periodTabs.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selPeriod  = btn.dataset.period;
      pickStep   = 0;
      rangeStart = null;
      rangeEnd   = null;

      // ★ single 모드 판단
      selectMode = (selPeriod === 'today') ? 'single' : 'range';

      // 기간 탭이면 자동 범위 계산
      if (selPeriod !== 'today') {
        calcPeriodRange(selPeriod);
        curYear  = rangeStart.getFullYear();
        curMonth = rangeStart.getMonth();
      }
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
    rangeStart = startD <= endD ? startD : endD;
    rangeEnd   = startD <= endD ? endD   : startD;
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
     월 선택 뷰 (기존 유지)
     ════════════════ */
  if (titleBtn) {
    titleBtn.addEventListener('click', function() {
      monthPickerOpen = !monthPickerOpen;
      if (monthPickerOpen) {
        if (dayLabelsEl) dayLabelsEl.style.display = 'none';
        gridEl.style.display = 'none';
        pickerEl.classList.add('open');
        renderMonthPicker();
      } else {
        exitMonthPicker();
      }
    });
  }

  function exitMonthPicker() {
    monthPickerOpen = false;
    if (dayLabelsEl) dayLabelsEl.style.display = '';
    gridEl.style.display = '';
    if (pickerEl) pickerEl.classList.remove('open');
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
     날짜 그리드 렌더 (★ 활성날짜 추가)
     ════════════════ */
  function renderCalendar() {
    fetchActiveDates(curYear, curMonth, function() {
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
        var nm = curMonth + 1 > 11 ? 0 : curMonth + 1;
        var ny = curMonth + 1 > 11 ? curYear + 1 : curYear;
        for (var n = 1; n <= 7 - remain; n++) {
          gridEl.appendChild(makeCell(n, ny, nm, true));
        }
      }
    });
  }

  function makeCell(day, year, month, isOther) {
    var cell     = document.createElement('div');
    var cellDate = new Date(year, month, day);
    var cd       = stripTime(cellDate);

    // ★ 날짜 문자열 (활성 날짜 비교용)
    var dateStr = year + '-' +
      String(month + 1).padStart(2, '0') + '-' +
      String(day).padStart(2, '0');

    cell.className = 'cal-cell' + (isOther ? ' other-month' : '');
    if (sameDay(cellDate, today)) cell.classList.add('today');

    // ★ 운동 기록 있는 날
    if (!isOther && activeDates.has(dateStr)) {
      cell.classList.add('has-record');
    }

    // 범위 하이라이트 (기존 유지)
    if (rangeStart && rangeEnd) {
      var rs = stripTime(rangeStart), re = stripTime(rangeEnd);
      if (cd >= rs && cd <= re) {
        cell.classList.add('in-range');
        if (cd.getTime() === rs.getTime()) cell.classList.add('range-start');
        if (cd.getTime() === re.getTime()) cell.classList.add('range-end');
        if (rs.getTime() === re.getTime()) {
          cell.classList.remove('range-start', 'range-end');
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
     날짜 클릭 (★ single 모드 추가)
     ════════════════ */
  function handleDateClick(cd) {
    // 탭 비활성화
    periodTabs.forEach(function(b) { b.classList.remove('active'); });
    selPeriod = null;

    if (selectMode === 'single') {
      // ★ 단일 날짜 선택
      rangeStart = cd;
      rangeEnd   = cd;
      pickStep   = 0;
    } else {
      if (pickStep === 0) {
        rangeStart = cd;
        rangeEnd   = null;
        pickStep   = 1;
      } else {
        if (cd < rangeStart) {
          rangeEnd   = rangeStart;
          rangeStart = cd;
        } else {
          rangeEnd = cd;
        }
        pickStep = 0;
      }
    }
  }

  /* ════════════════
     유틸
     ════════════════ */
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }
  function stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return { open: open, close: close };
}