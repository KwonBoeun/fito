/* FITO - 그룹 목록/검색 JS v6 - 오버레이 검색 */
let store, currentSort='activity';

/* ── 검색 오버레이 ── */
function openSearchOverlay(){
  document.getElementById('searchOverlay').classList.add('open');
  setTimeout(()=>document.getElementById('groupSearchInput').focus(),100);
}
function closeSearchOverlay(){
  document.getElementById('searchOverlay').classList.remove('open');
  document.getElementById('groupSearchInput').value='';
  document.getElementById('searchClearBtn').style.display='none';
  document.getElementById('sortBar').style.display='none';
  document.getElementById('searchResultsList').innerHTML='';
}

// 헤더 검색 바 클릭
document.querySelector('.gp-header-search').addEventListener('click', openSearchOverlay);

// 검색 입력
const searchInput=document.getElementById('groupSearchInput');
searchInput.addEventListener('input',()=>{
  let v=searchInput.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s#]/g,'');
  if(v!==searchInput.value){searchInput.value=v;}
  document.getElementById('searchClearBtn').style.display=v.trim()?'block':'none';
  renderSearchResults(v.trim());
});

function clearSearch(){
  searchInput.value='';
  document.getElementById('searchClearBtn').style.display='none';
  document.getElementById('sortBar').style.display='none';
  document.getElementById('searchResultsList').innerHTML='';
}

function setSort(s){
  currentSort=s;
  document.querySelectorAll('.gp-sort-btn').forEach(b=>b.classList.toggle('active',b.dataset.sort===s));
  renderSearchResults(searchInput.value.trim());
}

/* ── 검색 결과 렌더 ── */
function renderSearchResults(query){
  store=FITO_STORE.get();
  const list=document.getElementById('searchResultsList');
  const sortBar=document.getElementById('sortBar');
  if(!query){list.innerHTML='<div style="padding:40px 20px;text-align:center;color:var(--gray-400);font-size:13px">검색어를 입력하세요</div>';sortBar.style.display='none';return;}

  sortBar.style.display='flex';
  const q=query.toLowerCase();
  let joined=store.groups.filter(g=>g.joined&&(g.name.toLowerCase().includes(q)||g.tags.some(t=>t.toLowerCase().includes(q))));
  let recommend=(store.recommendGroups||[]).filter(g=>g.name.toLowerCase().includes(q)||g.tags.some(t=>t.toLowerCase().includes(q)));
  const all=[...joined,...recommend.map(g=>({...g,joined:false}))];

  all.sort((a,b)=>{
    if(currentSort==='popular'||currentSort==='members') return (FITO_STORE.getMemberCount(b.id)||0)-(FITO_STORE.getMemberCount(a.id)||0);
    if(currentSort==='latest') return (b.createdAt||'').localeCompare(a.createdAt||'');
    if(a.inactive!==b.inactive) return a.inactive?1:-1;
    return ((b.liveCnt||0)+(b.chatCnt||0))-((a.liveCnt||0)+(a.chatCnt||0));
  });

  if(!all.length){list.innerHTML=`<div style="padding:40px 20px;text-align:center;color:var(--gray-400);font-size:13px">"${query}"에 대한 검색 결과가 없습니다.</div>`;return;}
  list.innerHTML='<div style="padding:0 16px">'+all.map(g=>searchCardHtml(g)).join('')+'</div>';
}

function searchCardHtml(g){
  const mc=FITO_STORE.getMemberCount(g.id)||1;
  const tags=(g.tags||[]).slice(0,3).map(t=>`<span class="gp-card-tag" onclick="event.stopPropagation();searchByTag('${t}')">${t}</span>`).join('');
  const badge=g.joined?'':'<span style="color:var(--orange);font-size:10px;font-weight:700">추천</span>';
  return `<div class="gp-card ani" onclick="goGroupMain(${g.id})" style="${g.joined?'':'background:var(--gray-50)'}">
    <div class="gp-card-img">${g.profileImg?`<img src="${g.profileImg}" style="width:100%;height:100%;object-fit:cover"/>`:''}
    </div><div class="gp-card-info"><div class="gp-card-name">${g.name}</div>
    <div class="gp-card-meta">멤버 ${mc}명 ${badge}</div>
    <div class="gp-card-tags">${tags}</div></div></div>`;
}

