(()=>{if(!document.querySelector('link[data-lra-logo-visible]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./assets/logo-visible.css?v=20261009-1025';l.dataset.lraLogoVisible='1';document.head.appendChild(l);}})();
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
