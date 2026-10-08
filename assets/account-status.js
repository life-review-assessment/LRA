(()=>{
  let mounted=false;
  function mount(){
    if(mounted)return true;
    const account=window.LRA_ACCOUNT;
    if(!account?.authenticated||!account.profile)return false;
    mounted=true;
    const profile=account.profile;
    const style=document.createElement('style');
    style.textContent=`.lra-account-status{position:fixed;top:12px;right:12px;z-index:9000;max-width:min(82vw,360px);background:rgba(244,242,237,.96);border:1px solid rgba(17,17,15,.22);padding:9px 12px;box-shadow:0 6px 24px rgba(17,17,15,.08);font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;color:#11110f}.lra-account-status strong{display:block;font-size:12px;line-height:1.5;font-weight:700}.lra-account-status span{display:block;margin-top:2px;font-size:9px;line-height:1.4;color:#6d685f;letter-spacing:.04em;word-break:break-all}`;
    document.head.appendChild(style);
    const box=document.createElement('div');
    box.className='lra-account-status';
    const name=document.createElement('strong');
    name.textContent=`ログイン中：${profile.displayName||'利用者'}`;
    const id=document.createElement('span');
    id.textContent=`利用者ID：${profile.userId||''}`;
    box.append(name,id);
    document.body.appendChild(box);
    return true;
  }
  if(!mount()){
    const timer=setInterval(()=>{if(mount())clearInterval(timer);},100);
    setTimeout(()=>clearInterval(timer),30000);
  }
})();
