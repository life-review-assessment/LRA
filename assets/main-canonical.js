import { PLANS, OPTIONS, CORE, ADAPTIVE, EVENT_TRACE, REFLECTION, QUESTION_DB_VERSION, PACKET_VERSION } from './questions.js?v=20261011-q2';
import { SHORT_TERM_OBSERVATION } from './short-term.js?v=20261011-q2';
import { buildAnalysisPacket, LRA_CANON } from './lra-canon.js';
import { INFERENCE_CONTRACT } from './inference-contract.js';

const $=s=>document.querySelector(s);
const stateKey='lra.state.2.0';
const historyKey='lra.history.1.3';
const userKey='lra.user.1.0';
const domainLabel={ACTION:'行動',JUDGMENT:'決め方',ENVIRONMENT:'生活環境',EMOTION:'気持ち',RECOVERY:'休息・回復',CROSS:'全体'};
const stageLabel={CORE:'基本質問',ADAPTIVE:'追加質問',EVENT_TRACE:'出来事について',REFLECTION:'振り返り',SHORT_TERM_OBSERVATION:'短期チェック'};
const domainOrder=['ACTION','JUDGMENT','ENVIRONMENT','EMOTION','RECOVERY'];
let memoryState=null;

function randomHex(bytes=16){const a=new Uint8Array(bytes);crypto.getRandomValues(a);return[...a].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();}
function dateStamp(){const d=new Date();return`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;}
function getUserId(){let id=window.LRA_ACCOUNT?.profile?.userId||null;try{id=id||localStorage.getItem(userKey);}catch{}return id||null;}
function blank(plan='FREE'){return{userId:getUserId(),lraId:`LRA-${dateStamp()}-${randomHex(4)}`,analysisCount:1,planCode:plan,outputId:null,stage:'INTRO',index:0,answers:{},answerExtras:{},adaptiveQuestionIds:[],eventTraceUsed:null,savedAt:null,status:'受付',analysisPacket:null,baseAnalysisPacket:null,analysis:null};}
function loadState(){try{const x=JSON.parse(localStorage.getItem(stateKey)||'null');if(x&&x.lraId){x.userId=x.userId||getUserId();x.analysisCount=Number(x.analysisCount||1);x.answers=x.answers||{};x.answerExtras=x.answerExtras||{};x.adaptiveQuestionIds=Array.isArray(x.adaptiveQuestionIds)?x.adaptiveQuestionIds:[];return x;}}catch{}return memoryState||blank();}
let state=loadState();
function setStored(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
function getStored(key,fallback=''){try{return localStorage.getItem(key)||fallback;}catch{return fallback;}}
function persist(){state.savedAt=new Date().toISOString();memoryState=structuredClone(state);setStored(stateKey,JSON.stringify(state));setSync('自動保存しました');}
function history(){try{return JSON.parse(getStored(historyKey,'[]'));}catch{return[];}}
function saveHistory(){const rows=history();const key=`${state.lraId}:${state.analysisCount}`;const row={key,userId:state.userId,lraId:state.lraId,analysisCount:state.analysisCount,outputId:state.outputId,planCode:state.planCode,status:state.status,savedAt:state.savedAt,analysisPacket:state.analysisPacket,analysis:state.analysis};const i=rows.findIndex(x=>x.key===key);if(i>=0)rows[i]=row;else rows.push(row);setStored(historyKey,JSON.stringify(rows));}
function plan(){return PLANS.find(p=>p.code===state.planCode)||PLANS[0];}
function money(n){return`${n.toLocaleString('ja-JP')}円`;}
function show(view){document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('hidden',x.dataset.view!==view));window.scrollTo({top:0,behavior:'auto'});}
function setSync(text,bad=false){document.querySelectorAll('.syncState').forEach(el=>{el.textContent=text;el.classList.toggle('bad',bad);});}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function valuePresent(v){return !(v===undefined||v===null||v===''||(Array.isArray(v)&&v.length===0));}
function optionFor(q,v){return(q.options||[]).find(o=>String(o.value)===String(v));}
function responseState(q,v){if(!valuePresent(v))return'UNANSWERED';if(Array.isArray(v)){if(v.length===1)return optionFor(q,v[0])?.responseState||'ANSWER';return'ANSWER';}return optionFor(q,v)?.responseState||(q.specialResponses||[]).find(o=>String(o.value)===String(v))?.responseState||'ANSWER';}
function routingSignal(q){const v=state.answers[q.questionId];if(!valuePresent(v))return null;const o=optionFor(q,v);if(o?.responseState)return null;return Number.isFinite(o?.routingSignal)?o.routingSignal:null;}

function beginPlan(code){if(code!=='FREE'){alert('有料プランは現在受付準備中です。');return;}state=blank(code);persist();renderIntro();}
function renderPlans(){
  $('#planGrid').innerHTML=PLANS.map(p=>`<article class="plan-card ${p.code==='STANDARD'?'featured':''}"><div><div class="plan-code">${p.code}</div><h3>${p.name}</h3><p>${p.category}</p></div><div class="plan-action"><strong>${money(p.price)}</strong><button class="btn ${p.code==='FREE'?'dark':''}" data-plan="${p.code}">${p.code==='FREE'?'このプランで開始':'現在準備中'}</button></div></article>`).join('');
  $('#optionGrid').innerHTML=OPTIONS.map(o=>`<div class="option-row"><span>${o.name}</span><b>${o.price}</b></div>`).join('');
  $('#planGrid').onclick=e=>{const b=e.target.closest('[data-plan]');if(b)beginPlan(b.dataset.plan);};
  const hpg=$('#homePlanGrid');if(hpg){hpg.innerHTML=PLANS.map(p=>`<article class="home-plan-card ${p.code==='STANDARD'?'featured':''}">${p.code==='STANDARD'?'<span class="recommended">基本プラン</span>':''}<div><div class="code">${p.code}</div><h3>${p.name}</h3><p>${p.category}</p></div><div><strong>${money(p.price)}</strong><button data-home-plan="${p.code}">${p.code==='FREE'?'このプランで開始 →':'現在準備中'}</button></div></article>`).join('');hpg.onclick=e=>{const b=e.target.closest('[data-home-plan]');if(b)beginPlan(b.dataset.homePlan);};}
  const hog=$('#homeOptionGrid');if(hog)hog.innerHTML=OPTIONS.map(o=>`<div><span>${o.name}</span><b>${o.price}</b></div>`).join('');
}
function renderIntro(){show('intro');$('#introPlan').textContent=`${plan().name}｜${money(plan().price)}`;$('#introId').textContent=state.lraId;}

function selectAdaptive(){
  const coreById=new Map(CORE.map(q=>[q.questionId,q]));
  const coreSignal=new Map(CORE.map(q=>[q.questionId,routingSignal(q)]));
  const domainStats={};
  for(const d of domainOrder){const rows=CORE.filter(q=>q.domain===d).map(q=>coreSignal.get(q.questionId)).filter(Number.isFinite);const active=rows.filter(x=>x>=2);domainStats[d]={max:active.length?Math.max(...active):0,count:active.length};}
  const budgets={};
  for(const d of domainOrder){const s=domainStats[d];let b=s.max<=1?0:s.max===2?2:s.max===3?3:4;if(s.count>=2)b=Math.min(4,b+1);budgets[d]=b;}
  const queues={};
  for(const d of domainOrder){
    queues[d]=ADAPTIVE.map((q,order)=>({q,order})).filter(x=>x.q.domain===d).map(x=>{
      const activeParents=(x.q.parentCoreIds||[]).filter(id=>(coreSignal.get(id)??-1)>=2);
      const max=activeParents.length?Math.max(...activeParents.map(id=>coreSignal.get(id))):0;
      return{...x,activeParents,max};
    }).filter(x=>x.activeParents.length>0).sort((a,b)=>b.max-a.max||b.activeParents.length-a.activeParents.length||a.order-b.order);
  }
  const activeDomains=domainOrder.filter(d=>budgets[d]>0);
  activeDomains.sort((a,b)=>domainStats[b].max-domainStats[a].max||domainOrder.indexOf(a)-domainOrder.indexOf(b));
  const out=[],counts={};
  const nonCrossCap=activeDomains.length>=2?12:14;
  let progressed=true;
  while(out.length<nonCrossCap&&progressed){
    progressed=false;
    for(const d of activeDomains){
      if(out.length>=nonCrossCap)break;
      if((counts[d]||0)>=budgets[d])continue;
      const next=queues[d].shift();if(!next)continue;
      out.push(next.q);counts[d]=(counts[d]||0)+1;progressed=true;
    }
  }
  const activeCount=activeDomains.length;
  if(activeCount>=2&&out.length<14){
    const globalMax=Math.max(...activeDomains.map(d=>domainStats[d].max));
    const activeTags=new Set(CORE.filter(q=>(coreSignal.get(q.questionId)??-1)>=2).map(q=>q.routingTag));
    const crossOrder=['LRA-ADP-CROSS-01','LRA-ADP-CROSS-03','LRA-ADP-CROSS-05','LRA-ADP-CROSS-02','LRA-ADP-CROSS-04'];
    const eligible=id=>id==='LRA-ADP-CROSS-01'||(id==='LRA-ADP-CROSS-02'&&activeCount>=3)||(id==='LRA-ADP-CROSS-03'&&globalMax>=3)||(id==='LRA-ADP-CROSS-04'&&(activeDomains.includes('ENVIRONMENT')||activeDomains.includes('RECOVERY')))||(id==='LRA-ADP-CROSS-05'&&(activeDomains.includes('ENVIRONMENT')||activeTags.has('help_seeking_constraint')||activeTags.has('personal_time_constraint')));
    for(const id of crossOrder){if(out.length>=14||out.filter(q=>q.domain==='CROSS').length>=2)break;if(!eligible(id))continue;const q=ADAPTIVE.find(x=>x.questionId===id);if(q)out.push(q);}
  }
  const nextIds=out.map(q=>q.questionId);
  ADAPTIVE.forEach(q=>{if(!nextIds.includes(q.questionId)){delete state.answers[q.questionId];delete state.answerExtras?.[q.questionId];}});
  state.adaptiveQuestionIds=nextIds;persist();return out;
}

function stageQuestions(){if(state.stage==='CORE')return CORE;if(state.stage==='ADAPTIVE'){const ids=state.adaptiveQuestionIds.length?state.adaptiveQuestionIds:selectAdaptive().map(q=>q.questionId);return ids.map(id=>ADAPTIVE.find(q=>q.questionId===id)).filter(Boolean);}if(state.stage==='EVENT_TRACE')return EVENT_TRACE;if(state.stage==='REFLECTION')return REFLECTION;if(state.stage==='SHORT_TERM_OBSERVATION')return SHORT_TERM_OBSERVATION;return[];}
function advanceStage(){state.index=0;if(state.stage==='CORE'){selectAdaptive();state.stage='ADAPTIVE';}else if(state.stage==='ADAPTIVE')state.stage='EVENT_CHECK';else if(state.stage==='EVENT_TRACE')state.stage='REFLECTION';else if(state.stage==='REFLECTION'||state.stage==='SHORT_TERM_OBSERVATION')state.stage='REVIEW';persist();renderState();}

function renderSpecialButtons(area,q,cur,textField){
  const specials=q.specialResponses||[];if(!specials.length)return;
  const box=document.createElement('div');box.className='choice-list special-responses';
  for(const sp of specials){const b=document.createElement('button');b.type='button';b.className=`choice ${String(cur)===String(sp.value)?'selected':''}`;b.innerHTML=`<b>${escapeHtml(sp.label)}</b>`;b.onclick=()=>{area.dataset.specialValue=sp.value;textField.value='';textField.disabled=true;box.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');};box.appendChild(b);}
  textField.addEventListener('input',()=>{area.dataset.specialValue='';textField.disabled=false;box.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));});
  area.dataset.specialValue=specials.some(x=>String(x.value)===String(cur))?String(cur):'';textField.disabled=!!area.dataset.specialValue;area.appendChild(box);
}

function renderQuestion(){
  show('assessment');const list=stageQuestions();const q=list[state.index];if(!q){advanceStage();return;}
  $('#stageLabel').textContent=stageLabel[state.stage]||state.stage;
  $('#domainLabel').textContent=domainLabel[q.domain]||q.domain||'';$('#questionCount').textContent=`${state.index+1} / ${list.length}`;$('#progressFill').style.width=`${((state.index+1)/list.length)*100}%`;$('#questionText').textContent=q.text;
  $('#timeRange').textContent=q.timeRange?(state.stage==='EVENT_TRACE'?'この出来事について':state.stage==='REFLECTION'?'今の状況について':state.stage==='SHORT_TERM_OBSERVATION'?'今日について':state.stage==='ADAPTIVE'?'ここ2週間ほどを中心に思い出してください':state.stage==='CORE'?'ここ2週間ほどの生活を思い浮かべて答えてください。正確な回数を思い出す必要はありません。':`対象期間：${q.timeRange}`):'';
  const area=$('#answerArea');area.innerHTML='';const cur=state.answers[q.questionId];
  if(q.answerType==='single_choice'){
    const box=document.createElement('div');box.className='choice-list';(q.options||[]).forEach(o=>{const b=document.createElement('button');b.className=`choice ${String(cur)===String(o.value)?'selected':''}`;b.type='button';b.innerHTML=`<b>${escapeHtml(o.label)}</b>`;b.onclick=()=>{state.answers[q.questionId]=o.value;state.index++;persist();renderQuestion();};box.appendChild(b);});area.appendChild(box);
  }else if(q.answerType==='multi_choice'){
    const selected=new Set(Array.isArray(cur)?cur:[]),box=document.createElement('div');box.className='choice-list';
    (q.options||[]).forEach(o=>{const label=document.createElement('label');label.className='multi';const input=document.createElement('input');input.type='checkbox';input.value=o.value;input.checked=selected.has(o.value);input.dataset.exclusive=o.exclusive?'1':'0';input.onchange=()=>{const all=[...box.querySelectorAll('input[type="checkbox"]')];if(input.checked&&input.dataset.exclusive==='1')all.forEach(x=>{if(x!==input)x.checked=false;});else if(input.checked)all.filter(x=>x.dataset.exclusive==='1').forEach(x=>x.checked=false);};const span=document.createElement('span');span.textContent=o.label;label.append(input,span);box.appendChild(label);});area.appendChild(box);
    if((q.options||[]).some(o=>o.allowsText)){const extra=document.createElement('input');extra.className='text-field';extra.placeholder='「その他」を選んだ場合のみ、短く入力してください';extra.value=state.answerExtras?.[q.questionId]?.other||'';extra.dataset.otherText='1';area.appendChild(extra);}
  }else{
    const t=document.createElement(q.answerType==='text_long'?'textarea':'input');t.className='text-field';if(t.tagName==='TEXTAREA')t.rows=6;const special=(q.specialResponses||[]).some(x=>String(x.value)===String(cur));t.value=special?'':(cur||'');t.placeholder='答えられる範囲で大丈夫です。短い言葉でもかまいません';area.appendChild(t);renderSpecialButtons(area,q,cur,t);
  }
  $('#backBtn').disabled=state.stage==='CORE'&&state.index===0;
  $('#backBtn').onclick=()=>{if(state.index>0){state.index--;persist();renderQuestion();return;}if(state.stage==='ADAPTIVE'){state.stage='CORE';state.index=CORE.length-1;persist();renderQuestion();return;}if(state.stage==='EVENT_TRACE'){state.stage='EVENT_CHECK';persist();renderEventCheck();return;}if(state.stage==='REFLECTION'){state.stage=state.eventTraceUsed?'EVENT_TRACE':'EVENT_CHECK';state.index=state.eventTraceUsed?EVENT_TRACE.length-1:0;persist();renderState();return;}if(state.stage==='SHORT_TERM_OBSERVATION'){state.stage='COMPLETE';persist();renderDone();}};
  $('#nextBtn').onclick=()=>{
    let value;
    if(q.answerType==='multi_choice'){
      value=[...area.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.value);
      const extra=area.querySelector('[data-other-text]')?.value.trim()||'';state.answerExtras=state.answerExtras||{};if(extra)state.answerExtras[q.questionId]={other:extra};else delete state.answerExtras[q.questionId];
    }else if(q.answerType==='single_choice')value=state.answers[q.questionId];
    else value=area.dataset.specialValue||area.querySelector('.text-field')?.value.trim()||'';
    if(q.required&&!valuePresent(value)){alert('回答を選んでください。');return;}
    state.answers[q.questionId]=value;
    if(q.questionId==='LRA-EVT-01'&&responseState(q,value)==='NA'){
      EVENT_TRACE.slice(1).forEach(x=>delete state.answers[x.questionId]);state.eventTraceUsed=false;state.stage='REFLECTION';state.index=0;persist();renderQuestion();return;
    }
    state.index++;persist();renderQuestion();
  };
}

function renderEventCheck(){show('event');$('#eventYes').onclick=()=>{state.eventTraceUsed=true;state.stage='EVENT_TRACE';state.index=0;persist();renderQuestion();};$('#eventNo').onclick=()=>{state.eventTraceUsed=false;EVENT_TRACE.forEach(q=>delete state.answers[q.questionId]);state.stage='REFLECTION';state.index=0;persist();renderQuestion();};}
function makePacket(){const p=buildAnalysisPacket(state,{CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,SHORT_TERM_OBSERVATION},{questionDbVersion:QUESTION_DB_VERSION,packetVersion:PACKET_VERSION});p.userId=state.userId;p.eventTraceUsed=state.eventTraceUsed;p.adaptiveQuestionIds=[...state.adaptiveQuestionIds];p.inferenceContract=INFERENCE_CONTRACT;p.canon=LRA_CANON;p.previousAnalyses=history().filter(x=>x.userId===state.userId&&x.analysis&&!(x.lraId===state.lraId&&Number(x.analysisCount)===Number(state.analysisCount))).map(x=>({lraId:x.lraId,analysisCount:x.analysisCount,savedAt:x.savedAt,analysis:x.analysis}));return p;}
function renderReview(){show('review');const adaptive=state.adaptiveQuestionIds.map(id=>ADAPTIVE.find(q=>q.questionId===id)).filter(Boolean);const hasShort=SHORT_TERM_OBSERVATION.some(q=>state.answers[q.questionId]!==undefined);const counts=[['基本質問',CORE],['追加質問',adaptive],['出来事について',state.eventTraceUsed?EVENT_TRACE:[]],['振り返り',REFLECTION],['短期チェック',hasShort?SHORT_TERM_OBSERVATION:[]]];$('#reviewGrid').innerHTML=counts.filter(([,list])=>list.length).map(([label,list])=>`<div><span>${label}</span><strong>${list.filter(q=>state.answers[q.questionId]!==undefined).length} / ${list.length}</strong></div>`).join('');$('#submitBtn').onclick=()=>{state.outputId=`OUT-${dateStamp()}-${randomHex(4)}`;state.analysisPacket=makePacket();state.analysis=null;state.stage='COMPLETE';state.status=state.analysisCount>1?'再分析待ち':'分析待ち';persist();saveHistory();renderDone();};}
function renderDone(){show('done');$('#doneId').textContent=state.lraId;$('#doneStatus').textContent=state.status==='再分析待ち'?'再分析を受け付けました':'分析を進めています';$('#resultBtn').onclick=renderResult;}
function renderResult(){show('result');$('#resultStatus').textContent=state.status==='再分析待ち'?'再分析を進めています':state.status==='分析待ち'?'分析を進めています':state.status;const box=$('#resultBody');if(!state.analysis){box.innerHTML='<section class="result-section"><span>現在の状態</span><p>現在、回答内容を確認・分析しています。結果がまとまり次第、マイページから確認できます。</p></section>';return;}const order=[['currentStructure','現在の生活構造'],['bottleneck','今いちばん影響が大きい部分'],['chainLoop','今の状態が続いている流れ'],['hypotheses','考えられること'],['evidence','そう考える理由'],['counterUncertainty','まだ分からないこと'],['functionalParts','今うまく機能している部分'],['protect','守りたいもの'],['resources','使える支え・資源'],['leverage','変化につながりやすいポイント'],['interventions','試せること'],['topPriority','まず試す候補'],['confidence','見立ての確かさ'],['additionalObservation','追加で確認したいこと']];box.innerHTML=order.filter(([k])=>state.analysis[k]!==undefined).map(([k,l])=>`<section class="result-section"><span>${l}</span><p>${escapeHtml(typeof state.analysis[k]==='object'?JSON.stringify(state.analysis[k],null,2):state.analysis[k])}</p></section>`).join('');}
function renderState(){if(state.stage==='INTRO')renderIntro();else if(['CORE','ADAPTIVE','EVENT_TRACE','REFLECTION','SHORT_TERM_OBSERVATION'].includes(state.stage))renderQuestion();else if(state.stage==='EVENT_CHECK')renderEventCheck();else if(state.stage==='REVIEW')renderReview();else if(state.stage==='COMPLETE')renderDone();else show('home');}

function normalizeContinuation(context={}){
  const currentUser=getUserId();const requestedUser=String(context.userId||context.user_id||currentUser||'');const lraId=String(context.lraId||context.lra_id||'');const analysisCount=Math.max(1,Number(context.analysisCount??context.analysis_count??1)||1);if(!currentUser||requestedUser!==currentUser||!/^LRA-\d{8}-[A-F0-9]{8,32}$/.test(lraId))return null;
  let answers=context.answers&&typeof context.answers==='object'?context.answers:null;let planCode=String(context.planCode||context.plan_code||'');let eventTraceUsed=typeof context.eventTraceUsed==='boolean'?context.eventTraceUsed:(typeof context.event_trace_used==='boolean'?context.event_trace_used:null);let adaptiveQuestionIds=Array.isArray(context.adaptiveQuestionIds)?context.adaptiveQuestionIds:(Array.isArray(context.adaptive_question_ids)?context.adaptive_question_ids:null);let baseAnalysisPacket=context.analysisPacket||context.analysis_packet||null;
  if(!answers&&state.userId===currentUser&&state.lraId===lraId&&Number(state.analysisCount||1)===analysisCount&&state.answers&&typeof state.answers==='object'){answers=state.answers;planCode=planCode||state.planCode;eventTraceUsed=eventTraceUsed??state.eventTraceUsed;adaptiveQuestionIds=adaptiveQuestionIds||state.adaptiveQuestionIds;baseAnalysisPacket=baseAnalysisPacket||state.analysisPacket;}
  if(!answers){const row=history().find(x=>x.userId===currentUser&&x.lraId===lraId&&Number(x.analysisCount||1)===analysisCount);const packet=row?.analysisPacket;if(packet?.answers&&typeof packet.answers==='object'){answers=packet.answers;planCode=planCode||packet.planCode||packet.planId||row.planCode;eventTraceUsed=eventTraceUsed??packet.eventTraceUsed;adaptiveQuestionIds=adaptiveQuestionIds||packet.adaptiveQuestionIds;baseAnalysisPacket=baseAnalysisPacket||packet;}}
  if(!answers)return null;return{userId:currentUser,lraId,analysisCount,planCode:planCode||'FREE',eventTraceUsed,adaptiveQuestionIds:Array.isArray(adaptiveQuestionIds)?[...adaptiveQuestionIds]:[],answers:structuredClone(answers),baseAnalysisPacket:baseAnalysisPacket?structuredClone(baseAnalysisPacket):null};
}
function startShortTermObservationFromResult(context){const source=normalizeContinuation(context);if(!source){alert('この結果から短期チェックを開始するための回答データを確認できませんでした。マイページで最新状態を確認して、もう一度お試しください。');return false;}for(const q of SHORT_TERM_OBSERVATION)delete source.answers[q.questionId];state={userId:source.userId,lraId:source.lraId,analysisCount:source.analysisCount+1,planCode:source.planCode,outputId:null,stage:'SHORT_TERM_OBSERVATION',index:0,answers:source.answers,answerExtras:{},adaptiveQuestionIds:source.adaptiveQuestionIds,eventTraceUsed:source.eventTraceUsed,savedAt:null,status:'短期観測中',analysisPacket:null,baseAnalysisPacket:source.baseAnalysisPacket,analysis:null};persist();renderQuestion();return true;}
function startShortTermObservation(){if(!state.analysis){alert('結果が確認できるようになってから、短期チェックを開始できます。');return false;}saveHistory();return startShortTermObservationFromResult({userId:state.userId,lraId:state.lraId,analysisCount:state.analysisCount,planCode:state.planCode,eventTraceUsed:state.eventTraceUsed,adaptiveQuestionIds:state.adaptiveQuestionIds,answers:state.answers,analysisPacket:state.analysisPacket});}

window.LRA_RUNTIME=Object.freeze({version:'LRA-WEB-OBSERVATION-2.0',role:'OBSERVATION_DEVICE_ONLY',getState:()=>structuredClone(state),getAnalysisPacket:()=>state.analysisPacket?structuredClone(state.analysisPacket):null,getHistory:()=>structuredClone(history()),resume:renderState,startShortTermObservation,startShortTermObservationFromResult,applyReviewedAnalysis:(analysis)=>{state.analysis=structuredClone(analysis);state.status='分析結果確定';persist();saveHistory();renderResult();}});

$('#plansBtn').onclick=()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth',block:'start'});
if($('#homeStartBtn'))$('#homeStartBtn').onclick=()=>beginPlan('FREE');
$('#startBtn').onclick=()=>{if(!$('#consent').checked){alert('内容を確認し、チェックを入れてください。');return;}state.stage='CORE';state.index=0;state.status='回答中';persist();renderQuestion();};
$('#reloadResultBtn').onclick=renderResult;
renderPlans();
if(state.stage&&state.stage!=='INTRO')renderState();else show('home');
