const PAYMENT_API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-payment-api';
const STATE_KEY='lra.state.2.0';
const USER_KEY='lra.user.1.0';
const PENDING_KEY='lra.payment.pending.1.0';
const START_KEY='lra.payment.start.1.0';
const TEST_CODE_KEY='lra.payment.testCode.1.0';
const PAID=new Set(['LIGHT','STANDARD','DEEP','CONTINUOUS']);
const pageUrl=new URL(location.href);
const testStart=pageUrl.searchParams.get('payment_test')==='1';
const paymentReturn=pageUrl.searchParams.get('payment')==='complete';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function getToken(){return window.LRA_ACCOUNT_UI?.getToken?.()||'';}
function getUserId(){return window.LRA_ACCOUNT?.profile?.userId||localStorage.getItem(USER_KEY)||'';}
function writePending(v){try{v?localStorage.setItem(PENDING_KEY,JSON.stringify(v)):localStorage.removeItem(PENDING_KEY)}catch{}}
function readTestCode(){try{return sessionStorage.getItem(TEST_CODE_KEY)||''}catch{return''}}
function writeTestCode(v){try{v?sessionStorage.setItem(TEST_CODE_KEY,v):sessionStorage.removeItem(TEST_CODE_KEY)}catch{}}
function writeStart(v){try{v?sessionStorage.setItem(START_KEY,v):sessionStorage.removeItem(START_KEY)}catch{}}
function readStart(){try{return sessionStorage.getItem(START_KEY)||''}catch{return''}}

async function ensureAccount(){
  const ui=window.LRA_ACCOUNT_UI;
  if(!ui?.ensureAccount)throw new Error('ACCOUNT_UI_UNAVAILABLE');
  const profile=await ui.ensureAccount();
  if(!profile)throw new Error('ACCOUNT_REQUIRED');
  if(!getToken())throw new Error('ACCOUNT_REQUIRED');
  return profile;
}

