import { PLANS, OPTIONS, CORE, ADAPTIVE, EVENT_TRACE, REFLECTION, QUESTION_DB_VERSION, PACKET_VERSION } from './questions.js';
import { SHORT_TERM_OBSERVATION } from './short-term.js';
import { buildAnalysisPacket, LRA_CANON } from './lra-canon.js';
import { INFERENCE_CONTRACT } from './inference-contract.js';

const $=s=>document.querySelector(s);
const stateKey='lra.state.1.3';
const historyKey='lra.history.1.3';
const userKey='lra.user.1.0';
const domainLabel={ACTION:'行動',JUDGMENT:'判断',ENVIRONMENT:'環境',EMOTION:'感情',RECOVERY:'回復',CROSS:'全体'};
let memoryState=null;

function randomHex(bytes=16){const a=new Uint8Array(bytes);crypto.getRandomValues(a);return[...a].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();}
function dateStamp(){const d=new Date();return`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;}
function getUserId(){let id=null;try{id=localStorage.getItem(userKey);}catch{}if(!id){id=`USR-${dateStamp()}-${randomHex(4)}`;try{localStorage.setItem(userKey,id);}catch{}}return id;}
function blank(plan='FREE'){return{userId:getUserId(),lraId:`LRA-${dateStamp()}-${randomHex(4)}`,analysisCount:1,planCode:plan,outputId:null,stage:'INTRO',index:0,answers:{},adaptiveQuestionIds:[],eventTraceUsed:null,savedAt:null,status:'受付',analysisPacket:null,analysis:null};}
function loadState(){try{const x=JSON.parse(localStorage.getItem(stateKey)||'null');if(x&&x.lraId){x.userId=x.userId||getUserId();x.analysisCount=Number(x.analysisCount||1);return x;}}catch{}return memoryState||blank();}
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

function beginPlan(code){if(code!=='FREE'){alert('有料プランは決済導線の接続後に開始できます。');return;}state=blank(code);persist();renderIntro();}
function renderPlans(){
  $('#planGrid').innerHTML=PLANS.map(p=>`<article class="plan-card ${p.code==='STANDARD'?'featured':''}"><div><div class="plan-code">${p.code}</div><h3>${p.name}</h3><p>${p.category}</p></div><div class="plan-action"><strong>${money(p.price)}</strong><button class="btn ${p.code==='FREE'?'dark':''}" data-plan="${p.code}">${p.code==='FREE'?'このプランで開始':'決済接続後に開始'}</button></div></article>`).join('');
  $('#optionGrid').innerHTML=OPTIONS.map(o=>`<div class="option-row"><span>${o.name}</span><b>${o.price}</b></div>`).join('');
  $('#planGrid').onclick=e=>{const b=e.target.closest('[data-plan]');if(b)beginPlan(b.dataset.plan);};
  const hpg=$('#homePlanGrid');if(hpg){hpg.innerHTML=PLANS.map(p=>`<article class="home-plan-card ${p.code==='STANDARD'?'featured':''}">${p.code==='STANDARD'?'<span class="recommended">基本プラン</span>':''}<div><div class="code">${p.code}</div><h3>${p.name}</h3><p>${p.category}</p></div><div><strong>${money(p.price)}</strong><button data-home-plan="${p.code}">${p.code==='FREE'?'このプランで開始 →':'決済接続後に開始'}</button></div></article>`).join('');hpg.onclick=e=>{const b=e.target.closest('[data-home-plan]');if(b)beginPlan(b.dataset.homePlan);};}
  const hog=$('#homeOptionGrid');if(hog)hog.innerHTML=OPTIONS.map(o=>`<div><span>${o.name}</span><b>${o.price}</b></div>`).join('');
}
function renderIntro(){show('intro');$('#introPlan').textContent=`${plan().name}｜${money(plan().price)}`;$('#introId').textContent=state.lraId;}

function selectAdaptive(){
  const triggered=new Set();
  CORE.forEach(q=>{if(['3','4','U','S'].includes(state.answers[q.questionId]))q.branchTags.forEach(t=>triggered.add(t));});
  const ranked=ADAPTIVE.map((q,order)=>({q,order,score:q.branchTags.filter(t=>triggered.has(t)).length+(q.domain==='CROSS'?0.35:0)+(q.type==='PROTECT'?0.15:0)+(q.type==='COMPARE'?0.10:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
  const out=[],counts={};
  for(const x of ranked){if(out.length>=14)break;const d=x.q.domain;if(d!=='CROSS'&&(counts[d]||0)>=4)continue;out.push(x.q);counts[d]=(counts[d]||0)+1;}
  for(const q of ADAPTIVE.filter(q=>q.domain==='CROSS').slice(0,3)){if(out.length>=14)break;if(!out.some(x=>x.questionId===q.questionId))out.push(q);}
  const nextIds=out.map(q=>q.questionId);
  ADAPTIVE.forEach(q=>{if(!nextIds.includes(q.questionId))delete state.answers[q.questionId];});
  state.adaptiveQuestionIds=nextIds;persist();return out;
}
function stageQuestions(){if(state.stage==='CORE')return CORE;if(state.stage==='ADAPTIVE'){const ids=state.adaptiveQuestionIds.length?state.adaptiveQuestionIds:selectAdaptive().map(q=>q.questionId);return ids.map(id=>ADAPTIVE.find(q=>q.questionId===id)).filter(Boolean);}if(state.stage==='EVENT_TRACE')return EVENT_TRACE;if(state.stage==='REFLECTION')return REFLECTION;if(state.stage==='SHORT_TERM_OBSERVATION')return SHORT_TERM_OBSERVATION;return[];}
function advanceStage(){state.index=0;if(state.stage==='CORE'){selectAdaptive();state.stage='ADAPTIVE';}else if(state.stage==='ADAPTIVE')state.stage='EVENT_CHECK';else if(state.stage==='EVENT_TRACE')state.stage='REFLECTION';else if(state.stage==='REFLECTION'||state.stage==='SHORT_TERM_OBSERVATION')state.stage='REVIEW';persist();renderState();}

function renderQuestion(){
  show('assessment');const list=stageQuestions();const q=list[state.index];if(!q){advanceStage();return;}
  $('#stageLabel').textContent={CORE:'CORE SCAN',ADAPTIVE:'ADAPTIVE SCAN',EVENT_TRACE:'EVENT TRACE',REFLECTION:'REFLECTION',SHORT_TERM_OBSERVATION:'SHORT TERM OBSERVATION'}[state.stage]||state.stage;
  $('#domainLabel').textContent=domainLabel[q.domain]||q.domain||'';$('#questionCount').textContent=`${state.index+1} / ${list.length}`;$('#progressFill').style.width=`${((state.index+1)/list.length)*100}%`;$('#questionText').textContent=q.text;$('#timeRange').textContent=q.timeRange?`対象期間：${q.timeRange}`:'';
  const area=$('#answerArea');area.innerHTML='';const cur=state.answers[q.questionId];
  if(q.answerType==='single_choice'){
    const box=document.createElement('div');box.className='choice-list';(q.options||[]).forEach(o=>{const b=document.createElement('button');b.className=`choice ${cur===o.value?'selected':''}`;b.type='button';b.innerHTML=`<span>${o.value}</span><b>${o.label}</b>`;b.onclick=()=>{state.answers[q.questionId]=o.value;state.index++;persist();renderQuestion();};box.appendChild(b);});area.appendChild(box);
  }else if(q.answerType==='multi_choice'){
    const selected=new Set(Array.isArray(cur)?cur:[]),box=document.createElement('div');box.className='choice-list';(q.options||[]).forEach(o=>{const label=document.createElement('label');label.className='multi';label.innerHTML=`<input type="checkbox" value="${o.value}" ${selected.has(o.value)?'checked':''}><span>${o.label}</span>`;box.appendChild(label);});area.appendChild(box);
  }else{const t=document.createElement(q.answerType==='text_long'?'textarea':'input');t.className='text-field';if(t.tagName==='TEXTAREA')t.rows=6;t.value=cur||'';t.placeholder='書ける範囲で入力してください';area.appendChild(t);}
  $('#backBtn').disabled=state.stage==='CORE'&&state.index===0;
  $('#backBtn').onclick=()=>{if(state.index>0){state.index--;persist();renderQuestion();return;}if(state.stage==='ADAPTIVE'){state.stage='CORE';state.index=CORE.length-1;persist();renderQuestion();return;}if(state.stage==='EVENT_TRACE'){state.stage='EVENT_CHECK';persist();renderEventCheck();return;}if(state.stage==='REFLECTION'){state.stage=state.eventTraceUsed?'EVENT_TRACE':'EVENT_CHECK';state.index=state.eventTraceUsed?EVENT_TRACE.length-1:0;persist();renderState();return;}if(state.stage==='SHORT_TERM_OBSERVATION'){state.stage='COMPLETE';persist();renderDone();}};
  $('#nextBtn').onclick=()=>{let value;if(q.answerType==='multi_choice')value=[...area.querySelectorAll('input:checked')].map(x=>x.value);else if(q.answerType==='single_choice')value=state.answers[q.questionId];else value=area.querySelector('.text-field')?.value.trim()||'';if(q.required&&(value===undefined||value===null||value===''||(Array.isArray(value)&&!value.length))){alert('回答を選んでください。');return;}state.answers[q.questionId]=value;state.index++;persist();renderQuestion();};
}
function renderEventCheck(){show('event');$('#eventYes').onclick=()=>{state.eventTraceUsed=true;state.stage='EVENT_TRACE';state.index=0;persist();renderQuestion();};$('#eventNo').onclick=()=>{state.eventTraceUsed=false;EVENT_TRACE.forEach(q=>delete state.answers[q.questionId]);state.stage='REFLECTION';state.index=0;persist();renderQuestion();};}

function makePacket(){const p=buildAnalysisPacket(state,{CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,SHORT_TERM_OBSERVATION},{questionDbVersion:QUESTION_DB_VERSION,packetVersion:PACKET_VERSION});p.userId=state.userId;p.eventTraceUsed=state.eventTraceUsed;p.adaptiveQuestionIds=[...state.adaptiveQuestionIds];p.inferenceContract=INFERENCE_CONTRACT;p.canon=LRA_CANON;p.previousAnalyses=history().filter(x=>x.userId===state.userId&&x.analysis&&!(x.lraId===state.lraId&&Number(x.analysisCount)===Number(state.analysisCount))).map(x=>({lraId:x.lraId,analysisCount:x.analysisCount,savedAt:x.savedAt,analysis:x.analysis}));return p;}
function renderReview(){
  show('review');const adaptive=state.adaptiveQuestionIds.map(id=>ADAPTIVE.find(q=>q.questionId===id)).filter(Boolean);const hasShort=SHORT_TERM_OBSERVATION.some(q=>state.answers[q.questionId]!==undefined);const counts=[['CORE',CORE],['ADAPTIVE',adaptive],['EVENT TRACE',state.eventTraceUsed?EVENT_TRACE:[]],['REFLECTION',REFLECTION],['SHORT TERM',hasShort?SHORT_TERM_OBSERVATION:[]]];$('#reviewGrid').innerHTML=counts.filter(([,list])=>list.length).map(([label,list])=>`<div><span>${label}</span><strong>${list.filter(q=>state.answers[q.questionId]!==undefined).length} / ${list.length}</strong></div>`).join('');
  $('#submitBtn').onclick=()=>{state.outputId=`OUT-${dateStamp()}-${randomHex(4)}`;state.analysisPacket=makePacket();state.analysis=null;state.stage='COMPLETE';state.status=state.analysisCount>1?'再分析待ち':'分析待ち';persist();saveHistory();renderDone();};
}
function renderDone(){show('done');$('#doneId').textContent=state.lraId;$('#doneStatus').textContent=state.status;const h=$('[data-view="done"] h2');const p=$('[data-view="done"] .lead');if(h)h.textContent='回答の受付が完了しました。';if(p)p.textContent='回答内容はLRA分析正本に従う分析パケットとして保存されています。';$('#resultBtn').onclick=renderResult;}
function renderResult(){show('result');$('#resultStatus').textContent=state.status;const box=$('#resultBody');if(!state.analysis){box.innerHTML='<section class="result-section"><span>STATUS</span><p>分析パケット生成済み。最終解析・複数仮説・因果推論・CHAIN/LOOP判定・確信度・レバレッジ・介入順位はWeb側で確定せず、LRA外部推論と人間レビューで確定します。</p></section>';return;}const order=[['currentStructure','現在の生活構造'],['bottleneck','最大ボトルネック'],['chainLoop','CHAIN/LOOP'],['hypotheses','主要仮説'],['evidence','根拠'],['counterUncertainty','反証・不確実性'],['functionalParts','機能している部分'],['protect','保護対象'],['resources','資源'],['leverage','レバレッジポイント'],['interventions','介入候補'],['topPriority','最優先候補'],['confidence','確信度'],['additionalObservation','必要時追加観測']];box.innerHTML=order.filter(([k])=>state.analysis[k]!==undefined).map(([k,l])=>`<section class="result-section"><span>${l}</span><p>${escapeHtml(typeof state.analysis[k]==='object'?JSON.stringify(state.analysis[k],null,2):state.analysis[k])}</p></section>`).join('');}
function renderState(){if(state.stage==='INTRO')renderIntro();else if(['CORE','ADAPTIVE','EVENT_TRACE','REFLECTION','SHORT_TERM_OBSERVATION'].includes(state.stage))renderQuestion();else if(state.stage==='EVENT_CHECK')renderEventCheck();else if(state.stage==='REVIEW')renderReview();else if(state.stage==='COMPLETE')renderDone();else show('home');}
function startShortTermObservation(){
  if(!state.analysis){alert('確定した分析結果を読み込んでから短期観測を開始してください。');return;}
  saveHistory();
  for(const q of SHORT_TERM_OBSERVATION)delete state.answers[q.questionId];
  state.analysisCount=Number(state.analysisCount||1)+1;state.outputId=null;state.analysisPacket=null;state.analysis=null;state.stage='SHORT_TERM_OBSERVATION';state.index=0;state.status='短期観測中';persist();renderQuestion();
}

window.LRA_RUNTIME=Object.freeze({version:'LRA-WEB-OBSERVATION-1.1',role:'OBSERVATION_DEVICE_ONLY',getState:()=>structuredClone(state),getAnalysisPacket:()=>state.analysisPacket?structuredClone(state.analysisPacket):null,getHistory:()=>structuredClone(history()),resume:renderState,startShortTermObservation,applyReviewedAnalysis:(analysis)=>{state.analysis=structuredClone(analysis);state.status='分析結果確定';persist();saveHistory();renderResult();}});

$('#plansBtn').onclick=()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth',block:'start'});
if($('#homeStartBtn'))$('#homeStartBtn').onclick=()=>beginPlan('FREE');
$('#startBtn').onclick=()=>{if(!$('#consent').checked){alert('内容を確認し、チェックを入れてください。');return;}state.stage='CORE';state.index=0;state.status='回答中';persist();renderQuestion();};
$('#reloadResultBtn').onclick=renderResult;
renderPlans();
if(state.stage&&state.stage!=='INTRO')renderState();else show('home');
