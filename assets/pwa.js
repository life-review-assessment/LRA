(()=>{
  const style=document.createElement('style');
  style.dataset.lraMobileBleed='1';
  style.textContent=`@media(max-width:760px){
    .home-plan-card.featured,
    .result-preview-grid article.dark{
      width:calc(100% + 48px)!important;
      margin-left:-24px!important;
      margin-right:-24px!important;
      padding-left:24px!important;
      padding-right:24px!important;
      border-left:0!important;
      border-right:0!important;
    }
  }`;
  document.head.appendChild(style);

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
})();
