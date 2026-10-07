import { LRA_CANON } from './lra-canon.js';

const JP={ACTION:'行動',JUDGMENT:'判断',ENVIRONMENT:'環境',EMOTION:'感情',RECOVERY:'回復',CROSS:'全体'};
const isNum=v=>['0','1','2','3','4'].includes(String(v));
const str=v=>Array.isArray(v)?v.join('、'):String(v??'').trim();
const get=(answers,list,fragment)=>{const q=list.find(x=>x.text.includes(fragment));return q?str(answers[q.questionId]):'';};

function axisObservation(answers,CORE){
  const b={ACTION:[],JUDGMENT:[],ENVIRONMENT:[],EMOTION:[],RECOVERY:[]};
  CORE.forEach(q=>{const v=answers[q.questionId];if(isNum(v))b[q.domain].push(Number(v));});
  return Object.fromEntries(Object.entries(b).map(([k,a])=>[k,{mean:a.length?a.reduce((x,y)=>x+y,0)/a.length:null,observed:a.length,high:a.filter(v=>v>=3).length}]));
}
function timeline(answers,EVENT_TRACE){
  const phases=['EVENT','TIME','IMMEDIATE_CHANGE','BEHAVIOR_JUDGMENT_CHANGE','LOSS_OR_PROTECTION','PAST_SIMILARITY','COUNTERFACTUAL','REMAINING_EFFECT'];
  return EVENT_TRACE.map((q,i)=>({phase:phases[i],value:str(answers[q.questionId])})).filter(x=>x.value);
}
function evidenceNodes(answers,lists){
  return lists.flat().filter(q=>answers[q.questionId]!==undefined).map(q=>({questionId:q.questionId,stage:q.stage,type:q.type||'FACT',domain:q.domain||'CROSS',timeRange:q.timeRange||null,value:str(answers[q.questionId]),source:'USER_RESPONSE'}));
}
function confidence(support,counter,missing){
  if(support===0)return 'INSUFFICIENT';
  const x=support*2-counter*2-missing;
  if(support>=3&&x>=5)return 'HIGH';
  if(support>=2&&x>=2)return 'MEDIUM';
  return 'LOW';
}
function makeHypothesis(id,claim,supportEvidence,counterEvidence,missingInformation){
  const support=supportEvidence.filter(Boolean),counter=counterEvidence.filter(Boolean),missing=missingInformation.filter(Boolean);
  const c=confidence(support.length,counter.length,missing.length);
  let status='NEW';
  if(counter.length>support.length)status='WEAKENED';
  else if(support.length>=2)status='SUPPORTED';
  else if(!support.length)status='UNRESOLVED';
  return{id,claim,supportEvidence:support,counterEvidence:counter,missingInformation:missing,confidence:c,status,alternativeHypothesisIds:[]};
}
function hypothesisSet(answers,axis,ADAPTIVE,EVENT_TRACE,REFLECTION){
  const ranked=Object.entries(axis).filter(([,v])=>v.mean!==null).sort((a,b)=>b[1].mean-a[1].mean);
  if(!ranked.length)return[];
  const a=ranked[0][0],b=(ranked[1]||ranked[0])[0];
  const problem=get(answers,REFLECTION,'今一番困っていること');
  const burden=get(answers,REFLECTION,'最近増えた負担');
  const selfCause=get(answers,REFLECTION,'自分で考える原因');
  const event=str(answers[EVENT_TRACE[0]?.questionId]);
  const immediate=str(answers[EVENT_TRACE[2]?.questionId]);
  const remaining=str(answers[EVENT_TRACE[7]?.questionId]);
  const exceptions=[get(answers,ADAPTIVE,'比較的動けた日'),get(answers,ADAPTIVE,'比較的決めやすかった時'),get(answers,ADAPTIVE,'一時的に良くなった日')].filter(Boolean);
  const h1=makeHypothesis('H1',`${JP[a]}の負荷が起点となり、${JP[b]}へ波及している可能性`,[axis[a].high?`${JP[a]}で高頻度回答${axis[a].high}件`:'' ,selfCause,problem],[exceptions[0]],[!event?'出来事の時間順序が不足':'']);
  const h2=makeHypothesis('H2',`${JP[b]}側の変化が先に起こり、${JP[a]}へ波及している可能性`,[axis[b].high?`${JP[b]}で高頻度回答${axis[b].high}件`:'' ,burden,immediate],[exceptions[1]],[!immediate?'最初に変化した要素が不足':'']);
  const h3=makeHypothesis('H3','外部の出来事・環境条件が複数領域を同時に動かしている可能性',[event,remaining,get(answers,ADAPTIVE,'外部事情で予定や判断が崩れた')],[exceptions[2]],[!event?'EVENT TRACEが不足':'']);
  h1.alternativeHypothesisIds=['H2','H3'];h2.alternativeHypothesisIds=['H1','H3'];h3.alternativeHypothesisIds=['H1','H2'];
  return[h1,h2,h3];
}
function protectionAndResources(answers,ADAPTIVE,REFLECTION){
  return{
    functionalParts:[get(answers,ADAPTIVE,'比較的動けた日'),get(answers,ADAPTIVE,'比較的決めやすかった時'),get(answers,ADAPTIVE,'負担が小さかった時'),get(answers,ADAPTIVE,'比較的回復できた日'),get(answers,ADAPTIVE,'一時的に良くなった日')].filter(Boolean),
    protect:[get(answers,REFLECTION,'変えたくないこと'),get(answers,REFLECTION,'一番失いたくないもの'),get(answers,ADAPTIVE,'失いたくない'),get(answers,ADAPTIVE,'変えずに残したい'),get(answers,ADAPTIVE,'残したい習慣')].filter(Boolean),
    resources:[get(answers,ADAPTIVE,'まだ十分使えていないもの'),get(answers,ADAPTIVE,'安心・楽しさ・落ち着き')].filter(Boolean)
  };
}
function interventions(answers,axis,ADAPTIVE,REFLECTION,hypotheses){
  const ranked=Object.entries(axis).filter(([,v])=>v.mean!==null).sort((a,b)=>b[1].mean-a[1].mean);
  const a=ranked[0]?.[0]||'CROSS',b=ranked[1]?.[0]||a;
  const change=get(answers,REFLECTION,'今すぐ変えたいこと')||get(answers,REFLECTION,'今できること');
  const cf=[get(answers,ADAPTIVE,'一つだけ障害を外せるなら'),get(answers,ADAPTIVE,'判断材料を一つ減らすなら'),get(answers,ADAPTIVE,'周囲の条件を一つだけ変えられるなら'),get(answers,ADAPTIVE,'影響を小さくできる条件'),get(answers,ADAPTIVE,'30分だけ余白を増やせるなら')].filter(Boolean);
  const best=hypotheses.find(h=>h.status==='SUPPORTED')||hypotheses[0];
  const conf=best?.confidence==='HIGH'?1:best?.confidence==='MEDIUM'?.75:.5;
  const raw=[
    {id:'I1',label:change||`${JP[a]}の負荷源を一つ小さくする`,expectedImpact:3,leverage:3,feasibility:change?3:2,confidence:conf,reversibility:3,cost:1,protectionRisk:0},
    {id:'I2',label:cf[0]||`${JP[a]}から${JP[b]}への波及を弱める条件を一つ試す`,expectedImpact:2,leverage:2,feasibility:2,confidence:conf,reversibility:3,cost:1,protectionRisk:0},
    {id:'I3',label:'今は変えず、短期観測で時間順序・例外・反証を確認する',expectedImpact:1,leverage:1,feasibility:3,confidence:1,reversibility:3,cost:1,protectionRisk:0}
  ];
  return raw.map(x=>({...x,score:(x.expectedImpact*x.leverage*x.feasibility*x.confidence*x.reversibility)/(x.cost+x.protectionRisk+1)})).sort((a,b)=>b.score-a.score).map((x,i)=>({...x,priority:i+1}));
}
function baseline(current,previous){
  if(!previous)return{status:'INITIAL',changes:[]};
  const changes=[];for(const k of Object.keys(current.axis)){const a=current.axis[k].mean,b=previous.axis?.[k]?.mean;if(a!==null&&b!==null&&b!==undefined)changes.push({domain:k,from:b,to:a,delta:+(a-b).toFixed(2)});}
  return{status:'UPDATED',changes,previousGeneratedAt:previous.generatedAt||null};
}

