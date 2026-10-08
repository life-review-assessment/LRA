const CACHE='lra-static-v1.3.8';
const STATIC=[
  './','./index.html','./manifest.json','./lra-brand.png',
  './terms.html','./privacy.html','./legal.html',
  './assets/style.css','./assets/questions.js','./assets/short-term.js',
  './assets/lra-canon.js','./assets/legacy-canon.js','./assets/legacy-sheet-schema.js','./assets/legacy-report-assets.js','./assets/inference-contract.js',
  './assets/main-canonical.js','./assets/account-gate.js?v=139','./assets/startup-guard.js?v=139',
  './assets/submission-transport.js','./assets/handoff-ui.js','./assets/short-term-ui.js','./assets/pwa.js'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return r;})));
});
