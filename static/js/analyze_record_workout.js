/* FITO - 나의 운동 분석 JS */

// 1. 운동 데이터셋 (중복 선언 방지)
if (typeof workoutDB === 'undefined') {
    var workoutDB = [
        { name: "벤치프레스", code: "CH001", part: "가슴" },
        { name: "인클라인 벤치프레스", code: "CH002", part: "가슴" },
        { name: "숄더 프레스", code: "SH001", part: "어깨" },
        { name: "스쿼트", code: "LG001", part: "하체" },
        { name: "런닝머신", code: "CD001", part: "유산소" },
        { name: "플랭크", code: "AB001", part: "코어" }
    ];
}

let radarChartInstance = null;
let currentEditId = null;

// 2. 초기 로드 (DOMContentLoaded 안에서 함수를 순차적으로 호출)
document.addEventListener('DOMContentLoaded', () => {
    window.renderDate();      
    window.initRadarChart();  
    window.fetchTodayData();  
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.rc-header-right')) window.closeMore();
    });
});

/* ── 전역 함수 정의 (window 객체에 직접 할당) ── */

window.renderDate = function() {
    const days = ['일','월','화','수','목','금','토'];
    const n = new Date();
    const dateStr = `${n.getFullYear()}.${String(n.getMonth()+1).padStart(2,'0')}.${String(n.getDate()).padStart(2,'0')} (${days[n.getDay()]})`;
    const el = document.getElementById('rcDate');
    if(el) el.textContent = dateStr;
};

