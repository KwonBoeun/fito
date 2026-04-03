/* FITO - 그룹 공유 데이터 스토어 v4 */
const FITO_STORE = {
  _defaults: {
    myName: '나',
    groups: [
      { id:1, name:'하체 마스터 클럽', creator:'핏걸_나연', members:32, liveCnt:5, chatCnt:128, tags:['#하체','#스쿼트','#런지','#데드리프트','#초보환영'], hasLive:true, liveViewers:6, inactive:false, visibility:'public', desc:'매주 3회 하체 운동을 함께하는 그룹입니다.', joined:true, myRole:'owner', profileImg:'', bannerImg:'', createdAt:'2025-01-15' },
      { id:2, name:'아침 러닝 크루', creator:'러너킴', members:18, liveCnt:3, chatCnt:85, tags:['#러닝','#아침운동'], hasLive:false, liveViewers:0, inactive:false, visibility:'public', desc:'매일 아침 6시에 함께 달리는 크루입니다.', joined:true, myRole:'member', profileImg:'', bannerImg:'', createdAt:'2025-02-10' },
      { id:3, name:'홈트 같이해요', creator:'홈트여왕', members:45, liveCnt:8, chatCnt:240, tags:['#홈트','#초보자'], hasLive:true, liveViewers:4, inactive:false, visibility:'public', desc:'집에서도 충분히 운동할 수 있어요!', joined:true, myRole:'manager', profileImg:'', bannerImg:'', createdAt:'2025-01-20' },
      { id:4, name:'코어 챌린지 30일', creator:'코어킹', members:22, liveCnt:2, chatCnt:67, tags:['#코어','#챌린지'], hasLive:false, liveViewers:0, inactive:false, visibility:'public', desc:'30일간 코어 챌린지에 도전해보세요.', joined:true, myRole:'member', profileImg:'', bannerImg:'', createdAt:'2025-03-01' },
      { id:5, name:'다이어트 식단 공유', creator:'다이어터민', members:61, liveCnt:0, chatCnt:0, tags:['#다이어트','#식단'], hasLive:false, liveViewers:0, inactive:true, visibility:'public', desc:'다이어트 식단을 함께 공유하고 응원해요.', joined:true, myRole:'member', profileImg:'', bannerImg:'', createdAt:'2024-12-01' },
    ],
    recommendGroups: [
      { id:101, name:'풀업 마스터', creator:'철봉남', members:28, tags:['#풀업','#상체'], desc:'풀업 0개에서 10개까지 함께 도전', visibility:'public', createdAt:'2025-02-15' },
      { id:102, name:'필라테스 러버즈', creator:'필라테스정', members:53, tags:['#필라테스','#유연성'], desc:'매일 필라테스 루틴 공유', visibility:'public', createdAt:'2025-01-10' },
      { id:103, name:'벌크업 식단연구소', creator:'영양사진', members:37, tags:['#벌크업','#식단'], desc:'벌크업을 위한 식단과 운동 공유', visibility:'public', createdAt:'2025-03-05' },
    ],
    groupMembers: {
      1: [{name:'나',role:'owner'},{name:'핏걸_나연',role:'manager'},{name:'트레이너박',role:'manager'},{name:'스쿼트킹',role:'member'},{name:'런지퀸',role:'member'},{name:'코어킹',role:'member'},{name:'다이어터민',role:'member'},{name:'홈트여왕',role:'member'},{name:'근육맨제이',role:'member'}],
      2: [{name:'러너킴',role:'owner'},{name:'나',role:'member'}],
      3: [{name:'홈트여왕',role:'owner'},{name:'나',role:'manager'},{name:'핏걸_나연',role:'member'}],
      4: [{name:'코어킹',role:'owner'},{name:'나',role:'member'}],
      5: [{name:'다이어터민',role:'owner'},{name:'나',role:'member'}],
    },
    groupPending: { 1: [{name:'newbie_fit',greeting:'안녕하세요! 하체 운동 같이 하고 싶어요'}] },
    groupLives: {
      1: [
        { id:1, title:'하체 같이해요 🏋️', host:'핏걸_나연', status:'live', participants:6, max:8, startTime:null, desc:'스쿼트 런지 데드리프트 함께해요', visibility:'public', record:true },
        { id:2, title:'스쿼트 챌린지', host:'스쿼트킹', status:'soon', participants:0, max:6, startTime:'14:30', desc:'스쿼트 100개 도전', visibility:'public', record:false },
        { id:3, title:'저녁 런지 루틴', host:'런지퀸', status:'scheduled', participants:0, max:5, startTime:'19:00', desc:'런지 루틴 같이해요', visibility:'public', record:true },
      ],
    },
    groupStories: {
      1: [
        { id:1, author:'핏걸_나연', title:'스쿼트 폼 체크', time:'2시간 전', views:45 },
        { id:2, author:'스쿼트킹', title:'100개 챌린지 성공!', time:'5시간 전', views:128 },
        { id:3, author:'런지퀸', title:'런지 변형 3가지', time:'8시간 전', views:67 },
        { id:4, author:'코어킹', title:'코어+하체 루틴', time:'1일 전', views:34 },
      ],
    },
    groupChats: {
      1: [
        { id:'all-1', name:'전체 채팅', type:'all', allowedMembers:null },
        { id:'secret-1', name:'고급반 채팅', type:'secret', allowedMembers:['나','핏걸_나연','트레이너박','스쿼트킹'] },
      ],
      2: [{id:'all-2',name:'전체 채팅',type:'all',allowedMembers:null}],
      3: [{id:'all-3',name:'전체 채팅',type:'all',allowedMembers:null}],
    },
    groupMessages: {
      'all-1': [
        {id:1,author:'핏걸_나연',text:'오늘 운동 다들 하셨나요?',time:'09:32',likes:2,likedBy:['스쿼트킹','런지퀸'],date:'2025-03-27'},
        {id:2,author:'스쿼트킹',text:'오늘 스쿼트 100개 달성했습니다! 🔥',time:'10:15',likes:8,likedBy:['핏걸_나연','런지퀸','코어킹','다이어터민','홈트여왕','근육맨제이','트레이너박','나'],date:'2025-03-27'},
        {id:3,author:'런지퀸',text:'저도 런지 50개 했어요! 하체 불타는 느낌 ㅋㅋ',time:'10:22',likes:3,likedBy:['핏걸_나연','스쿼트킹','나'],date:'2025-03-27'},
        {id:4,author:'나',text:'오늘 데드리프트 80kg 성공했어요 💪',time:'10:45',likes:5,likedBy:['핏걸_나연','스쿼트킹','런지퀸','코어킹','트레이너박'],date:'2025-03-27'},
        {id:5,author:'코어킹',text:'다들 대단하시네요!',time:'11:02',likes:1,likedBy:['나'],date:'2025-03-27'},
        {id:6,author:'트레이너박',text:'오늘 저녁 7시에 라이브 합니다~',time:'11:30',likes:4,likedBy:['핏걸_나연','스쿼트킹','런지퀸','나'],date:'2025-03-27'},
        {id:7,author:'다이어터민',text:'오늘 식단은 닭가슴살 샐러드와 고구마!',time:'12:15',likes:0,likedBy:[],date:'2025-03-27'},
        {id:8,author:'홈트여왕',text:'집에서 덤벨만으로도 충분히 하체 운동 가능해요.',time:'13:40',likes:2,likedBy:['핏걸_나연','나'],date:'2025-03-27'},
      ],
      'secret-1': [
        {id:1,author:'트레이너박',text:'고급반 분들 내일 데드리프트 120kg 도전합시다',time:'14:20',likes:2,likedBy:['나','스쿼트킹'],date:'2025-03-27'},
      ],
    },
    nextGroupId: 200, nextLiveId: 100, nextMsgId: 100, nextChatId: 100,
  },
  _key: 'fito_group_store_v4',
  load() { try { const s=localStorage.getItem(this._key); if(s) return JSON.parse(s); } catch(e){} return null; },
  save(d) { localStorage.setItem(this._key, JSON.stringify(d)); },
  get() { return this.load() || JSON.parse(JSON.stringify(this._defaults)); },
  update(fn) { const d=this.get(); fn(d); this.save(d); return d; },
  reset() { localStorage.removeItem(this._key); },
  getGroup(gid) { const s=this.get(); return s.groups.find(g=>g.id===gid)||(s.recommendGroups||[]).find(g=>g.id===gid)||null; },
  isMember(gid) { const g=this.getGroup(gid); return g&&g.joined===true; },
  getMyRole(gid) { const g=this.getGroup(gid); return (g&&g.myRole)||'none'; },
  canManage(gid) { const r=this.getMyRole(gid); return r==='owner'||r==='manager'; },
  canAccessChat(gid,chatId) {
    const s=this.get(); if(!this.isMember(gid)) return false;
    const chats=(s.groupChats[gid]||[]); const chat=chats.find(c=>c.id===chatId);
    if(!chat) return false; if(chat.type==='all') return true;
    return chat.allowedMembers&&chat.allowedMembers.includes(s.myName||'나');
  },
  getTodayBestChat(gid) {
    const s=this.get(); const members=(s.groupMembers[gid]||[]);
    const threshold=Math.max(1,Math.ceil(members.length/10));
    const allChat=(s.groupChats[gid]||[]).find(c=>c.type==='all');
    if(!allChat) return null;
    const msgs=s.groupMessages[allChat.id]||[];
    const qualified=msgs.filter(m=>m.likes>=threshold);
    if(!qualified.length) return null;
    qualified.sort((a,b)=>b.likes-a.likes);
    return qualified[0];
  }
};
