const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const IN_PROGRESS=new Set(['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION']);

function showOnly(view){
  document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('hidden',el.dataset.view!==view));
  window.scrollTo({top:0,behavior:'auto'});
}
function profileUserId(profile){return profile?.userId||profile?.user_id||'';}
function sameOwner(state,profile){return !!(state?.userId&&profileUserId(profile)&&state.userId===profileUserId(profile));}

async function savedSessionProfile(){
  if(window.LRA_ACCOUNT?.authenticated)return window.LRA_ACCOUNT.profile||null;
  const token=window.LRA_ACCOUNT_UI?.getToken?.()||'';
  if(!token)return null;
  try{
    const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${token}`},body:JSON.stringify({action:'session'}),cache:'no-store'});
    const j=await r.json().catch(()=>({}));
    return r.ok&&j.ok===true?j.profile||null:null;
  }catch{return null;}
}

async function guardStartup(){
  const state=window.LRA_RUNTIME?.getState?.();
  if(!state)return;
  if(IN_PROGRESS.has(state.stage)){
    const saved=await savedSessionProfile();
    if(saved){if(sameOwner(state,saved))window.LRA_RUNTIME?.resume?.();else showOnly('home');return;}
    const profile=await window.LRA_ACCOUNT_UI?.ensureAccount?.();
    if(profile&&sameOwner(state,profile))window.LRA_RUNTIME?.resume?.();else showOnly('home');
    return;
  }
  if(state.stage==='COMPLETE'){
    const saved=await savedSessionProfile();
    if(!saved||!sameOwner(state,saved))showOnly('home');
  }
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(guardStartup,0),{once:true});
else setTimeout(guardStartup,0);
