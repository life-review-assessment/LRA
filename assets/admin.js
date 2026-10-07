import { buildAnalysisPrompt } from './analysis-handoff.js';

const stateKey='lra.state.1.3';
const historyKey='lra.history.1.3';
const $=s=>document.querySelector(s);
let rows=loadRows();
let selected=null;

function loadRows(){
  let history=[];try{history=JSON.parse(localStorage.getItem(historyKey)||'[]');}catch{}
  let current=null;try{current=JSON.parse(localStorage.getItem(stateKey)||'null');}catch{}
  const map=new Map();
  for(const row of history){const key=row.key||`${row.lraId}:${row.analysisCount||1}`;map.set(key,{...row,key});}
  if(current?.lraId){const key=`${current.lraId}:${current.analysisCount||1}`;map.set(key,{key,userId:current.userId||null,lraId:current.lraId,analysisCount:Number(current.analysisCount||1),outputId:current.outputId||null,planCode:current.planCode||null,status:current.status||'受付',savedAt:current.savedAt||null,analysisPacket:current.analysisPacket||null,analysis:current.analysis||null});}
  return[...map.values()].sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));
}
function persistRows(){localStorage.setItem(historyKey,JSON.stringify(rows));}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function status(t,bad=false){const el=$('#adminStatus');el.textContent=t;el.style.color=bad?'#7b2c2c':'';}
function renderList(){
  const box=$('#recordList');
  if(!rows.length){box.innerHTML='<div class="admin-empty">この端末には記録がありません。</div>';return;}
  box.innerHTML=rows.map(r=>`<button class="admin-row ${selected===r.key?'active':''}" data-key="${esc(r.key)}"><small>${esc(r.savedAt||'')}</small><b>${esc(r.lraId||'')}</b><span>${esc(r.status||'')} / 分析${esc(r.analysisCount||1)}回目</span></button>`).join('');
  box.onclick=e=>{const b=e.target.closest('[data-key]');if(b)selectRow(b.dataset.key);};
}
function selectRow(key){
  selected=key;const r=rows.find(x=>x.key===key);if(!r)return;
  $('#detailEmpty').classList.add('hidden-admin');$('#detail').classList.remove('hidden-admin');
  $('#dLraId').textContent=r.lraId||'';$('#dUserId').textContent=r.userId||'';$('#dCount').textContent=String(r.analysisCount||1);$('#dStatus').textContent=r.status||'';$('#dOutputId').textContent=r.outputId||'';$('#dSaved').textContent=r.savedAt||'';
  $('#payload').value=JSON.stringify(r.analysis||r.analysisPacket||{},null,2);
  renderList();status('');
}
function current(){return rows.find(x=>x.key===selected)||null;}
async function copyText(value,label){try{await navigator.clipboard.writeText(String(value??''));status(`${label}をコピーしました。`);}catch{status('コピーできませんでした。',true);}}
async function copyJson(value,label){return copyText(JSON.stringify(value||{},null,2),label);}
function download(name,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function saveResult(){
  const r=current();if(!r)return;
  let parsed;try{parsed=JSON.parse($('#payload').value);}catch{status('JSON形式を確認してください。',true);return;}
  r.analysis=parsed;r.status='分析結果確定';r.savedAt=new Date().toISOString();persistRows();selectRow(r.key);status('レビュー済み分析結果を保存しました。');
}
function exportReviewedResult(){
  const r=current();if(!r){status('記録を選択してください。',true);return;}
  if(!r.analysis){status('分析結果を保存してから書き出してください。',true);return;}
  const pkg={kind:'LRA_REVIEWED_RESULT',schemaVersion:'LRA-REVIEWED-RESULT-1.0',userId:r.userId||null,lraId:r.lraId,analysisCount:Number(r.analysisCount||1),outputId:r.outputId||null,planCode:r.planCode||null,status:'分析結果確定',reviewedAt:new Date().toISOString(),analysis:r.analysis};
  download(`${r.lraId}_A${r.analysisCount||1}_result.json`,pkg);status('利用者へ返す分析結果を書き出しました。');
}
function setRecordStatus(value){const r=current();if(!r)return;r.status=value;r.savedAt=new Date().toISOString();persistRows();selectRow(r.key);status(`状態を「${value}」に更新しました。`);}
function importRows(file){
  const reader=new FileReader();reader.onload=()=>{try{const incoming=JSON.parse(String(reader.result||''));const list=Array.isArray(incoming)?incoming:[incoming];for(const item of list){const packet=item.analysisPacket||item.packet||((item.schemaVersion&&item.lraId&&item.answers)?item:null);if(!packet&&!item.lraId)continue;const lraId=item.lraId||packet.lraId;const analysisCount=Number(item.analysisCount||packet.analysisCount||1);const key=`${lraId}:${analysisCount}`;const next={key,userId:item.userId||packet?.userId||null,lraId,analysisCount,outputId:item.outputId||packet?.outputId||null,planCode:item.planCode||packet?.planCode||null,status:item.status||'分析待ち',savedAt:item.savedAt||packet?.observedAt||new Date().toISOString(),analysisPacket:packet||item.analysisPacket||null,analysis:item.analysis||null};const i=rows.findIndex(x=>x.key===key);if(i>=0)rows[i]={...rows[i],...next};else rows.push(next);}rows.sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));persistRows();renderList();status('記録を読み込みました。');}catch{status('読み込みファイルを確認してください。',true);}};reader.readAsText(file);
}

$('#copyPromptBtn').onclick=()=>{const r=current();if(!r?.analysisPacket){status('分析パケットがありません。',true);return;}copyText(buildAnalysisPrompt(r.analysisPacket),'ChatGPT分析依頼');};
$('#copyPacketBtn').onclick=()=>{const r=current();if(r)copyJson(r.analysisPacket,'分析パケット');};
$('#copyResultBtn').onclick=()=>{const r=current();if(r)copyJson(r.analysis,'分析結果');};
$('#exportResultBtn').onclick=exportReviewedResult;
$('#exportAllBtn').onclick=()=>download(`LRA_ADMIN_EXPORT_${new Date().toISOString().slice(0,10)}.json`,rows);
$('#importFile').onchange=e=>{const f=e.target.files?.[0];if(f)importRows(f);e.target.value='';};
$('#saveResultBtn').onclick=saveResult;
$('#markReviewBtn').onclick=()=>setRecordStatus('レビュー待ち');
$('#markCompleteBtn').onclick=()=>setRecordStatus('完了');
renderList();
