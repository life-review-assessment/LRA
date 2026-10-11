const RESET='lra-network-fresh-v1';

self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    try{
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('lra-static-')).map(k=>caches.delete(k)));
    }catch{}
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.all(clients.map(async client=>{
      try{
        const u=new URL(client.url);
        if(u.origin!==self.location.origin)return;
        if(u.searchParams.get('lra_fresh')===RESET)return;
        u.searchParams.set('lra_fresh',RESET);
        await client.navigate(u.href);
      }catch{}
    }));
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(fetch(event.request,{cache:'no-store'}));
});
