const LONG_CASE_RE=/LRA-(\d{2})(\d{2})(\d{2})(\d{2})-([A-F0-9]{8,32})/g;
export function publicCaseId(value){
  return String(value??'').replace(LONG_CASE_RE,(_m,yy1,yy2,mm,dd,suffix)=>`LRA-${yy2}${mm}${dd}-${suffix.slice(0,4)}`);
}
function maskText(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let n;
  while((n=walker.nextNode())){
    const p=n.parentElement;
    if(!p||['SCRIPT','STYLE','TEXTAREA','INPUT'].includes(p.tagName))continue;
    const next=publicCaseId(n.nodeValue);
    if(next!==n.nodeValue)n.nodeValue=next;
  }
}
function install(){
  maskText(document.body);
  const obs=new MutationObserver(muts=>{
    for(const m of muts){
      if(m.type==='characterData'){const n=m.target;const next=publicCaseId(n.nodeValue);if(next!==n.nodeValue)n.nodeValue=next;continue;}
      for(const node of m.addedNodes){if(node.nodeType===Node.TEXT_NODE){const next=publicCaseId(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}else if(node.nodeType===Node.ELEMENT_NODE)maskText(node);}
    }
  });
  obs.observe(document.body,{subtree:true,childList:true,characterData:true});
}
window.LRA_PUBLIC_CASE_ID=publicCaseId;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
