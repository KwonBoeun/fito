/* FITO - 그룹 라이브 JS v4 - ALL 하단+풀스크린, 대기화면 */
let micOn=true,camOn=false,isRec=false,volumeOn=true,showAll=false;
const EMOJIS=['👏','💪','🔥','❤️','😂','✋','👍','🎉','💯','😍','🏋️','🤩'];
const PARTICIPANTS=[
  {name:'핏걸_나연',isHost:true,camOn:true,hand:false},
  {name:'스쿼트킹',isHost:false,camOn:true,hand:false},
  {name:'런지퀸',isHost:false,camOn:false,hand:true},
  {name:'코어킹',isHost:false,camOn:true,hand:false},
  {name:'다이어터민',isHost:false,camOn:false,hand:false},
  {name:'홈트여왕',isHost:false,camOn:true,hand:false},
];
let liveChatMessages=[{author:'핏걸_나연',text:'다들 준비됐나요?',time:'14:30'},{author:'스쿼트킹',text:'네! 시작해요 💪',time:'14:31'}];

/* ── 대기/라이브 화면 분기 ── */
function initLiveScreen(){
  const status=new URLSearchParams(location.search).get('status')||'live';
  if(status==='scheduled'||status==='soon'){
    // 대기 화면 표시
    document.getElementById('liveContent').style.display='none';
    document.getElementById('waitingScreen').style.display='flex';
    const startTime=new URLSearchParams(location.search).get('time')||'';
    document.getElementById('waitStartTime').textContent=startTime||'곧 시작';
    // 카운트다운 (mock)
    let cnt=status==='soon'?30:300;
    const ti=setInterval(()=>{
      cnt--;
      const m=Math.floor(cnt/60),s=cnt%60;
      document.getElementById('waitCountdown').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if(cnt<=0){clearInterval(ti);document.getElementById('liveContent').style.display='block';document.getElementById('waitingScreen').style.display='none';renderParticipants();}
    },1000);
  } else {
    document.getElementById('waitingScreen').style.display='none';
    renderParticipants();
  }
}

function renderParticipants(){
  const grid=document.getElementById('participantsGrid');
  const maxShow=showAll?PARTICIPANTS.length:4;
  grid.innerHTML=PARTICIPANTS.slice(0,maxShow).map(p=>`
    <div class="gl-participant">
      ${p.camOn?'':`<div class="gl-participant-avatar"></div>`}
      <span class="gl-participant-name">${p.name}${p.isHost?' 👑':''}</span>
      ${p.hand?'<span class="gl-participant-hand">✋</span>':''}
    </div>`).join('');
  const moreEl=document.getElementById('moreParticipants');
  if(PARTICIPANTS.length>4){moreEl.style.display='flex';document.getElementById('moreBtn').textContent=showAll?'접기 ▲':`더보기 (${PARTICIPANTS.length-4}명) ▼`;}else moreEl.style.display='none';
}
function toggleAllParticipants(){showAll=!showAll;renderParticipants();}

function toggleMic(){micOn=!micOn;document.getElementById('micBtn').classList.toggle('off',!micOn);showSnackbar(micOn?'마이크 ON':'마이크 OFF');}
function toggleCam(){camOn=!camOn;document.getElementById('camBtn').classList.toggle('off',!camOn);document.getElementById('filterBtn').classList.toggle('off',!camOn);}
function toggleVolume(){volumeOn=!volumeOn;document.getElementById('volumeBtn').innerHTML=volumeOn?'<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>':'<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';}

/* ── 이모티콘 선택 ── */
function sendEmoji(){document.getElementById('emojiOverlay').classList.add('open');document.getElementById('emojiSheet').classList.add('open');}
function closeEmoji(){document.getElementById('emojiOverlay').classList.remove('open');document.getElementById('emojiSheet').classList.remove('open');}
function pickEmoji(e){closeEmoji();showSnackbar(`${e} 이모티콘을 보냈습니다`);}

function toggleFilter(){if(!camOn){showSnackbar('카메라를 먼저 켜주세요');return;}showSnackbar('필터가 적용되었습니다');}
function sharScreen(){showSnackbar('화면 공유 요청을 보냈습니다');}

/* ── 더보기 ── */
function openMoreTools(){document.getElementById('moreOverlay').classList.add('open');document.getElementById('moreSheet').classList.add('open');}
function closeMoreTools(){document.getElementById('moreOverlay').classList.remove('open');document.getElementById('moreSheet').classList.remove('open');}

