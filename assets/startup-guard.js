const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const IN_PROGRESS=new Set(['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION']);

const MOBILE_ABOUT_VERSION='20261011-r5';

function repairMobileAbout(){
  if(!window.matchMedia('(max-width:760px)').matches)return;
  const about=document.getElementById('about');
  if(!about)return;

  about.dataset.mobileAboutVersion=MOBILE_ABOUT_VERSION;
  about.className='lra-mobile-about';
  about.innerHTML=`
    <div class="lra-mobile-about-inner">
      <p class="lra-mobile-kicker">WHAT LRA DOES</p>
      <div class="lra-mobile-thesis">
        <span>そんなとき、必要なのは</span>
        <span>もっと頑張ることではなく、</span>
        <span class="lra-mobile-thesis-emphasis">今の生活を一度、構造として整理すること。</span>
      </div>
      <p class="lra-mobile-copy">LRAは、困りごとや負担だけを見るサービスではありません。<br>支えになっていること、守りたいもの、すでに機能している部分、使える資源まで含めて生活全体を整理します。</p>
      <div class="lra-mobile-decision"><p>何を変えるか。何を残すか。次に何を選ぶか。</p><small>LRAは、その判断をしやすくするための意思決定支援です。</small></div>
      <div class="lra-mobile-steps">
        <article><span>01</span><h3>今の状態を確認する</h3><p>行動、決め方、生活環境、気持ち、休息・回復について、負担と今うまくいっている部分の両方をここ2週間ほどの生活から確認します。</p></article>
        <article><span>02</span><h3>回答に合わせて詳しく見る</h3><p>回答内容に合わせた追加質問で、必要な部分をもう少し詳しく確認します。</p></article>
        <article><span>03</span><h3>つながりを整理する</h3><p>負担が続く流れだけでなく、例外、支え、守りたいもの、使える資源も含めて全体のつながりを整理します。</p></article>
        <article><span>04</span><h3>次の一歩を考える</h3><p>何を変えるかだけでなく、何を変えないかも含めて、次の判断に使える選択肢を整理します。</p></article>
      </div>
    </div>`;

  let style=document.getElementById('lraMobileAboutRepairStyle');
  if(!style){style=document.createElement('style');style.id='lraMobileAboutRepairStyle';document.head.appendChild(style);}
  style.textContent=`
    @media(max-width:760px){
      .lra-mobile-about,.lra-mobile-about *{box-sizing:border-box!important}
      .lra-mobile-about{display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:72px 0!important;margin:0!important;border-bottom:1px solid rgba(23,22,19,.14)!important;background:#f6f3ed!important;color:#171613!important;contain:none!important;content-visibility:visible!important;transform:none!important;opacity:1!important;visibility:visible!important}
      .lra-mobile-about-inner{display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0 24px!important;overflow:visible!important;contain:none!important;content-visibility:visible!important;transform:none!important;opacity:1!important;visibility:visible!important}
      .lra-mobile-kicker{display:block!important;position:static!important;height:auto!important;margin:0 0 22px!important;padding:0!important;font:600 10px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif!important;letter-spacing:.22em!important;color:#6c675f!important;transform:none!important;opacity:1!important;visibility:visible!important}
      .lra-mobile-thesis{display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;font:400 36px/1.38 Georgia,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:-.025em!important;color:#171613!important;white-space:normal!important;overflow:visible!important;contain:none!important;content-visibility:visible!important;transform:none!important;opacity:1!important;visibility:visible!important}
      .lra-mobile-thesis>span{display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;font:inherit!important;color:inherit!important;white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important;transform:none!important;opacity:1!important;visibility:visible!important}
      .lra-mobile-thesis>span+span{margin-top:14px!important}
      .lra-mobile-thesis-emphasis{font-weight:600!important}
      .lra-mobile-copy{display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:32px 0 0!important;padding:0!important;font-size:13px!important;line-height:2!important;color:#5c574f!important;overflow:visible!important;transform:none!important;opacity:1!important;visibility:visible!important}
      .lra-mobile-decision{display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:48px 0 0!important;padding:0!important;overflow:visible!important;transform:none!important;opacity:1!important;visibility:visible!important}
      .lra-mobile-decision:before{content:""!important;display:block!important;position:static!important;width:54px!important;height:1px!important;margin:0 0 30px!important;background:#171613!important}
      .lra-mobile-decision p{display:block!important;position:static!important;margin:0!important;padding:0!important;font:400 34px/1.45 Georgia,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:-.03em!important;color:#171613!important}
      .lra-mobile-decision small{display:block!important;position:static!important;margin:22px 0 0!important;padding:0!important;font-size:13px!important;line-height:1.9!important;color:#5c574f!important}
      .lra-mobile-steps{display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:48px 0 0!important;padding:0!important;border-top:1px solid #171613!important;overflow:visible!important;transform:none!important;opacity:1!important;visibility:visible!important}
      .lra-mobile-steps article{display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:24px 0!important;border:0!important;border-bottom:1px solid rgba(23,22,19,.14)!important;background:transparent!important;overflow:visible!important}
      .lra-mobile-steps article>span{display:block!important;font:400 14px Georgia,serif!important;color:#6c675f!important}
      .lra-mobile-steps h3{display:block!important;margin:18px 0 10px!important;font:500 18px/1.5 Georgia,"Yu Mincho",serif!important;color:#171613!important}
      .lra-mobile-steps p{display:block!important;margin:0!important;font-size:12px!important;line-height:1.9!important;color:#5c574f!important}
    }
  `;

  requestAnimationFrame(()=>{
    const thesis=about.querySelector('.lra-mobile-thesis');
    const copy=about.querySelector('.lra-mobile-copy');
    const spans=[...about.querySelectorAll('.lra-mobile-thesis>span')];
    const bad=!thesis||!copy||spans.length!==3||spans.some(s=>s.getBoundingClientRect().height<20)||copy.getBoundingClientRect().top-thesis.getBoundingClientRect().bottom>100;
    if(bad){
      about.style.cssText='display:block!important;position:static!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:64px 24px!important;margin:0!important;background:#f6f3ed!important;color:#171613!important';
      const inner=about.firstElementChild;if(inner)inner.style.cssText='display:block!important;position:static!important;width:100%!important;height:auto!important;margin:0!important;padding:0!important;overflow:visible!important';
      spans.forEach((s,i)=>s.style.cssText=`display:block!important;position:static!important;height:auto!important;margin:${i?'12px':'0'} 0 0!important;padding:0!important;font:400 ${i===2?'600 ':''}34px/1.4 Georgia,"Yu Mincho",serif!important;color:#171613!important;opacity:1!important;visibility:visible!important`);
      if(copy)copy.style.cssText='display:block!important;position:static!important;height:auto!important;margin:30px 0 0!important;padding:0!important;font-size:13px!important;line-height:2!important;color:#5c574f!important;opacity:1!important;visibility:visible!important';
    }
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repairMobileAbout,{once:true});
else repairMobileAbout();

function showOnly(view){
  document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('hidden',el.dataset.view!==view));
  window.scrollTo({top:0,behavior:'auto'});
}
function profileUserId(profile){return profile?.userId||profile?.user_id||'';}
function sameOwner(state,profile){return !!(state?.userId&&profileUserId(profile)&&state.userId===profileUserId(profile));}

const initialState=window.LRA_RUNTIME?.getState?.();
if(initialState&&(IN_PROGRESS.has(initialState.stage)||initialState.stage==='COMPLETE'))showOnly('home');

async function savedSessionProfile(){
  if(window.LRA_ACCOUNT?.authenticated)return window.LRA_ACCOUNT.profile||null;
  const token=window.LRA_ACCOUNT_UI?.getToken?.()||'';
  if(!token)return null;
  try{
    const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${token}`},body:JSON.stringify({action:'session'}),cache:'no-store'});
    const j=await r.json().catch(()=>({}));
    return r.ok&&j.ok===true?j.profile||null:null;
  }catch{return null;}
}

async function guardStartup(){
  const state=window.LRA_RUNTIME?.getState?.();
  if(!state)return;
  if(IN_PROGRESS.has(state.stage)){
    const saved=await savedSessionProfile();
    if(saved){if(sameOwner(state,saved))window.LRA_RUNTIME?.resume?.();else showOnly('home');return;}
    const profile=await window.LRA_ACCOUNT_UI?.ensureAccount?.();
    if(profile&&sameOwner(state,profile))window.LRA_RUNTIME?.resume?.();else showOnly('home');
    return;
  }
  if(state.stage==='COMPLETE'){
    const saved=await savedSessionProfile();
    if(!saved||!sameOwner(state,saved))showOnly('home');
  }
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',guardStartup,{once:true});
else guardStartup();
