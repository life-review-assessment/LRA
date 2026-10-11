const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const IN_PROGRESS=new Set(['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION']);

function repairMobileAbout(){
  if(!window.matchMedia('(max-width:760px)').matches)return;
  const about=document.getElementById('about');
  if(!about)return;

  about.setAttribute('data-mobile-layout','r10');
  about.style.cssText='display:block!important;position:static!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:72px 0!important;margin:0!important;background:#f4f2ed!important;color:#171613!important;';
  about.innerHTML=`
    <div style="display:block!important;position:static!important;height:auto!important;min-height:0!important;max-height:none!important;padding:0 24px!important;margin:0!important;overflow:visible!important;">
      <p style="display:block!important;margin:0 0 22px!important;font:600 10px/1.4 -apple-system,BlinkMacSystemFont,'Hiragino Sans','Yu Gothic',sans-serif!important;letter-spacing:.22em!important;color:#777268!important;">WHAT LRA DOES</p>
      <div style="display:block!important;margin:0!important;padding:0!important;height:auto!important;min-height:0!important;max-height:none!important;font:400 34px/1.42 Georgia,'Yu Mincho','Hiragino Mincho ProN',serif!important;letter-spacing:-.025em!important;color:#171613!important;overflow:visible!important;">
        <p style="display:block!important;margin:0!important;padding:0!important;height:auto!important;min-height:0!important;max-height:none!important;">そんなとき、必要なのは</p>
        <p style="display:block!important;margin:12px 0 0!important;padding:0!important;height:auto!important;min-height:0!important;max-height:none!important;">もっと頑張ることではなく、</p>
        <p style="display:block!important;margin:12px 0 0!important;padding:0!important;height:auto!important;min-height:0!important;max-height:none!important;font-weight:600!important;">今の生活を一度、構造として整理すること。</p>
      </div>
      <p style="display:block!important;margin:30px 0 0!important;padding:0!important;height:auto!important;min-height:0!important;max-height:none!important;font-size:13px!important;line-height:2!important;color:#5c574f!important;">LRAは、困りごとや負担だけを見るサービスではありません。<br>支えになっていること、守りたいもの、すでに機能している部分、使える資源まで含めて生活全体を整理します。</p>
      <div style="display:block!important;margin:48px 0 0!important;padding:0!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;">
        <div style="display:block!important;width:54px!important;height:1px!important;background:#171613!important;margin:0 0 30px!important;"></div>
        <p style="display:block!important;margin:0!important;padding:0!important;font:400 34px/1.45 Georgia,'Yu Mincho','Hiragino Mincho ProN',serif!important;letter-spacing:-.03em!important;color:#171613!important;">何を変えるか。何を残すか。次に何を選ぶか。</p>
        <small style="display:block!important;margin:22px 0 0!important;font-size:13px!important;line-height:1.9!important;color:#5c574f!important;">LRAは、その判断をしやすくするための意思決定支援です。</small>
      </div>
      <div style="display:block!important;margin:48px 0 0!important;padding:0!important;border-top:1px solid #171613!important;">
        <article style="display:block!important;padding:24px 0!important;border-bottom:1px solid rgba(23,22,19,.14)!important;"><span style="display:block!important;font:400 14px Georgia,serif!important;color:#777268!important;">01</span><h3 style="display:block!important;margin:18px 0 10px!important;font:500 18px/1.5 Georgia,'Yu Mincho',serif!important;">今の状態を確認する</h3><p style="display:block!important;margin:0!important;font-size:12px!important;line-height:1.9!important;color:#5c574f!important;">行動、決め方、生活環境、気持ち、休息・回復について、負担と今うまくいっている部分の両方をここ2週間ほどの生活から確認します。</p></article>
        <article style="display:block!important;padding:24px 0!important;border-bottom:1px solid rgba(23,22,19,.14)!important;"><span style="display:block!important;font:400 14px Georgia,serif!important;color:#777268!important;">02</span><h3 style="display:block!important;margin:18px 0 10px!important;font:500 18px/1.5 Georgia,'Yu Mincho',serif!important;">回答に合わせて詳しく見る</h3><p style="display:block!important;margin:0!important;font-size:12px!important;line-height:1.9!important;color:#5c574f!important;">回答内容に合わせた追加質問で、必要な部分をもう少し詳しく確認します。</p></article>
        <article style="display:block!important;padding:24px 0!important;border-bottom:1px solid rgba(23,22,19,.14)!important;"><span style="display:block!important;font:400 14px Georgia,serif!important;color:#777268!important;">03</span><h3 style="display:block!important;margin:18px 0 10px!important;font:500 18px/1.5 Georgia,'Yu Mincho',serif!important;">つながりを整理する</h3><p style="display:block!important;margin:0!important;font-size:12px!important;line-height:1.9!important;color:#5c574f!important;">負担が続く流れだけでなく、例外、支え、守りたいもの、使える資源も含めて全体のつながりを整理します。</p></article>
        <article style="display:block!important;padding:24px 0!important;border-bottom:1px solid rgba(23,22,19,.14)!important;"><span style="display:block!important;font:400 14px Georgia,serif!important;color:#777268!important;">04</span><h3 style="display:block!important;margin:18px 0 10px!important;font:500 18px/1.5 Georgia,'Yu Mincho',serif!important;">次の一歩を考える</h3><p style="display:block!important;margin:0!important;font-size:12px!important;line-height:1.9!important;color:#5c574f!important;">何を変えるかだけでなく、何を変えないかも含めて、次の判断に使える選択肢を整理します。</p></article>
      </div>
    </div>`;
}

repairMobileAbout();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repairMobileAbout,{once:true});

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
  repairMobileAbout();
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
