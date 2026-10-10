import { sendLraSubmission } from './submission-transport.js?v=20261009-server1';

function packetNow(){return window.LRA_RUNTIME?.getAnalysisPacket?.()||null;}
function stateNow(){return window.LRA_RUNTIME?.getState?.()||null;}
function doneView(){return document.querySelector('[data-view="done"]');}
function lead(){return doneView()?.querySelector('.lead')||null;}
function actions(){return doneView()?.querySelector('.actions')||null;}
function setHeading(eyebrow,title){const view=doneView();const h=view?.querySelector('h2');const e=view?.querySelector('.eyebrow');if(e)e.textContent=eyebrow;if(h)h.textContent=title;}
function setSendingCopy(){setHeading('送信中','回答を送信しています。');const el=lead();if(el){el.textContent='送信が完了するまで、この画面を閉じないでください。';el.classList.remove('bad');}}
function setReceivedCopy(){setHeading('受付完了','回答を受け付けました。');}
function setFailedCopy(){setHeading('送信できませんでした','回答をまだ受け付けていません。');}
function setMessage(text,bad=false){const el=lead();if(el){el.textContent=text;el.classList.toggle('bad',bad);}}
function removeRetry(){document.getElementById('lraRetrySubmitBtn')?.remove();}
function showRetry(){
  if(document.getElementById('lraRetrySubmitBtn'))return;
  const box=actions();if(!box)return;
  const btn=document.createElement('button');btn.type='button';btn.className='btn dark';btn.id='lraRetrySubmitBtn';btn.textContent='もう一度送信する →';btn.addEventListener('click',()=>sendNow());box.appendChild(btn);
}

async function sendNow(){
  const packet=packetNow();
  if(!packet)return false;
  removeRetry();
  setSendingCopy();
  try{
    const state=stateNow()||{};
    await sendLraSubmission(packet,state.status||'分析待ち');
    setReceivedCopy();
    setMessage('回答を受け付けました。分析結果はマイページから確認できます。');
    const s=document.getElementById('doneStatus');if(s)s.textContent=state.status==='再分析待ち'?'再分析を進めています':'分析を進めています';
    window.dispatchEvent(new CustomEvent('lra:submission-saved',{detail:{lraId:packet.lraId,analysisCount:packet.analysisCount}}));
    return true;
  }catch(e){
    console.error(e);
    setFailedCopy();
    setMessage(e?.message==='USER_LOGIN_REQUIRED'?'ログイン状態を確認して、もう一度送信してください。':'回答を送信できませんでした。通信状態を確認して、もう一度お試しください。',true);
    const s=document.getElementById('doneStatus');if(s)s.textContent='送信できませんでした';
    showRetry();
    return false;
  }
}

const submit=document.getElementById('submitBtn');
if(submit)submit.addEventListener('click',()=>{setSendingCopy();setTimeout(()=>sendNow(),0);});
