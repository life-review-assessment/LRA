import { sendLraSubmission } from './submission-transport.js';

function packetNow(){return window.LRA_RUNTIME?.getAnalysisPacket?.()||null;}
function stateNow(){return window.LRA_RUNTIME?.getState?.()||null;}
function lead(){return document.querySelector('[data-view="done"] .lead');}
function setMessage(text,bad=false){const el=lead();if(el){el.textContent=text;el.classList.toggle('bad',bad);}}

async function sendNow(){
  const packet=packetNow();
  if(!packet)return false;
  try{
    const state=stateNow()||{};
    await sendLraSubmission(packet,state.status||'分析待ち');
    setMessage('回答データを管理側へ送信しました。');
    const s=document.getElementById('doneStatus');if(s)s.textContent='分析待ち（送信済み）';
    return true;
  }catch(e){
    console.error(e);
    setMessage('管理側への送信に失敗しました。通信状態を確認してください。',true);
    const s=document.getElementById('doneStatus');if(s)s.textContent='送信エラー';
    return false;
  }
}

const submit=document.getElementById('submitBtn');
if(submit)submit.addEventListener('click',()=>setTimeout(()=>sendNow(),0));
