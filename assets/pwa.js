(()=>{if(!document.querySelector('link[data-lra-brand-atmosphere]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./assets/brand-atmosphere.css';l.dataset.lraBrandAtmosphere='1';document.head.appendChild(l);}})();
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
