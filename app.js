/* BARAMEEL WORLD — MASTER BUILD
   Client is presentation + scanner only.
   Production source of truth: backend/database.
   There is ONE printed QR: BARAMEEL-UNIVERSAL.
*/
(() => {
  const VERSION = '20260929-17';
  const STORAGE = 'barameel.world.player.v17';
  const LEGACY_STORAGES = ['barameel.world.player.v16','barameel.world.player.v15'];
  const API_BASE = String(window.BARAMEEL_API_BASE || '').replace(/\/$/, '');
  const RUNNERS = ['rookie','skater','brona','racer','chiller','dreamer'];
  const RUNNER_NAMES = {rookie:'THE ROOKIE',skater:'THE SKATER',brona:'BRONA',racer:'THE RACER',chiller:'THE CHILLER',dreamer:'THE DREAMER'};
  const DEFAULTS = {playerId:null, playerCode:null, nickname:'', runner:'brona', points:0, weeklyPoints:0, rank:null, playerCount:0, checkpoints:[], collected:{collection01:{}}, totalScans:0, lastReward:null, lastSeen:null};
  let state = loadState();
  if (!state.playerId) { state.playerId = crypto.randomUUID(); saveState(); }

  function loadState(){
    try{
      const current=JSON.parse(localStorage.getItem(STORAGE)||'null');
      if(current) return {...DEFAULTS,...current};
      for(const key of LEGACY_STORAGES){
        const old=JSON.parse(localStorage.getItem(key)||'null');
        if(old){ const migrated={...DEFAULTS,...old}; localStorage.setItem(STORAGE,JSON.stringify(migrated)); return migrated; }
      }
    }catch{}
    return {...DEFAULTS};
  }
  function saveState(){ state.lastSeen = Date.now(); localStorage.setItem(STORAGE, JSON.stringify(state)); }
  function patchState(p){ state = {...state,...p}; saveState(); return state; }
  function setNickname(v){ patchState({nickname:String(v||'').trim().slice(0,24)}); }
  function setRunner(v){ if(RUNNERS.includes(v)) patchState({runner:v}); }
  function selected(){ return state.runner || 'brona'; }
  function pieces(c='collection01', i='image01'){ return (state.collected?.[c]?.[i]||[]).map(Number).sort((a,b)=>a-b); }
  function hasPiece(c,i,p){ return pieces(c,i).includes(Number(p)); }
  function count(c,i){ return pieces(c,i).length; }
  function mergePlayer(p){
    if(!p) return state;
    state = {...state,...p};
    if(p.collected) state.collected = p.collected;
    saveState();
    return state;
  }

  /* CLASSIC BARAMEEL ARCADE AUDIO — restored from the proven V9–V12 interaction system.
     Character selection uses the distinct square-wave arcade motifs that were previously approved.
     File assets remain the primary sounds for navigation/scan/reward; WebAudio is only a fallback. */
  const SOUND_FILES={
    tap:'./audio/tap.wav',
    select:'./audio/select.wav',
    confirm:'./audio/confirm.wav',
    back:'./audio/back.wav',
    scan:'./audio/scan.wav',
    error:'./audio/error.wav',
    completion:'./audio/completion-arcade.wav',
    levelup:'./audio/reward-levelup.mp3'
  };
  const soundBank={};
  let soundUnlocked=false, soundPrimed=false;
  function getAudioContext(){
    if(!getAudioContext.ctx){
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C)return null;
      getAudioContext.ctx=new C();
      getAudioContext.master=getAudioContext.ctx.createGain();
      getAudioContext.master.gain.value=.86;
      getAudioContext.master.connect(getAudioContext.ctx.destination);
    }
    return getAudioContext.ctx;
  }
  function unlockAudio(){
    const c=getAudioContext();
    if(c){
      try{if(c.state==='suspended')c.resume()}catch{}
      try{const b=c.createBuffer(1,1,c.sampleRate),o=c.createBufferSource();o.buffer=b;o.connect(c.destination);o.start(0)}catch{}
    }
    primeSounds();
    soundUnlocked=true;
  }
  function ensureGestureAudio(){if(!soundUnlocked)unlockAudio()}
  function tone(freq,d=.1,type='square',gain=.22,delay=0){
    const c=getAudioContext(); if(!c)return;
    try{if(c.state==='suspended')c.resume()}catch{}
    try{
      const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
      o.type=type;o.frequency.value=freq;
      g.gain.setValueAtTime(.0001,t);
      g.gain.exponentialRampToValueAtTime(gain,t+.008);
      g.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02);
    }catch{}
  }
  function fallbackSound(type){
    if(type==='back'){tone(659,.07,'square',.25);tone(523,.09,'square',.22,.07);tone(392,.12,'triangle',.18,.16);return}
    if(type==='error'){tone(220,.09,'sawtooth',.28);tone(170,.10,'sawtooth',.3,.09);tone(120,.15,'square',.25,.19);return}
    if(type==='scan'){[660,880,1175,1568].forEach((f,i)=>tone(f,.055,'square',.24,i*.055));return}
    if(type==='confirm'){[523,659,784,1047,1568].forEach((f,i)=>tone(f,.065,'square',.27,i*.05));return}
    if(type==='select'){[392,523,659,988,1319].forEach((f,i)=>tone(f,.06,i<4?'square':'triangle',.25,i*.045));return}
    tone(740,.06,'square',.25);tone(1040,.05,'square',.20,.055);
  }
  function primeSounds(){
    if(soundPrimed)return; soundPrimed=true;
    Object.entries(SOUND_FILES).forEach(([name,src])=>{
      const a=new Audio();a.src=src;a.preload='auto';a.playsInline=true;a.setAttribute('playsinline','');a.crossOrigin='anonymous';soundBank[name]=a;
      try{a.load()}catch{}
    });
  }
  function play(type){
    primeSounds();ensureGestureAudio();
    const a=soundBank[type];
    if(!a || a.readyState<2){fallbackSound(type);return null}
    try{a.muted=false;a.volume=type==='completion'?0.98:0.94;a.currentTime=0;const p=a.play();if(p?.catch)p.catch(()=>fallbackSound(type));return a}catch{fallbackSound(type);return null}
  }
  function playSelect(runner=selected()){
    ensureGestureAudio();
    const roots={rookie:392,skater:440,brona:494,racer:554,chiller:622,dreamer:698};
    const root=roots[runner]||494;
    [1,1.25,1.5,2,2.5].forEach((m,i)=>tone(root*m,.065,i===4?'triangle':'square',.24,i*.045));
  }
  function playCompletionSound(){
    ensureGestureAudio();primeSounds();
    const a=soundBank.completion;
    if(a){try{a.currentTime=0;a.volume=.98;const p=a.play();if(p?.catch)p.catch(()=>{});return a}catch{}}
    [523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.11,i<5?'square':'triangle',.24,i*.09));
    tone(2093,.18,'triangle',.22,.62);
  }
  function playRewardJingle(){ensureGestureAudio();const a=soundBank.levelup;try{if(a){a.currentTime=0;a.volume=1;a.play();return a}}catch{}return play('confirm')}
  function playPointsCountUp(amount,duration=2200){
    ensureGestureAudio();
    const steps=Math.max(22,Math.min(38,Math.round(duration/58)));
    const span=duration/steps;
    const startF=420,endF=1320;
    for(let i=0;i<steps;i++){const p=i/(steps-1),f=startF+(endF-startF)*(p*p);tone(f,.045,'square',.11,.06+i*span/1000)}
    tone(880,.07,'triangle',.18,Math.max(0,(duration-220)/1000));
    tone(1175,.08,'triangle',.2,Math.max(0,(duration-125)/1000));
    tone(1568,.12,'triangle',.23,Math.max(0,(duration-20)/1000));
  }
  primeSounds();
  ['pointerdown','touchstart','mousedown','keydown'].forEach(e=>window.addEventListener(e,unlockAudio,{capture:true,passive:true}));

  function go(url){ location.href=url; }
  function goAfter(url,sound='tap',delay=180){ play(sound); setTimeout(()=>go(url),delay); }
  function idle(fn){ if('requestIdleCallback' in window) requestIdleCallback(fn,{timeout:900}); else setTimeout(fn,80); }
  function preload(src){ const i=new Image(); i.decoding='async'; i.src=src; return i; }
  function preloadAll(xs){ xs.forEach(preload); }
  function flash(target=document.body){ let el=target.querySelector?.('.barameel-flash'); if(!el){el=document.createElement('div');el.className='barameel-flash';target.appendChild(el);} el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }

  async function api(path, body, method='POST'){
    if(!API_BASE) return {ok:false, code:'BACKEND_NOT_CONFIGURED', error:'BACKEND_NOT_CONFIGURED'};
    try{
      const r=await fetch(API_BASE+path,{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined,credentials:'include',cache:'no-store'});
      const data=await r.json().catch(()=>({}));
      if(!r.ok) return {ok:false,...data,error:data.error||`HTTP_${r.status}`};
      return data;
    }catch(e){ console.warn('[BARAMEEL API]',path,e); return {ok:false,code:'NETWORK_ERROR',error:'NETWORK_ERROR'}; }
  }
  async function track(event,meta={}){ return api('/analytics',{player_id:state.playerId,event,meta,path:location.pathname,ts:Date.now()}); }
  async function syncPlayer(){ const r=await api('/player',{player_id:state.playerId,nickname:state.nickname,runner:state.runner}); if(r?.player) mergePlayer(r.player); return r; }
  async function scanUniversal({ticketId=null}){
    const r=await api('/scan',{player_id:state.playerId,qr_token:'BARAMEEL-UNIVERSAL',ticket_id:ticketId,idempotency_key:'scan-'+crypto.randomUUID()});
    if(r?.player) mergePlayer(r.player);
    const rw=r?.reward;
    if(r?.ok&&rw){
      const c=rw.collection_id||rw.collection, i=rw.image_id||rw.image, piece=Number(rw.piece_number||rw.piece);
      if(c&&i&&piece&&piece>=1&&piece<=9&&!rw.duplicate){
        state.collected ||= {}; state.collected[c] ||= {}; state.collected[c][i] ||= [];
        if(!state.collected[c][i].map(Number).includes(piece)) state.collected[c][i].push(piece);
      }
      if(rw.points!=null) state.points=Number(state.points||0)+Number(rw.points||0);
      state.totalScans=Number(state.totalScans||0)+1; state.lastReward=rw; saveState();
    }
    return r;
  }
  async function duoLink(otherPlayerCode){
    const r=await api('/duo-link',{player_id:state.playerId,other_player_code:String(otherPlayerCode||'').trim(),idempotency_key:'duo-'+crypto.randomUUID()});
    if(r?.player) mergePlayer(r.player);
    return r;
  }
  async function fetchCollection(id='collection01'){
    const key='barameel.collection.'+id;
    try{const c=sessionStorage.getItem(key);if(c)return JSON.parse(c);}catch{}
    const r=await fetch(`./assets/collections/${id}/collection.json`,{cache:'force-cache'});
    if(!r.ok) throw Error('COLLECTION_UNAVAILABLE');
    const d=await r.json(); try{sessionStorage.setItem(key,JSON.stringify(d));}catch{} return d;
  }
  function parseUniversalQR(raw){
    let s=String(raw||'').trim();
    try{s=decodeURIComponent(s)}catch{}
    s=s.trim();
    if(/^BARAMEEL[-_:]?UNIVERSAL$/i.test(s)) return {type:'universal',token:'BARAMEEL-UNIVERSAL'};
    if(/(?:^|[?&])qr=BARAMEEL-UNIVERSAL(?:&|$)/i.test(s)) return {type:'universal',token:'BARAMEEL-UNIVERSAL'};
    try{const u=new URL(s);if((u.searchParams.get('qr')||'').toUpperCase()==='BARAMEEL-UNIVERSAL')return {type:'universal',token:'BARAMEEL-UNIVERSAL'}}catch{}
    return null;
  }
  window.BR={VERSION,RUNNERS,RUNNER_NAMES,get state(){return state},setNickname,setRunner,selected,pieces,hasPiece,count,mergePlayer,play,playSelect,playCompletionSound,playPointsCountUp,playRewardJingle,go,goAfter,idle,preload,preloadAll,flash,api,track,syncPlayer,scanUniversal,duoLink,fetchCollection,parseUniversalQR,saveState,API_BASE};
})();
