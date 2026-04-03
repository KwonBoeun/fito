/* FITO - 그룹 채팅 JS v4 - 좋아요시 스크롤 위치 유지 */
let chatId, messages, myName;
const BAD_WORDS = ['시발','씨발','ㅅㅂ','개새끼','ㄱㅅㄲ','병신','ㅂㅅ','지랄','ㅈㄹ'];

function initChat() {
  const store=FITO_STORE.get(); myName=store.myName||'나';
  chatId=window.CHAT_TYPE||'all';
  const gid=parseInt(window.GROUP_ID);
  const chats=(store.groupChats&&store.groupChats[gid])||[];
  if(chatId==='all'){ const ac=chats.find(c=>c.type==='all'); if(ac) chatId=ac.id; }
  if(!FITO_STORE.isMember(gid)){ showSnackbar('그룹에 가입해야 채팅에 참여할 수 있습니다.'); setTimeout(()=>location.href='/group',1500); return false; }
  const chat=chats.find(c=>c.id===chatId);
  if(chat&&chat.type==='secret'){ if(!chat.allowedMembers||!chat.allowedMembers.includes(myName)){ showSnackbar('이 비밀 채팅방에 접근할 권한이 없습니다.'); setTimeout(()=>history.back(),1500); return false; } }
  document.getElementById('chatTitle').textContent=(chat&&chat.name)||'전체 채팅';
  messages=(store.groupMessages&&store.groupMessages[chatId])||[];
  return true;
}

function renderMessages(scrollToBottom) {
  const list=document.getElementById('messageList');
  const prevScroll=list.scrollTop; // 현재 스크롤 위치 저장
  let html='',lastDate='';
  messages.forEach(m=>{
    if(m.date!==lastDate){lastDate=m.date;html+=`<div class="gc-msg-date-divider">${m.date}</div>`;}
    const isMe=m.author===myName;
    const liked=(m.likedBy||[]).includes(myName);
    const heart=liked?'❤️':'🤍';
    const cnt=m.likes>0?` ${m.likes}`:'';
    // 좋아요 버튼은 항상 표시
    const likeBtn=`<div class="gc-msg-like" onclick="event.stopPropagation();toggleLike(${m.id})">${heart}${cnt}</div>`;
    if(isMe){
      html+=`<div class="gc-msg mine"><div class="gc-msg-body">
        <div class="gc-msg-bubble mine">${m.text}${likeBtn}</div>
        <div class="gc-msg-time">${m.time}</div></div></div>`;
    } else {
      html+=`<div class="gc-msg"><div class="gc-msg-avatar"></div><div class="gc-msg-body">
        <div class="gc-msg-name">${m.author}</div>
        <div class="gc-msg-bubble other">${m.text}${likeBtn}</div>
        <div class="gc-msg-time">${m.time}</div></div></div>`;
    }
  });
  list.innerHTML=html;
  // 좋아요 시에는 스크롤 위치 유지, 새 메시지 시에만 맨 아래
  if(scrollToBottom) list.scrollTop=list.scrollHeight;
  else list.scrollTop=prevScroll;
}

function toggleLike(msgId) {
  const store=FITO_STORE.get();
  const msgs=store.groupMessages[chatId]; if(!msgs) return;
  const msg=msgs.find(m=>m.id===msgId); if(!msg) return;
  if(!msg.likedBy) msg.likedBy=[];
  const idx=msg.likedBy.indexOf(myName);
  if(idx>=0){msg.likedBy.splice(idx,1);msg.likes=Math.max(0,msg.likes-1);}
  else{msg.likedBy.push(myName);msg.likes=(msg.likes||0)+1;}
  FITO_STORE.save(store);
  messages=store.groupMessages[chatId];
  renderMessages(false); // 스크롤 유지
}

const chatInput=document.getElementById('chatInput');
const sendBtn=document.getElementById('sendBtn');
const charCount=document.getElementById('charCount');
chatInput.addEventListener('input',()=>{
  let v=chatInput.value; if(v.length>300){v=v.substring(0,300);chatInput.value=v;}
  charCount.textContent=v.length;
  sendBtn.classList.toggle('disabled',v.trim().length===0);
  chatInput.style.height='auto'; chatInput.style.height=Math.min(chatInput.scrollHeight,80)+'px';
});
chatInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});

function sendMessage() {
  const text=chatInput.value.trim(); if(!text) return;
  if(BAD_WORDS.some(w=>text.includes(w))){document.getElementById('badWordModal').classList.add('open');chatInput.value='';charCount.textContent='0';sendBtn.classList.add('disabled');return;}
  const now=new Date();
  FITO_STORE.update(s=>{
    const nid=s.nextMsgId++;
    if(!s.groupMessages[chatId])s.groupMessages[chatId]=[];
    s.groupMessages[chatId].push({id:nid,author:myName,text:text,time:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,likes:0,likedBy:[],date:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`});
  });
  messages=FITO_STORE.get().groupMessages[chatId]||[];
  chatInput.value='';charCount.textContent='0';sendBtn.classList.add('disabled');chatInput.style.height='auto';
  renderMessages(true); // 새 메시지: 맨 아래로
}

function closeBadWordModal(){document.getElementById('badWordModal').classList.remove('open');}
function openAttach(){document.getElementById('attachOverlay').classList.add('open');document.getElementById('attachSheet').classList.add('open');}
function closeAttach(){document.getElementById('attachOverlay').classList.remove('open');document.getElementById('attachSheet').classList.remove('open');}
function selectAttachType(t){closeAttach();showSnackbar(t==='image'?'이미지를 선택해주세요 (최대 20장, 300MB)':'동영상을 선택해주세요 (최대 20개, 300MB)');}
function showSnackbar(msg){const sb=document.getElementById('snackbar');sb.textContent=msg;sb.classList.add('show');setTimeout(()=>sb.classList.remove('show'),3000);}
document.addEventListener('DOMContentLoaded',()=>{if(initChat())renderMessages(true);});
