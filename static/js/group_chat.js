/* FITO - 그룹 채팅 JS v5 */
let chatId, messages, myName;
const BAD_WORDS=['시발','씨발','ㅅㅂ','개새끼','ㄱㅅㄲ','병신','ㅂㅅ','지랄','ㅈㄹ'];

function initChat(){
  const store=FITO_STORE.get();myName=store.myName||'나';
  chatId=window.CHAT_TYPE||'all';
  const gid=parseInt(window.GROUP_ID);
  const chats=(store.groupChats&&store.groupChats[gid])||[];
  if(chatId==='all'){const ac=chats.find(c=>c.type==='all');if(ac)chatId=ac.id;}
  if(!FITO_STORE.isMember(gid)){showSnackbar('그룹에 가입해야 채팅에 참여할 수 있습니다.');setTimeout(()=>location.href='/group',1500);return false;}
  const chat=chats.find(c=>c.id===chatId);
  if(chat&&chat.type==='secret'&&(!chat.allowedMembers||!chat.allowedMembers.includes(myName))){showSnackbar('이 비밀 채팅방에 접근할 권한이 없습니다.');setTimeout(()=>history.back(),1500);return false;}
  document.getElementById('chatTitle').textContent=(chat&&chat.name)||'전체 채팅';
  messages=(store.groupMessages&&store.groupMessages[chatId])||[];
  return true;
}

function renderMessages(scrollToBottom){
  const list=document.getElementById('messageList');
  const prevScroll=list.scrollTop;
  let html='',lastDate='';
  messages.forEach(m=>{
    if(m.date!==lastDate){lastDate=m.date;html+=`<div class="gc-msg-date-divider">${m.date}</div>`;}
    const isMe=m.author===myName;
    const liked=(m.likedBy||[]).includes(myName);
    const heart=liked?'❤️':'🤍';
    const cnt=m.likes>0?` ${m.likes}`:'';
    const likeBtn=`<span class="gc-msg-like" onclick="event.stopPropagation();toggleLike(${m.id})">${heart}${cnt}</span>`;

    // 이미지/동영상 첨부 표시
    let attachHtml='';
    if(m.attachments&&m.attachments.length>0){
      attachHtml='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">'+m.attachments.map(a=>{
        if(a.type==='image') return `<img src="${a.data}" style="max-width:180px;max-height:120px;border-radius:8px;object-fit:cover"/>`;
        return `<div style="width:180px;height:100px;background:#222;border-radius:8px;display:flex;align-items:center;justify-content:center"><span style="color:#fff;font-size:11px">🎬 동영상</span></div>`;
      }).join('')+'</div>';
    }

    if(isMe){
      html+=`<div class="gc-msg mine"><div class="gc-msg-body">
        <div class="gc-msg-bubble mine">${attachHtml}${m.text}</div>
        <div class="gc-msg-time-row"><span class="gc-msg-time">${m.time}</span>${likeBtn}</div>
      </div></div>`;
    } else {
      html+=`<div class="gc-msg"><div class="gc-msg-avatar"></div><div class="gc-msg-body">
        <div class="gc-msg-name">${m.author}</div>
        <div class="gc-msg-bubble other">${attachHtml}${m.text}</div>
        <div class="gc-msg-time-row"><span class="gc-msg-time">${m.time}</span>${likeBtn}</div>
      </div></div>`;
    }
  });
  list.innerHTML=html;
  if(scrollToBottom)list.scrollTop=list.scrollHeight;
  else list.scrollTop=prevScroll;
}

function toggleLike(msgId){
  const store=FITO_STORE.get();const msgs=store.groupMessages[chatId];if(!msgs)return;
  const msg=msgs.find(m=>m.id===msgId);if(!msg)return;
  if(!msg.likedBy)msg.likedBy=[];
  const idx=msg.likedBy.indexOf(myName);
  if(idx>=0){msg.likedBy.splice(idx,1);msg.likes=Math.max(0,msg.likes-1);}
  else{msg.likedBy.push(myName);msg.likes=(msg.likes||0)+1;}
  FITO_STORE.save(store);messages=store.groupMessages[chatId];
  renderMessages(false);
}

const chatInput=document.getElementById('chatInput');
const sendBtn=document.getElementById('sendBtn');
const charCount=document.getElementById('charCount');
let pendingAttachments=[];

