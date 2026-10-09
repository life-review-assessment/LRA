(()=>{
  const img=document.querySelector('.cover-brand');
  if(img){
    img.style.opacity='1';
    img.style.visibility='visible';
    img.style.filter='none';
    img.style.mixBlendMode='normal';
  }
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
})();
