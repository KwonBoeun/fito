/* FITO - 그룹 라이브 만들기 JS v4 - 터치 드래그 시간 + 입력 가능 */
let visibility='public',peopleCount=4,selectedHour=0,selectedMin=0;
function sanitize(v){return v.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g,'');}

const nameInput=document.getElementById('liveName');
nameInput.addEventListener('input',()=>{nameInput.value=sanitize(nameInput.value);document.getElementById('nameCount').textContent=nameInput.value.length;});
function setVisibility(v){visibility=v;document.getElementById('btnPublic').classList.toggle('selected',v==='public');document.getElementById('btnPrivate').classList.toggle('selected',v==='private');}

/* ── 시간 설정 (터치 드래그 + 클릭 입력) ── */
function buildTimePicker(){
  const now=new Date();selectedHour=now.getHours();selectedMin=now.getMinutes();
  renderHour();renderMin();updateTimeDisplay();
  // 터치 드래그 설정
  setupDrag('hourArea',v=>{selectedHour=v;renderHour();updateTimeDisplay();},()=>selectedHour,0,23);
  setupDrag('minArea',v=>{selectedMin=v;renderMin();updateTimeDisplay();},()=>selectedMin,0,59);
}
function renderHour(){document.getElementById('hourDisplay').textContent=String(selectedHour).padStart(2,'0');}
function renderMin(){document.getElementById('minDisplay').textContent=String(selectedMin).padStart(2,'0');}
function updateTimeDisplay(){document.getElementById('selectedTime').textContent=`${String(selectedHour).padStart(2,'0')}:${String(selectedMin).padStart(2,'0')}`;}

function setupDrag(areaId,onSet,getVal,min,max){
  const el=document.getElementById(areaId);
  let startY=0,startVal=0,dragging=false;
  el.addEventListener('touchstart',e=>{startY=e.touches[0].clientY;startVal=getVal();dragging=true;e.preventDefault();},{passive:false});
  el.addEventListener('touchmove',e=>{
    if(!dragging)return;e.preventDefault();
    const dy=startY-e.touches[0].clientY; // 위로 드래그 = 양수 = 숫자 증가
    const step=Math.round(dy/20);
    let nv=startVal+step;
    // 순환
    while(nv>max)nv-=(max-min+1);
    while(nv<min)nv+=(max-min+1);
    onSet(nv);
  },{passive:false});
  el.addEventListener('touchend',()=>{dragging=false;});
  // 마우스도 지원
  el.addEventListener('mousedown',e=>{startY=e.clientY;startVal=getVal();dragging=true;});
  document.addEventListener('mousemove',e=>{
    if(!dragging)return;
    const dy=startY-e.clientY;const step=Math.round(dy/20);
    let nv=startVal+step;while(nv>max)nv-=(max-min+1);while(nv<min)nv+=(max-min+1);
    onSet(nv);
  });
  document.addEventListener('mouseup',()=>{dragging=false;});
}

function changeHour(d){selectedHour+=d;if(selectedHour>23)selectedHour=0;if(selectedHour<0)selectedHour=23;renderHour();updateTimeDisplay();}
function changeMin(d){selectedMin+=d;if(selectedMin>59)selectedMin=0;if(selectedMin<0)selectedMin=59;renderMin();updateTimeDisplay();}
function editHourDirect(){const v=prompt('시간을 입력하세요 (0~23):',String(selectedHour));if(v===null)return;const n=parseInt(v);if(isNaN(n)||n<0||n>23){showSnackbar('올바르지 않은 시간입니다.');return;}selectedHour=n;renderHour();updateTimeDisplay();}
function editMinDirect(){const v=prompt('분을 입력하세요 (0~59):',String(selectedMin));if(v===null)return;const n=parseInt(v);if(isNaN(n)||n<0||n>59){showSnackbar('올바르지 않은 시간입니다.');return;}selectedMin=n;renderMin();updateTimeDisplay();}

function changePeople(d){const n=peopleCount+d;if(n<4||n>8)return;peopleCount=n;document.getElementById('pplCount').textContent=peopleCount;document.getElementById('pplMinus').classList.toggle('disabled',peopleCount<=4);document.getElementById('pplPlus').classList.toggle('disabled',peopleCount>=8);}

function confirmLive(){
  const name=nameInput.value.trim();if(!name){showSnackbar('라이브 이름을 입력해주세요.');return;}
  const now=new Date(),selTime=new Date();selTime.setHours(selectedHour,selectedMin,0,0);
  if(selTime<=now){showSnackbar('올바르지 않은 시간입니다. 현재 시간 이후로 설정해주세요.');return;}
  const gid=parseInt(new URLSearchParams(location.search).get('group_id')||'1');
  if(!FITO_STORE.canManage(gid)){showSnackbar('라이브를 만들 권한이 없습니다.');return;}
  FITO_STORE.update(s=>{
    const nid=s.nextLiveId++;if(!s.groupLives[gid])s.groupLives[gid]=[];
    const ts=`${String(selectedHour).padStart(2,'0')}:${String(selectedMin).padStart(2,'0')}`;
    const dm=(selTime-now)/60000;
    s.groupLives[gid].push({id:nid,title:name,host:s.myName||'나',status:dm<=10?'soon':'scheduled',participants:0,max:peopleCount,startTime:ts,desc:document.getElementById('liveDesc').value.trim(),visibility:visibility,record:document.getElementById('recCheck').checked});
  });
  showSnackbar('라이브가 생성되었습니다!');setTimeout(()=>{location.href=window.URL_GROUP_MAIN||'/group';},1000);
}
function showSnackbar(msg){const sb=document.getElementById('snackbar');sb.textContent=msg;sb.classList.add('show');setTimeout(()=>sb.classList.remove('show'),3000);}
document.addEventListener('DOMContentLoaded',()=>{buildTimePicker();changePeople(0);});
