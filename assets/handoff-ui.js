function fileName(packet){const id=packet?.lraId||'LRA';const n=packet?.analysisCount||1;return`${id}_A${n}_submission.json`;}
function packetNow(){return window.LRA_RUNTIME?.getAnalysisPacket?.()||null;}
async function sharePacket(){
  const packet=packetNow();
  if(!packet){alert('送信データがまだ生成されていません。');return;}
  const text=JSON.stringify({kind:'LRA_SUBMISSION',schemaVersion:'LRA-SUBMISSION-1.0',lraId:packet.lraId,userId:packet.userId,analysisCount:packet.analysisCount,outputId:packet.outputId,planCode:packet.planCode,status:'分析待ち',savedAt:new Date().toISOString(),analysisPacket:packet,analysis:null},null,2);
  const file=new File([text],fileName(packet),{type:'application/json'});
  try{
    if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({title:'LRA回答データ',text:`LRA-ID: ${packet.lraId}`,files:[file]});return;}
  }catch(e){if(e?.name==='AbortError')return;}
  const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const btn=document.getElementById('shareSubmissionBtn');if(btn)btn.addEventListener('click',sharePacket);