export function analyzeLRA(packet,{CORE,ADAPTIVE,EVENT_TRACE,REFLECTION},previousAnalysis=null){
  const answers=packet.rawAnswers||{};
  const axis=axisObservation(answers,CORE);
  const nodes=evidenceNodes(answers,[CORE,ADAPTIVE,EVENT_TRACE,REFLECTION]);
  const hypotheses=hypothesisSet(answers,axis,ADAPTIVE,EVENT_TRACE,REFLECTION);
  const ranked=Object.entries(axis).filter(([,v])=>v.mean!==null).sort((a,b)=>b[1].mean-a[1].mean);
  const top=ranked[0]?.[0]||null,second=ranked[1]?.[0]||null;
  const tl=timeline(answers,EVENT_TRACE);
  const pr=protectionAndResources(answers,ADAPTIVE,REFLECTION);
  const ints=interventions(answers,axis,ADAPTIVE,REFLECTION,hypotheses);
  const chain=top&&second?[{from:top,to:second,kind:'CHAIN',status:'HYPOTHESIS',basis:hypotheses[0]?.supportEvidence||[]}]:[];
  const loopEvidence=tl.filter(x=>['IMMEDIATE_CHANGE','REMAINING_EFFECT','PAST_SIMILARITY'].includes(x.phase));
  const loop=top&&second&&loopEvidence.length>=2?{nodes:[top,second],kind:'LOOP',status:'HYPOTHESIS',basis:loopEvidence}:null;
  const selfCause=get(answers,REFLECTION,'自分で考える原因');
  const contradictions=selfCause?[{kind:'SELF_RECOGNITION_NOT_CAUSAL_FACT',value:selfCause}]:[];
  const current={generatedAt:new Date().toISOString(),axis};
  const prior=previousAnalysis?.currentStructure?.axisObservation?{generatedAt:previousAnalysis.generatedAt,axis:previousAnalysis.currentStructure.axisObservation}:null;
  return{
    engineVersion:'LRA-STRUCTURE-ENGINE-1.0',
    generatedAt:current.generatedAt,
    canon:LRA_CANON,
    observationFacts:nodes,
    currentStructure:{axisObservation:axis,summary:'観測事実を構造ノードとして保持し、原因は仮説として分離する。'},
    bottleneck:top,
    chain,
    loop,
    hypotheses,
    evidence:hypotheses.flatMap(h=>h.supportEvidence.map(v=>({hypothesisId:h.id,value:v}))),
    counterEvidence:hypotheses.flatMap(h=>h.counterEvidence.map(v=>({hypothesisId:h.id,value:v}))),
    contradictions,
    exceptions:pr.functionalParts,
    timeline:tl,
    interactions:top&&second?[{nodes:[top,second],description:`${JP[top]}と${JP[second]}の接続を優先確認`}]:[],
    functionalParts:pr.functionalParts,
    protect:pr.protect,
    resources:pr.resources,
    leveragePoints:ints.map(x=>({id:x.id,label:x.label,score:x.score})),
    interventions:ints,
    topPriority:ints[0]||null,
    confidence:hypotheses.some(h=>h.confidence==='HIGH')?'HIGH':hypotheses.some(h=>h.confidence==='MEDIUM')?'MEDIUM':hypotheses.length?'LOW':'INSUFFICIENT',
    additionalObservation:['負荷が動く直前に何があったか','比較的うまくいった日の違い','主要仮説に反する事実があるか'],
    personalBaseline:baseline(current,prior),
    hypothesisUpdate:{mode:previousAnalysis?'RE_ANALYSIS':'INITIAL',states:hypotheses.map(h=>({id:h.id,status:h.status,confidence:h.confidence}))},
    safety:{diagnosis:false,simpleScoring:false,singleCauseAssertion:false,aiFinalDecision:false}
  };
}
