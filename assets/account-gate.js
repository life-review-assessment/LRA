(()=>{
  const USER_API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
  const EMAIL_API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-email-api';
  const ACCOUNT_KEY='lra.account.1.0',USER_KEY='lra.user.1.0',TOKEN_KEY='lra.user.session.token.1.0',HISTORY_KEY='lra.history.1.3',CLIENT_PREFIX='lra.clientKey.',NEEDS_EMAIL_KEY='lra.account.needsEmail.1.0';
  const lget=k=>{try{return localStorage.getItem(k)}catch{return null}},lset=(k,v)=>{try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v);return true}catch{return false}};
  const readAccount=()=>{try{return JSON.parse(lget(ACCOUNT_KEY)||'null')}catch{return null}};
  const writeAccount=p=>{const ok=lset(ACCOUNT_KEY,JSON.stringify(p))&&lset(USER_KEY,p.userId);if(ok)lset(NEEDS_EMAIL_KEY,null);return ok};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  let account=readAccount(),token=lget(TOKEN_KEY)||'',gate=null,authenticated=false;
  const waiters=[];
  window.LRA_ACCOUNT={authenticated:false,profile:null};

  const style=document.createElement('style');
  style.textContent=`
  .lra-gate{position:fixed;inset:0;z-index:99999;background:#f4f2ed;overflow-y:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding:max(24px,env(safe-area-inset-top)) 20px max(32px,env(safe-area-inset-bottom))}
  .lra-gate-card{width:min(520px,100%);margin:0 auto;border-top:1px solid #11110f;padding-top:28px;padding-bottom:24px;box-sizing:border-box}
  .lra-gate-kicker{font:600 10px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;letter-spacing:.22em;color:#777268;margin:0 0 18px}
  .lra-gate h2{font:400 clamp(34px,8vw,56px)/1.15 Georgia,"Yu Mincho",serif;letter-spacing:-.04em;margin:0 0 18px}
  .lra-gate p{font-size:13px;line-height:1.9;color:#5c574f}
  .lra-gate label{display:block;font-size:11px;color:#777268;margin:18px 0 6px}
  .lra-gate input{width:100%;box-sizing:border-box;min-height:54px;border:1px solid rgba(17,17,15,.25);background:#faf8f2;padding:14px;font-size:16px}
  .lra-gate-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
  .lra-gate button{min-height:52px;border:1px solid #11110f;background:#11110f;color:#f4f2ed;padding:0 18px}
  .lra-gate button.alt{background:transparent;color:#11110f}
  .lra-gate button:disabled{opacity:.45}
  .lra-gate-error{min-height:20px;margin-top:12px;color:#7b2c2c;font-size:12px}
  .lra-known-account,.lra-credential{margin:14px 0 2px;padding:14px 0;border-top:1px solid rgba(17,17,15,.12);border-bottom:1px solid rgba(17,17,15,.12)}
  .lra-known-account strong,.lra-credential strong{display:block;font-size:15px;font-weight:600;color:#11110f}
  .lra-known-account span,.lra-credential span{display:block;margin-top:5px;font-size:11px;color:#777268}
  .lra-code{font:700 19px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em;word-break:break-all}
  .cover-login{position:absolute;top:max(20px,env(safe-area-inset-top));right:20px;z-index:4;border:1px solid rgba(17,17,15,.35);background:rgba(244,242,237,.88);color:#11110f;padding:10px 14px;font-size:11px;letter-spacing:.08em}
  #userDashboardId{display:none!important}
  @media(max-width:600px){.lra-gate{padding-left:18px;padding-right:18px}.lra-gate-card{padding-top:22px}.lra-gate h2{font-size:clamp(34px,10vw,44px)}.lra-gate-actions{display:grid;grid-template-columns:1fr}.lra-gate button{width:100%}}
  `;
  document.head.appendChild(style);

  function profileFrom(p){return{userId:p.user_id||p.userId,displayName:p.display_name||p.displayName||'利用者',loginId:p.login_id||p.loginId||'',serverBacked:true}}
  function closeGate(resolveValue){if(gate){gate.remove();gate=null}if(resolveValue!==undefined){while(waiters.length)waiters.shift()(resolveValue)}}
  function fail(t){const el=gate?.querySelector('#lraGateError');if(el)el.textContent=t||''}
  function busy(on){gate?.querySelectorAll('button,input').forEach(el=>el.disabled=on)}
  function mountShell(html){if(gate)gate.remove();gate=document.createElement('div');gate.className='lra-gate';gate.innerHTML=`<div class="lra-gate-card">${html}<div id="lraGateError" class="lra-gate-error"></div></div>`;document.body.appendChild(gate);gate.scrollTop=0}
  async function api(url,body,t=''){const h={'content-type':'application/json'};if(t)h.authorization=`Bearer ${t}`;const r=await fetch(url,{method:'POST',headers:h,body:JSON.stringify(body),cache:'no-store'}),j=await r.json().catch(()=>({}));if(!r.ok||j.ok!==true){const e=new Error(j.error||'通信エラー');e.status=r.status;e.code=j.error||'';throw e}return j}
  function migrationProofs(userId){let rows=[];try{rows=JSON.parse(lget(HISTORY_KEY)||'[]')}catch{}const proofs=[];for(const r of rows){if(r?.userId!==userId||!r?.lraId||!r?.outputId)continue;const key=lget(`${CLIENT_PREFIX}${r.lraId}`);if(/^CLK-[A-F0-9]{32}$/.test(String(key||'')))proofs.push({lra_id:r.lraId,output_id:r.outputId,client_key:key})}return proofs.slice(0,50)}
  function finish(p,newToken,{close=true}={}){authenticated=true;account=profileFrom(p);token=newToken||token;writeAccount(account);if(token)lset(TOKEN_KEY,token);window.LRA_ACCOUNT={authenticated:true,profile:account};window.dispatchEvent(new CustomEvent('lra:account-authenticated',{detail:{profile:account}}));if(close)closeGate(account)}

  function credentialScreen(j,title){finish(j.profile,j.token,{close:false});mountShell(`<p class="lra-gate-kicker">LRA ACCOUNT</p><h2>${esc(title)}</h2><p>ユーザーIDは別の端末でログインするときに使います。この画面で一度だけ確認してください。通常のマイページには表示しません。</p><div class="lra-credential"><span>ユーザーID</span><div class="lra-code">${esc(j.profile?.login_id||'')}</div></div><div class="lra-gate-actions"><button id="lraCopyId" class="alt">ユーザーIDをコピー</button><button id="lraCredentialDone">確認した →</button></div>`);
    gate.querySelector('#lraCopyId')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(j.profile?.login_id||'');fail('コピーしました。')}catch{fail('コピーできませんでした。長押しで控えてください。')}});
    gate.querySelector('#lraCredentialDone')?.addEventListener('click',()=>closeGate(account));
  }

  function mountRegister({challenge='',name='',email=''}={}){
    if(!challenge){
      mountShell(`<p class="lra-gate-kicker">LRA ACCOUNT</p><h2>アカウントを作成。</h2><p>メールで本人確認したあと、ユーザーIDを発行し、ログインPINを設定します。</p><label>表示名</label><input id="lraGateName" type="text" autocomplete="nickname" maxlength="40" placeholder="表示名"><label>メールアドレス</label><input id="lraGateEmail" type="email" autocomplete="email" placeholder="name@example.com"><div class="lra-gate-actions"><button id="lraSendRegister">確認コードを送る →</button><button class="alt" id="lraGateLoginSwitch">ログイン</button><button class="alt" id="lraGateCancel">戻る</button></div>`);
      gate.querySelector('#lraGateCancel')?.addEventListener('click',()=>closeGate(null));
      gate.querySelector('#lraGateLoginSwitch')?.addEventListener('click',()=>mountLogin({forceId:true}));
      gate.querySelector('#lraSendRegister')?.addEventListener('click',async()=>{const n=(gate.querySelector('#lraGateName')?.value||'').trim()||'利用者',e=(gate.querySelector('#lraGateEmail')?.value||'').trim().toLowerCase();busy(true);try{const j=await api(EMAIL_API,{action:'send_register',email:e});mountRegister({challenge:j.challenge_id,name:n,email:e});}catch(err){fail(err.message)}finally{busy(false)}});
      return;
    }
    mountShell(`<p class="lra-gate-kicker">EMAIL VERIFICATION</p><h2>メールを確認。</h2><p>${esc(email)} に届いた6桁の確認コードを入力し、ログインPINを設定してください。</p><label>確認コード</label><input id="lraGateCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6桁"><label>ログインPIN（4〜12桁）</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="new-password" maxlength="12" placeholder="4〜12桁"><div class="lra-gate-actions"><button id="lraVerifyRegister">確認して登録 →</button><button class="alt" id="lraResendRegister">コードを再送</button><button class="alt" id="lraGateCancel">戻る</button></div>`);
    gate.querySelector('#lraGateCancel')?.addEventListener('click',()=>mountRegister());
    gate.querySelector('#lraResendRegister')?.addEventListener('click',async()=>{busy(true);try{const j=await api(EMAIL_API,{action:'send_register',email});mountRegister({challenge:j.challenge_id,name,email});}catch(err){fail(err.message)}finally{busy(false)}});
    gate.querySelector('#lraVerifyRegister')?.addEventListener('click',async()=>{const code=(gate.querySelector('#lraGateCode')?.value||'').trim(),pin=gate.querySelector('#lraGatePin')?.value||'',legacy=lget(USER_KEY)||account?.userId||'';busy(true);try{const j=await api(EMAIL_API,{action:'verify_register',challenge_id:challenge,code,pin,display_name:name,legacy_user_id:legacy,migration_proofs:migrationProofs(legacy)});credentialScreen(j,'登録が完了しました。');}catch(err){fail(err.message)}finally{busy(false)}});
  }

  function mountRecover({challenge='',email=''}={}){
    if(!challenge){
      mountShell(`<p class="lra-gate-kicker">ACCOUNT RECOVERY</p><h2>ログイン情報を復旧。</h2><p>ユーザーIDやPINを忘れた場合は、登録メールで本人確認します。</p><label>登録メールアドレス</label><input id="lraGateEmail" type="email" autocomplete="email" placeholder="name@example.com"><div class="lra-gate-actions"><button id="lraSendRecover">確認コードを送る →</button><button class="alt" id="lraGateCancel">戻る</button></div>`);
      gate.querySelector('#lraGateCancel')?.addEventListener('click',()=>mountLogin());
      gate.querySelector('#lraSendRecover')?.addEventListener('click',async()=>{const e=(gate.querySelector('#lraGateEmail')?.value||'').trim().toLowerCase();busy(true);try{const j=await api(EMAIL_API,{action:'send_recover',email:e});mountRecover({challenge:j.challenge_id,email:e});}catch(err){fail(err.message)}finally{busy(false)}});
      return;
    }
    mountShell(`<p class="lra-gate-kicker">ACCOUNT RECOVERY</p><h2>PINを再設定。</h2><p>${esc(email)} に届いた6桁の確認コードと、新しいPINを入力してください。</p><label>確認コード</label><input id="lraGateCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6桁"><label>新しいPIN（4〜12桁）</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="new-password" maxlength="12" placeholder="4〜12桁"><div class="lra-gate-actions"><button id="lraVerifyRecover">確認して再設定 →</button><button class="alt" id="lraResendRecover">コードを再送</button><button class="alt" id="lraGateCancel">戻る</button></div>`);
    gate.querySelector('#lraGateCancel')?.addEventListener('click',()=>mountRecover());
    gate.querySelector('#lraResendRecover')?.addEventListener('click',async()=>{busy(true);try{const j=await api(EMAIL_API,{action:'send_recover',email});mountRecover({challenge:j.challenge_id,email});}catch(err){fail(err.message)}finally{busy(false)}});
    gate.querySelector('#lraVerifyRecover')?.addEventListener('click',async()=>{const code=(gate.querySelector('#lraGateCode')?.value||'').trim(),pin=gate.querySelector('#lraGatePin')?.value||'';busy(true);try{const j=await api(EMAIL_API,{action:'verify_recover',challenge_id:challenge,code,pin});credentialScreen(j,'ログイン情報を復旧しました。');}catch(err){fail(err.message)}finally{busy(false)}});
  }

  function mountNeedsEmail(){
    mountShell(`<p class="lra-gate-kicker">ACCOUNT UPDATE</p><h2>メール確認が必要です。</h2><p>この端末に残っている旧ログイン情報は現在の登録情報と一致しません。PINを繰り返し入力せず、メール確認から登録・復旧してください。</p><div class="lra-gate-actions"><button id="lraLegacyRegister">メールで登録・引継ぎ →</button><button class="alt" id="lraLegacyRecover">登録済みメールから復旧</button><button class="alt" id="lraLegacyOther">別のユーザーIDでログイン</button><button class="alt" id="lraGateCancel">戻る</button></div>`);
    gate.querySelector('#lraLegacyRegister')?.addEventListener('click',()=>mountRegister());
    gate.querySelector('#lraLegacyRecover')?.addEventListener('click',()=>mountRecover());
    gate.querySelector('#lraLegacyOther')?.addEventListener('click',()=>mountLogin({forceId:true}));
    gate.querySelector('#lraGateCancel')?.addEventListener('click',()=>closeGate(null));
  }

  function mountLogin({forceId=false}={}){
    if(lget(NEEDS_EMAIL_KEY)==='1'&&!forceId){mountNeedsEmail();return}
    const knownId=account?.userId||lget(USER_KEY)||'',knownName=account?.displayName||'利用者',useKnown=!!knownId&&!forceId;
    if(useKnown){
      mountShell(`<p class="lra-gate-kicker">LRA LOGIN</p><h2>おかえりなさい。</h2><p>このブラウザに保存済みのアカウントです。PINだけ入力してください。</p><div class="lra-known-account"><strong>${esc(knownName)}</strong><span>保存済みLRAアカウント</span></div><label>PIN</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" placeholder="設定したPIN"><div class="lra-gate-actions"><button id="lraGateLogin">ログイン →</button><button class="alt" id="lraGateSwitch">別のアカウントでログイン</button><button class="alt" id="lraGateRecover">ユーザーID / PINを忘れた</button><button class="alt" id="lraGateMigrate">メールで登録・復旧</button><button class="alt" id="lraGateCancel">戻る</button></div>`);
    }else{
      mountShell(`<p class="lra-gate-kicker">LRA LOGIN</p><h2>ログイン</h2><p>別の端末では、発行されたユーザーIDとPINを入力します。</p><label>ユーザーID</label><input id="lraGateLoginId" type="text" autocapitalize="characters" autocomplete="username" placeholder="LRA-XXXXXX"><label>PIN</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" placeholder="設定したPIN"><div class="lra-gate-actions"><button id="lraGateLogin">ログイン →</button><button class="alt" id="lraGateRecover">ユーザーID / PINを忘れた</button><button class="alt" id="lraGateRegister">新規登録</button><button class="alt" id="lraGateCancel">戻る</button></div>`);
    }
    gate.querySelector('#lraGateCancel')?.addEventListener('click',()=>closeGate(null));
    gate.querySelector('#lraGateSwitch')?.addEventListener('click',()=>mountLogin({forceId:true}));
    gate.querySelector('#lraGateRecover')?.addEventListener('click',()=>mountRecover());
    gate.querySelector('#lraGateMigrate')?.addEventListener('click',()=>mountRegister());
    gate.querySelector('#lraGateRegister')?.addEventListener('click',()=>mountRegister());
    gate.querySelector('#lraGateLogin')?.addEventListener('click',async()=>{const ident=(useKnown?knownId:(gate.querySelector('#lraGateLoginId')?.value||'')).trim().toUpperCase(),pin=gate.querySelector('#lraGatePin')?.value||'';if(!ident)return fail('ユーザーIDを確認してください。');if(!/^\d{4,12}$/.test(pin))return fail('PINを確認してください。');busy(true);try{const j=await api(USER_API,{action:'login',login_id:ident,pin});finish(j.profile,j.token);}catch(err){if(useKnown&&err.code==='ACCOUNT_NOT_FOUND'){lset(NEEDS_EMAIL_KEY,'1');mountNeedsEmail();return}if(err.code==='ACCOUNT_NOT_FOUND')fail('ユーザーIDまたは登録状態を確認してください。');else fail(err.message);}finally{busy(false)}});
    gate.querySelector('#lraGatePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')gate.querySelector('#lraGateLogin')?.click()});
  }

  function ensureAccount(){if(authenticated)return Promise.resolve(account);return new Promise(resolve=>{waiters.push(resolve);if(lget(NEEDS_EMAIL_KEY)==='1')mountNeedsEmail();else if(account||lget(USER_KEY))mountLogin();else mountRegister()})}
  function openLogin(){if(authenticated)return Promise.resolve(account);return new Promise(resolve=>{waiters.push(resolve);mountLogin()})}
  function openRegistration(){if(authenticated)return Promise.resolve(account);return new Promise(resolve=>{waiters.push(resolve);mountRegister()})}
  function openAccountInfo(){if(!authenticated){openLogin();return}mountShell(`<p class="lra-gate-kicker">ACCOUNT</p><h2>ログイン済みです。</h2><p>ユーザーIDは通常画面には表示しません。別の端末で必要になり、忘れた場合は登録メールから復旧できます。</p><div class="lra-gate-actions"><button id="lraGateDone">閉じる</button></div>`);gate.querySelector('#lraGateDone')?.addEventListener('click',()=>closeGate())}
  async function logout(){try{if(token)await api(USER_API,{action:'logout'},token)}catch{}token='';lset(TOKEN_KEY,null);authenticated=false;window.LRA_ACCOUNT={authenticated:false,profile:null};location.reload()}
  function getToken(){return token}
  window.LRA_ACCOUNT_UI=Object.freeze({ensureAccount,openRegistration,openLogin,openAccountInfo,logout,getToken});

  async function boot(){const oldId=lget(USER_KEY);if(!account&&oldId)account={userId:oldId,displayName:'利用者',loginId:''};if(token){try{const j=await api(USER_API,{action:'session'},token);finish(j.profile,token);return}catch{lset(TOKEN_KEY,null);token=''}}}
  boot();
})();