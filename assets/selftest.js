import {PLANS,OPTIONS,CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,QUESTION_DB_VERSION,PACKET_VERSION} from './questions.js';
import {SHORT_TERM_OBSERVATION} from './short-term.js';
import {LRA_CANON} from './lra-canon.js';
import {LEGACY_CANON} from './legacy-canon.js';
import {LEGACY_14_SHEETS} from './legacy-sheet-schema.js';
import {LEGACY_REPORT_ASSETS} from './legacy-report-assets.js';

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
  add('Legacy five axes retained',LEGACY_CANON.axes.length===5&&LEGACY_CANON.axes.map(x=>x.name).join('/')==='行動/判断/環境/感情/回復',LEGACY_CANON.axes.map(x=>`${x.name}=${x.definition}`).join(' / '));
  add('Legacy TYPE 8+T99 retained',LEGACY_CANON.types.length===9&&LEGACY_CANON.types.at(-1)?.code==='T99',LEGACY_CANON.types.map(x=>`${x.code}:${x.name}`).join(' / '));
  add('Legacy TAG22 retained',LEGACY_CANON.tagCategories.length===22,LEGACY_CANON.tagCategories.join(' / '));
  add('Legacy PT01-06 retained without invented triggers',LEGACY_CANON.patterns.length===6&&LEGACY_CANON.patternRule.includes('未凍結'),LEGACY_CANON.patterns.map(x=>`${x.code}:${x.name}`).join(' / '));
  add('Legacy real 40 questions retained',LEGACY_CANON.oldQuestion40.items.length===40&&LEGACY_CANON.oldQuestion40.version==='phase1.0',String(LEGACY_CANON.oldQuestion40.items.length));
  add('Legacy frozen 25 questions retained',LEGACY_CANON.oldQuestion25.items.length===25&&LEGACY_CANON.oldQuestion25.scale.length===5,String(LEGACY_CANON.oldQuestion25.items.length));
  add('Reflection generation difference retained',LEGACY_CANON.reflectionGenerations.current8==='今できること'&&LEGACY_CANON.reflectionGenerations.legacyJune8==='今後手に入れたいもの',LEGACY_CANON.reflectionGenerations.rule);
  add('Legacy specialist/safety retained',LEGACY_CANON.specialistLegacy.bands.length===4&&LEGACY_CANON.specialistLegacy.currentSafetyRule.includes('単語1つで機械確定せず'),'legacy priority + current context rule');
  add('Legacy 14-sheet names retained',Object.keys(LEGACY_14_SHEETS.sheets).length===14,Object.keys(LEGACY_14_SHEETS.sheets).join(' / '));
  add('Legacy 14-sheet common columns retained',LEGACY_14_SHEETS.common.length===7,LEGACY_14_SHEETS.common.join(' / '));
  add('Legacy status and review codes retained',LEGACY_14_SHEETS.stateCodes.length===8&&LEGACY_14_SHEETS.reviewCodes.length===3,'ST01-ST07/ST99 + R01-R03');
  add('Legacy report generations retained',LEGACY_REPORT_ASSETS.fivePart.length===5&&Object.keys(LEGACY_REPORT_ASSETS.lateP1P4).length===4,'5部 + P1-P4');

  const [index,main,engine,manifest,sw,account,resultHandoff]=await Promise.all([
    get('./index.html'),get('./assets/main-canonical.js'),get('./assets/analysis-engine.js'),get('./manifest.json'),get('./sw.js'),get('./assets/account-gate.js'),get('./assets/result-handoff.js')
  ]);
  add('Public UI has no admin link',!index.includes('admin.html'),'index.html');
  add('Public deployment has no admin route',!(await exists('./admin.html')),'admin.html must not be public');
  add('Approved customer runtime active',index.includes('./assets/main-canonical.js')&&!index.includes('src="./assets/main.js"'),'main-canonical.js');
  add('Local user login active',index.includes('./assets/account-gate.js')&&account.includes('provisionalUserId'),'persistent first-login user ID');
  add('Submission handoff active',index.includes('./assets/handoff-ui.js')&&index.includes('shareSubmissionBtn'),'handoff-ui.js');
  add('Reviewed result return active',index.includes('./assets/result-handoff.js')&&index.includes('resultImportBtn'),'result-handoff.js');
  add('Result belongs to exact analysis round',resultHandoff.includes('ANALYSIS_COUNT_MISMATCH')&&resultHandoff.includes('OUTPUT_ID_MISMATCH'),'user/LRA/analysis/output validation');
  add('Short-term reanalysis UI active',index.includes('./assets/short-term-ui.js')&&index.includes('shortTermBtn'),'short-term-ui.js');
  add('PWA registration active',index.includes('./assets/pwa.js')&&manifest.includes('"display": "standalone"')&&sw.includes("const CACHE='lra-static-v1.2.0'"),'manifest + service worker');
  add('Adaptive trigger exact',main.includes("['3','4','U','S'].includes")&&main.includes("q.domain==='CROSS'?0.35:0")&&main.includes("q.type==='PROTECT'?0.15:0")&&main.includes("q.type==='COMPARE'?0.10:0"),'3/4/U/S + 0.35/0.15/0.10');
  add('Adaptive caps exact',main.includes('out.length>=14')&&main.includes("counts[d]||0)>=4")&&main.includes("filter(q=>q.domain==='CROSS').slice(0,3)"),'max14 / per-domain4 / CROSS3');
  add('Resume after reload',main.includes("if(state.stage&&state.stage!=='INTRO')renderState()"),'renderState resume');
  add('New output ID on reanalysis',main.includes("state.outputId=`OUT-")&&main.includes('state.outputId=null;state.analysisPacket=null;state.analysis=null'),'new output ID');
  add('Local heuristic final inference disabled',engine.includes('LOCAL_INFERENCE_DISABLED_BY_LRA_CANON')&&!main.includes('function buildAnalysis('),'external inference only');
  const forbidden=[/supabase/i,/netlify/i,/price\s*[:=]\s*1500\b/,/price\s*[:=]\s*5500\b/,/price\s*[:=]\s*10000\b/,/price\s*[:=]\s*15000\b/,/price\s*[:=]\s*30000\b/];
  const scan=index+main+account+resultHandoff;
  add('No prohibited backend or stale-price remnants in public runtime',forbidden.every(r=>!r.test(scan)),'public runtime scan');
  add('Legal pages exist',await exists('./terms.html')&&await exists('./privacy.html')&&await exists('./legal.html'),'terms/privacy/legal');
  add('Provided logo asset exists',await exists('./lra-brand.png'),'lra-brand.png');

  add('Owner-email server authentication',false,'STATIC_ONLY: server-side identity verification requires an explicitly authorized authentication backend.');
  add('Central automatic multi-user storage',false,'STATIC_ONLY: receiving/storing records from different customer devices requires an explicitly authorized backend.');
  add('Paid-plan payment execution',false,'PAYMENT_NOT_CONNECTED: a live payment provider connection is required.');
}catch(e){add('Self-test execution',false,e.message||String(e));}

const rows=document.getElementById('rows');
rows.innerHTML=tests.map(t=>`<div class="row"><div class="${t.ok?'pass':'fail'}">${t.ok?'PASS':'BLOCK'}</div><div><b>${t.name}</b>${t.detail?`<div style="margin-top:5px;color:#777268;font-size:12px;line-height:1.6">${String(t.detail).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</div>`:''}</div></div>`).join('');
const pass=tests.filter(x=>x.ok).length,blocked=tests.length-pass;
document.getElementById('summary').textContent=`${pass} PASS / ${blocked} BLOCK — ${blocked===0?'100%':'未完了項目あり'}`;
