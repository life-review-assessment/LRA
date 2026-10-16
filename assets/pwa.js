(()=>{
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=20261017-authfix1',{updateViaCache:'none'}).catch(()=>{}));
  }
})();
