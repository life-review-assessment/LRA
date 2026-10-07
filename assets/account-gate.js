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
  const localSet=(k,v)=>{try{localStorage.setItem(k,v);return true;}catch{return false;}};
  const sessionGet=k=>{try{return sessionStorage.getItem(k);}catch{return null;}};
  const sessionSet=(k,v)=>{try{if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v);return true;}catch{return false;}};
  async function legacyDigest(pin,salt){const p=enc.encode(pin);const merged=new Uint8Array(salt.length+p.length);merged.set(salt);merged.set(p,salt.length);return b64(new Uint8Array(await crypto.subtle.digest('SHA-256',merged)));}
  async function pbkdf2(pin,salt,iterations=ITERATIONS){const key=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);return b64(new Uint8Array(bits));}
  function read(){try{return JSON.parse(localGet(ACCOUNT_KEY)||'null');}catch{return null;}}
  function write(x){return localSet(ACCOUNT_KEY,JSON.stringify(x))&&localSet(USER_KEY,x.userId);}
  const account=read();
  if(sessionGet(SESSION_KEY)==='1'&&account){localSet(USER_KEY,account.userId);window.LRA_ACCOUNT={authenticated:true,profile:account};return;}
  const oldUserId=localGet(USER_KEY);
  const provisionalUserId=account?.userId||oldUserId||newUserId();
  localSet(USER_KEY,provisionalUserId);

  const style=document.createElement('style');style.textContent=`.lra-gate{position:fixed;inset:0;z-index:99999;background:#f4f2ed;display:grid;place-items:center;padding:24px}.lra-gate-card{width:min(520px,100%);border-top:1px solid #11110f;padding-top:28px}.lra-gate-kicker{font:600 10px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;letter-spacing:.22em;color:#777268;margin:0 0 18px}.lra-gate h2{font:400 clamp(34px,8vw,56px)/1.15 Georgia,"Yu Mincho",serif;letter-spacing:-.04em;margin:0 0 18px}.lra-gate p{font-size:13px;line-height:1.9;color:#5c574f}.lra-gate label{display:block;font-size:11px;color:#777268;margin:18px 0 6px}.lra-gate input{width:100%;min-height:54px;border:1px solid rgba(17,17,15,.25);background:#faf8f2;padding:14px;font-size:16px}.lra-gate-actions{display:flex;gap:10px;margin-top:22px}.lra-gate button{min-height:52px;border:1px solid #11110f;background:#11110f;color:#f4f2ed;padding:0 18px}.lra-gate button:disabled{opacity:.45}.lra-gate-error{min-height:20px;margin-top:12px;color:#7b2c2c;font-size:12px}`;document.head.appendChild(style);
  const gate=document.createElement('div');gate.className='lra-gate';
  const safeName=account?.displayName?String(account.displayName).replace(/[&<>"']/g,''):'';
  gate.innerHTML=account
    ?`<div class="lra-gate-card"><p class="lra-gate-kicker">LRA LOGIN</p><h2>${safeName?`おかえりなさい、${safeName}。`:'ログイン'}</h2><p>この端末に保存されている利用者IDと分析履歴を続けます。</p><label>PIN</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" placeholder="設定したPIN"><div class="lra-gate-actions"><button id="lraGateLogin">ログイン →</button></div><div id="lraGateError" class="lra-gate-error"></div></div>`
    :`<div class="lra-gate-card"><p class="lra-gate-kicker">LRA ACCOUNT</p><h2>この端末で使う<br>LRAアカウントを作成。</h2><p>初回登録時に利用者IDを固定し、以後この端末では同じIDと履歴を使用します。</p><label>表示名</label><input id="lraGateName" type="text" autocomplete="nickname" maxlength="40" placeholder="表示名"><label>PIN（4〜12桁）</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="new-password" maxlength="12" placeholder="4〜12桁"><div class="lra-gate-actions"><button id="lraGateCreate">登録して続ける →</button></div><div id="lraGateError" class="lra-gate-error"></div></div>`;
  document.body.appendChild(gate);
  function fail(t){const e=gate.querySelector('#lraGateError');if(e)e.textContent=t;}
  function busy(on){const b=gate.querySelector('button');if(b)b.disabled=on;}
  async function create(){
    const name=(gate.querySelector('#lraGateName')?.value||'').trim();const pin=gate.querySelector('#lraGatePin')?.value||'';
    if(!/^\d{4,12}$/.test(pin)){fail('PINは4〜12桁の数字で設定してください。');return;}
    busy(true);try{const salt=bytes(16);const profile={userId:provisionalUserId,displayName:name||'利用者',kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:b64(salt),pinHash:await pbkdf2(pin,salt),createdAt:new Date().toISOString(),lastLoginAt:new Date().toISOString()};if(!write(profile)){fail('このブラウザでは保存領域を利用できません。');return;}sessionSet(SESSION_KEY,'1');window.LRA_ACCOUNT={authenticated:true,profile};gate.remove();}finally{busy(false);}
  }
  async function login(){
    const pin=gate.querySelector('#lraGatePin')?.value||'';busy(true);try{const salt=fromB64(account.salt);let ok=false;if(account.kdf==='PBKDF2-SHA256')ok=(await pbkdf2(pin,salt,Number(account.iterations||ITERATIONS)))===account.pinHash;else ok=(await legacyDigest(pin,salt))===account.pinHash;if(!ok){fail('PINが一致しません。');return;}if(account.kdf!=='PBKDF2-SHA256'){account.kdf='PBKDF2-SHA256';account.iterations=ITERATIONS;account.pinHash=await pbkdf2(pin,salt);}
      account.lastLoginAt=new Date().toISOString();if(!write(account)){fail('このブラウザでは保存領域を利用できません。');return;}sessionSet(SESSION_KEY,'1');window.LRA_ACCOUNT={authenticated:true,profile:account};gate.remove();
    }finally{busy(false);}
  }
  gate.querySelector('#lraGateCreate')?.addEventListener('click',create);
  gate.querySelector('#lraGateLogin')?.addEventListener('click',login);
  gate.querySelector('#lraGatePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')(account?login():create());});
})();
