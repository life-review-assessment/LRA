import { PLANS, OPTIONS, CORE, ADAPTIVE, EVENT_TRACE, REFLECTION, QUESTION_DB_VERSION, PACKET_VERSION } from './questions.js';

const $ = (s) => document.querySelector(s);
const stateKey = 'lra.state.1.2';
const domainLabel = {ACTION:'行動',JUDGMENT:'判断',ENVIRONMENT:'環境',EMOTION:'感情',RECOVERY:'回復',CROSS:'全体'};
let state = loadState();

function randomHex(bytes=16){ const a=new Uint8Array(bytes); crypto.getRandomValues(a); return [...a].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase(); }
function dateStamp(){ const d=new Date(); return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`; }
function blank(plan='FREE'){ return { lraId:`LRA-${dateStamp()}-${randomHex(4)}`, planCode:plan, outputId:null, stage:'INTRO', index:0, answers:{}, adaptiveQuestionIds:[], eventTraceUsed:null, savedAt:null, status:'受付', analysis:null }; }
function loadState(){ try { const x=JSON.parse(localStorage.getItem(stateKey)||'null'); return x && x.lraId ? x : blank(); } catch { return blank(); } }
function persist(){ state.savedAt=new Date().toISOString(); localStorage.setItem(stateKey, JSON.stringify(state)); setSync('自動保存しました'); }
function plan(){ return PLANS.find(p=>p.code===state.planCode) || PLANS[0]; }
function money(n){ return `${n.toLocaleString('ja-JP')}円`; }
function show(view){ document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('hidden',x.dataset.view!==view)); window.scrollTo({top:0,behavior:'auto'}); }
function setSync(text,bad=false){ document.querySelectorAll('.syncState').forEach(el=>{el.textContent=text;el.classList.toggle('bad',bad);}); }
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

function beginPlan(code){ state=blank(code); persist(); renderIntro(); }
function renderPlans(){
  $('#planGrid').innerHTML=PLANS.map(p=>`<article class="plan-card ${p.code==='STANDARD'?'featured':''}"><div><div class="plan-code">${p.code}</div><h3>${p.name}</h3><p>${p.category}</p></div><div class="plan-action"><strong>${money(p.price)}</strong><button class="btn ${p.code==='FREE'?'dark':''}" data-plan="${p.code}">このプランで開始</button></div></article>`).join('');
  $('#optionGrid').innerHTML=OPTIONS.map(o=>`<div class="option-row"><span>${o.name}</span><b>${o.price}</b></div>`).join('');
  $('#planGrid').onclick=e=>{const b=e.target.closest('[data-plan]');if(b)beginPlan(b.dataset.plan);};
  const homePlanGrid=$('#homePlanGrid');
  if(homePlanGrid){
    homePlanGrid.innerHTML=PLANS.map(p=>`<article class="home-plan-card ${p.code==='STANDARD'?'featured':''}">${p.code==='STANDARD'?'<span class="recommended">基本プラン</span>':''}<div><div class="code">${p.code}</div><h3>${p.name}</h3><p>${p.category}</p></div><div><strong>${money(p.price)}</strong><button data-home-plan="${p.code}">このプランで開始 →</button></div></article>`).join('');
    homePlanGrid.onclick=e=>{const b=e.target.closest('[data-home-plan]');if(b)beginPlan(b.dataset.homePlan);};
  }
  const homeOptionGrid=$('#homeOptionGrid');
  if(homeOptionGrid) homeOptionGrid.innerHTML=OPTIONS.map(o=>`<div><span>${o.name}</span><b>${o.price}</b></div>`).join('');
}
function renderIntro(){ show('intro'); const p=plan(); $('#introPlan').textContent=`${p.name}｜${money(p.price)}`; $('#introId').textContent=state.lraId; }

function selectAdaptive(){
  const triggered=new Set();
  CORE.forEach(q=>{ if(['3','4','U','S'].includes(state.answers[q.questionId])) q.branchTags.forEach(t=>triggered.add(t)); });
  const ranked=ADAPTIVE.map((q,order)=>({q,order,score:q.branchTags.filter(t=>triggered.has(t)).length+(q.domain==='CROSS'?0.35:0)+(q.type==='PROTECT'?0.15:0)+(q.type==='COMPARE'?0.10:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
  const out=[],counts={};
  for(const x of ranked){ if(out.length>=14)break; const d=x.q.domain; if(d!=='CROSS'&&(counts[d]||0)>=4)continue; out.push(x.q); counts[d]=(counts[d]||0)+1; }
  for(const q of ADAPTIVE.filter(q=>q.domain==='CROSS').slice(0,3)){ if(out.length>=14)break; if(!out.some(x=>x.questionId===q.questionId))out.push(q); }
  state.adaptiveQuestionIds=out.map(q=>q.questionId); persist(); return out;
}
function stageQuestions(){
  if(state.stage==='CORE')return CORE;
  if(state.stage==='ADAPTIVE'){ const ids=state.adaptiveQuestionIds.length?state.adaptiveQuestionIds:selectAdaptive().map(q=>q.questionId); return ids.map(id=>ADAPTIVE.find(q=>q.questionId===id)).filter(Boolean); }
  if(state.stage==='EVENT_TRACE')return EVENT_TRACE;
  if(state.stage==='REFLECTION')return REFLECTION;
  return [];
}
function stageQuestionsFor(stage){ if(stage==='ADAPTIVE')return state.adaptiveQuestionIds.map(id=>ADAPTIVE.find(q=>q.questionId===id)).filter(Boolean); return []; }
function advanceStage(){
  state.index=0;
  if(state.stage==='CORE'){selectAdaptive();state.stage='ADAPTIVE';}
  else if(state.stage==='ADAPTIVE'){state.stage='EVENT_CHECK';}
  else if(state.stage==='EVENT_TRACE'){state.stage='REFLECTION';}
  else if(state.stage==='REFLECTION'){state.stage='REVIEW';}
  persist();renderState();
}
function renderQuestion(){
  show('assessment'); const list=stageQuestions(); const q=list[state.index]; if(!q){advanceStage();return;}
  $('#stageLabel').textContent={CORE:'CORE SCAN',ADAPTIVE:'ADAPTIVE SCAN',EVENT_TRACE:'EVENT TRACE',REFLECTION:'REFLECTION'}[state.stage]||state.stage;
  $('#domainLabel').textContent=domainLabel[q.domain]||q.domain||''; $('#questionCount').textContent=`${state.index+1} / ${list.length}`; $('#progressFill').style.width=`${((state.index+1)/list.length)*100}%`; $('#questionText').textContent=q.text; $('#timeRange').textContent=q.timeRange?`対象期間：${q.timeRange}`:'';
  const area=$('#answerArea'); area.innerHTML=''; const cur=state.answers[q.questionId];
  if(q.answerType==='single_choice'){
    const box=document.createElement('div');box.className='choice-list';
    (q.options||[]).forEach(o=>{const b=document.createElement('button');b.className=`choice ${cur===o.value?'selected':''}`;b.type='button';b.innerHTML=`<span>${o.value}</span><b>${o.label}</b>`;b.onclick=()=>{state.answers[q.questionId]=o.value;state.index++;persist();renderQuestion();};box.appendChild(b);});area.appendChild(box);
  } else if(q.answerType==='multi_choice'){
    const selected=new Set(Array.isArray(cur)?cur:[]),box=document.createElement('div');box.className='choice-list';
    (q.options||[]).forEach(o=>{const label=document.createElement('label');label.className='multi';label.innerHTML=`<input type="checkbox" value="${o.value}" ${selected.has(o.value)?'checked':''}><span>${o.label}</span>`;box.appendChild(label);});area.appendChild(box);
  } else {
    const t=document.createElement(q.answerType==='text_long'?'textarea':'input');t.className='text-field';if(t.tagName==='TEXTAREA')t.rows=6;t.value=cur||'';t.placeholder='書ける範囲で入力してください';area.appendChild(t);
  }
  $('#backBtn').disabled=state.stage==='CORE'&&state.index===0;
  $('#backBtn').onclick=()=>{if(state.index>0){state.index--;persist();renderQuestion();return;}if(state.stage==='ADAPTIVE'){state.stage='CORE';state.index=CORE.length-1;persist();renderQuestion();return;}if(state.stage==='EVENT_TRACE'){state.stage='EVENT_CHECK';persist();renderEventCheck();return;}if(state.stage==='REFLECTION'){if(state.eventTraceUsed){state.stage='EVENT_TRACE';state.index=EVENT_TRACE.length-1;persist();renderQuestion();}else{state.stage='EVENT_CHECK';persist();renderEventCheck();}}};
  $('#nextBtn').onclick=()=>{let value;if(q.answerType==='multi_choice')value=[...area.querySelectorAll('input:checked')].map(x=>x.value);else if(q.answerType==='single_choice')value=state.answers[q.questionId];else value=area.querySelector('.text-field')?.value.trim()||'';if(q.required&&(value===undefined||value===null||value===''||(Array.isArray(value)&&!value.length))){alert('回答を選んでください。');return;}state.answers[q.questionId]=value;state.index++;persist();renderQuestion();};
}
function renderEventCheck(){show('event');$('#eventYes').onclick=()=>{state.eventTraceUsed=true;state.stage='EVENT_TRACE';state.index=0;persist();renderQuestion();};$('#eventNo').onclick=()=>{state.eventTraceUsed=false;state.stage='REFLECTION';state.index=0;persist();renderQuestion();};}

function axisScores(){
  const buckets={ACTION:[],JUDGMENT:[],ENVIRONMENT:[],EMOTION:[],RECOVERY:[]};
  CORE.forEach(q=>{const v=state.answers[q.questionId];if(['0','1','2','3','4'].includes(v))buckets[q.domain].push(Number(v));});
  const out={};Object.entries(buckets).forEach(([k,a])=>out[k]=a.length?a.reduce((x,y)=>x+y,0)/a.length:0);return out;
}
function reflectionValue(fragment){const q=REFLECTION.find(x=>x.text.includes(fragment));return q?String(state.answers[q.questionId]||'').trim():'';}
function adaptiveValue(fragment){const q=ADAPTIVE.find(x=>x.text.includes(fragment));return q?String(state.answers[q.questionId]||'').trim():'';}
function buildAnalysis(){
  const s=axisScores(),order=Object.entries(s).sort((a,b)=>b[1]-a[1]),top=order[0],second=order[1];
  const problem=reflectionValue('今一番困っていること'),burden=reflectionValue('最近増えた負担'),selfCause=reflectionValue('自分で考える原因'),change=reflectionValue('今すぐ変えたいこと')||reflectionValue('今できること'),protect=reflectionValue('変えたくないこと')||reflectionValue('一番失いたくないもの')||adaptiveValue('失いたくない');
  const numeric=CORE.filter(q=>['0','1','2','3','4'].includes(state.answers[q.questionId])).length;const written=Object.values(state.answers).filter(v=>typeof v==='string'&&v.trim()&&!['0','1','2','3','4','U','S'].includes(v)).length;const confidence=Math.min(94,48+numeric*1.5+Math.min(16,written*2));
  const a=domainLabel[top[0]],b=domainLabel[second[0]];
  return {
    structure:`回答では「${a}」の負荷が最も高く、次に「${b}」が続いています。${problem?`現在の困りごとは「${problem}」として表れています。`:''}一つの原因だけでなく、複数の条件がつながって現在の状態を維持している可能性があります。`,
    cause:selfCause?`本人が原因として挙げているのは「${selfCause}」です。これに「${a}」の負荷が重なっている可能性があります。`:burden?`最近増えた負担として「${burden}」が挙げられています。特に「${a}」との接続を確認する必要があります。`:`現時点では「${a}」が中心候補です。ただし、起点なのか結果なのかは追加観測が必要です。`,
    maintain:`「${a}」の負荷が高まることで「${b}」にも影響し、対応余力が減ることで元の負荷を下げにくくしている可能性があります。`,
    bottleneck:`現時点の中心候補は「${a}」です。単独の点数ではなく「${b}」との接続部分を優先して確認します。`,
    loop:`${a}の負荷が上がる → ${b}へ影響する → 対応余力が減る → ${a}の負荷を下げにくくなる、という循環が仮説として考えられます。`,
    hypotheses:`仮説A：${a}が起点になっている。\n仮説B：${b}の変化が先に起こり、${a}へ波及している。\n仮説C：外部条件の変化が両方を同時に押し上げている。`,
    evidence:`CORE SCANでは、${a}=${top[1].toFixed(2)}、${b}=${second[1].toFixed(2)}でした。自由記述と適応質問の回答を補助根拠として統合しています。`,
    counter:`この結果は診断ではなく、回答から作った構造仮説です。数値だけでは出来事の順序や例外を確定できません。うまくいった日の違いを追加で確認すると精度が上がります。`,
    protect:protect?`守りたいものとして「${protect}」が挙げられています。見直す際はこれを損なわないことを前提にします。`:`守りたいもの・すでに使える支えは、次の観測で追加確認する必要があります。`,
    leverage:change?`最初の介入候補は「${change}」です。大きく変えるより、他の領域へ影響しやすい一か所から試すのが適しています。`:`最初は「${a}」の負荷を直接下げる小さな変更から試し、他の領域がどう動くかを確認するのが適しています。`,
    intervention:`優先1：${a}の負荷源を一つ減らす。\n優先2：${b}への波及を弱める条件を作る。\n優先3：変化後に楽になった点・悪化した点を短期観測し、仮説を更新する。`,
    confidence:`現時点の確からしさは約${Math.round(confidence)}%です。断定ではなく、追加観測で更新する前提です。`,
    observe:`次に確認したいのは「${a}の負荷が動く直前に何があるか」と「負荷が低かった日に何が違ったか」です。`
  };
}

function renderReview(){show('review');const a=stageQuestionsFor('ADAPTIVE');const counts=[['CORE',CORE],['ADAPTIVE',a],['EVENT TRACE',state.eventTraceUsed?EVENT_TRACE:[]],['REFLECTION',REFLECTION]];$('#reviewGrid').innerHTML=counts.map(([label,list])=>`<div><span>${label}</span><strong>${list.filter(q=>state.answers[q.questionId]!==undefined).length} / ${list.length}</strong></div>`).join('');$('#submitBtn').onclick=()=>{state.outputId=state.outputId||`OUT-${dateStamp()}-${randomHex(4)}`;state.analysis=buildAnalysis();state.stage='COMPLETE';state.status='分析完了';persist();renderDone();};}
function renderDone(){show('done');$('#doneId').textContent=state.lraId;$('#doneStatus').textContent=state.status;$('#resultBtn').onclick=renderResult;}
function renderResult(){show('result');const box=$('#resultBody');$('#resultStatus').textContent=state.status;const a=state.analysis||{};const fields=[['structure','今の状況と全体のつながり'],['cause','主な原因として考えられること'],['maintain','状況が続いている理由'],['bottleneck','今いちばん負担になっている部分'],['loop','負担が続いている流れ'],['hypotheses','考えられる可能性'],['evidence','そう考える根拠'],['counter','当てはまらない点・まだ分からないこと'],['protect','守りたいもの・すでにある支え'],['leverage','最初に見直すと動きやすいところ'],['intervention','次に試せることと優先順位'],['confidence','この見立ての確からしさ'],['observe','もう少し確認したいこと']];const shown=fields.filter(([k])=>a[k]);box.innerHTML=shown.length?shown.map(([k,l])=>`<section class="result-section"><span>${l}</span><p>${escapeHtml(a[k])}</p></section>`).join(''):'<p class="muted">まだ分析結果がありません。</p>';}
function renderState(){if(state.stage==='INTRO')renderIntro();else if(['CORE','ADAPTIVE','EVENT_TRACE','REFLECTION'].includes(state.stage))renderQuestion();else if(state.stage==='EVENT_CHECK')renderEventCheck();else if(state.stage==='REVIEW')renderReview();else if(state.stage==='COMPLETE')renderDone();else renderIntro();}

$('#plansBtn').onclick=()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth',block:'start'});
if($('#homeStartBtn'))$('#homeStartBtn').onclick=()=>beginPlan('FREE');
$('#startBtn').onclick=()=>{if(!$('#consent').checked){alert('内容を確認し、チェックを入れてください。');return;}state.stage='CORE';state.index=0;state.status='回答中';persist();renderQuestion();};
$('#reloadResultBtn').onclick=renderResult;
renderPlans();show('home');