function searchByTag(tag){
  searchInput.value=tag;
  document.getElementById('searchClearBtn').style.display='block';
  renderSearchResults(tag);
  // 오버레이가 닫혀 있으면 열기
  if(!document.getElementById('searchOverlay').classList.contains('open'))openSearchOverlay();
}

/* ── 메인 그룹 목록 (검색 아닌 기본 화면) ── */
function renderGroups(){
  store=FITO_STORE.get();
  const list=document.getElementById('groupList');
  const empty=document.getElementById('emptyState');
  const banner=document.getElementById('recommendBanner');

  let joined=store.groups.filter(g=>g.joined);
  let recommend=store.recommendGroups||[];

  joined.sort((a,b)=>{if(a.inactive!==b.inactive)return a.inactive?1:-1;return(b.liveCnt+b.chatCnt)-(a.liveCnt+a.chatCnt);});

  let html='';
  if(joined.length>0){
    html+='<div class="gp-list-section-title">나의 그룹</div>';
    html+=joined.map(g=>groupCardHtml(g)).join('');
  }
  if(recommend.length>0){
    html+='<div class="gp-list-section-title" style="margin-top:8px">추천 그룹</div>';
    html+=recommend.map(g=>recommendCardHtml(g)).join('');
  }

  if(!html){
    empty.style.display='block';empty.textContent='가입한 그룹이 없습니다. 그룹을 만들어보세요!';
    list.innerHTML='';
  } else {empty.style.display='none';list.innerHTML=html;}

  // 추천 배너
  if(joined.length>0&&recommend.length>0&&Math.random()>0.5){
    const pick=recommend[Math.floor(Math.random()*recommend.length)];
    document.getElementById('recommendText').textContent=`회원님을 위한 추천그룹 <${pick.name}>가 있어요!`;
    banner.style.display='block';banner.onclick=()=>goGroupMain(pick.id);
  } else banner.style.display='none';
}

function groupCardHtml(g){
  const ic=g.inactive?' inactive':'';
  const lb=g.hasLive?`<span class="gp-card-live-badge">LIVE ${g.liveViewers}명</span>`:'';
  const mc=FITO_STORE.getMemberCount(g.id)||1;
  const tags=(g.tags||[]).slice(0,3).map(t=>`<span class="gp-card-tag" onclick="event.stopPropagation();searchByTag('${t}')">${t}</span>`).join('');
  return `<div class="gp-card ani${ic}" onclick="goGroupMain(${g.id})">
    <div class="gp-card-img">${g.profileImg?`<img src="${g.profileImg}" style="width:100%;height:100%;object-fit:cover"/>`:''}
    </div><div class="gp-card-info"><div class="gp-card-name">${g.name}</div>
    <div class="gp-card-meta">멤버 ${mc}명 ${lb}</div><div class="gp-card-tags">${tags}</div></div></div>`;
}
function recommendCardHtml(g){
  const mc=FITO_STORE.getMemberCount(g.id)||1;
  const tags=(g.tags||[]).slice(0,3).map(t=>`<span class="gp-card-tag" onclick="event.stopPropagation();searchByTag('${t}')">${t}</span>`).join('');
  return `<div class="gp-card ani" onclick="goGroupMain(${g.id})" style="background:var(--gray-50)">
    <div class="gp-card-img" style="background:linear-gradient(135deg,#ddd,#bbb)"></div>
    <div class="gp-card-info"><div class="gp-card-name">${g.name}</div>
    <div class="gp-card-meta">멤버 ${mc}명 · <span style="color:var(--orange)">추천</span></div>
    <div class="gp-card-tags">${tags}</div></div></div>`;
}

function goGroupMain(id){location.href=`/group/main?id=${id}`;}
function onCreateGroupClick(){document.getElementById('createConfirmModal').classList.add('open');}
function closeCreateModal(){document.getElementById('createConfirmModal').classList.remove('open');}
function goCreateGroup(){closeCreateModal();location.href='/group/create';}
function showSnackbar(msg){const sb=document.getElementById('snackbar');sb.textContent=msg;sb.classList.add('show');setTimeout(()=>sb.classList.remove('show'),3000);}

document.addEventListener('DOMContentLoaded',()=>{
  renderGroups();
  // URL에 tag 파라미터가 있으면 자동 검색
  const urlTag=new URLSearchParams(location.search).get('tag');
  if(urlTag){openSearchOverlay();setTimeout(()=>{searchInput.value=urlTag;document.getElementById('searchClearBtn').style.display='block';renderSearchResults(urlTag);},150);}
});
