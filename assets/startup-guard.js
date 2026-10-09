const IN_PROGRESS=new Set(['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION']);

function showOnly(view){
  document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('hidden',el.dataset.view!==view));
  window.scrollTo({top:0,behavior:'auto'});
}

function guardStartup(){
  const state=window.LRA_RUNTIME?.getState?.();
  if(!state)return;
  if((IN_PROGRESS.has(state.stage)||state.stage==='COMPLETE')&&!window.LRA_ACCOUNT?.authenticated){
    showOnly('home');
  }
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(guardStartup,0),{once:true});
else setTimeout(guardStartup,0);
