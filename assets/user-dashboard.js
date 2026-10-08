const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const PLAN_NAMES={FREE:'無料体験',LIGHT:'ライト',STANDARD:'スタンダード',DEEP:'ディープ',CONTINUOUS:'継続分析'};
let pendingStart=false;
let records=[];
let grouped=[];

const $=s=>document.querySelector(s);
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function show(view){document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('hidden',el.dataset.view!==view));window.scrollTo({top:0,behavior:'auto'});}
function dateText(v){if(!v)return'—';try{return new Date(v).toLocaleString('ja-JP',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return String(v)}}
function profile(){return window.LRA_ACCOUNT?.profile||null;}
function token(){return window.LRA_ACCOUNT_UI?.getToken?.()||'';}
function stateNow(){return window.LRA_RUNTIME?.getState?.()||null;}
async function api(body){const t=token();if(!t)throw new Error('ログインが必要です。');const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${t}`},body:JSON.stringify(body),cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok||j.ok!==true)throw new Error(j.error||'通信エラー');return j;}

const style=document.createElement('style');
style.textContent=`
.user-dashboard{max-width:920px;margin:auto}.user-head{border-top:1px solid #11110f;padding-top:28px}.user-head h2{font:400 clamp(38px,8vw,64px)/1.12 Georgia,"Yu Mincho",serif;letter-spacing:-.045em;margin:12px 0}.user-head p{font-size:13px;line-height:1.9;color:#5c574f}.user-actions{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0 40px}.user-summary{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #11110f;border-left:1px solid rgba(17,17,15,.18);margin-bottom:44px}.user-summary article{padding:24px;border-right:1px solid rgba(17,17,15,.18);border-bottom:1px solid rgba(17,17,15,.18);min-height:170px}.user-summary span,.user-history-head span,.user-report-head span,.user-use-head span{font-size:9px;letter-spacing:.16em;color:#777268}.user-summary h3{font:400 27px/1.35 Georgia,"Yu Mincho",serif;margin:18px 0 10px}.user-summary p{font-size:12px;line-height:1.8;color:#5c574f;margin:0}.user-progress{border-top:1px solid #11110f;padding:20px 0 28px;margin-bottom:30px}.user-progress h3{font:400 26px Georgia,"Yu Mincho",serif;margin:8px 0}.user-progress p{font-size:12px;line-height:1.8;color:#5c574f}.user-history{border-top:1px solid #11110f}.user-history-head{display:flex;justify-content:space-between;gap:18px;align-items:end;padding:22px 0}.user-history-head h3{font:400 28px Georgia,"Yu Mincho",serif;margin:5px 0}.user-history-list{border-top:1px solid rgba(17,17,15,.18)}.user-use{padding:20px 0 24px;border-bottom:1px solid rgba(17,17,15,.28)}.user-use-head{display:flex;justify-content:space-between;gap:16px;align-items:start;margin-bottom:12px}.user-use-head h4{font:600 17px/1.5 -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif;margin:5px 0}.user-use-head small{font-size:10px;line-height:1.6;color:#777268}.user-analysis-row{width:100%;display:grid;grid-template-columns:1fr auto;gap:16px;text-align:left;padding:14px 0;border:0;border-top:1px solid rgba(17,17,15,.14);background:transparent;color:#11110f;cursor:pointer}.user-analysis-row:disabled{cursor:default}.user-analysis-row b{display:block;font-size:12px;margin-bottom:5px}.user-analysis-row small{display:block;font-size:10px;line-height:1.6;color:#777268}.user-analysis-row strong{font-size:11px;white-space:nowrap;align-self:center}.user-empty{padding:24px 0;font-size:12px;line-height:1.9;color:#777268}.user-report{max-width:820px;margin:auto}.user-report-head{border-top:1px solid #11110f;padding-top:26px}.user-report-head h2{font:400 clamp(34px,7vw,54px)/1.2 Georgia,"Yu Mincho",serif;margin:12px 0}.user-report-meta{font-size:11px;line-height:1.8;color:#777268;margin-bottom:24px}.user-report-body{white-space:pre-wrap;font-size:14px;line-height:2;border-top:1px solid rgba(17,17,15,.18);padding-top:24px}.user-report-wait{padding:26px 0;border-top:1px solid rgba(17,17,15,.18);font-size:13px;line-height:1.9;color:#5c574f}.user-badge{display:inline-block;border:1px solid rgba(17,17,15,.2);padding:5px 8px;font-size:9px;letter-spacing:.08em;margin-top:8px}.user-error{font-size:12px;color:#7b2c2c;line-height:1.7;margin-top:12px}
@media(max-width:700px){.user-summary{grid-template-columns:1fr}.user-analysis-row{grid-template-columns:1fr}.user-analysis-row strong{justify-self:start}.user-actions .btn{flex:1 1 150px}}
`;
document.head.appendChild(style);

function isInProgress(){const p=profile(),s=stateNow();return !!(p?.userId&&s?.userId===p.userId&&['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION'].includes(s.stage));}
function buildGroups(rows){
  const map=new Map();
  for(const r of rows){if(!map.has(r.lra_id))map.set(r.lra_id,[]);map.get(r.lra_id).push(r);}
  const groups=[...map.entries()].map(([lraId,list])=>{list.sort((a,b)=>Number(a.analysis_count||1)-Number(b.analysis_count||1));const first=list[0],last=list[list.length-1];return{lraId,list,first,last,firstAt:first.submitted_at||first.updated_at||'',lastAt:last.submitted_at||last.updated_at||''};});
  groups.sort((a,b)=>new Date(a.firstAt)-new Date(b.firstAt));
  groups.forEach((g,i)=>g.useNumber=i+1);
  return groups.sort((a,b)=>new Date(b.lastAt)-new Date(a.lastAt));
}
function renderHistory(){
  const list=$('#userHistoryList');if(!list)return;
  if(!grouped.length){list.innerHTML='<div class="user-empty">正式に送信されたLRAの履歴はまだありません。</div>';return;}
  list.innerHTML=grouped.map(g=>{
    const plan=g.last.plan_name||PLAN_NAMES[g.last.plan_code]||g.last.plan_code||'LRA';
    const analysisRows=g.list.map(r=>{
      const canOpen=!!r.has_report,count=Number(r.analysis_count||1),label=count===1?'分析1回目':`再分析 ${count}回目`;
      return `<button class="user-analysis-row" data-report-id="${esc(r.lra_id)}" data-analysis-count="${count}" ${canOpen?'':'disabled'}><span><b>${esc(label)}</b><small>${esc(dateText(r.submitted_at||r.updated_at))}</small><span class="user-badge">${esc(r.status||'受付')}</span></span><strong>${canOpen?'結果を見る →':'結果準備中'}</strong></button>`;
    }).join('');
    return `<section class="user-use"><div class="user-use-head"><div><span>LRA ${g.useNumber}</span><h4>LRA利用 ${g.useNumber}回目｜${esc(plan)}</h4><small>${esc(g.lraId)}</small></div><small>${esc(dateText(g.firstAt))}</small></div>${analysisRows}</section>`;
  }).join('');
}
function renderProgress(){
  const box=$('#userProgressBox'),resume=$('#userResumeBtn'),newBtn=$('#userNewBtn');if(!box||!resume||!newBtn)return;
  const active=isInProgress(),s=stateNow();
  box.classList.toggle('hidden',!active);resume.classList.toggle('hidden',!active);newBtn.disabled=active;
  newBtn.textContent=active?'回答中のLRAがあります':'新しくLRAを受ける →';
  if(active){$('#userProgressTitle').textContent='回答途中のLRAがあります';$('#userProgressText').textContent=`${PLAN_NAMES[s.planCode]||s.planCode||'LRA'}｜${s.lraId}`;}
}

async function loadDashboard(){
  if(!window.LRA_ACCOUNT?.authenticated)return;
  show('dashboard');
  const p=profile();$('#userWelcome').textContent=`${p?.displayName||'利用者'}さん`;$('#userDashboardId').textContent=`利用者ID：${p?.userId||''}`;
  $('#userHistoryList').innerHTML='<div class="user-empty">履歴を確認しています。</div>';
  renderProgress();
  try{records=(await api({action:'records'})).records||[];grouped=buildGroups(records);renderHistory();
    const latestGroup=grouped[0],latest=latestGroup?.last;
    if(latest){$('#userLatestTitle').textContent=`LRA利用 ${latestGroup.useNumber}回目｜${latest.plan_name||PLAN_NAMES[latest.plan_code]||latest.plan_code||'LRA'}`;$('#userLatestText').textContent=`分析 ${Number(latest.analysis_count||1)}回目｜現在の状態：${latest.status||'受付'}`;$('#userLatestStatus').textContent=dateText(latest.submitted_at||latest.updated_at);}
    else{$('#userLatestTitle').textContent='まだ正式な履歴はありません';$('#userLatestText').textContent='LRAを送信すると、ここに利用履歴と結果が表示されます。';$('#userLatestStatus').textContent='';}
  }catch(e){$('#userHistoryList').innerHTML='<div class="user-empty user-error">履歴を読み込めませんでした。「最新状態を確認」から再試行してください。</div>';}
}

async function openReport(id,count){
  show('userReport');$('#userReportTitle').textContent='結果を読み込んでいます';$('#userReportBody').textContent='';$('#userReportMeta').textContent='';$('#userReportWait').classList.add('hidden');
  try{const rec=(await api({action:'get',lra_id:id,analysis_count:Number(count)})).record;$('#userReportTitle').textContent=`${rec.plan_name||PLAN_NAMES[rec.plan_code]||'LRA'}の結果`;$('#userReportMeta').textContent=`${rec.lra_id}｜分析 ${Number(rec.analysis_count||1)}回目｜${dateText(rec.client_report_saved_at||rec.updated_at)}`;if(rec.client_report_text){$('#userReportBody').textContent=rec.client_report_text;$('#userReportBody').classList.remove('hidden');}else{$('#userReportBody').classList.add('hidden');$('#userReportWait').textContent='結果はまだ準備中です。';$('#userReportWait').classList.remove('hidden');}}
  catch{$('#userReportTitle').textContent='結果を読み込めませんでした';$('#userReportBody').classList.add('hidden');$('#userReportWait').textContent='通信状態を確認して、もう一度お試しください。';$('#userReportWait').classList.remove('hidden');}
}

$('#userHistoryList')?.addEventListener('click',e=>{const b=e.target.closest('[data-report-id]');if(b&&!b.disabled)openReport(b.dataset.reportId,b.dataset.analysisCount);});
$('#userReportBackBtn')?.addEventListener('click',loadDashboard);
$('#userNewBtn')?.addEventListener('click',()=>{if(!isInProgress())$('#homeStartBtn')?.click();});
$('#userPlansBtn')?.addEventListener('click',()=>{show('home');setTimeout(()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth',block:'start'}),0);});
$('#userResumeBtn')?.addEventListener('click',()=>window.LRA_RUNTIME?.resume?.());
$('#userRefreshBtn')?.addEventListener('click',loadDashboard);
$('#userLogoutBtn')?.addEventListener('click',()=>window.LRA_ACCOUNT_UI?.logout?.());
$('#userLoginEntry')?.addEventListener('click',()=>window.LRA_ACCOUNT_UI?.openLogin?.());

window.addEventListener('lra:account-authenticated',()=>{if(!pendingStart)loadDashboard();});

document.addEventListener('click',async e=>{
  const target=e.target.closest('#homeStartBtn,[data-home-plan],[data-plan]');
  if(!target||window.LRA_ACCOUNT?.authenticated)return;
  const code=target.id==='homeStartBtn'?'FREE':(target.dataset.homePlan||target.dataset.plan||'');if(code!=='FREE')return;
  e.preventDefault();e.stopImmediatePropagation();pendingStart=true;
  try{const p=await window.LRA_ACCOUNT_UI?.ensureAccount?.();if(p)target.click();}finally{pendingStart=false;}
},true);

if(window.LRA_ACCOUNT?.authenticated)loadDashboard();