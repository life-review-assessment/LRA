import { getLraClientKey } from './submission-transport.js?v=20261009-server1';

const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const IN_PROGRESS=new Set(['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION']);
let eligibilityKey='';
let eligibility=false;
let eligibilityPending=false;

function token(){return window.LRA_ACCOUNT_UI?.getToken?.()||'';}
function stateNow(){return window.LRA_RUNTIME?.getState?.()||null;}
async function api(body){
  const t=token();if(!t)throw new Error('LOGIN_REQUIRED');
  const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${t}`},body:JSON.stringify(body),cache:'no-store'});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||j.ok!==true){const e=new Error(j.error||'REQUEST_FAILED');e.status=r.status;throw e;}
  return j;
}
function reportContext(){
  const meta=document.getElementById('userReportMeta')?.textContent||'';
  const m=meta.match(/(LRA-\d{8}-[A-F0-9]{8,32}).*?分析\s*(\d+)回目/);
  return m?{lra_id:m[1],analysis_count:Number(m[2])}:null;
}
function reportReady(){
  const body=document.getElementById('userReportBody');
  return !!(body&&!body.classList.contains('hidden')&&body.textContent.trim());
}
function contextKey(ctx){return ctx?`${ctx.lra_id}:${ctx.analysis_count}`:'';}
function applyEligibility(box,ctx){
  const key=contextKey(ctx);
  const show=!!(ctx&&reportReady()&&eligibilityKey===key&&!eligibilityPending&&eligibility);
  box.classList.toggle('hidden',!show);
}
async function refreshEligibility(box,ctx){
  const key=contextKey(ctx);
  eligibilityKey=key;eligibility=false;eligibilityPending=true;applyEligibility(box,ctx);
  try{
    const rows=(await api({action:'records'})).records||[];
    if(eligibilityKey!==key)return;
    const same=rows.filter(r=>r.lra_id===ctx.lra_id);
    const latestCount=same.reduce((max,r)=>Math.max(max,Number(r.analysis_count||1)),0);
    const current=same.find(r=>Number(r.analysis_count||1)===ctx.analysis_count);
    eligibility=!!(current?.has_report&&latestCount===ctx.analysis_count);
  }catch{if(eligibilityKey===key)eligibility=false;}
  finally{if(eligibilityKey===key){eligibilityPending=false;applyEligibility(box,ctx);}}
}
function ensureReportAction(){
  const view=document.querySelector('[data-view="userReport"]');
  if(!view)return;
  let box=document.getElementById('userReportContinuationActions');
  if(!box){
    box=document.createElement('div');box.id='userReportContinuationActions';box.className='actions hidden';
    const button=document.createElement('button');button.type='button';button.className='btn dark';button.id='userReportShortTermBtn';button.textContent='短期チェックを開始 →';
    button.addEventListener('click',async()=>{
      const s=stateNow();
      if(s&&IN_PROGRESS.has(s.stage)){alert('回答途中のLRAがあります。先にその回答を完了してください。');return;}
      const ctx=reportContext();if(!ctx)return;
      const clientKey=getLraClientKey(ctx.lra_id);if(!clientKey){alert('短期チェックを開始できませんでした。最新状態を確認して、もう一度お試しください。');return;}
      button.disabled=true;button.textContent='確認しています…';
      try{
        const data=await api({action:'continuation',...ctx,client_key:clientKey});
        const started=window.LRA_RUNTIME?.startShortTermObservationFromResult?.(data.continuation);
        if(started!==true)throw new Error('START_FAILED');
      }catch(e){
        if(e?.message==='NOT_LATEST_RESULT')alert('短期チェックは、このLRAの最新結果から開始してください。');
        else if(e?.message==='RESULT_NOT_READY')alert('結果が確定してから短期チェックを開始できます。');
        else if(e?.message==='LOGIN_REQUIRED'||e?.status===401)alert('ログイン状態を確認して、もう一度お試しください。');
        else alert('短期チェックを開始できませんでした。最新状態を確認して、もう一度お試しください。');
        button.disabled=false;button.textContent='短期チェックを開始 →';
      }
    });
    box.appendChild(button);view.appendChild(box);
  }
  const ctx=reportContext();
  if(!ctx||!reportReady()){box.classList.add('hidden');return;}
  const key=contextKey(ctx);
  if(eligibilityKey!==key)refreshEligibility(box,ctx);else applyEligibility(box,ctx);
}

const btn=document.getElementById('shortTermBtn');
if(btn)btn.addEventListener('click',()=>window.LRA_RUNTIME?.startShortTermObservation?.());

const reportView=document.querySelector('[data-view="userReport"]');
if(reportView){
  const observer=new MutationObserver(()=>ensureReportAction());
  observer.observe(reportView,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  ensureReportAction();
}
