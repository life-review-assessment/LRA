const CACHE='lra-static-v1.5.5';
const STATIC=[
  './','./index.html','./manifest.json','./lra-brand.png','./lra-icon.svg',
  './terms.html','./privacy.html','./legal.html',
  './assets/style.css','./assets/logo-visible.css','./assets/questions.js','./assets/short-term.js',
  './assets/lra-canon.js','./assets/legacy-canon.js','./assets/legacy-sheet-schema.js','./assets/legacy-report-assets.js','./assets/inference-contract.js',
  './assets/main-canonical.js','./assets/account-gate.js','./assets/user-dashboard.js','./assets/startup-guard.js',
  './assets/submission-transport.js','./assets/handoff-ui.js','./assets/short-term-ui.js','./assets/pwa.js'
];
const FRESH=new Set(['./assets/pwa.js','./assets/logo-visible.css','./lra-brand.png']);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  await Promise.all(clients.map(c=>c.navigate(c.url).catch(()=>null)));
})());});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  const rel='./'+url.pathname.split('/').slice(-2).join('/');
  const root='./'+url.pathname.split('/').pop();
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  if(FRESH.has(rel)||FRESH.has(root)){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return r;}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return r;})));
});
