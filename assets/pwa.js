(()=>{
  const ensureLogo=()=>{
    const img=document.querySelector('.cover-brand');
    if(!img)return;
    img.src='./lra-brand.png?v=20261009-0136';
    img.alt='LRA LIFE REVIEW ASSESSMENT';
    Object.assign(img.style,{
      display:'block',
      position:'relative',
      zIndex:'30',
      width:'280px',
      maxWidth:'72vw',
      height:'auto',
      opacity:'1',
      visibility:'visible',
      filter:'none',
      mixBlendMode:'normal',
      background:'#f4f2ed',
      padding:'8px 10px',
      border:'1px solid rgba(17,17,15,.18)',
      borderRadius:'2px'
    });
    img.onerror=()=>{
      const fallback=document.createElement('div');
      fallback.setAttribute('aria-label','LRA LIFE REVIEW ASSESSMENT');
      fallback.style.cssText='position:relative;z-index:30;display:inline-flex;flex-direction:column;gap:4px;padding:10px 12px;border:1px solid rgba(17,17,15,.18);background:#f4f2ed;color:#11110f;font-family:Georgia,serif;line-height:1';
      fallback.innerHTML='<strong style="font-size:34px;letter-spacing:.08em;font-weight:400">LRA</strong><span style="font:600 9px/1.2 -apple-system,BlinkMacSystemFont,\"Hiragino Sans\",sans-serif;letter-spacing:.18em">LIFE REVIEW ASSESSMENT</span>';
      img.replaceWith(fallback);
    };
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureLogo,{once:true});else ensureLogo();
  if(!document.querySelector('link[data-lra-logo-visible]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./assets/logo-visible.css?v=20261009-0136';l.dataset.lraLogoVisible='1';document.head.appendChild(l);}
})();
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
