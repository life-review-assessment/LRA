(()=>{
  const mark=document.querySelector('.cover-brand-mark');
  if(mark)mark.setAttribute('src','./lra-brand-mark-fixed.svg?v=20261014-1');
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
})();
