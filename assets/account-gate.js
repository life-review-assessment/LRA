(()=>{
  const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
  const ACCOUNT_KEY='lra.account.1.0';
  const USER_KEY='lra.user.1.0';
  const TOKEN_KEY='lra.user.session.token.1.0';
  const HISTORY_KEY='lra.history.1.3';
  const CLIENT_PREFIX='lra.clientKey.';
  const ITER=150000;
  const enc=new TextEncoder();
  const b64=a=>btoa(String.fromCharCode(...a));
  const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const bytes=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return a;};
  const hex=a=>[...a].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
  const dateStamp=()=>{const d=new Date();return`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;};
  const newUserId=()=>`USR-${dateStamp()}-${hex(bytes(4))}`;
  const lget=k=>{try{return localStorage.getItem(k);}catch{return null;}};
  const lset=(k,v)=>{try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);return true;}catch{return false;}};
  const readAccount=()=>{try{return JSON.parse(lget(ACCOUNT_KEY)||'null');}catch{return null;}};
  const writeAccount=p=>lset(ACCOUNT_KEY,JSON.stringify(p))&&lset(USER_KEY,p.userId);
  async function legacyDigest(pin,salt){const p=enc.encode(pin),m=new Uint8Array(salt.length+p.length);m.set(salt);m.set(p,salt.length);return b64(new Uint8Array(await crypto.subtle.digest('SHA-256',m)));}
  async function pbkdf2(pin,salt,iterations=ITER){const key=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);return b64(new Uint8Array(bits));}
  async function verifyLegacyPin(account,pin){if(!account?.pinHash||!account?.salt)return false;const salt=fromB64(account.salt);if(account.kdf==='PBKDF2-SHA256')return await pbkdf2(pin,salt,Number(account.iterations||ITER))===account.pinHash;return await legacyDigest(pin,salt)===account.pinHash;}
  async function api(body,token=''){
    const h={'content-type':'application/json'};if(token)h.authorization=`Bearer ${token}`;
    const r=await fetch(API,{method:'POST',headers:h,body:JSON.stringify(body),cache:'no-store'}),j=await r.json().catch(()=>({}));
    if(!r.ok||j.ok!==true){const e=new Error(j.error||'通信エラー');e.status=r.status;e.code=j.error||'';throw e;}return j;
  }
  function migrationProofs(userId){
    let rows=[];try{rows=JSON.parse(lget(HISTORY_KEY)||'[]');}catch{}
    const proofs=[];
    for(const r of rows){if(r?.userId!==userId||!r?.lraId||!r?.outputId)continue;const key=lget(`${CLIENT_PREFIX}${r.lraId}`);if(/^CLK-[A-F0-9]{32}$/.test(String(key||'')))proofs.push({lra_id:r.lraId,output_id:r.outputId,client_key:key});}
    return proofs.slice(0,50);
  }

  let account=readAccount();
  let token=lget(TOKEN_KEY)||'';
  let gate=null;
  let authenticated=false;
  const waiters=[];
  window.LRA_ACCOUNT={authenticated:false,profile:null};

  const style=document.createElement('style');
  style.textContent=`.lra-gate{position:fixed;inset:0;z-index:99999;background:#f4f2ed;display:grid;place-items:center;padding:24px}.lra-gate-card{width:min(520px,100%);border-top:1px solid #11110f;padding-top:28px}.lra-gate-kicker{font:600 10px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;letter-spacing:.22em;color:#777268;margin:0 0 18px}.lra-gate h2{font:400 clamp(34px,8vw,56px)/1.15 Georgia,"Yu Mincho",serif;letter-spacing:-.04em;margin:0 0 18px}.lra-gate p{font-size:13px;line-height:1.9;color:#5c574f}.lra-gate label{display:block;font-size:11px;color:#777268;margin:18px 0 6px}.lra-gate input{width:100%;box-sizing:border-box;min-height:54px;border:1px solid rgba(17,17,15,.25);background:#faf8f2;padding:14px;font-size:16px}.lra-gate-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.lra-gate button{min-height:52px;border:1px solid #11110f;background:#11110f;color:#f4f2ed;padding:0 18px}.lra-gate button.alt{background:transparent;color:#11110f}.lra-gate button:disabled{opacity:.45}.lra-gate-error{min-height:20px;margin-top:12px;color:#7b2c2c;font-size:12px}.cover-login{position:absolute;top:max(20px,env(safe-area-inset-top));right:20px;z-index:4;border:1px solid rgba(17,17,15,.35);background:rgba(244,242,237,.88);color:#11110f;padding:10px 14px;font-size:11px;letter-spacing:.08em}`;
  document.head.appendChild(style);

  function finish(profile,newToken){
    authenticated=true;account={userId:profile.user_id||profile.userId,displayName:profile.display_name||profile.displayName||'利用者',serverBacked:true};token=newToken||token;
    writeAccount(account);if(token)lset(TOKEN_KEY,token);
    window.LRA_ACCOUNT={authenticated:true,profile:account};
    if(gate){gate.remove();gate=null;}
    window.dispatchEvent(new CustomEvent('lra:account-authenticated',{detail:{profile:account}}));
    while(waiters.length)waiters.shift()(account);
  }
  function fail(t){const el=gate?.querySelector('#lraGateError');if(el)el.textContent=t||'';}
  function busy(on){gate?.querySelectorAll('button').forEach(b=>b.disabled=on);}
  function closeGate(){if(gate){gate.remove();gate=null;}}

  function mount(mode,{returning=false}={}){
    closeGate();gate=document.createElement('div');gate.className='lra-gate';
    const knownId=account?.userId||lget(USER_KEY)||'';
    if(mode==='register'){
      gate.innerHTML=`<div class="lra-gate-card"><p class="lra-gate-kicker">LRA ACCOUNT</p><h2>LRAアカウントを作成。</h2><p>結果と利用履歴を本人専用のマイページで確認するため、表示名とPINを設定します。</p><label>表示名</label><input id="lraGateName" type="text" autocomplete="nickname" maxlength="40" placeholder="表示名"><label>PIN（4〜12桁）</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="new-password" maxlength="12" placeholder="4〜12桁"><div class="lra-gate-actions"><button id="lraGateCreate">登録して続ける →</button><button class="alt" id="lraGateCancel">戻る</button></div><div id="lraGateError" class="lra-gate-error"></div></div>`;
    }else{
      gate.innerHTML=`<div class="lra-gate-card"><p class="lra-gate-kicker">LRA LOGIN</p><h2>ログイン</h2><p>登録済みの利用者IDとPINでマイページを開きます。</p><label>利用者ID</label><input id="lraGateUser" type="text" autocapitalize="characters" autocomplete="off" value="" placeholder="USR-XXXXXXXX-XXXXXXXX"><label>PIN</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" placeholder="設定したPIN"><div class="lra-gate-actions"><button id="lraGateLogin">ログイン →</button><button class="alt" id="lraGateCancel">戻る</button></div><div id="lraGateError" class="lra-gate-error"></div></div>`;
    }
    document.body.appendChild(gate);
    gate.querySelector('#lraGateCancel')?.addEventListener('click',()=>{closeGate();while(waiters.length)waiters.shift()(null);});
    async function create(){
      const name=(gate?.querySelector('#lraGateName')?.value||'').trim()||'利用者',pin=gate?.querySelector('#lraGatePin')?.value||'';
      if(!/^\d{4,12}$/.test(pin))return fail('PINは4〜12桁の数字で設定してください。');
      const userId=knownId||newUserId();busy(true);try{const j=await api({action:'register',user_id:userId,display_name:name,pin,migration_proofs:migrationProofs(userId)});finish(j.profile,j.token);}catch(e){fail(e.code==='MIGRATION_PROOF_REQUIRED'?'既存履歴の本人確認ができませんでした。':'登録できませんでした。もう一度お試しください。');}finally{busy(false);}
    }
    async function login(){
      const userId=(gate?.querySelector('#lraGateUser')?.value||'').trim().toUpperCase(),pin=gate?.querySelector('#lraGatePin')?.value||'';
      if(!/^USR-\d{8}-[A-F0-9]{8,32}$/.test(userId))return fail('利用者IDを確認してください。');
      if(!/^\d{4,12}$/.test(pin))return fail('PINを確認してください。');
      busy(true);try{
        try{const j=await api({action:'login',user_id:userId,pin});finish(j.profile,j.token);return;}catch(e){if(e.code!=='ACCOUNT_NOT_FOUND')throw e;}
        const legacy=readAccount();if(!legacy||legacy.userId!==userId||!await verifyLegacyPin(legacy,pin))throw new Error('LEGACY_VERIFY_FAILED');
        const j=await api({action:'register',user_id:userId,display_name:legacy.displayName||'利用者',pin,migration_proofs:migrationProofs(userId)});finish(j.profile,j.token);
      }catch(e){fail(e.code==='MIGRATION_PROOF_REQUIRED'?'既存履歴の本人確認ができませんでした。':'利用者IDまたはPINを確認してください。');}finally{busy(false);}
    }
    gate.querySelector('#lraGateCreate')?.addEventListener('click',create);
    gate.querySelector('#lraGateLogin')?.addEventListener('click',login);
    gate.querySelector('#lraGatePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')(mode==='register'?create():login());});
  }

  function ensureAccount(){if(authenticated)return Promise.resolve(account);return new Promise(resolve=>{waiters.push(resolve);mount(account?'login':'register');});}
  function openLogin(){if(authenticated)return Promise.resolve(account);return new Promise(resolve=>{waiters.push(resolve);mount('login',{returning:true});});}
  async function logout(){try{if(token)await api({action:'logout'},token);}catch{}token='';lset(TOKEN_KEY,null);authenticated=false;window.LRA_ACCOUNT={authenticated:false,profile:null};location.reload();}
  function getToken(){return token;}
  window.LRA_ACCOUNT_UI=Object.freeze({ensureAccount,openRegistration:ensureAccount,openLogin,logout,getToken});

  async function boot(){
    const oldId=lget(USER_KEY);if(!account&&oldId)account={userId:oldId,displayName:'利用者'};
    if(token){try{const j=await api({action:'session'},token);finish(j.profile,token);return;}catch{lset(TOKEN_KEY,null);token='';}}
  }
  boot();
})();