const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const IN_PROGRESS=new Set(['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION']);

function installVisualOnlyMobileFix(){
  if(document.getElementById('lraVisualOnlyMobileFix'))return;
  const style=document.createElement('style');
  style.id='lraVisualOnlyMobileFix';
  style.textContent=`
    @media (max-width:760px){
      #about,#about>.site-wrap,#about .lra-intro-grid,#about .lra-intro-grid>div,#about .lra-intro-thesis,#about .lra-intro-copy,#about .lra-intro-decision{
        position:static!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        overflow:visible!important;
        contain:none!important;
        content-visibility:visible!important;
        transform:none!important;
        opacity:1!important;
        visibility:visible!important;
      }
      #about .lra-intro-grid{display:block!important}
      #about .lra-intro-thesis{
        display:block!important;
        margin:0!important;
        padding:0!important;
        white-space:normal!important;
        word-break:normal!important;
        overflow-wrap:normal!important;
        -webkit-text-size-adjust:100%!important;
        text-size-adjust:100%!important;
      }
      #about .lra-intro-thesis strong{
        display:block!important;
        position:static!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        margin:0!important;
        padding:0!important;
        overflow:visible!important;
        visibility:visible!important;
        opacity:1!important;
        transform:none!important;
        font:inherit!important;
        font-weight:600!important;
        color:#171613!important;
      }
      #about .lra-intro-copy{padding-top:0!important;margin-top:28px!important}
      #about .lra-intro-decision{margin-top:54px!important}
    }
  `;
  document.head.appendChild(style);
}
installVisualOnlyMobileFix();

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