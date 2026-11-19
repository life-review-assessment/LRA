// Retire earlier LRA service workers and the copies of the former site they cached.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('lra-static-')).map(name => caches.delete(name)));
    await self.registration.unregister();
  })());
});
