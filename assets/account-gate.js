(()=>{
  const ACCOUNT_KEY='lra.account.1.0';
  const USER_KEY='lra.user.1.0';
  const SESSION_KEY='lra.session.auth.1.0';
  const enc=new TextEncoder();
  const b64=a=>btoa(String.fromCharCode(...a));
  const bytes=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return a;};
  const hex=a=>[...a].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
  const dateStamp=()=>{const d=new Date();return`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;};
  const newUserId=()=>`USR-${dateStamp()}-${hex(bytes(4))}`;
  async function digest(pin,salt){const merged=new Uint8Array(salt.length+enc.encode(pin).length);merged.set(salt);merged.set(enc.encode(pin),salt.length);return b64(new Uint8Array(await crypto.subtle.digest('SHA-256',merged)));}
  function read(){try{return JSON.parse(localStorage.getItem(ACCOUNT_KEY)||'null');}catch{return null;}}
  function write(x){localStorage.setItem(ACCOUNT_KEY,JSON.stringify(x));localStorage.setItem(USER_KEY,x.userId);}
  function session(on){if(on)sessionStorage.setItem(SESSION_KEY,'1');else sessionStorage.removeItem(SESSION_KEY);}
  if(sessionStorage.getItem(SESSION_KEY)==='1'&&read()){const a=read();localStorage.setItem(USER_KEY,a.userId);window.LRA_ACCOUNT={authenticated:true,profile:a};return;}
  const oldUserId=localStorage.getItem(USER_KEY);
  const account=read();
  const style=document.createElement('style');style.textContent=`.lra-gate{position:fixed;inset:0;z-index:99999;background:#f4f2ed;display:grid;place-items:center;padding:24px}.lra-gate-card{width:min(520px,100%);border-top:1px solid #11110f;padding-top:28px}.lra-gate-kicker{font:600 10px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;letter-spacing:.22em;color:#777268;margin:0 0 18px}.lra-gate h2{font:400 clamp(34px,8vw,56px)/1.15 Georgia,"Yu Mincho",serif;letter-spacing:-.04em;margin:0 0 18px}.lra-gate p{font-size:13px;line-height:1.9;color:#5c574f}.lra-gate label{display:block;font-size:11px;color:#777268;margin:18px 0 6px}.lra-gate input{width:100%;min-height:54px;border:1px solid rgba(17,17,15,.25);background:#faf8f2;padding:14px;font-size:16px}.lra-gate-actions{display:flex;gap:10px;margin-top:22px}.lra-gate button{min-height:52px;border:1px solid #11110f;background:#11110f;color:#f4f2ed;padding:0 18px}.lra-gate-error{min-height:20px;margin-top:12px;color:#7b2c2c;font-size:12px}`;document.head.appendChild(style);
  const gate=document.createElement('div');gate.className='lra-gate';
  if(account){
    gate.innerHTML=`<div class="lra-gate-card"><p class="lra-gate-kicker">LRA LOGIN</p><h2>${account.displayName?`おかえりなさい、${String(account.displayName).replace(/[&<>"']/g,'')}。`:'ログイン'}</h2><p>この端末に保存されているLRA-IDと分析履歴を続けます。</p><label>PIN</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" placeholder="設定したPIN"><div class="lra-gate-actions"><button id="lraGateLogin">ログイン →</button></div><div id="lraGateError" class="lra-gate-error"></div></div>`;
  }else{
    gate.innerHTML=`<div class="lra-gate-card"><p class="lra-gate-kicker">LRA ACCOUNT</p><h2>この端末で使う<br>LRAアカウントを作成。</h2><p>初回登録時に利用者IDを固定し、以後この端末では同じIDと履歴を使用します。</p><label>表示名</label><input id="lraGateName" type="text" autocomplete="nickname" maxlength="40" placeholder="表示名"><label>PIN（4〜12桁）</label><input id="lraGatePin" type="password" inputmode="numeric" autocomplete="new-password" maxlength="12" placeholder="4〜12桁"><div class="lra-gate-actions"><button id="lraGateCreate">登録して続ける →</button></div><div id="lraGateError" class="lra-gate-error"></div></div>`;
  }
  document.documentElement.appendChild(gate);
  function fail(t){const e=gate.querySelector('#lraGateError');if(e)e.textContent=t;}
  async function create(){const name=(gate.querySelector('#lraGateName')?.value||'').trim();const pin=gate.querySelector('#lraGatePin')?.value||'';if(!/^\d{4,12}$/.test(pin)){fail('PINは4〜12桁の数字で設定してください。');return;}const salt=bytes(16);const userId=oldUserId||newUserId();const profile={userId,displayName:name||'利用者',salt:b64(salt),pinHash:await digest(pin,salt),createdAt:new Date().toISOString(),lastLoginAt:new Date().toISOString()};write(profile);session(true);window.LRA_ACCOUNT={authenticated:true,profile};gate.remove();}
  async function login(){const pin=gate.querySelector('#lraGatePin')?.value||'';const salt=Uint8Array.from(atob(account.salt),c=>c.charCodeAt(0));const h=await digest(pin,salt);if(h!==account.pinHash){fail('PINが一致しません。');return;}account.lastLoginAt=new Date().toISOString();write(account);session(true);window.LRA_ACCOUNT={authenticated:true,profile:account};gate.remove();}
  gate.querySelector('#lraGateCreate')?.addEventListener('click',create);
  gate.querySelector('#lraGateLogin')?.addEventListener('click',login);
  gate.querySelector('#lraGatePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')(account?login():create());});
})();
