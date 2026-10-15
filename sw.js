const CACHE='lra-static-v1.5.43-reset';
const STATIC=[
  './','./index.html','./manifest.json','./lra-icon.svg','./lra-brand-mark.svg',
  './terms.html','./privacy.html','./legal.html',
  './assets/style.css','./assets/questions.js','./assets/short-term.js',
  './assets/lra-canon.js','./assets/legacy-canon.js','./assets/legacy-sheet-schema.js','./assets/legacy-report-assets.js','./assets/inference-contract.js',
  './assets/account-gate.js','./assets/main-canonical.js','./assets/submission-transport.js','./assets/payment-flow.js','./assets/option-flow.js','./assets/option-history.js','./assets/handoff-ui.js','./assets/user-dashboard.js','./assets/short-term-ui.js','./assets/startup-guard.js','./assets/pwa.js'
];
async function fresh(request){return fetch(request,{cache:'no-store'});}
self.addEventListener('install',event=>{event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const path of STATIC){
    const response=await fresh(new Request(path,{cache:'no-store'}));
    if(!response.ok)throw new Error(`CACHE_SEED_FAILED:${path}:${response.status}`);
    await cache.put(path,response.clone());
  }
  await self.skipWaiting();
})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})());});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fresh(event.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE);await c.put(event.request,r.clone());}return r;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(fresh(event.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE);await c.put(event.request,r.clone());}return r;}).catch(()=>caches.match(event.request)));
});
