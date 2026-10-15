(()=>{
  const FIX_ID='lra-mobile-display-fix-20261015-v2';

  function applyDisplayFix(){
    document.documentElement.style.webkitTextSizeAdjust='100%';
    document.documentElement.style.textSizeAdjust='100%';

    if(!document.getElementById(FIX_ID)){
      const style=document.createElement('style');
      style.id=FIX_ID;
      style.textContent=`
@media(max-width:760px){
  .lra-intro-thesis{
    font-size:28px!important;
    line-height:1.42!important;
    letter-spacing:-.035em!important;
    word-break:keep-all!important;
    overflow-wrap:normal!important;
  }
}`;
      document.head.appendChild(style);
    }

    const u=new URL(location.href);
    if(u.searchParams.has('lra_recovered')){
      if('scrollRestoration' in history)history.scrollRestoration='manual';
      const top=()=>window.scrollTo({top:0,left:0,behavior:'auto'});
      top();
      requestAnimationFrame(()=>{top();setTimeout(top,80);});
      u.searchParams.delete('lra_recovered');
      history.replaceState(null,'',u.pathname+u.search+u.hash);
    }
  }

  applyDisplayFix();

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=20261015-display2',{updateViaCache:'none'}).catch(()=>{}));
  }
})();