chatInput.addEventListener('input',()=>{
  let v=chatInput.value;if(v.length>300){v=v.substring(0,300);chatInput.value=v;}
  charCount.textContent=v.length;updateSendBtn();
  chatInput.style.height='auto';chatInput.style.height=Math.min(chatInput.scrollHeight,80)+'px';
});
chatInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});

function updateSendBtn(){
  sendBtn.classList.toggle('disabled',chatInput.value.trim().length===0&&pendingAttachments.length===0);
}

function sendMessage(){
  const text=chatInput.value.trim();
  if(!text&&pendingAttachments.length===0)return;
  if(text&&BAD_WORDS.some(w=>text.includes(w))){document.getElementById('badWordModal').classList.add('open');chatInput.value='';charCount.textContent='0';sendBtn.classList.add('disabled');return;}
  const now=new Date();
  FITO_STORE.update(s=>{
    const nid=s.nextMsgId++;
    if(!s.groupMessages[chatId])s.groupMessages[chatId]=[];
    s.groupMessages[chatId].push({id:nid,author:myName,text:text,time:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,likes:0,likedBy:[],date:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`,attachments:pendingAttachments.length>0?[...pendingAttachments]:undefined});
  });
  messages=FITO_STORE.get().groupMessages[chatId]||[];
  chatInput.value='';charCount.textContent='0';pendingAttachments=[];
  document.getElementById('attachPreview').innerHTML='';document.getElementById('attachPreview').style.display='none';
  updateSendBtn();chatInput.style.height='auto';
  renderMessages(true);
}

/* ── 파일 첨부 (실제 작동) ── */
function openAttach(){document.getElementById('attachOverlay').classList.add('open');document.getElementById('attachSheet').classList.add('open');}
function closeAttach(){document.getElementById('attachOverlay').classList.remove('open');document.getElementById('attachSheet').classList.remove('open');}

function selectAttachType(type){
  closeAttach();
  const input=document.createElement('input');
  input.type='file';
  input.accept=type==='image'?'image/*':'video/*';
  input.multiple=true;
  input.onchange=e=>{
    const files=Array.from(e.target.files).slice(0,20);
    if(files.length===0)return;
    let totalSize=0;
    files.forEach(f=>totalSize+=f.size);
    if(totalSize>300*1024*1024){showSnackbar('파일 크기가 너무 큽니다. (최대 300MB)');return;}
    // 이미지는 미리보기, 동영상은 아이콘
    const preview=document.getElementById('attachPreview');
    preview.style.display='flex';
    files.forEach(f=>{
      if(type==='image'){
        const reader=new FileReader();
        reader.onload=ev=>{
          pendingAttachments.push({type:'image',data:ev.target.result,name:f.name});
          preview.innerHTML+=`<div style="position:relative;display:inline-block"><img src="${ev.target.result}" style="width:48px;height:48px;border-radius:8px;object-fit:cover"/><span onclick="removeAttach(${pendingAttachments.length-1})" style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#e05c4b;color:#fff;border-radius:50%;font-size:10px;display:flex;align-items:center;justify-content:center;cursor:pointer">✕</span></div>`;
          updateSendBtn();
        };
        reader.readAsDataURL(f);
      } else {
        pendingAttachments.push({type:'video',data:'',name:f.name});
        preview.innerHTML+=`<div style="position:relative;display:inline-block"><div style="width:48px;height:48px;background:#222;border-radius:8px;display:flex;align-items:center;justify-content:center"><span style="color:#fff;font-size:14px">🎬</span></div><span onclick="removeAttach(${pendingAttachments.length-1})" style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#e05c4b;color:#fff;border-radius:50%;font-size:10px;display:flex;align-items:center;justify-content:center;cursor:pointer">✕</span></div>`;
        updateSendBtn();
      }
    });
    showSnackbar(`${files.length}개 파일이 첨부되었습니다.`);
  };
  input.click();
}

function removeAttach(idx){
  pendingAttachments.splice(idx,1);
  // 간단히 전체 리렌더
  const preview=document.getElementById('attachPreview');
  if(pendingAttachments.length===0){preview.innerHTML='';preview.style.display='none';}
  updateSendBtn();
}

function closeBadWordModal(){document.getElementById('badWordModal').classList.remove('open');}
function showSnackbar(msg){const sb=document.getElementById('snackbar');sb.textContent=msg;sb.classList.add('show');setTimeout(()=>sb.classList.remove('show'),3000);}
document.addEventListener('DOMContentLoaded',()=>{if(initChat())renderMessages(true);});
