const ENDPOINT='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-submit';
const KEY_PREFIX='lra.clientKey.';
function randomHex(bytes=16){const a=new Uint8Array(bytes);crypto.getRandomValues(a);return[...a].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();}
export function getLraClientKey(lraId){
  if(!lraId)return null;
  const storageKey=`${KEY_PREFIX}${lraId}`;
  let key=null;
  try{key=localStorage.getItem(storageKey);}catch{}
  if(!/^CLK-[A-F0-9]{32}$/.test(String(key||''))){key=`CLK-${randomHex(16)}`;try{localStorage.setItem(storageKey,key);}catch{}}
  return key;
}
export async function sendLraSubmission(packet,status='分析待ち'){
  const clientKey=getLraClientKey(packet?.lraId);
  const authToken=window.LRA_ACCOUNT_UI?.getToken?.()||'';
  if(!authToken)throw new Error('USER_LOGIN_REQUIRED');
  const payload={kind:'LRA_SUBMISSION',schemaVersion:'LRA-SUBMISSION-1.0',lraId:packet.lraId,userId:packet.userId,analysisCount:Number(packet.analysisCount||1),outputId:packet.outputId,planCode:packet.planCode,status,savedAt:new Date().toISOString(),analysisPacket:packet,analysis:null,clientKey};
  const res=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${authToken}`},cache:'no-store',keepalive:true,body:JSON.stringify(payload)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.ok!==true)throw new Error(data.error||'SUBMISSION_FAILED');
  return data;
}
