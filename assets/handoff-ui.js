import { sendLraSubmission } from './submission-transport.js';

function packetNow(){return window.LRA_RUNTIME?.getAnalysisPacket?.()||null;}
function stateNow(){return window.LRA_RUNTIME?.getState?.()||null;}
function lead(){return document.querySelector('[data-view="done"] .lead');}
function setMessage(text,bad=false){const el=lead();if(el){el.textContent=text;el.classList.toggle('bad',bad);}}

async function sendNow(showProgress=true){
  const packet=packetNow();
  if(!packet){if(showProgress)alert('送信データがまだ生成されていません。');return false;}
  if(showProgress)setMessage('管理側へ送信しています…');
  try{
    const state=stateNow()||{};
    await sendLraSubmission(packet,state.status||'分析待ち');
    setMessage('回答データを管理側へ送信しました。');
    const s=document.getElementById('doneStatus');if(s)s.textContent='分析待ち（送信済み）';
    return true;
  }catch(e){
    console.error(e);
    setMessage('管理側への送信に失敗しました。通信状態を確認して再送信してください。',true);
    const s=document.getElementById('doneStatus');if(s)s.textContent='送信エラー';
    return false;
  }
}

const submit=document.getElementById('submitBtn');
if(submit)submit.addEventListener('click',()=>setTimeout(()=>sendNow(false),0));

const resend=document.getElementById('shareSubmissionBtn');
if(resend){resend.textContent='管理側へ再送信';resend.addEventListener('click',()=>sendNow(true));}
