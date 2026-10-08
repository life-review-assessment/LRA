(()=>{
  const API='https://holpzxxeebfvkvixjuhu.supabase.co/functions/v1/lra-user-api';
  const ACCOUNT_KEY='lra.account.1.0';
  const USER_KEY='lra.user.1.0';
  const TOKEN_KEY='lra.user.session.token.1.0';
  const enc=new TextEncoder();
  const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const b64=a=>btoa(String.fromCharCode(...a));
  const bytes=n=>{const a=new Uint