/* FITO - 그룹 라이브 저장소 JS v5 - 스토어 연동, 큰 플레이어, 시크바 */
let currentSort='latest',currentVideoId=null,fitsCaptions=[],fitsStartPct=10,fitsEndPct=50,selectedMusicId=null;
let videos=[];
const MUSIC_LIST=[
  {id:1,name:'Energetic Workout Beat',artist:'FitMusic',duration:'2:45'},
  {id:2,name:'Morning Run Vibes',artist:'RunBeats',duration:'3:12'},
  {id:3,name:'Core Power Mix',artist:'GymTracks',duration:'2:30'},
  {id:4,name:'Stretch & Relax',artist:'ChillFit',duration:'4:01'},
  {id:5,name:'HIIT Timer Beat',artist:'FitMusic',duration:'1:58'},
  {id:6,name:'Cardio Rush',artist:'RunBeats',duration:'3:30'},
  {id:7,name:'Cool Down Melody',artist:'ChillFit',duration:'4:15'},
];

function loadVideos(){
  const gid=parseInt(new URLSearchParams(location.search).get('group_id')||'1');
  const store=FITO_STORE.get();
  videos=(store.groupStorage&&store.groupStorage[gid])||[];
}

function setSort(s,btn){currentSort=s;document.querySelectorAll('.gs-sort-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderVideos();}

function renderVideos(){
  const list=document.getElementById('videoList'),empty=document.getElementById('emptyState');
  if(!videos.length){list.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  let sorted=[...videos];
  if(currentSort==='latest')sorted.sort((a,b)=>new Date(b.date)-new Date(a.date));
  else sorted.sort((a,b)=>a.title.localeCompare(b.title,'ko'));
  list.innerHTML=sorted.map(v=>{
    if(v.damaged)return `<div class="gs-video-card ani" style="opacity:.4;pointer-events:none"><div class="gs-video-thumb"><span class="gs-video-duration">${v.duration}</span></div><div class="gs-video-info"><div class="gs-video-title">${v.title}</div><div class="gs-video-meta">${v.date} · ${v.participants}</div><div style="font-size:10px;color:#e05c4b;font-weight:600;margin-top:2px">영상 파일이 손상되었습니다</div></div></div>`;
    return `<div class="gs-video-card ani" onclick="openVideoDetail(${v.id})"><div class="gs-video-thumb"><span class="gs-video-duration">${v.duration}</span></div><div class="gs-video-info"><div class="gs-video-title">${v.title}</div><div class="gs-video-meta">${v.date} · ${v.participants}</div><div class="gs-video-actions"><button class="gs-video-action-btn" onclick="event.stopPropagation();openFitsEditorDirect(${v.id})">핏츠 만들기</button><button class="gs-video-action-btn" onclick="event.stopPropagation();showSnackbar('다운로드를 시작합니다')">다운로드</button></div></div></div>`;
  }).join('');
}

/* ── 영상 상세 + 큰 플레이어 + 시크바 ── */
let playInterval=null,playTime=0,currentTotalSec=0;
function openVideoDetail(id){
  currentVideoId=id;const v=videos.find(v=>v.id===id);if(!v)return;
  currentTotalSec=v.totalSec||1200;playTime=0;
  document.getElementById('detailTitle').textContent=v.title;
  document.getElementById('detailMeta').textContent=`${v.date} · ${v.participants} · ${v.duration}`;
  // 큰 플레이어
  document.getElementById('playerArea').innerHTML=`
    <div style="width:100%;aspect-ratio:16/9;background:#111;border-radius:14px;position:relative;overflow:hidden;margin-bottom:14px;min-height:200px">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer" id="playBtn" onclick="togglePlay()">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">
          <svg id="playIcon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:10px 14px;background:linear-gradient(transparent,rgba(0,0,0,.7))">
        <div style="width:100%;height:6px;background:rgba(255,255,255,.25);border-radius:3px;overflow:hidden;cursor:pointer;position:relative" id="seekBar" onclick="seekVideo(event)">
          <div id="playProgress" style="width:0%;height:100%;background:#fff;border-radius:3px;transition:width .1s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:6px">
          <span style="font-size:12px;color:rgba(255,255,255,.7)" id="playCurrent">00:00</span>
          <span style="font-size:12px;color:rgba(255,255,255,.7)">${v.duration}</span>
        </div>
      </div>
    </div>`;
  document.getElementById('videoOverlay').classList.add('open');
  document.getElementById('videoSheet').classList.add('open');
}

function togglePlay(){
  if(playInterval){
    clearInterval(playInterval);playInterval=null;
    document.getElementById('playIcon').innerHTML='<polygon points="5 3 19 12 5 21 5 3"/>';
    return;
  }
  document.getElementById('playIcon').innerHTML='<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  playInterval=setInterval(()=>{
    playTime++;
    const pct=Math.min(100,(playTime/currentTotalSec)*100);
    document.getElementById('playProgress').style.width=pct+'%';
    const m=Math.floor(playTime/60),s=playTime%60;
    document.getElementById('playCurrent').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(playTime>=currentTotalSec){clearInterval(playInterval);playInterval=null;playTime=0;document.getElementById('playIcon').innerHTML='<polygon points="5 3 19 12 5 21 5 3"/>';}
  },100); // 10x speed mock
}

function seekVideo(e){
  const bar=document.getElementById('seekBar');
  const rect=bar.getBoundingClientRect();
  const pct=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
  playTime=Math.floor(pct*currentTotalSec);
  document.getElementById('playProgress').style.width=(pct*100)+'%';
  const m=Math.floor(playTime/60),s=playTime%60;
  document.getElementById('playCurrent').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function closeVideoDetail(){document.getElementById('videoOverlay').classList.remove('open');document.getElementById('videoSheet').classList.remove('open');if(playInterval){clearInterval(playInterval);playInterval=null;}playTime=0;}

/* ═══ 핏츠 만들기 ═══ */
function openFitsEditor(){closeVideoDetail();initFitsEditor(currentVideoId);}
function openFitsEditorDirect(id){currentVideoId=id;initFitsEditor(id);}
function initFitsEditor(vid){
  const v=videos.find(v=>v.id===vid);if(!v){showSnackbar('영상을 찾을 수 없습니다.');return;}
  fitsCaptions=[];selectedMusicId=null;fitsStartPct=10;fitsEndPct=50;
  document.getElementById('fitsSourceTitle').textContent=v.title;
  document.getElementById('fitsDesc').value='';
  document.getElementById('fitsCaptionList').innerHTML='';
  renderFitsTimeline(v);renderMusicList();renderFitsCaptions();
  document.getElementById('fitsOverlay').classList.add('open');
  document.getElementById('fitsSheet').classList.add('open');
  setupTimelineDrag(v);
}
function closeFitsEditor(){document.getElementById('fitsOverlay').classList.remove('open');document.getElementById('fitsSheet').classList.remove('open');}

function renderFitsTimeline(v){
  const fill=document.getElementById('fitsFill');
  fill.style.left=fitsStartPct+'%';fill.style.width=(fitsEndPct-fitsStartPct)+'%';
  document.getElementById('fitsHandleL').style.left=`calc(${fitsStartPct}% - 8px)`;
  document.getElementById('fitsHandleR').style.left=`calc(${fitsEndPct}% - 8px)`;
  const ts=v.totalSec||1200;
  const startSec=Math.round(ts*fitsStartPct/100);
  const endSec=Math.round(ts*fitsEndPct/100);
  document.getElementById('fitsStartTime').textContent=formatSec(startSec);
  document.getElementById('fitsEndTime').textContent=formatSec(endSec);
  const dur=endSec-startSec;
  document.getElementById('fitsDuration').textContent=dur>=60?`${Math.floor(dur/60)}분 ${dur%60}초`:`${dur}초`;
}

function setupTimelineDrag(v){
  const bar=document.getElementById('fitsTimelineBar');
  const hL=document.getElementById('fitsHandleL'),hR=document.getElementById('fitsHandleR');
  let dragging=null;
  function getX(e){return(e.touches?e.touches[0]:e).clientX;}
  hL.ontouchstart=hL.onmousedown=(e)=>{e.preventDefault();dragging='left';};
  hR.ontouchstart=hR.onmousedown=(e)=>{e.preventDefault();dragging='right';};
  function onMove(e){
    if(!dragging)return;e.preventDefault&&e.preventDefault();
    const rect=bar.getBoundingClientRect();
    const pct=Math.max(0,Math.min(100,((getX(e)-rect.left)/rect.width)*100));
    if(dragging==='left')fitsStartPct=Math.max(0,Math.min(pct,fitsEndPct-3));
    else fitsEndPct=Math.min(100,Math.max(pct,fitsStartPct+3));
    renderFitsTimeline(v);
  }
  document.addEventListener('touchmove',onMove,{passive:false});
  document.addEventListener('mousemove',onMove);
  document.addEventListener('touchend',()=>{dragging=null;});
  document.addEventListener('mouseup',()=>{dragging=null;});
}

function formatSec(s){const m=Math.floor(s/60),sec=s%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}

function renderMusicList(){
  document.getElementById('musicListEl').innerHTML=
    `<div class="ml-item ${selectedMusicId===null?'sel':''}" onclick="selectMusic(null)"><span style="font-size:13px;font-weight:600">음악 없음</span></div>`+
    MUSIC_LIST.map(m=>{
      const sel=selectedMusicId===m.id;
      return `<div class="ml-item ${sel?'sel':''}" onclick="selectMusic(${m.id})">
        <span style="font-size:16px">${sel?'🎵':'🎶'}</span>
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${m.name}</div><div style="font-size:10px;${sel?'color:rgba(255,255,255,.6)':'color:var(--gray-400)'}">${m.artist} · ${m.duration}</div></div>
        ${sel?'<span style="font-size:12px">✓</span>':''}
      </div>`;
    }).join('');
}
function selectMusic(id){selectedMusicId=id;renderMusicList();}

function addFitsCaption(){
  const text=document.getElementById('fitsCaptionText').value.trim();
  const start=document.getElementById('fitsCaptionStart').value.trim();
  const end=document.getElementById('fitsCaptionEnd').value.trim();
  if(!text){showSnackbar('자막 내용을 입력해주세요.');return;}
  if(!start.match(/^\d{2}:\d{2}$/)||!end.match(/^\d{2}:\d{2}$/)){showSnackbar('시점을 00:00 형식으로 입력해주세요.');return;}
  fitsCaptions.push({text,start,end});
  document.getElementById('fitsCaptionText').value='';
  document.getElementById('fitsCaptionStart').value='';
  document.getElementById('fitsCaptionEnd').value='';
  renderFitsCaptions();
}
function removeFitsCaption(i){fitsCaptions.splice(i,1);renderFitsCaptions();}
function renderFitsCaptions(){
  const list=document.getElementById('fitsCaptionList');
  if(!fitsCaptions.length){list.innerHTML='<div style="font-size:11px;color:var(--gray-400);padding:4px 0">추가된 자막이 없습니다</div>';return;}
  list.innerHTML=fitsCaptions.map((c,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--gray-50);border-radius:8px;margin-bottom:4px"><span style="font-size:11px;font-weight:700;color:var(--blue);flex-shrink:0">${c.start}~${c.end}</span><span style="font-size:12px;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${c.text}</span><span style="cursor:pointer;font-size:14px;color:var(--gray-400)" onclick="removeFitsCaption(${i})">✕</span></div>`).join('');
}

function shareFits(){
  if(fitsEndPct-fitsStartPct<1){showSnackbar('구간을 올바르게 설정해주세요.');return;}
  const v=videos.find(v=>v.id===currentVideoId);if(!v)return;
  const dur=Math.round((v.totalSec||1200)*(fitsEndPct-fitsStartPct)/100);
  if(dur>180){showSnackbar('핏츠는 최대 3분까지 가능합니다.');return;}
  const gid=parseInt(new URLSearchParams(location.search).get('group_id')||'1');
  FITO_STORE.update(s=>{
    if(!s.groupStories[gid])s.groupStories[gid]=[];
    s.groupStories[gid].unshift({id:Date.now(),author:s.myName||'나',title:document.getElementById('fitsDesc').value.trim()||(v.title+' 핏츠'),time:'방금 전',views:0});
  });
  closeFitsEditor();showSnackbar('핏츠가 그룹에 공유되었습니다! 🎉');
}

function showSnackbar(msg){const sb=document.getElementById('snackbar');sb.textContent=msg;sb.classList.add('show');setTimeout(()=>sb.classList.remove('show'),3000);}
document.addEventListener('DOMContentLoaded',()=>{loadVideos();renderVideos();});
