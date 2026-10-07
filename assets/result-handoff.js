const input=document.getElementById('resultImportFile');
const button=document.getElementById('resultImportBtn');

function setMessage(text,bad=false){
  const host=document.querySelector('[data-view="result"] .syncState')||document.getElementById('resultImportStatus');
  if(host){host.textContent=text;host.classList.toggle('bad',bad);}
}
function readJson(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{try{resolve(JSON.parse(String(r.result||'')));}catch(e){reject(e);}};r.onerror=reject;r.readAsText(file);});}
async function importResult(file){
  try{
    const pkg=await readJson(file);
    if(pkg?.kind!=='LRA_REVIEWED_RESULT'||!pkg.analysis)throw new Error('INVALID_PACKAGE');
    const current=window.LRA_RUNTIME?.getState?.();
    if(!current)throw new Error('NO_STATE');
    if(pkg.lraId!==current.lraId)throw new Error('LRA_ID_MISMATCH');
    if(pkg.userId&&current.userId&&pkg.userId!==current.userId)throw new Error('USER_ID_MISMATCH');
    window.LRA_RUNTIME.applyReviewedAnalysis(pkg.analysis);
    setMessage('分析結果を読み込みました。');
  }catch(e){
    const message=e?.message==='LRA_ID_MISMATCH'?'このLRA-IDの結果ではありません。':e?.message==='USER_ID_MISMATCH'?'この利用者の結果ではありません。':'分析結果ファイルを確認してください。';
    setMessage(message,true);
  }
}
if(button&&input){button.addEventListener('click',()=>input.click());input.addEventListener('change',async()=>{const f=input.files?.[0];if(f)await importResult(f);input.value='';});}
