const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const HISTORY_KEY='lra.history.1.3';
const CLIENT_PREFIX='lra.clientKey.';
const PLAN_NAMES={FREE:'無料体験',LIGHT:'ライト',STANDARD:'スタンダード',DEEP:'ディープ',CONTINUOUS:'継続分析'};
let pendingStart=false;
let mergedRecords=[];

const $=s=>document.querySelector(s);
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));}
function show(view){document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('hidden',el.dataset.view!==view));window.scrollTo({top:0,behavior:'auto'});}
function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');}catch{return[];}}
function clientKey(id){try{return localStorage.getItem(`${CLIENT_PREFIX}${id}`)||'';}catch{return'';}}
function dateText(v){if(!v)return'—';try{return new Date(v).toLocaleString('ja-JP',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return String(v)}}
function stateNow(){return window.LRA_RUNTIME?.getState?.()||null;}
function profile(){return window.LRA_ACCOUNT?.profile||null;}
async function api(body){const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok||j.ok!==true)throw new Error(j.error||'通信エラー');return j;}

const style=document.createElement('style');
style.textContent=`
.user-dashboard{max-width:920px;margin:auto}.user-head{border-top:1px solid #11110f;padding-top:28px}.user-head h2{font:400 clamp(38px,8vw,64px)/1.12 Georgia,"Yu Mincho",serif;letter-spacing:-.045em;margin:12px 0}.user-head p{font-size:13px;line-height:1.9;color:#5c574f}.user-actions{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0 40px}.user-summary{display:grid;grid-template-columns:1.15fr .85fr;border-top:1px solid #11110f;border-left:1px solid rgba(17,17,15,.18);margin-bottom:44px}.user-summary article{padding:24px;border-right:1px solid rgba(17,17,15,.18);border-bottom:1px solid rgba(17,17,15,.18);min-height:180px}.user-summary span,.user-history-head span,.user-report-head span{font-size:9px;letter-spacing:.16em;color:#777268}.user-summary h3{font:400 27px/1.35 Georgia,"Yu Mincho",serif;margin:18px 0 10px}.user-summary p{font-size:12px;line-height:1.8;color:#5c574f;margin:0}.user-history{border-top:1px solid #11110f}.user-history-head{display:flex;justify-content:space-between;gap:18px;align-items:end;padding:22px 0}.user-history-head h3{font:400 28px Georgia,"Yu Mincho",serif;margin:5px 0}.user-history-list{border-top:1px solid rgba(17,17,15,.18)}.user-history-item{width:100%;display:grid;grid-template-columns:1fr auto;gap:18px;text-align:left;padding:18px 0;border:0;border-bottom:1px solid rgba(17,17,15,.18);background:transparent;color:#11110f;cursor:pointer}.user-history-item:disabled{cursor:default}.user-history-item b{display:block;font-size:13px;margin-bottom:7px}.user-history-item small{display:block;font-size:10px;line-height:1.7;color:#777268}.user-history-item strong{font-size:11px;white-space:nowrap;align-self:center}.user-empty{padding:24px 0;font-size:12px;line-height:1.9;color:#777268}.user-report{max-width:820px;margin:auto}.user-report-head{border-top:1px solid #11110f;padding-top:26px}.user-report-head h2{font:400 clamp(34px,7vw,54px)/1.2 Georgia,"Yu Mincho",serif;margin:12px 0}.user-report-meta{font-size:11px;line-height:1.8;color:#777268;margin-bottom:24px}.user-report-body{white-space:pre-wrap;font-size:14px;line-height:2;border-top:1px solid rgba(17,17,15,.18);padding-top:24px}.user-report-wait{padding:26px 0;border-top:1px solid rgba(17,17,15,.18);font-size:13px;line-height:1.9;color:#5c574f}.user-badge{display:inline-block;border:1px solid rgba(17,17,15,.2);padding:5px 8px;font-size:9px;letter-spacing:.08em;margin-top:8px}.user-error{font-size:12px;color:#7b2c2c;line-height:1.7;margin-top:12px}
@media(max-width:700px){.user-summary{grid-template-columns:1fr}.user-history-item{grid-template-columns:1fr}.user-history-item strong{justify-self:start}.user-actions .btn{flex:1 1 150px}}
`;
document.head.appendChild(style);

function localRows(){
  const p=profile();
  if(!p?.userId)return[];
  const rows=getHistory().filter(r=>r?.userId===p.userId).map(r=>({
    lra_id:r.lraId,output_id:r.outputId,plan_code:r.planCode,plan_name:PLAN_NAMES[r.planCode]||r.planCode||'',analysis_count:Number(r.analysisCount||1),status:r.status||'受付',updated_at:r.savedAt||null,submission_saved_at:r.savedAt||null,has_report:false,local:true
  }));
  const s=stateNow();
  if(s?.userId===p.userId&&s?.lraId&&!rows.some(r=>r.lra_id===s.lraId))rows.push({lra_id:s.lraId,output_id:s.outputId,plan_code:s.planCode,plan_name:PLAN_NAMES[s.planCode]||s.planCode||'',analysis_count:Number(s.analysisCount||1),status:s.status||'受付',updated_at:s.savedAt||null,submission_saved_at:s.savedAt||null,has_report:false,local:true});
  return rows;
}

async function serverRows(local){
  const records=local.map(r=>({lra_id:r.lra_id,client_key:clientKey(r.lra_id)})).filter(x=>x.client_key);
  if(!records.length)return[];
  try{return (await api({action:'records',records})).records||[];}catch{return[];}
}

