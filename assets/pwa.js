(()=>{
  if(!('serviceWorker' in navigator))return;
  const RESET_KEY='lra.cloudflare.reset.20261015.1';
  async function clearLegacyRuntime(){
    try{
      if(localStorage.getItem(RESET_KEY)==='1')return false;
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.map(k=>caches.delete(k)));
      }
      localStorage.setItem(RESET_KEY,'1');
      return true;
    }catch{return false;}
  }
  window.addEventListener('load',async()=>{
    const cleared=await clearLegacyRuntime();
    if(cleared){
      const u=new URL(location.href);
      if(u.searchParams.get('_lra_reset')!=='20261015'){
        u.searchParams.set('_lra_reset','20261015');
        location.replace(u.href);
        return;
      }
    }
    try{
      await navigator.serviceWorker.register('./sw.js?v=20261015-reset2',{updateViaCache:'none'});
      const u=new URL(location.href);
      if(u.searchParams.has('_lra_reset')){
        u.searchParams.delete('_lra_reset');
        history.replaceState(null,'',u.pathname+u.search+u.hash);
      }
    }catch{}
  });
})();
