(()=>{
  const RESET_VERSION='20261011-r9';
  const RESET_KEY='lra-pwa-reset-version';

  async function hardResetOnce(){
    try{
      if(localStorage.getItem(RESET_KEY)===RESET_VERSION)return false;
      localStorage.setItem(RESET_KEY,RESET_VERSION);

      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.map(k=>caches.delete(k)));
      }

      if('serviceWorker' in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r=>r.unregister()));
      }

      const u=new URL(location.href);
      if(u.searchParams.get('lra_reset')!==RESET_VERSION){
        u.searchParams.set('lra_reset',RESET_VERSION);
        location.replace(u.href);
        return true;
      }
    }catch{}
    return false;
  }

  (async()=>{
    const reloading=await hardResetOnce();
    if(reloading)return;
    if('serviceWorker' in navigator){
      window.addEventListener('load',()=>navigator.serviceWorker.register(`./sw.js?v=${RESET_VERSION}`,{updateViaCache:'none'}).catch(()=>{}),{once:true});
    }
  })();
})();