window.initRadarChart = function(scores = [0, 0, 0, 0, 0, 0]) {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['지속시간', '칼로리', '강도', '운동량', '집중도', '달성률'],
            datasets: [{
                label: '나',
                data: scores,
                backgroundColor: 'rgba(45,158,94,0.2)',
                borderColor: '#2d9e5e',
                borderWidth: 2.5,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: { r: { min: 0, max: 110, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
};

window.fetchTodayData = async function() {
    try {
        const response = await fetch('/api/workout/today-analysis');
        const result = await response.json();
        if (result.ok && result.data) {
            const d = result.data;
            document.getElementById('sTime').textContent = d.stats?.time || "00H 00M";
            document.getElementById('sKcal').textContent = d.stats?.kcal || "0000kcal";
            window.initRadarChart(d.radarScores || [0, 0, 0, 0, 0, 0]);
            window.renderWorkoutList(d.workouts || []);
            document.getElementById('analysisBox').innerHTML = d.analysisSummary || "";
            document.getElementById('topPct').textContent = d.topPercent ? `상위 ${d.topPercent}%` : "상위 --%";
        }
    } catch (e) { console.error("데이터 로드 실패:", e); }
};

window.renderWorkoutList = function(workouts = []) {
    const list = document.getElementById('workoutList');
    if (!workouts || workouts.length === 0) {
        list.innerHTML = `<div class="workout-empty">오늘 등록된 운동이 없어요</div>`;
        return;
    }
    list.innerHTML = workouts.map(w => `
        <div class="workout-item" data-id="${w.id}">
            <div class="workout-info">
                <div class="workout-name">${w.workoutName}</div>
                <div class="workout-sub">${w.sets}세트 / ${w.durationMinutes}분</div>
            </div>
            <div class="workout-manage" style="margin-left:auto">
                <button class="edit-item-btn" onclick="openEditModal(${w.id}, '${w.workoutName}', ${w.sets}, ${w.durationMinutes})">수정</button>
            </div>
        </div>
    `).join('');
};

window.toggleMore = function(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('moreDropdown');
    if (dropdown) dropdown.classList.toggle('open');
};

window.closeMore = function() {
    const dd = document.getElementById('moreDropdown');
    if(dd) dd.classList.remove('open');
};

window.openAddModal = function() {
    window.closeMore();
    currentEditId = null;
    document.getElementById('modalTitle').innerText = "운동 기록 추가";
    document.getElementById('workName').value = "";
    document.getElementById('workSet').value = "";
    document.getElementById('workVal').value = "";
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workDate').value = today;
    document.getElementById('recordModal').classList.add('open');
};

window.openEditModal = function(id, name, sets, val) {
    currentEditId = id;
    document.getElementById('modalTitle').innerText = "운동 기록 수정";
    document.getElementById('workName').value = name;
    document.getElementById('workSet').value = sets;
    document.getElementById('workVal').value = val;
    document.getElementById('recordModal').classList.add('open');
};

window.closeRecordModal = function() {
    document.getElementById('recordModal').classList.remove('open');
};

window.suggestWorkouts = function(val) {
    const list = document.getElementById('autoCompleteList');
    list.innerHTML = '';
    if (!val) return;
    workoutDB.filter(w => w.name.includes(val)).forEach(w => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${w.name}</strong> <small>${w.part}</small>`;
        div.onclick = () => { document.getElementById('workName').value = w.name; list.innerHTML = ''; };
        list.appendChild(div);
    });
};

window.saveRecord = async function() {
    const name = document.getElementById('workName').value;
    if(!name) return alert("운동명을 입력해주세요.");

    const data = {
        date: document.getElementById('workDate').value,
        name: name,
        sets: parseInt(document.getElementById('workSet').value) || 0,
        val: parseInt(document.getElementById('workVal').value) || 0
    };

    const url = currentEditId ? `/api/workout/update/${currentEditId}` : '/api/workout/add';
    const method = currentEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        window.closeRecordModal();
        window.fetchTodayData();
    }
};

window.confirmReset = async function() {
    const response = await fetch('/api/workout/reset', { method: 'DELETE' });
    if (response.ok) {
        document.getElementById('resetModal').classList.remove('open');
        window.fetchTodayData();
    }
};

let sortableInstance = null;

window.startEditOrder = function() {
    window.closeMore();
    const list = document.getElementById('workoutList');
    const items = list.querySelectorAll('.workout-item');
    
    if (items.length === 0) return;

    // 1. 리스트를 편집 모드로 전환
    list.classList.add('edit-mode');
    document.getElementById('editOrderFooter').style.display = 'block';

    items.forEach(item => {
        // 기존 디자인 유지를 위해 특정 요소만 숨김 처리
        const manageBtn = item.querySelector('.workout-manage');
        if (manageBtn) manageBtn.style.display = 'none';

        // 핸들이 이미 생성되어 있지 않은 경우에만 추가
        if (!item.querySelector('.order-handle')) {
            const handle = document.createElement('div');
            handle.className = 'order-handle';
            handle.innerHTML = '☰';
            // 디자인이 깨지지 않게 가장 앞에 삽입
            item.prepend(handle);
        }
    });

    // 2. SortableJS 활성화
    if (typeof Sortable !== 'undefined') {
        if (sortableInstance) sortableInstance.destroy();
        sortableInstance = new Sortable(list, {
            animation: 150,
            handle: '.order-handle',
            ghostClass: 'sortable-ghost',
            forceFallback: true // 모바일 환경에서도 디자인 유지 도움
        });
    }
};

window.saveOrderChange = async function() {
    const items = document.querySelectorAll('.workout-item');
    const orders = Array.from(items).map((item, i) => ({
        id: item.getAttribute('data-id'), // dataset.id 대신 getAttribute 사용 권장
        orderIndex: i
    }));

    const response = await fetch('/api/workout/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: orders })
    });

    if (response.ok) {
        // 성공 시 편집 모드 해제 및 UI 복구
        const list = document.getElementById('workoutList');
        list.classList.remove('edit-mode');
        document.getElementById('editOrderFooter').style.display = 'none';
        
        // 추가된 핸들 삭제 및 숨긴 버튼 복구
        document.querySelectorAll('.order-handle').forEach(h => h.remove());
        document.querySelectorAll('.workout-manage').forEach(m => m.style.display = 'block');
        
        if(sortableInstance) sortableInstance.destroy();
        
        alert("순서가 저장되었습니다.");
        window.fetchTodayData(); // 바뀐 순서로 다시 불러오기
    }
};

window.showResetModal = function() { window.closeMore(); document.getElementById('resetModal').classList.add('open'); };
window.closeReset = function() { document.getElementById('resetModal').classList.remove('open'); };