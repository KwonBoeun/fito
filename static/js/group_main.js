/* FITO - 그룹 메인 JS v4 - 채팅방 추가 수정 */
let store,group,myRole,members,lives,stories,gid;
function loadData(){
  store=FITO_STORE.get();gid=parseInt(window.GROUP_ID);
  group=store.groups.find(g=>g.id===gid);
  if(!group){const rec=(store.recommendGroups||[]).find(g=>g.id===gid);if(rec)group={...rec,joined:false,myRole:'none',liveCnt:0,chatCnt:0,hasLive:false,liveViewers:0,inactive:false};}
  if(!group){showSnackbar('해당 그룹이 존재하지 않습니다.');return false;}
  myRole=group.myRole||'none';members=(store.groupMembers&&store.groupMembers[gid])||[];
  lives=(store.groupLives&&store.groupLives[gid])||[];stories=(store.groupStories&&store.groupStories[gid])||[];
  return true;
}
function renderGroupInfo(){
  document.getElementById('headerGroupName').textContent=group.name;
  document.getElementById('groupName').textContent=group.name;
  document.getElementById('groupCreator').textContent=`그룹장: ${group.creator}`;
  document.getElementById('groupDesc').textContent=group.desc||'설명이 없습니다.';
  document.getElementById('groupTags').innerHTML=(group.tags||[]).map(t=>`<span class="gm-tag" onclick="searchByTag('${t}')" style="cursor:pointer">${t}</span>`).join('');
  const btn=document.getElementById('joinLeaveBtn');
  if(group.joined){btn.textContent='탈퇴';btn.className='gm-join-btn leave';}else{btn.textContent='가입 신청';btn.className='gm-join-btn join';}
  if(group.bannerImg){const b=document.getElementById('groupBanner');b.style.backgroundImage=`url(${group.bannerImg})`;b.style.backgroundSize='cover';}
  if(group.profileImg){const p=document.getElementById('groupProfileImg');p.style.backgroundImage=`url(${group.profileImg})`;p.style.backgroundSize='cover';}
  const avatars = document.getElementById('membersAvatars');
  avatars.innerHTML=Array.from({length:Math.min(members.length,4)},()=>'<div class="gm-avatar"></div>').join('');
  document.getElementById('membersCount').textContent=`${members.length}명`;
  // 저장소 카운트 (실제 데이터)
  const storageCount = FITO_STORE.getStorageCount(gid);
  document.getElementById('storageCount').textContent=storageCount>0?`${storageCount}개`:'없음';
  if(!group.joined){['chatSection','liveSection','newLiveWrap','storageSection'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});}
}
function searchByTag(tag){location.href=`/group?tag=${encodeURIComponent(tag)}`;}
function renderIssues(){
  const scroll=document.getElementById('storyScroll');
  if(stories.length===0){scroll.innerHTML=`<span style="font-size:11px;color:var(--gray-400);padding:8px 0">${group.joined?'업로드 된 핏츠가 없습니다. 첫 번째 핏츠의 주인공이 되어 보세요!':'업로드 된 핏츠가 없습니다.'}</span>`;}
  else{scroll.innerHTML=stories.map(s=>`<div class="gm-story-item" title="${s.author}: ${s.title}"></div>`).join('');}
  const chatText=document.getElementById('todayChatText'),chatAuthor=document.getElementById('todayChatAuthor');
  const best=FITO_STORE.getTodayBestChat(gid);
  if(best){chatText.textContent=best.text;chatAuthor.textContent=`— ${best.author} ♥ ${best.likes}`;}
  else{chatText.textContent='오늘은 조용하군요...!';chatAuthor.textContent='';}
}
let storySortType='latest';
function openStories(){if(stories.length===0){showSnackbar('핏츠가 없습니다.');return;}renderStoryList();document.getElementById('storyOverlay').classList.add('open');document.getElementById('storySheet').classList.add('open');}
function closeStories(){document.getElementById('storyOverlay').classList.remove('open');document.getElementById('storySheet').classList.remove('open');}
function sortStories(t){storySortType=t;document.getElementById('storyLatest').className=t==='latest'?'ss-btn active':'ss-btn';document.getElementById('storyPopular').className=t==='popular'?'ss-btn active':'ss-btn';renderStoryList();}
function renderStoryList(){
  let sorted=[...stories];if(storySortType==='popular')sorted.sort((a,b)=>(b.views||0)-(a.views||0));
  document.getElementById('storyList').innerHTML=sorted.map(s=>`
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--gray-100)">
      <div style="width:56px;height:56px;border-radius:8px;background:var(--gray-200);flex-shrink:0;display:flex;align-items:center;justify-content:center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
      <div style="flex:1"><div style="font-size:14px;font-weight:600;margin-bottom:2px">${s.title}</div>
      <div style="font-size:11px;color:var(--gray-400)">${s.author} · ${s.time} · 조회 ${s.views||0}회</div></div></div>`).join('');
}
function renderChats(){
  const list=document.getElementById('chatList');
  const chats=(store.groupChats&&store.groupChats[gid])||[];
  if(chats.length===0){list.innerHTML='<div class="gp-empty">채팅방이 없습니다.</div>';return;}
  const mn=store.myName||'나';
  list.innerHTML=chats.map(c=>{
    const msgs=(store.groupMessages||{})[c.id]||[];
    const lastMsg=msgs.length>0?`${msgs[msgs.length-1].author}: ${msgs[msgs.length-1].text}`:'메시지 없음';
    const icon=c.type==='all'?'<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>':'<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    const hasAccess=c.type==='all'||(c.allowedMembers&&c.allowedMembers.includes(mn));
    const ls=hasAccess?'':'opacity:0.4';
    return `<div class="gm-chat-item" style="${ls}" onclick="openChat('${c.id}',${hasAccess})">
      <div class="gm-chat-icon">${icon}</div><div class="gm-chat-info"><div class="gm-chat-name">${c.name}${!hasAccess?' 🔒':''}</div>
      <div class="gm-chat-preview">${hasAccess?lastMsg:'접근 권한이 없습니다'}</div></div></div>`;
  }).join('');
}
function renderLives(){
  const list=document.getElementById('liveList');
  if(lives.length===0){list.innerHTML='<div class="gp-empty">라이브가 만들어지지 않았습니다.<br>새로운 라이브를 만들어 보는건 어떨까요?</div>';return;}
  const order={live:0,soon:1,scheduled:2};
  const sorted=[...lives].sort((a,b)=>(order[a.status]||2)-(order[b.status]||2));
  list.innerHTML=sorted.map(l=>{
    let sh='',mt='';
    if(l.status==='live'){sh='<span class="gm-live-status live">● LIVE</span>';mt=`${l.participants}/${l.max}명 참여 중`;}
    else if(l.status==='soon'){sh='<span class="gm-live-status soon">곧 시작</span>';mt=`${l.startTime} 시작 예정`;}
    else{sh='<span class="gm-live-status scheduled">예정</span>';mt=`${l.startTime} 시작 예정`;}
    return `<div class="gm-live-card" onclick="joinLive(${l.id},'${l.status}')">
      <div class="gm-live-thumb">${l.status==='live'?'<div style="position:absolute;inset:0;background:rgba(232,22,28,.1)"></div>':''}</div>
      <div class="gm-live-info"><div class="gm-live-title">${l.title}</div><div class="gm-live-meta">${l.host} · ${mt}</div>${sh}</div></div>`;
  }).join('');
}
function toggleMembership(){if(group.joined)document.getElementById('leaveModal').classList.add('open');else document.getElementById('joinModal').classList.add('open');}
function closeJoinModal(){document.getElementById('joinModal').classList.remove('open');}
function closeLeaveModal(){document.getElementById('leaveModal').classList.remove('open');}
function submitJoin(){const g=document.getElementById('joinGreeting').value.trim();if(g.length<1||g.length>100){showSnackbar('가입인사를 1~100자로 입력해주세요.');return;}closeJoinModal();showSnackbar('가입 신청이 전송되었습니다.');}
function confirmLeave(){FITO_STORE.update(s=>{const g=s.groups.find(g=>g.id===gid);if(g){g.joined=false;g.myRole='none';}if(s.groupMembers[gid])s.groupMembers[gid]=s.groupMembers[gid].filter(m=>m.name!==(s.myName||'나'));});closeLeaveModal();showSnackbar('그룹에서 탈퇴했습니다.');setTimeout(()=>location.href='/group',1000);}
function openMembersSheet(){renderMembersList();document.getElementById('membersOverlay').classList.add('open');document.getElementById('membersSheet').classList.add('open');}
function closeMembersSheet(){document.getElementById('membersOverlay').classList.remove('open');document.getElementById('membersSheet').classList.remove('open');}
function renderMembersList(){
  const isAdmin=myRole==='owner'||myRole==='manager';
  const pending=(store.groupPending&&store.groupPending[gid])||[];
  const list=document.getElementById('membersList');let html='';
  if(isAdmin&&pending.length>0){
    html+='<div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:8px">가입 대기 중</div>';
    html+=pending.map((p,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)"><div style="width:32px;height:32px;border-radius:50%;background:var(--gray-200);flex-shrink:0"></div><div style="flex:1"><div style="font-size:13px;font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--gray-400)">${p.greeting}</div></div><button onclick="acceptPending(${i})" style="padding:4px 10px;background:#000;color:#fff;border:none;border-radius:999px;font-size:11px;font-weight:600;cursor:pointer">수락</button><button onclick="rejectPending(${i})" style="padding:4px 10px;background:#f2f2f2;color:#e05c4b;border:none;border-radius:999px;font-size:11px;font-weight:600;cursor:pointer">거절</button></div>`).join('');
    html+='<div style="height:12px"></div>';
  }
  html+='<div style="font-size:12px;font-weight:700;color:var(--gray-500);margin-bottom:8px">멤버</div>';
  const rl={owner:'그룹장',manager:'매니저',member:'그룹원'},rc={owner:'var(--orange)',manager:'var(--blue)',member:'var(--gray-400)'};
  html+=members.map(m=>{
    let act='';
    if(myRole==='owner'&&m.role==='member'&&m.name!==(store.myName||'나'))act=`<button onclick="promoteMember('${m.name}')" style="padding:3px 8px;background:var(--blue);color:#fff;border:none;border-radius:999px;font-size:10px;cursor:pointer;margin-right:4px">승급</button><button onclick="kickMember('${m.name}')" style="padding:3px 8px;background:#fdecea;color:#e05c4b;border:none;border-radius:999px;font-size:10px;cursor:pointer">내보내기</button>`;
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)"><div style="width:32px;height:32px;border-radius:50%;background:var(--gray-200);flex-shrink:0"></div><div style="flex:1"><div style="font-size:13px;font-weight:600">${m.name}</div></div><span style="font-size:10px;font-weight:700;color:${rc[m.role]};padding:2px 8px;background:var(--gray-50);border-radius:999px">${rl[m.role]}</span>${act}</div>`;
  }).join('');
  list.innerHTML=html;
}
function acceptPending(i){FITO_STORE.update(s=>{const p=(s.groupPending[gid]||[]);if(p[i]){if(!s.groupMembers[gid])s.groupMembers[gid]=[];s.groupMembers[gid].push({name:p[i].name,role:'member'});p.splice(i,1);}});loadData();renderGroupInfo();renderMembersList();showSnackbar('가입을 수락했습니다.');}
function rejectPending(i){FITO_STORE.update(s=>{(s.groupPending[gid]||[]).splice(i,1);});renderMembersList();showSnackbar('가입을 거절했습니다.');}
function promoteMember(n){FITO_STORE.update(s=>{const m=(s.groupMembers[gid]||[]).find(m=>m.name===n);if(m)m.role='manager';});loadData();renderMembersList();showSnackbar(`${n}님이 매니저로 승급되었습니다.`);}
function kickMember(n){FITO_STORE.update(s=>{s.groupMembers[gid]=(s.groupMembers[gid]||[]).filter(m=>m.name!==n);});loadData();renderGroupInfo();renderMembersList();showSnackbar(`${n}님을 내보냈습니다.`);}