/* ── 라이브 채팅 ── */
function openLiveChat(){closeMoreTools();renderLiveChatMessages();document.getElementById('chatOverlay').classList.add('open');document.getElementById('chatSheet').classList.add('open');}
function closeLiveChat(){document.getElementById('chatOverlay').classList.remove('open');document.getElementById('chatSheet').classList.remove('open');}
function renderLiveChatMessages(){
  document.getElementById('liveChatList').innerHTML=liveChatMessages.map(m=>`<div style="margin-bottom:8px"><span style="font-size:11px;font-weight:700;color:var(--orange)">${m.author}</span> <span style="font-size:10px;color:var(--gray-400)">${m.time}</span><div style="font-size:13px;color:var(--black);margin-top:2px">${m.text}</div></div>`).join('');
  document.getElementById('liveChatList').scrollTop=99999;
}
function sendLiveChat(){const i=document.getElementById('liveChatInput'),t=i.value.trim();if(!t)return;const n=new Date();liveChatMessages.push({author:'나',text:t,time:`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`});i.value='';renderLiveChatMessages();}

/* ── 공지 편집 ── */
function editNotice(){closeMoreTools();document.getElementById('noticeEditOverlay').classList.add('open');document.getElementById('noticeEditSheet').classList.add('open');document.getElementById('noticeEditInput').value=document.getElementById('noticeText').textContent;}
function closeNoticeEdit(){document.getElementById('noticeEditOverlay').classList.remove('open');document.getElementById('noticeEditSheet').classList.remove('open');}
function saveNotice(){const v=document.getElementById('noticeEditInput').value.trim();if(v)document.getElementById('noticeText').textContent=v;closeNoticeEdit();showSnackbar('공지가 수정되었습니다');}

function toggleRec(){isRec=!isRec;document.getElementById('recIcon').style.display=isRec?'flex':'none';document.getElementById('recToggleLabel').textContent=isRec?'녹화 중지':'녹화 시작';closeMoreTools();showSnackbar(isRec?'녹화가 시작되었습니다':'녹화가 중지되었습니다');}

/* ── ALL 보기 (풀스크린) ── */
function openAllView(){
  const ov=document.getElementById('allOverlay');
  ov.style.display='flex';
  const grid=document.getElementById('allGrid');
  // 풀스크린 그리드
  const cols=PARTICIPANTS.length<=4?2:PARTICIPANTS.length<=6?3:4;
  grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;
  grid.innerHTML=PARTICIPANTS.map(p=>`
    <div style="aspect-ratio:3/4;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
      ${p.camOn?'<div style="width:100%;height:100%;background:linear-gradient(135deg,#222,#333)"></div>':`<div style="width:50px;height:50px;border-radius:50%;background:#444"></div>`}
      <span style="position:absolute;bottom:6px;left:8px;font-size:11px;color:#fff;background:rgba(0,0,0,.6);padding:2px 8px;border-radius:999px;font-weight:600">${p.name}${p.isHost?' 👑':''}</span>
      ${p.hand?'<span style="position:absolute;top:6px;right:8px;font-size:18px">✋</span>':''}
    </div>`).join('');
}
function closeAllView(){document.getElementById('allOverlay').style.display='none';}

/* ── 나가기 ── */
let exitLock=false;
function exitLive(){if(exitLock)return;document.getElementById('exitModal').classList.add('open');}
function closeExitModal(){document.getElementById('exitModal').classList.remove('open');}
function confirmExit(){exitLock=true;closeExitModal();location.href=window.URL_GROUP_MAIN||'/group';}

let snackTimer=null;
function showSnackbar(msg){const sb=document.getElementById('snackbar');sb.textContent=msg;sb.style.bottom='80px';sb.classList.add('show');clearTimeout(snackTimer);snackTimer=setTimeout(()=>sb.classList.remove('show'),2500);}

document.addEventListener('DOMContentLoaded',()=>{
  initLiveScreen();
  document.getElementById('emojiGrid').innerHTML=EMOJIS.map(e=>`<div style="font-size:28px;text-align:center;padding:10px;cursor:pointer;border-radius:8px;transition:background .1s" onclick="pickEmoji('${e}')" ontouchstart="this.style.background='#eee'" ontouchend="this.style.background=''">${e}</div>`).join('');
});
