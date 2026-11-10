const CACHE='despacho-v42';
const BASE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const propio=u.origin===location.origin;
  // La app (index.html): primero internet, para que las actualizaciones se vean al momento
  if(e.request.mode==='navigate'||(propio&&/\/(index\.html)?$/.test(u.pathname))){
    e.respondWith(fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  const externoOk=/(^|\.)fonts\.(googleapis|gstatic)\.com$|^cdnjs\.cloudflare\.com$/.test(u.hostname)||(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/'));
  if(!propio&&!externoOk)return;
  e.respondWith(caches.match(e.request).then(r=>{
    const red=fetch(e.request).then(res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return res}).catch(()=>r);
    return r||red;
  }));
});
