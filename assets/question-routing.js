const DOMAIN_ORDER=['ACTION','JUDGMENT','ENVIRONMENT','EMOTION','RECOVERY'];

const PREMISE_CORE_IDS=Object.freeze({
  'LRA-ADP-ACTION-01':['LRA-CORE-ACTION-01'],
  'LRA-ADP-ACTION-02':['LRA-CORE-ACTION-01'],
  'LRA-ADP-ACTION-03':['LRA-CORE-ACTION-02'],
  'LRA-ADP-ACTION-05':['LRA-CORE-ACTION-04'],
  'LRA-ADP-ENVIRONMENT-03':['LRA-CORE-ENVIRONMENT-01'],
  'LRA-ADP-EMOTION-01':['LRA-CORE-EMOTION-01'],
  'LRA-ADP-EMOTION-02':['LRA-CORE-EMOTION-01'],
  'LRA-ADP-EMOTION-03':['LRA-CORE-EMOTION-01'],
  'LRA-ADP-EMOTION-04':['LRA-CORE-EMOTION-01'],
  'LRA-ADP-RECOVERY-01':['LRA-CORE-RECOVERY-01'],
  'LRA-ADP-RECOVERY-02':['LRA-CORE-RECOVERY-01'],
  'LRA-ADP-RECOVERY-03':['LRA-CORE-RECOVERY-01'],
  'LRA-ADP-RECOVERY-04':['LRA-CORE-RECOVERY-03']
});

const SUPPRESS_ON_PREFER_NOT=Object.freeze({
  'LRA-ADP-ACTION-01':['LRA-CORE-ACTION-01'],
  'LRA-ADP-ACTION-02':['LRA-CORE-ACTION-01'],
  'LRA-ADP-ACTION-03':['LRA-CORE-ACTION-02'],
  'LRA-ADP-ACTION-05':['LRA-CORE-ACTION-04'],
  'LRA-ADP-JUDGMENT-02':['LRA-CORE-JUDGMENT-02'],
  'LRA-ADP-ENVIRONMENT-01':['LRA-CORE-ENVIRONMENT-01'],
  'LRA-ADP-ENVIRONMENT-03':['LRA-CORE-ENVIRONMENT-01'],
  'LRA-ADP-EMOTION-01':['LRA-CORE-EMOTION-01'],
  'LRA-ADP-EMOTION-02':['LRA-CORE-EMOTION-01'],
  'LRA-ADP-EMOTION-03':['LRA-CORE-EMOTION-01'],
  'LRA-ADP-EMOTION-04':['LRA-CORE-EMOTION-01'],
  'LRA-ADP-EMOTION-05':['LRA-CORE-EMOTION-04'],
  'LRA-ADP-RECOVERY-01':['LRA-CORE-RECOVERY-01'],
  'LRA-ADP-RECOVERY-02':['LRA-CORE-RECOVERY-01'],
  'LRA-ADP-RECOVERY-03':['LRA-CORE-RECOVERY-01'],
  'LRA-ADP-RECOVERY-04':['LRA-CORE-RECOVERY-03']
});

function present(v){return !(v===undefined||v===null||v===''||(Array.isArray(v)&&v.length===0));}
function optionFor(q,v){return(q?.options||[]).find(o=>String(o.value)===String(v));}
function responseState(q,v){
  if(!present(v))return'UNANSWERED';
  if(Array.isArray(v)){
    if(v.length!==1)return'ANSWER';
    return optionFor(q,v[0])?.responseState||'ANSWER';
  }
  return optionFor(q,v)?.responseState||(q?.specialResponses||[]).find(o=>String(o.value)===String(v))?.responseState||'ANSWER';
}
function routingSignal(q,answers){
  const v=answers?.[q.questionId];if(!present(v))return null;
  const o=optionFor(q,v);if(!o||o.responseState)return null;
  return Number.isFinite(o.routingSignal)?o.routingSignal:null;
}

export function sanitizeQuestionAnswer(q,v){
  if(!present(v))return q?.answerType==='multi_choice'?[]:'';
  const options=q?.options||[];
  if(q?.answerType==='single_choice'){
    if(Array.isArray(v))return'';
    const found=options.find(o=>String(o.value)===String(v));
    return found?found.value:'';
  }
  if(q?.answerType==='multi_choice'){
    if(!Array.isArray(v))return[];
    const selected=[];
    for(const o of options){if(v.some(x=>String(x)===String(o.value)))selected.push(o.value);}
    const exclusive=selected.filter(x=>optionFor(q,x)?.exclusive);
    if(exclusive.length)return selected.length===1&&exclusive.length===1?[exclusive[0]]:[];
    return selected;
  }
  if(typeof v!=='string')return'';
  const text=v.trim();if(!text)return'';
  const special=(q?.specialResponses||[]).find(x=>String(x.value)===text);
  if(special)return special.value;
  const max=q?.answerType==='text_long'?400:160;
  return text.slice(0,max);
}

