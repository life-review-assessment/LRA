const VERSION='20261011-r10';
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    try{
      const keys=await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }catch{}
    try{await self.registration.unregister();}catch{}
    try{await self.clients.claim();}catch{}
  })());
});
self.addEventListener('fetch',()=>{});
