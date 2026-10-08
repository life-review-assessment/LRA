function showHomeAfterCompletedState(){
  if(window.LRA_ACCOUNT?.authenticated)return;
  const state=window.LRA_RUNTIME?.getState?.();
  if(state?.stage!=='COMPLETE')return;
  document.querySelectorAll('[data-view]').forEach(el=>{
    el.classList.toggle('hidden',el.dataset.view!=='home');
  });
  window.scrollTo({top:0,behavior:'auto'});
}

if(document.readyState==='loading'){
  window.addEventListener('DOMContentLoaded',()=>setTimeout(showHomeAfterCompletedState,0),{once:true});
}else{
  setTimeout(showHomeAfterCompletedState,0);
}
