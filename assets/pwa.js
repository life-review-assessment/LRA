(()=>{
  const FIX_ID='lra-mobile-display-fix-20261015';

  function applyDisplayFix(){
    document.documentElement.style.webkitTextSizeAdjust='100%';
    document.documentElement.style.textSizeAdjust='100%';

    if(!document.getElementById(FIX_ID)){
      const style=document.createElement('style');
      style.id=FIX_ID;
      style.textContent=`
@media(max-width:760px){
  .lra-intro-thesis{
    font-size:clamp(29px,7.4vw,32px)!important;
    line-height:1.42!important;
    letter-spacing:-.035em!important;
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
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=20261015-display1',{updateViaCache:'none'}).catch(()=>{}));
  }
})();
