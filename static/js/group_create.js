/* FITO - 그룹 만들기 JS v4 - 해시태그 수정 */
let visibility='public', tags=[], profileImgData='', bannerImgData='';
function sanitize(v){return v.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g,'');}

document.getElementById('profileImgArea').addEventListener('click',()=>{
  pickImage(d=>{profileImgData=d;document.getElementById('profileImgArea').innerHTML=`<img src="${d}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;checkForm();});
});
document.getElementById('bannerImgArea').addEventListener('click',()=>{
  pickImage(d=>{bannerImgData=d;document.getElementById('bannerImgArea').innerHTML=`<img src="${d}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r-md)"/>`;checkForm();});
});
function pickImage(cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>10*1024*1024){showSnackbar('이미지 크기가 너무 큽니다. (최대 10MB)');return;}const r=new FileReader();r.onload=ev=>cb(ev.target.result);r.readAsDataURL(f);};i.click();}

const nameInput=document.getElementById('groupName');
nameInput.addEventListener('input',()=>{nameInput.value=sanitize(nameInput.value);document.getElementById('nameCount').textContent=nameInput.value.length;checkForm();});
const descInput=document.getElementById('groupDesc');
descInput.addEventListener('input',()=>{document.getElementById('descCount').textContent=descInput.value.length;checkForm();});

function setVisibility(v){visibility=v;document.getElementById('btnPublic').classList.toggle('selected',v==='public');document.getElementById('btnPrivate').classList.toggle('selected',v==='private');}

/* ── 해시태그 (수정됨) ── */
const tagInput=document.getElementById('tagInput');
tagInput.addEventListener('input',()=>{tagInput.value=tagInput.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9_\s]/g,'');});
tagInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addTag();}});

function addTag(){
  const val=tagInput.value.trim();
  if(!val){showSnackbar('태그를 입력해주세요.');return;}
  if(tags.length>=20){showSnackbar('해시태그는 최대 20개까지 가능합니다.');return;}
  if(val.length>30){showSnackbar('태그는 30자까지 가능합니다.');return;}
  if(tags.includes(val)){showSnackbar('이미 추가된 태그입니다.');return;}
  tags.push(val);
  tagInput.value='';
  renderTags();
  checkForm();
  showSnackbar(`#${val} 태그가 추가되었습니다.`);
}
function removeTag(i){tags.splice(i,1);renderTags();checkForm();}
function renderTags(){
  const w=document.getElementById('tagsWrap');
  document.getElementById('tagCountLabel').textContent=tags.length;
  w.innerHTML=tags.map((t,i)=>`<div class="gc-tag-chip">#${t}<span class="gc-tag-chip-x" onclick="removeTag(${i})"><svg viewBox="0 0 24 24" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18" stroke="#999" stroke-width="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="#999" stroke-width="2"/></svg></span></div>`).join('');
}
function checkForm(){document.getElementById('submitBtn').disabled=nameInput.value.trim().length===0;}

function submitGroup(){
  const name=nameInput.value.trim();if(!name)return;
  FITO_STORE.update(s=>{
    const nid=s.nextGroupId++;
    s.groups.push({id:nid,name:name,creator:s.myName||'나',members:1,liveCnt:0,chatCnt:0,tags:tags.map(t=>'#'+t),hasLive:false,liveViewers:0,inactive:false,visibility:visibility,desc:descInput.value.trim(),joined:true,myRole:'owner',profileImg:profileImgData,bannerImg:bannerImgData,createdAt:new Date().toISOString().split('T')[0]});
    s.groupMembers[nid]=[{name:s.myName||'나',role:'owner'}];
    s.groupLives[nid]=[]; s.groupStories[nid]=[];
    s.groupPending[nid]=[]; s.groupChats[nid]=[{id:'all-'+nid,name:'전체 채팅',type:'all',allowedMembers:null}];
    s.groupMessages['all-'+nid]=[];
  });
  showSnackbar('그룹이 생성되었습니다!');
  setTimeout(()=>location.href='/group',1000);
}
function showSnackbar(msg){const sb=document.getElementById('snackbar');sb.textContent=msg;sb.classList.add('show');setTimeout(()=>sb.classList.remove('show'),3000);}
