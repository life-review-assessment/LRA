const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const IN_PROGRESS=new Set(['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION']);

function installMobileHomeLayoutGuard(){
  if(document.getElementById('lraMobileHomeLayoutGuard'))return;
  const style=document.createElement('style');
  style.id='lraMobileHomeLayoutGuard';
  style.textContent=`
    @media (max-width:760px){
      html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
      #about,#about>.site-wrap,#about .lra-intro-grid,#about .lra-intro-grid>div,#about .lra-intro-thesis,#about .lra-intro-copy,#about .lra-intro-decision,#about .site-steps{
        height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important
      }
      #about .lra-intro-grid{display:block!important}
      #about .lra-intro-thesis{
        display:block!important;margin:0!important;font-size:36px!important;line-height:1.45!important;
        letter-spacing:-.025em!important;white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important
      }
      #about .lra-intro-copy{display:block!important;padding-top:28px!important}
      #about .lra-intro-decision{display:block!important;margin-top:44px!important}
      #about .site-steps{display:grid!important;grid-template-columns:1fr!important;margin-top:44px!important}
      section[data-view="home"]{max-height:none!important;overflow:visible!important}
    }
  `;
  document.head.appendChild(style);
}
installMobileHomeLayoutGuard();

function showOnly(view){
  document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('hidden',el.dataset.view!==view));
  window.scrollTo({top:0,behavior:'auto'});
}
function profileUserId(profile){return profile?.userId||profile?.user_id||'';}
function sameOwner(state,profile){return !!(state?.userId&&profileUserId(profile)&&state.userId===profileUserId(profile));}

const initialState=window.LRA_RUNTIME?.getState?.();
if(initialState&&(IN_PROGRESS.has(initialState.stage)||initialState.stage==='COMPLETE'))showOnly('home');

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

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',guardStartup,{once:true});
else guardStartup();
