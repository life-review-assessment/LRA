const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
const PLAN_NAMES={FREE:'無料体験',LIGHT:'ライト',STANDARD:'スタンダード',DEEP:'ディープ',CONTINUOUS:'継続分析'};
const SEEN_PREFIX='lra.reportSeen.';
let pendingStart=false;
let records=[];
let grouped=[];
let latestReport=null;

const $=s=>document.querySelector(s);
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));}
function show(view){document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('hidden',el.dataset.view!==view));window.scrollTo({top:0,behavior:'auto'});}
function dateText(v){if(!v)return'—';try{return new Date(v).toLocaleString('ja-JP',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return String(v)}}
function profile(){return window.LRA_ACCOUNT?.profile||null;}
function token(){return window.LRA_ACCOUNT_UI?.getToken?.()||'';}
function stateNow(){return window.LRA_RUNTIME?.getState?.()||null;}
function seenKey(r){return `${SEEN_PREFIX}${r.lra_id}.${Number(r.analysis_count||1)}`;}
function seenAt(r){try{return localStorage.getItem(seenKey(r))||'';}catch{return'';}}
function markSeen(r){try{localStorage.setItem(seenKey(r),r.client_report_saved_at||new Date().toISOString());}catch{}}
function isNewReport(r){if(!r?.has_report||!r.client_report_saved_at)return false;const seen=seenAt(r);return !seen||new Date(seen)<new Date(r.client_report_saved_at);}
function statusGuide(status,hasReport){if(hasReport)return'結果を確認できます。';return({受付:'受付が完了しています。',回答中:'回答途中です。',分析待ち:'分析を進めています。',再分析待ち:'再分析を進めています。',分析中:'分析を進めています。',レビュー待ち:'結果を確認しています。',完了:'結果を準備しています。',納品済み:'結果を確認できます。'})[status]||'現在の状態を確認しています。';}
function statusLabel(status,hasReport){if(hasReport)return'結果を確認できます';return({受付:'受付済み',回答中:'回答中',分析待ち:'分析中',再分析待ち:'再分析中',分析中:'分析中',レビュー待ち:'結果確認中',完了:'結果準備中',納品済み:'結果を確認できます'})[status]||'確認中';}
async function api(body){const t=token();if(!t)throw new Error('ログインが必要です。');const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${t}`},body:JSON.stringify(body),cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok||j.ok!==true){const e=new Error(j.error||'通信エラー');e.status=r.status;throw e;}return j;}

const style=document.createElement('style');
style.textContent=`
.user-dashboard{max-width:920px;margin:auto}.user-head{border-top:1px solid #11110f;padding-top:28px}.user-head h2{font:400 clamp(38px,8vw,64px)/1.12 Georgia,"Yu Mincho",serif;letter-spacing:-.045em;margin:12px 0}.user-head p{font-size:13px;line-height:1.9;color:#5c574f}.user-actions{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0 40px}.user-summary{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #11110f;border-left:1px solid rgba(17,17,15,.18);margin-bottom:44px}.user-summary article{padding:24px;border-right:1px solid rgba(17,17,15,.18);border-bottom:1px solid rgba(17,17,15,.18);min-height:170px}.user-summary span,.user-history-head span,.user-report-head span,.user-use-head span{font-size:9px;letter-spacing:.16em;color:#777268}.user-summary h3{font:400 27px/1.35 Georgia,"Yu Mincho",serif;margin:18px 0 10px}.user-summary p{font-size:12px;line-height:1.8;color:#5c574f;margin:0}.user-latest-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:16px}.user-latest-actions .btn{min-height:42px;padding:0 14px}.user-new-result{display:inline-block;border:1px solid #11110f;background:#11110f;color:#f4f2ed;padding:5px 8px;font-size:9px;letter-spacing:.12em}.user-progress{border-top:1px solid #11110f;padding:20px 0 28px;margin-bottom:30px}.user-progress h3{font:400 26px Georgia,"Yu Mincho",serif;margin:8px 0}.user-progress p{font-size:12px;line-height:1.8;color:#5c574f}.user-history{border-top:1px solid #11110f}.user-history-head{display:flex;justify-content:space-between;gap:18px;align-items:end;padding:22px 0}.user-history-head h3{font:400 28px Georgia,"Yu Mincho",serif;margin:5px 0}.user-history-list{border-top:1px solid rgba(17,17,15,.18)}.user-use{padding:20px 0 24px;border-bottom:1px solid rgba(17,17,15,.28)}.user-use-head{display:flex;justify-content:space-between;gap:16px;align-items:start;margin-bottom:12px}.user-use-head h4{font:600 17px/1.5 -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif;margin:5px 0}.user-use-head small{font-size:10px;line-height:1.6;color:#777268}.user-analysis-row{width:100%;display:grid;grid-template-columns:1fr auto;gap:16px;text-align:left;padding:14px 0;border:0;border-top:1px solid rgba(17,17,15,.14);background:transparent;color:#11110f;cursor:pointer}.user-analysis-row:disabled{cursor:default}.user-analysis-row b{display:block;font-size:12px;margin-bottom:5px}.user-analysis-row small{display:block;font-size:10px;line-height:1.6;color:#777268}.user-analysis-row strong{font-size:11px;white-space:nowrap;align-self:center}.user-row-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.user-empty{padding:24px 0;font-size:12px;line-height:1.9;color:#777268}.user-report{max-width:820px;margin:auto}.user-report-head{border-top:1px solid #11110f;padding-top:26px}.user-report-head h2{font:400 clamp(34px,7vw,54px)/1.2 Georgia,"Yu Mincho",serif;margin:12px 0}.user-report-meta{font-size:11px;line-height:1.8;color:#777268;margin-bottom:24px}.user-report-body{white-space:pre-wrap;font-size:14px;line-height:2;border-top:1px solid rgba(17,17,15,.18);padding-top:24px}.user-report-wait{padding:26px 0;border-top:1px solid rgba(17,17,15,.18);font-size:13px;line-height:1.9;color:#5c574f}.user-badge{display:inline-block;border:1px solid rgba(17,17,15,.2);padding:5px 8px;font-size:9px;letter-spacing:.08em}.user-error{font-size:12px;color:#7b2c2c;line-height:1.7;margin-top:12px}
@media(max-width:700px){.user-summary{grid-template-columns:1fr}.user-analysis-row{grid-template-columns:1fr}.user-analysis-row strong{justify-self:start}.user-actions .btn{flex:1 1 150px}}
`;
document.head.appendChild(style);

function isInProgress(){const p=profile(),s=stateNow();return !!(p?.userId&&s?.userId===p.userId&&['CORE','ADAPTIVE','EVENT_CHECK','EVENT_TRACE','REFLECTION','REVIEW','SHORT_TERM_OBSERVATION'].includes(s.stage));}
function buildGroups(rows){
  const map=new Map();for(const r of rows){if(!map.has(r.lra_id))map.set(r.lra_id,[]);map.get(r.lra_id).push(r);}
  const groups=[...map.entries()].map(([lraId,list])=>{list.sort((a,b)=>Number(a.analysis_count||1)-Number(b.analysis_count||1));const first=list[0],last=list[list.length-1];return{lraId,list,first,last,firstAt:first.submitted_at||first.updated_at||'',lastAt:last.submitted_at||last.updated_at||''};});
  groups.sort((a,b)=>new Date(a.firstAt)-new Date(b.firstAt));groups.forEach((g,i)=>g.useNumber=i+1);return groups.sort((a,b)=>new Date(b.lastAt)-new Date(a.lastAt));
}
function renderHistory(){
  const list=$('#userHistoryList');if(!list)return;if(!grouped.length){list.innerHTML='<div class="user-empty">送信したLRAの履歴はまだありません。</div>';return;}
  list.innerHTML=grouped.map(g=>{const plan=g.last.plan_name||PLAN_NAMES[g.last.plan_code]||g.last.plan_code||'LRA';const analysisRows=g.list.map(r=>{const canOpen=!!r.has_report,count=Number(r.analysis_count||1),label=count===1?'分析1回目':`再分析 ${count}回目`,fresh=isNewReport(r);return `<button class="user-analysis-row" data-report-id="${esc(r.lra_id)}" data-analysis-count="${count}" ${canOpen?'':'disabled'}><span><b>${esc(label)}</b><small>${esc(dateText(r.submitted_at||r.updated_at))}</small><span class="user-row-badges"><span class="user-badge">${esc(statusLabel(r.status,r.has_report))}</span>${fresh?'<span class="user-new-result">NEW RESULT</span>':''}</span></span><strong>${canOpen?'結果を見る →':'結果準備中'}</strong></button>`;}).join('');return `<section class="user-use"><div class="user-use-head"><div><span>LRA ${g.useNumber}</span><h4>LRA利用 ${g.useNumber}回目｜${esc(plan)}</h4><small>${esc(g.lraId)}</small></div><small>${esc(dateText(g.firstAt))}</small></div>${analysisRows}</section>`;}).join('');
}
function renderProgress(){const box=$('#userProgressBox'),resume=$('#userResumeBtn'),newBtn=$('#userNewBtn');if(!box||!resume||!newBtn)return;const active=isInProgress(),s=stateNow();box.classList.toggle('hidden',!active);resume.classList.toggle('hidden',!active);newBtn.disabled=active;newBtn.textContent=active?'回答中のLRAがあります':'新しくLRAを受ける →';if(active){$('#userProgressTitle').textContent='回答途中のLRAがあります';$('#userProgressText').textContent=`${PLAN_NAMES[s.planCode]||s.planCode||'LRA'}｜${s.lraId}`;}}
function syncHomeEntry(){const e=$('#userLoginEntry');if(!e)return;e.textContent=window.LRA_ACCOUNT?.authenticated?'マイページ':'ログイン';}
function renderLatest(latestGroup,latest){
  const badge=$('#userLatestBadge'),open=$('#userLatestOpenBtn'),guide=$('#userLatestGuide');
  latestReport=null;
  if(latest){
    $('#userLatestTitle').textContent=`LRA利用 ${latestGroup.useNumber}回目｜${latest.plan_name||PLAN_NAMES[latest.plan_code]||latest.plan_code||'LRA'}`;
    $('#userLatestText').textContent=`分析 ${Number(latest.analysis_count||1)}回目｜${statusGuide(latest.status,latest.has_report)}`;
    $('#userLatestStatus').textContent=dateText(latest.client_report_saved_at||latest.submitted_at||latest.updated_at);
    if(guide)guide.textContent=latest.has_report?'最新の結果は履歴にも保存されています。':'結果の準備が完了すると、履歴から確認できます。';
    const fresh=isNewReport(latest);if(badge){badge.classList.toggle('hidden',!fresh);badge.textContent='NEW RESULT';}
    if(open){open.classList.toggle('hidden',!latest.has_report);}
    if(latest.has_report)latestReport=latest;
  }else{
    $('#userLatestTitle').textContent='まだ利用履歴はありません';$('#userLatestText').textContent='LRAを送信すると、ここに利用履歴と結果が表示されます。';$('#userLatestStatus').textContent='';
    if(guide)guide.textContent='';if(badge)badge.classList.add('hidden');if(open)open.classList.add('hidden');
  }
}

async function loadDashboard(){
  if(!window.LRA_ACCOUNT?.authenticated)return;syncHomeEntry();show('dashboard');const p=profile();$('#userWelcome').textContent=`${p?.displayName||'利用者'}さん`;$('#userDashboardId').textContent=p?.loginId?`ログインID：${p.loginId}`:'';$('#userHistoryList').innerHTML='<div class="user-empty">履歴を確認しています。</div>';renderProgress();
  try{records=(await api({action:'records'})).records||[];grouped=buildGroups(records);renderHistory();const latestGroup=grouped[0],latest=latestGroup?.last;renderLatest(latestGroup,latest);}
  catch(e){if(e.status===401){await window.LRA_ACCOUNT_UI?.logout?.();return;}$('#userHistoryList').innerHTML='<div class="user-empty user-error">履歴を読み込めませんでした。「最新状態を確認」からもう一度お試しください。</div>';}
}
async function openReport(id,count){show('userReport');$('#userReportTitle').textContent='結果を読み込んでいます';$('#userReportBody').textContent='';$('#userReportMeta').textContent='';$('#userReportWait').classList.add('hidden');try{const rec=(await api({action:'get',lra_id:id,analysis_count:Number(count)})).record;$('#userReportTitle').textContent=`${rec.plan_name||PLAN_NAMES[rec.plan_code]||'LRA'}の結果`;$('#userReportMeta').textContent=`${rec.lra_id}｜分析 ${Number(rec.analysis_count||1)}回目｜${dateText(rec.client_report_saved_at||rec.updated_at)}`;if(rec.client_report_text){markSeen({...rec,has_report:true});$('#userReportBody').textContent=rec.client_report_text;$('#userReportBody').classList.remove('hidden');}else{$('#userReportBody').classList.add('hidden');$('#userReportWait').textContent='結果はまだ準備中です。';$('#userReportWait').classList.remove('hidden');}}catch(e){$('#userReportTitle').textContent='結果を読み込めませんでした';$('#userReportBody').classList.add('hidden');$('#userReportWait').textContent='通信状態を確認して、もう一度お試しください。';$('#userReportWait').classList.remove('hidden');}}

$('#userHistoryList')?.addEventListener('click',e=>{const b=e.target.closest('[data-report-id]');if(b&&!b.disabled)openReport(b.dataset.reportId,b.dataset.analysisCount);});
$('#userLatestOpenBtn')?.addEventListener('click',()=>{if(latestReport)openReport(latestReport.lra_id,latestReport.analysis_count);});
$('#userReportBackBtn')?.addEventListener('click',loadDashboard);
$('#userNewBtn')?.addEventListener('click',()=>{if(!isInProgress())$('#homeStartBtn')?.click();});
$('#userPlansBtn')?.addEventListener('click',()=>{show('home');syncHomeEntry();setTimeout(()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth',block:'start'}),0);});
$('#userResumeBtn')?.addEventListener('click',()=>window.LRA_RUNTIME?.resume?.());
$('#userRefreshBtn')?.addEventListener('click',loadDashboard);
$('#userLogoutBtn')?.addEventListener('click',()=>window.LRA_ACCOUNT_UI?.logout?.());
$('#userLoginEntry')?.addEventListener('click',()=>window.LRA_ACCOUNT?.authenticated?loadDashboard():window.LRA_ACCOUNT_UI?.openLogin?.());
window.addEventListener('lra:submission-saved',()=>{if(window.LRA_ACCOUNT?.authenticated)loadDashboard();});
window.addEventListener('lra:account-authenticated',()=>{syncHomeEntry();if(!pendingStart)loadDashboard();});

document.addEventListener('click',async e=>{const target=e.target.closest('#homeStartBtn,[data-home-plan],[data-plan]');if(!target||window.LRA_ACCOUNT?.authenticated)return;const code=target.id==='homeStartBtn'?'FREE':(target.dataset.homePlan||target.dataset.plan||'');if(code!=='FREE')return;e.preventDefault();e.stopImmediatePropagation();pendingStart=true;try{const p=await window.LRA_ACCOUNT_UI?.ensureAccount?.();if(p)target.click();}finally{pendingStart=false;}},true);

syncHomeEntry();if(window.LRA_ACCOUNT?.authenticated)loadDashboard();