function merge(local,remote){
  const map=new Map(local.map(r=>[r.lra_id,{...r}]));
  for(const r of remote){map.set(r.lra_id,{...(map.get(r.lra_id)||{}),...r,local:false});}
  return [...map.values()].sort((a,b)=>new Date(b.updated_at||b.submission_saved_at||0)-new Date(a.updated_at||a.submission_saved_at||0));
}

function renderRows(rows){
  const list=$('#userHistoryList');
  if(!list)return;
  if(!rows.length){list.innerHTML='<div class="user-empty">まだLRAの利用履歴はありません。</div>';return;}
  list.innerHTML=rows.map(r=>{
    const canOpen=!!r.has_report;
    const title=`第${Number(r.analysis_count||1)}回｜${r.plan_name||PLAN_NAMES[r.plan_code]||r.plan_code||'LRA'}`;
    const meta=`${dateText(r.submission_saved_at||r.updated_at)}<br>${esc(r.lra_id)}`;
    return `<button class="user-history-item" data-report-id="${esc(r.lra_id)}" ${canOpen?'':'disabled'}><span><b>${esc(title)}</b><small>${meta}</small><span class="user-badge">${esc(r.status||'受付')}</span></span><strong>${canOpen?'結果を見る →':'結果準備中'}</strong></button>`;
  }).join('');
}

async function loadDashboard(){
  if(!window.LRA_ACCOUNT?.authenticated)return;
  const p=profile();
  show('dashboard');
  $('#userWelcome').textContent=`${p?.displayName||'利用者'}さん`;
  $('#userDashboardId').textContent=p?.userId||'';
  const local=localRows();
  const remote=await serverRows(local);
  mergedRecords=merge(local,remote);
  renderRows(mergedRecords);
  const latest=mergedRecords[0];
  const latestTitle=$('#userLatestTitle'),latestText=$('#userLatestText'),latestStatus=$('#userLatestStatus');
  if(latest){
    latestTitle.textContent=`${latest.plan_name||PLAN_NAMES[latest.plan_code]||latest.plan_code||'LRA'}｜第${Number(latest.analysis_count||1)}回`;
    latestText.textContent=latest.has_report?'最新の結果を確認できます。':`現在の状態：${latest.status||'受付'}`;
    latestStatus.textContent=dateText(latest.submission_saved_at||latest.updated_at);
  }else{
    latestTitle.textContent='まだ結果はありません';latestText.textContent='最初のLRAを始めると、ここに結果と履歴が表示されます。';latestStatus.textContent='';
  }
  const s=stateNow();
  const resume=$('#userResumeBtn');
  const inProgress=s&&s.userId===p?.userId&&!['INTRO','COMPLETE'].includes(s.stage);
  resume.classList.toggle('hidden',!inProgress);
}

async function openReport(id){
  const row=mergedRecords.find(r=>r.lra_id===id);if(!row?.has_report)return;
  const key=clientKey(id);if(!key)return;
  show('userReport');
  $('#userReportTitle').textContent='結果を読み込んでいます';$('#userReportBody').textContent='';$('#userReportMeta').textContent='';
  try{
    const rec=(await api({action:'get',lra_id:id,client_key:key})).record;
    $('#userReportTitle').textContent=`${rec.plan_name||PLAN_NAMES[rec.plan_code]||'LRA'}の結果`;
    $('#userReportMeta').textContent=`${rec.lra_id}｜分析 ${Number(rec.analysis_count||1)}回目｜${dateText(rec.client_report_saved_at||rec.updated_at)}`;
    if(rec.client_report_text){$('#userReportBody').textContent=rec.client_report_text;$('#userReportWait').classList.add('hidden');$('#userReportBody').classList.remove('hidden');}
    else{$('#userReportBody').classList.add('hidden');$('#userReportWait').classList.remove('hidden');}
  }catch(e){$('#userReportTitle').textContent='結果を読み込めませんでした';$('#userReportBody').textContent='';$('#userReportWait').textContent='通信状態を確認して、もう一度お試しください。';$('#userReportWait').classList.remove('hidden');}
}

$('#userHistoryList')?.addEventListener('click',e=>{const b=e.target.closest('[data-report-id]');if(b&&!b.disabled)openReport(b.dataset.reportId);});
$('#userReportBackBtn')?.addEventListener('click',loadDashboard);
$('#userNewBtn')?.addEventListener('click',()=>$('#homeStartBtn')?.click());
$('#userPlansBtn')?.addEventListener('click',()=>{show('home');setTimeout(()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth',block:'start'}),0);});
$('#userResumeBtn')?.addEventListener('click',()=>window.LRA_RUNTIME?.resume?.());
$('#userRefreshBtn')?.addEventListener('click',loadDashboard);
$('#userLogoutBtn')?.addEventListener('click',()=>location.reload());

window.addEventListener('lra:account-authenticated',()=>{if(!pendingStart)loadDashboard();});

document.addEventListener('click',async e=>{
  const target=e.target.closest('#homeStartBtn,[data-home-plan],[data-plan]');
  if(!target||window.LRA_ACCOUNT?.authenticated)return;
  const code=target.id==='homeStartBtn'?'FREE':(target.dataset.homePlan||target.dataset.plan||'');
  if(code!=='FREE')return;
  e.preventDefault();e.stopImmediatePropagation();
  pendingStart=true;
  try{await window.LRA_ACCOUNT_UI?.ensureAccount?.();}
  finally{pendingStart=false;}
  target.click();
},true);

if(window.LRA_ACCOUNT?.authenticated)loadDashboard();
