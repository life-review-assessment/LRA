const CACHE='lra-static-v1.5.46';
const STATIC=[
  './','./index.html','./manifest.json','./lra-icon.svg','./lra-brand-mark.svg',
  './terms.html','./privacy.html','./legal.html',
  './assets/style.css','./assets/questions.js','./assets/short-term.js','./assets/question-routing.js',
  './assets/lra-canon.js','./assets/legacy-canon.js','./assets/legacy-sheet-schema.js','./assets/legacy-report-assets.js','./assets/inference-contract.js',
  './assets/account-gate.js','./assets/main-canonical.js','./assets/submission-transport.js','./assets/handoff-ui.js','./assets/user-dashboard.js','./assets/short-term-ui.js','./assets/startup-guard.js','./assets/pwa.js'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC.map(x=>new Request(x,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request,{cache:'no-store'});
      if(fresh&&fresh.ok){const copy=fresh.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
      return fresh;
    }catch{
      const cached=await caches.match(event.request,{ignoreSearch:true});
      if(cached)return cached;
      if(event.request.mode==='navigate'){const fallback=await caches.match('./index.html');if(fallback)return fallback;}
      throw new Error('OFFLINE_RESOURCE_MISSING');
    }
  })());
});