export function sanitizeAnswerMap(questions,answers){
  const out={...(answers||{})},corruptedIds=[];
  for(const q of questions||[]){
    if(!Object.prototype.hasOwnProperty.call(out,q.questionId))continue;
    const before=out[q.questionId],after=sanitizeQuestionAnswer(q,before);
    if(JSON.stringify(before)!==JSON.stringify(after))corruptedIds.push(q.questionId);
    if(!present(after))delete out[q.questionId];else out[q.questionId]=after;
  }
  return{answers:out,corruptedIds};
}

export function computeAdaptiveQuestionIds(core,adaptive,answers){
  const coreById=new Map((core||[]).map(q=>[q.questionId,q]));
  const coreSignal=new Map((core||[]).map(q=>[q.questionId,routingSignal(q,answers)]));
  const stateFor=id=>{const q=coreById.get(id);return q?responseState(q,answers?.[id]):'UNANSWERED';};
  const active=id=>(coreSignal.get(id)??-1)>=2;
  const domainStats={};
  for(const d of DOMAIN_ORDER){const rows=(core||[]).filter(q=>q.domain===d).map(q=>coreSignal.get(q.questionId)).filter(Number.isFinite);const hits=rows.filter(x=>x>=2);domainStats[d]={max:hits.length?Math.max(...hits):0,count:hits.length};}
  const budgets={};
  for(const d of DOMAIN_ORDER){const s=domainStats[d];let b=s.max<=1?0:s.max===2?2:s.max===3?3:4;if(s.count>=2)b=Math.min(4,b+1);budgets[d]=b;}
  const queues={};
  for(const d of DOMAIN_ORDER){
    queues[d]=(adaptive||[]).map((q,order)=>({q,order})).filter(x=>x.q.domain===d).map(x=>{
      const suppressed=(SUPPRESS_ON_PREFER_NOT[x.q.questionId]||[]).some(id=>stateFor(id)==='PREFER_NOT');
      const premise=PREMISE_CORE_IDS[x.q.questionId]||[];
      const premiseMet=!premise.length||premise.some(active);
      const activeParents=(x.q.parentCoreIds||[]).filter(active);
      const max=activeParents.length?Math.max(...activeParents.map(id=>coreSignal.get(id))):0;
      return{...x,suppressed,premiseMet,activeParents,max};
    }).filter(x=>!x.suppressed&&x.premiseMet&&x.activeParents.length>0).sort((a,b)=>b.max-a.max||b.activeParents.length-a.activeParents.length||a.order-b.order);
  }
  const activeDomains=DOMAIN_ORDER.filter(d=>budgets[d]>0).sort((a,b)=>domainStats[b].max-domainStats[a].max||DOMAIN_ORDER.indexOf(a)-DOMAIN_ORDER.indexOf(b));
  const out=[],counts={};
  const nonCrossCap=activeDomains.length>=2?12:14;
  let progressed=true;
  while(out.length<nonCrossCap&&progressed){progressed=false;for(const d of activeDomains){if(out.length>=nonCrossCap)break;if((counts[d]||0)>=budgets[d])continue;const next=queues[d].shift();if(!next)continue;out.push(next.q.questionId);counts[d]=(counts[d]||0)+1;progressed=true;}}
  if(activeDomains.length>=2&&out.length<14){
    const globalMax=Math.max(...activeDomains.map(d=>domainStats[d].max));
    const cross=[];
    const first=activeDomains.length>=3?'LRA-ADP-CROSS-02':'LRA-ADP-CROSS-01';cross.push(first);
    const envTime=active('LRA-CORE-ENVIRONMENT-02'),help=active('LRA-CORE-ENVIRONMENT-04');
    if(activeDomains.includes('ENVIRONMENT')&&(envTime||help))cross.push('LRA-ADP-CROSS-05');
    else if(activeDomains.includes('ENVIRONMENT')||activeDomains.includes('RECOVERY'))cross.push('LRA-ADP-CROSS-04');
    else if(globalMax>=3)cross.push('LRA-ADP-CROSS-03');
    else if(first!=='LRA-ADP-CROSS-01')cross.push('LRA-ADP-CROSS-01');
    for(const id of cross){if(out.length>=14)break;if(!out.includes(id)&&(adaptive||[]).some(q=>q.questionId===id))out.push(id);}
  }
  return out;
}

export const QUESTION_ROUTING_RULES=Object.freeze({premiseCoreIds:PREMISE_CORE_IDS,suppressOnPreferNot:SUPPRESS_ON_PREFER_NOT,maxAdaptive:14,maxCross:2});
