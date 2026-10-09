import { sendLraSubmission } from './submission-transport.js?v=20261009-server1';

function packetNow(){return window.LRA_RUNTIME?.getAnalysisPacket?.()||null;}
function stateNow(){return window.LRA_RUNTIME?.getState?.()||null;}
function doneView(){return document.querySelector('[data-view="done"]');}
function lead(){return doneView()?.querySelector('.lead')||null;}
function setReceivedCopy(){const view=doneView();const h=view?.querySelector('h2');const e=view?.querySelector('.eyebrow');if(e)e.textContent='RECEIVED';if(h)h.textContent='回答の受付が完了しました。';const el=lead();if(el){el.textContent='回答内容を管理側へ送信しています。';el.classList.remove('bad');}}
function setMessage(text,bad=false){const el=lead();if(el){el.textContent=text;el.classList.toggle('bad',bad);}}

async function sendNow(){
  const packet=packetNow();
  if(!packet)return false;
  setReceivedCopy();
  try{
    const state=stateNow()||{};
    await sendLraSubmission(packet,state.status||'分析待ち');
    setMessage('回答内容を管理側へ送信しました。マイページから現在の状態と確定した結果を確認できます。');
    const s=document.getElementById('doneStatus');if(s)s.textContent=state.status==='再分析待ち'?'再分析待ち（送信済み）':'分析待ち（送信済み）';
    window.dispatchEvent(new CustomEvent('lra:submission-saved',{detail:{lraId:packet.lraId,analysisCount:packet.analysisCount}}));
    return true;
  }catch(e){
    console.error(e);
    setMessage(e?.message==='USER_LOGIN_REQUIRED'?'ログイン状態を確認して、もう一度送信してください。':'管理側への送信に失敗しました。通信状態を確認してください。',true);
    const s=document.getElementById('doneStatus');if(s)s.textContent='送信エラー';
    return false;
  }
}

const submit=document.getElementById('submitBtn');
if(submit)submit.addEventListener('click',()=>setTimeout(()=>sendNow(),0));
