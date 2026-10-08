const ENDPOINT='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-submit';
export async function sendLraSubmission(packet,status='分析待ち'){
  const payload={kind:'LRA_SUBMISSION',schemaVersion:'LRA-SUBMISSION-1.0',lraId:packet.lraId,userId:packet.userId,analysisCount:Number(packet.analysisCount||1),outputId:packet.outputId,planCode:packet.planCode,status,savedAt:new Date().toISOString(),analysisPacket:packet,analysis:null};
  const res=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},cache:'no-store',body:JSON.stringify(payload)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.ok!==true)throw new Error(data.error||'SUBMISSION_FAILED');
  return data;
}
