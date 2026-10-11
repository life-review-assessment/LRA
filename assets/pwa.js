(()=>{
  const VERSION='20261011-r10';
  const KEY='lra-cache-cleanup-version';

  async function cleanup(){
    try{
      if('serviceWorker' in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r=>r.unregister()));
      }
    }catch{}

    try{
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.map(k=>caches.delete(k)));
      }
    }catch{}

    try{
      localStorage.removeItem('lra-pwa-reset-version');
      localStorage.setItem(KEY,VERSION);
    }catch{}
  }

  cleanup();
})();
