(()=>{
  const ACCOUNT_KEY='lra.account.1.0';
  const USER_KEY='lra.user.1.0';
  const SESSION_KEY='lra.session.auth.1.0';
  const ITERATIONS=150000;
  const enc=new TextEncoder();
  const b64=a=>btoa(String.fromCharCode(...a));
  const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const bytes=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return a;};
  const hex=a=>[...a].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
  const dateStamp=()=>{const d=new Date();return`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;};
  const newUserId=()=>`USR-${dateStamp()}-${hex(bytes(4))}`;
  const localGet=k=>{try{return localStorage.getItem(k);}catch{return null;}};
  const localSet=(k,v)=>{try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);return true;}catch{return false;}};
  const sessionSet=(k,v)=>{try{if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v);return true;}catch{return false;}};
  async function legacyDigest(pin,salt){const p=enc.encode(pin);const merged=new Uint8Array(salt.length+p.length);merged.set(salt);merged.set(p,salt.length);return b64(new Uint8Array(await crypto.subtle.digest('SHA-256',merged)));}
  async function pbkdf2(pin,salt,iterations=ITERATIONS){const key=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);return b64(new Uint8Array(bits));}
  function read(){try{return JSON.parse(localGet(ACCOUNT_KEY)||'null');}catch{return null;}}
  function write(x){return localSet(ACCOUNT_KEY,JSON.stringify(x))&&localSet(USER_KEY,x.userId);}

  let account=read();
  sessionSet(SESSION_KEY,null);
  const oldUserId=localGet(USER_KEY);
  const provisionalUserId=account?.userId||oldUserId||newUserId();
  window.LRA_ACCOUNT={authenticated:false,profile:account||null};

  const style=document.createElement('style');
  style.textContent=`.lra-gate{position:fixed;inset:0;z-index:99999;background:#f4f2ed;display:grid;place-items:center;padding:24px}.lra-gate-card{width:min(520px,100%);border-top:1px solid #11110f;padding-top:28px}.lra-gate-kicker{font:600 10px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;letter-spacing:.22em;color:#777268;margin:0 0 18px}.lra-gate h2{font:400 clamp(34px,8vw,56px)/1.15 Georgia,"Yu Mincho",serif;letter-spacing:-.04em;margin:0 0 18px}.lra-gate p{font-size:13px;line-height:1.9;color:#5c574f}.lra-gate label{display:block;font-size:11px;color:#777268;margin:18px 0 6px}.lra-gate input{width:100%;box-sizing:border-box;min-height:54px;border:1px solid rgba(17,17,15,.25);background:#faf8f2;padding:14px;font-size:16px}.lra-gate-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.lra-gate button{min-height:52px;border:1px solid #11110f;background:#11110f;color:#f4f2ed;padding:0 18px}.lra-gate button.alt{background:transparent;color:#11110f}.lra-gate button:disabled{opacity:.45}.lra-gate-error{min-height:20px;margin-top:12px;color:#7b2c2c;font-size:12px}`;
  document.head.appendChild(style);

  let gate=null;
  const waiters=[];
  function finish(profile){
    window.LRA_ACCOUNT={authenticated:true,profile};
    sessionSet(SESSION_KEY,'1');
    window.dispatchEvent(new CustomEvent('lra:account-authenticated',{detail:{profile}}));
    while(waiters.length)waiters.shift()(profile);
    if(gate){gate.remove();gate=null;}
  }
  function fail(t){const e=gate?.querySelector('#lraGateError');if(e)e.textContent=t||'';}
  function busy(on){gate?.querySelectorAll('button').forEach(b=>b.disabled=on);}
  function closeGate(){if(gate){gate.remove();gate=null;}while(waiters.length)waiters.shift()(null);}
  function mount(mode){
    if(gate)return;
    gate=document.createElement('div');gate.className='lra-gate';
    gate.innerHTML=mode==='login'
      ?`<div class="lra-gate-card"><p class="lra-gate-kicker">LRA LOGIN</p><h2>ログイン</h2><p>この端末に保存されている利用者IDと履歴を続けます。</p><label>PIN</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" placeholder="設定したPIN"><div class="lra-gate-actions"><button id="lraGateLogin">ログイン →</button><button class="alt" id="lraGateCancel">戻る</button></div><div id="lraGateError" class="lra-gate-error"></div></div>`
      :`<div class="lra-gate-card"><p class="lra-gate-kicker">LRA ACCOUNT</p><h2>LRAアカウントを作成。</h2><p>結果と利用履歴をこの端末で確認できるように、表示名とPINを設定します。</p><label>表示名</label><input id="lraGateName" type="text" autocomplete="nickname" maxlength="40" placeholder="表示名"><label>PIN（4〜12桁）</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="new-password" maxlength="12" placeholder="4〜12桁"><div class="lra-gate-actions"><button id="lraGateCreate">登録して続ける →</button><button class="alt" id="lraGateCancel">戻る</button></div><div id="lraGateError" class="lra-gate-error"></div></div>`;
    document.body.appendChild(gate);
    gate.querySelector('#lraGateCancel')?.addEventListener('click',closeGate);
    async function create(){
      const name=(gate?.querySelector('#lraGateName')?.value||'').trim();
      const pin=gate?.querySelector('#lraGatePin')?.value||'';
      if(!/^\d{4,12}$/.test(pin))return fail('PINは4〜12桁の数字で設定してください。');
      busy(true);
      try{
        const salt=bytes(16);
        const profile={userId:provisionalUserId,displayName:name||'利用者',kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:b64(salt),pinHash:await pbkdf2(pin,salt),createdAt:new Date().toISOString(),lastLoginAt:new Date().toISOString()};
        if(!write(profile))return fail('このブラウザでは保存領域を利用できません。');
        account=profile;finish(profile);
      }finally{busy(false);}
    }
    async function login(){
      const pin=gate?.querySelector('#lraGatePin')?.value||'';
      busy(true);
      try{
        if(!account)return fail('アカウント情報がありません。');
        const salt=fromB64(account.salt);
        let ok=false;
        if(account.kdf==='PBKDF2-SHA256')ok=(await pbkdf2(pin,salt,Number(account.iterations||ITERATIONS)))===account.pinHash;
        else ok=(await legacyDigest(pin,salt))===account.pinHash;
        if(!ok)return fail('PINが一致しません。');
        if(account.kdf!=='PBKDF2-SHA256'){account.kdf='PBKDF2-SHA256';account.iterations=ITERATIONS;account.pinHash=await pbkdf2(pin,salt);}
        account.lastLoginAt=new Date().toISOString();
        if(!write(account))return fail('このブラウザでは保存領域を利用できません。');
        finish(account);
      }finally{busy(false);}
    }
    gate.querySelector('#lraGateCreate')?.addEventListener('click',create);
    gate.querySelector('#lraGateLogin')?.addEventListener('click',login);
    gate.querySelector('#lraGatePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')(mode==='login'?login():create());});
  }
  function ensureAccount(){if(window.LRA_ACCOUNT?.authenticated)return Promise.resolve(window.LRA_ACCOUNT.profile);return new Promise(resolve=>{waiters.push(resolve);mount(account?'login':'create');});}
  window.LRA_ACCOUNT_UI=Object.freeze({ensureAccount,openRegistration:ensureAccount,openLogin:()=>new Promise(resolve=>{waiters.push(resolve);mount('login');})});

  document.addEventListener('click',async e=>{
    const target=e.target.closest('#homeStartBtn,[data-home-plan],[data-plan]');
    if(!target||window.LRA_ACCOUNT?.authenticated)return;
    const code=target.id==='homeStartBtn'?'FREE':(target.dataset.homePlan||target.dataset.plan||'');
    if(code!=='FREE')return;
    e.preventDefault();e.stopImmediatePropagation();
    const profile=await ensureAccount();
    if(profile)target.click();
  },true);

  if(account)mount('login');
})();