function openChat(chatId,hasAccess){if(!group.joined){showSnackbar('그룹에 가입해야 채팅에 참여할 수 있습니다.');return;}if(!hasAccess){showSnackbar('이 비밀 채팅방에 접근할 권한이 없습니다.');return;}location.href=`${window.URL_GROUP_CHAT}&type=${chatId}`;}

/* ── 채팅방 추가 (수정: canManage 체크) ── */
function addChat(){
  if(!FITO_STORE.canManage(gid)){
    document.getElementById('noPermMsg').textContent='채팅방을 만들 권한이 없습니다. (매니저 이상)';
    document.getElementById('noPermModal').classList.add('open');return;
  }
  const name=prompt('비밀 채팅방 이름을 입력하세요:');
  if(!name||!name.trim()) return;
  FITO_STORE.update(s=>{
    const cid='secret-'+s.nextChatId++;
    if(!s.groupChats[gid])s.groupChats[gid]=[];
    s.groupChats[gid].push({id:cid,name:name.trim(),type:'secret',allowedMembers:[s.myName||'나']});
    s.groupMessages[cid]=[];
  });
  store=FITO_STORE.get();
  renderChats();
  showSnackbar(`"${name.trim()}" 비밀 채팅방이 추가되었습니다.`);
}

/* ── 라이브 참가 (시작 전이면 대기화면으로) ── */
function joinLive(id,status){
  if(!group.joined){showSnackbar('그룹에 가입해야 라이브에 참여할 수 있습니다.');return;}
  const live=lives.find(l=>l.id===id);
  const timeParam=live&&live.startTime?`&time=${live.startTime}`:'';
  location.href=`${window.URL_GROUP_LIVE}?id=${id}&status=${status}${timeParam}`;
}
let liveCreateLock=false;
function createNewLive(){
  if(!group.joined){showSnackbar('그룹에 가입해야 라이브를 만들 수 있습니다.');return;}
  if(!FITO_STORE.canManage(gid)){showSnackbar('라이브를 만들 권한이 없습니다. (매니저 이상)');return;}
  if(liveCreateLock)return;liveCreateLock=true;setTimeout(()=>{liveCreateLock=false;},2000);
  location.href=window.URL_GROUP_LIVE_CREATE;
}
function showSnackbar(msg){const sb=document.getElementById('snackbar');sb.textContent=msg;sb.classList.add('show');setTimeout(()=>sb.classList.remove('show'),3000);}
document.addEventListener('DOMContentLoaded',()=>{
  if(!loadData())return;renderGroupInfo();renderIssues();renderChats();renderLives();
  // URL에 tag 파라미터가 있으면 검색
  const urlTag=new URLSearchParams(location.search).get('tag');
  if(urlTag)searchByTag(urlTag);
});
