(()=>{
  const style=document.createElement('style');
  style.dataset.lraMobileBleed='1';
  style.textContent=`@media(max-width:760px){
    /* Premium rule: dark emphasis surfaces reach the viewport edges; controls keep content margins. */
    .home-plan-card.featured,
    .result-preview-grid article.dark{
      width:100vw!important;
      margin-left:calc((100% - 100vw)/2)!important;
      margin-right:calc((100% - 100vw)/2)!important;
      padding-left:24px!important;
      padding-right:24px!important;
      border-left:0!important;
      border-right:0!important;
      border-radius:0!important;
      background:#181714!important;
      box-shadow:none!important;
    }
    .flow-section{
      width:100%!important;
      background:#181714!important;
    }
    .home-start,
    .btn.dark{
      max-width:100%;
    }
  }`;
  document.head.appendChild(style);

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
})();
