import {PLANS,OPTIONS,CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,QUESTION_DB_VERSION,PACKET_VERSION} from './questions.js';
import {SHORT_TERM_OBSERVATION} from './short-term.js';
import {LRA_CANON} from './lra-canon.js';

const tests=[];
const add=(name,ok,detail='')=>tests.push({name,ok:Boolean(ok),detail});
const get=async path=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`${path}: ${r.status}`);return r.text();};
const exists=async path=>{try{const r=await fetch(path,{cache:'no-store'});return r.ok;}catch{return false;}};

try{
  add('Question DB version',QUESTION_DB_VERSION==='lra-question-db-1.1.0',QUESTION_DB_VERSION);
  add('Packet version',PACKET_VERSION==='LRA-PACKET-1.1',PACKET_VERSION);
  add('CORE 20',CORE.length===20,String(CORE.length));
  add('ADAPTIVE 30',ADAPTIVE.length===30,String(ADAPTIVE.length));
  add('EVENT TRACE 8',EVENT_TRACE.length===8,String(EVENT_TRACE.length));
  add('REFLECTION 8',REFLECTION.length===8,String(REFLECTION.length));
  add('Short-term observation 4',SHORT_TERM_OBSERVATION.length===4,String(SHORT_TERM_OBSERVATION.length));
  const scale=CORE[0]?.options||[];
  add('CORE scale values',JSON.stringify(scale.map(x=>x.value))===JSON.stringify(['0','1','2','3','4','U','S']),scale.map(x=>`${x.value}:${x.label}`).join(' / '));
  add('CORE scale Japanese fit',scale[0]?.label==='一度もなかった'&&scale[4]?.label==='ほぼ毎日あった',scale.map(x=>x.label).join(' / '));
  add('Current pricing',JSON.stringify(PLANS.map(x=>x.price))===JSON.stringify([0,980,2980,5980,9800]),PLANS.map(x=>`${x.name}:${x.price}`).join(' / '));
  add('Current option pricing',JSON.stringify(OPTIONS.map(x=>x.price))===JSON.stringify(['1,980〜2,980円','2,980〜3,980円','1,980〜3,980円','980〜1,980円']),OPTIONS.map(x=>`${x.name}:${x.price}`).join(' / '));
  add('Canonical analysis components',LRA_CANON.analysis.length===17&&['CHAIN','LOOP','MULTIPLE HYPOTHESES','COUNTEREVIDENCE','CONTRADICTIONS','EXCEPTIONS','TIMELINE','INTERACTIONS','CONFIDENCE','PERSONAL BASELINE','RE-ANALYSIS'].every(x=>LRA_CANON.analysis.includes(x)),LRA_CANON.analysis.join(' / '));
  add('Canonical result order',LRA_CANON.outputOrder.length===14,LRA_CANON.outputOrder.join(' → '));
  add('Legacy assets retained',LRA_CANON.legacy?.typeCodes?.length===9&&LRA_CANON.legacy?.tagCount===22,LRA_CANON.legacy?.retained?.join(' / ')||'');

  const [index,main,admin,engine,manifest,sw]=await Promise.all([
    get('../index.html'),get('./main-canonical.js'),get('../admin.html'),get('./analysis-engine.js'),get('../manifest.json'),get('../sw.js')
  ]);
  add('Public UI has no admin link',!index.includes('admin.html'),'index.html');
  add('Approved customer runtime active',index.includes('./assets/main-canonical.js')&&!index.includes('src="./assets/main.js"'),'main-canonical.js');
  add('Local user login active',index.includes('./assets/account-gate.js'),'account-gate.js');
  add('Submission handoff active',index.includes('./assets/handoff-ui.js')&&index.includes('shareSubmissionBtn'),'handoff-ui.js');
  add('Reviewed result return active',index.includes('./assets/result-handoff.js')&&index.includes('resultImportBtn'),'result-handoff.js');
  add('Short-term reanalysis UI active',index.includes('./assets/short-term-ui.js')&&index.includes('shortTermBtn'),'short-term-ui.js');
  add('PWA registration active',index.includes('./assets/pwa.js')&&manifest.includes('"display": "standalone"')&&sw.includes("const CACHE='lra-static-v1.0.0'"),'manifest + service worker');
  add('Adaptive trigger exact',main.includes("['3','4','U','S'].includes")&&main.includes("q.domain==='CROSS'?0.35:0")&&main.includes("q.type==='PROTECT'?0.15:0")&&main.includes("q.type==='COMPARE'?0.10:0"),'3/4/U/S + 0.35/0.15/0.10');
  add('Adaptive caps exact',main.includes('out.length>=14')&&main.includes("counts[d]||0)>=4")&&main.includes("filter(q=>q.domain==='CROSS').slice(0,3)"),'max14 / per-domain4 / CROSS3');
  add('Resume after reload',main.includes("if(state.stage&&state.stage!=='INTRO')renderState()"),'renderState resume');
  add('New output ID on reanalysis',main.includes("state.outputId=`OUT-")&&main.includes('state.outputId=null;state.analysisPacket=null;state.analysis=null'),'new output ID');
  add('Local heuristic final inference disabled',engine.includes('LOCAL_INFERENCE_DISABLED_BY_LRA_CANON')&&!main.includes('function buildAnalysis('),'external inference only');
  add('Admin review workflow',admin.includes('copyPromptBtn')&&admin.includes('exportResultBtn')&&admin.includes('importFile'),'import → ChatGPT handoff → review → export');
  const forbidden=[/supabase/i,/netlify/i,/price\s*[:=]\s*1500\b/,/price\s*[:=]\s*5500\b/,/price\s*[:=]\s*10000\b/,/price\s*[:=]\s*15000\b/,/price\s*[:=]\s*30000\b/];
  const scan=index+main+admin;
  add('No prohibited/stale backend or old-price remnants',forbidden.every(r=>!r.test(scan)),'index/main/admin scan');
  add('Legal pages exist',await exists('../terms.html')&&await exists('../privacy.html')&&await exists('../legal.html'),'terms/privacy/legal');
  add('Provided logo asset exists',await exists('../lra-brand.png'),'lra-brand.png');

  add('Owner-email server authentication',false,'STATIC_ONLY: server-side identity verification requires an authorized authentication backend.');
  add('Central automatic multi-user storage',false,'STATIC_ONLY: remote shared storage requires an authorized backend.');
  add('Paid-plan payment execution',false,'PAYMENT_NOT_CONNECTED: an external payment provider must be explicitly authorized.');
}catch(e){add('Self-test execution',false,e.message||String(e));}

const rows=document.getElementById('rows');
rows.innerHTML=tests.map(t=>`<div class="row"><div class="${t.ok?'pass':'fail'}">${t.ok?'PASS':'BLOCK'}</div><div><b>${t.name}</b>${t.detail?`<div style="margin-top:5px;color:#777268;font-size:12px;line-height:1.6">${String(t.detail).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</div>`:''}</div></div>`).join('');
const pass=tests.filter(x=>x.ok).length,blocked=tests.length-pass;
document.getElementById('summary').textContent=`${pass} PASS / ${blocked} BLOCK — ${blocked===0?'100%':'未完了項目あり'}`;
