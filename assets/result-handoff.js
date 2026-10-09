const input=document.getElementById('resultImportFile');
const button=document.getElementById('resultImportBtn');
const REQUIRED=['currentStructure','bottleneck','chainLoop','hypotheses','evidence','counterUncertainty','functionalParts','protect','resources','leverage','interventions','topPriority','confidence','additionalObservation'];

function setMessage(text,bad=false){
  const host=document.querySelector('[data-view="result"] .syncState')||document.getElementById('resultImportStatus');
  if(host){host.textContent=text;host.classList.toggle('bad',bad);}
}
function readJson(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{try{resolve(JSON.parse(String(r.result||'')));}catch(e){reject(e);}};r.onerror=reject;r.readAsText(file);});}
function validAnalysis(a){return a&&typeof a==='object'&&REQUIRED.every(k=>Object.prototype.hasOwnProperty.call(a,k))&&['HIGH','MEDIUM','LOW','INSUFFICIENT'].includes(a.confidence);}
async function importResult(file){
  try{
    const pkg=await readJson(file);
    if(pkg?.kind!=='LRA_REVIEWED_RESULT'||!validAnalysis(pkg.analysis))throw new Error('INVALID_PACKAGE');
    const current=window.LRA_RUNTIME?.getState?.();
    if(!current)throw new Error('NO_STATE');
    if(pkg.lraId!==current.lraId)throw new Error('LRA_ID_MISMATCH');
    if(pkg.userId&&current.userId&&pkg.userId!==current.userId)throw new Error('USER_ID_MISMATCH');
    if(Number(pkg.analysisCount||1)!==Number(current.analysisCount||1))throw new Error('ANALYSIS_COUNT_MISMATCH');
    if(pkg.outputId&&current.outputId&&pkg.outputId!==current.outputId)throw new Error('OUTPUT_ID_MISMATCH');
    window.LRA_RUNTIME.applyReviewedAnalysis(pkg.analysis);
    setMessage('分析結果を読み込みました。');
  }catch(e){
    const m={LRA_ID_MISMATCH:'このLRA-IDの結果ではありません。',USER_ID_MISMATCH:'この利用者の結果ではありません。',ANALYSIS_COUNT_MISMATCH:'今回の分析回数と一致しない結果です。',OUTPUT_ID_MISMATCH:'今回の出力IDと一致しない結果です。'};
    setMessage(m[e?.message]||'分析結果ファイルの形式を確認してください。',true);
  }
}
if(button&&input){button.addEventListener('click',()=>input.click());input.addEventListener('change',async()=>{const f=input.files?.[0];if(f)await importResult(f);input.value='';});}
