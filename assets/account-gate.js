(()=>{
  const ACCOUNT_KEY='lra.account.1.0';
  const USER_KEY='lra.user.1.0';
  const SESSION_KEY='lra.session.auth.1.0';
  const ITERATIONS=150000;
  const enc=new TextEncoder();
  const b64=a=>btoa(String.fromCharCode(...a));
  const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const bytes=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return a;};
  const hex=a=>[...a].map(v=>v