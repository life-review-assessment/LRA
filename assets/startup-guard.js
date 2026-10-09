const IN_PROGRESS=new Set(['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION']);

function showOnly(view){
  document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('hidden',el.dataset.view!==view));
  window.scrollTo({top:0,behavior:'auto'});
}

async function guardStartup(){
  const state=window.LRA_RUNTIME?.getState?.();
  if(!state)return;
  if(IN_PROGRESS.has(state.stage)&&!window.LRA_ACCOUNT?.authenticated){
    const profile=await window.LRA_ACCOUNT_UI?.ensureAccount?.();
    if(profile)window.LRA_RUNTIME?.resume?.();else showOnly('home');
    return;
  }
  if(state.stage==='COMPLETE'&&!window.LRA_ACCOUNT?.authenticated)showOnly('home');
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(guardStartup,0),{once:true});
else setTimeout(guardStartup,0);