async function api(body){
  const token=getToken();
  if(!token)throw new Error('ACCOUNT_REQUIRED');
  const r=await fetch(PAYMENT_API,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${token}`},cache:'no-store',body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||j.ok!==true){const e=new Error(j.error||'PAYMENT_API_ERROR');e.status=r.status;throw e}
  return j;
}

function mountStatus(text,bad=false){
  let box=document.getElementById('lraPaymentStatus');
  if(!box){
    const style=document.createElement('style');
    style.textContent='.lra-payment-status{position:fixed;inset:0;z-index:100001;background:rgba(244,242,237,.97);display:grid;place-items:center;padding:24px}.lra-payment-status>div{width:min(520px,100%);border-top:1px solid #171613;padding-top:28px}.lra-payment-status small{display:block;font:600 10px/1.4 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;letter-spacing:.18em;color:#777268;margin-bottom:14px}.lra-payment-status p{font-size:14px;line-height:1.9;color:#4f4a43;margin:0}.lra-payment-status.bad p{color:#7b2c2c}.lra-payment-test-banner{position:fixed;left:0;right:0;bottom:0;z-index:99998;background:#171613;color:#f4f2ed;text-align:center;padding:7px 12px;font:700 10px/1.2 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;letter-spacing:.12em}';
    document.head.appendChild(style);
    box=document.createElement('div');box.id='lraPaymentStatus';box.className='lra-payment-status';box.innerHTML='<div><small>PAYMENT CHECK</small><p></p></div>';document.body.appendChild(box);
  }
  box.classList.toggle('bad',bad);box.querySelector('p').textContent=text;
}

function removeStatus(){document.getElementById('lraPaymentStatus')?.remove();}
function relabelTestButtons(){
  if(!testStart)return;
  document.querySelectorAll('[data-plan],[data-home-plan]').forEach(b=>{const code=b.dataset.plan||b.dataset.homePlan;if(PAID.has(code)&&b.textContent!=='テスト決済で開始 →')b.textContent='テスト決済で開始 →';});
  if(!document.getElementById('lraPaymentTestBanner')){const x=document.createElement('div');x.id='lraPaymentTestBanner';x.className='lra-payment-test-banner';x.textContent='STRIPE TEST MODE｜実際の請求は発生しません';document.body.appendChild(x)}
}

async function startPaid(code){
  await ensureAccount();
  let testCode=readTestCode();
  if(!testCode){testCode=(prompt('LRAテスト決済コードを入力してください。')||'').trim();if(!testCode)return;writeTestCode(testCode)}
  mountStatus('Stripeテスト決済を準備しています。');
  try{
    const j=await api({action:'start',product_code:code,test_code:testCode});
    writePending({lraId:j.lra_id,productCode:j.product_code,expiresAt:j.expires_at});
    location.assign(j.checkout_url);
  }catch(e){
    if(e?.message==='TEST_ACCESS_DENIED'){writeTestCode('');mountStatus('テスト決済コードが一致しません。',true);setTimeout(removeStatus,1800);return}
    console.error(e);mountStatus('決済画面を開始できませんでした。ログイン状態と通信状態を確認してください。',true);setTimeout(removeStatus,2200);
  }
}

function paidState(lraId,productCode){
  const userId=getUserId();if(!userId)throw new Error('ACCOUNT_REQUIRED');
  return{userId,lraId,analysisCount:1,planCode:productCode,outputId:null,stage:'INTRO',index:0,answers:{},answerExtras:{},adaptiveQuestionIds:[],eventTraceUsed:null,savedAt:new Date().toISOString(),status:'受付',analysisPacket:null,baseAnalysisPacket:null,analysis:null};
}

function resumePaidStart(){
  const marker=readStart();if(!marker)return;
  try{
    const state=JSON.parse(localStorage.getItem(STATE_KEY)||'null');
    if(state?.lraId===marker&&state?.stage==='INTRO'&&PAID.has(state?.planCode)){
      writeStart('');
      setTimeout(()=>window.LRA_RUNTIME?.resume?.(),0);
      return;
    }
  }catch{}
  writeStart('');
}

async function resolveReturn(){
  if(!paymentReturn)return;
  const sessionId=pageUrl.searchParams.get('session_id')||'';
  if(!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)){mountStatus('決済確認情報が正しくありません。',true);return}
  mountStatus('Stripeでの決済結果を確認しています。');
  try{await ensureAccount()}catch{mountStatus('決済を確認するため、LRAアカウントへログインしてください。',true);return}
  let result=null;
  for(let i=0;i<16;i++){
    try{result=await api({action:'resolve',session_id:sessionId});if(result?.paid)break;if(result?.checkout_status==='expired')break}catch(e){if(e?.message!=='NOT_FOUND'){console.error(e);break}}
    await sleep(750);
  }
  if(result?.paid&&PAID.has(result.product_code)){
    try{localStorage.setItem(STATE_KEY,JSON.stringify(paidState(result.lra_id,result.product_code)));writeStart(result.lra_id)}catch{mountStatus('端末に開始情報を保存できませんでした。',true);return}
    writePending(null);
    const clean=`${location.origin}${location.pathname}`;
    location.replace(clean);
    return;
  }
  if(result?.checkout_status==='expired'){writePending(null);mountStatus('この決済は完了していません。プラン画面からもう一度お試しください。',true);return}
  mountStatus('決済は完了していますが、LRAへの反映をまだ確認できません。画面を再読み込みすると再確認できます。',true);
}

resumePaidStart();
if(testStart||paymentReturn){
  relabelTestButtons();
  const observer=new MutationObserver(relabelTestButtons);observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(!testStart)return;const b=e.target.closest?.('[data-plan],[data-home-plan]');if(!b)return;const code=b.dataset.plan||b.dataset.homePlan;if(!PAID.has(code))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();startPaid(code)},true);
  resolveReturn();
}
