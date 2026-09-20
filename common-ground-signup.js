const signupForm=document.getElementById('newsletter-form');
const signupStatus=document.getElementById('newsletter-status');
signupForm.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!signupForm.reportValidity())return;
 const button=signupForm.querySelector('button');if(button.disabled)return;
 const label=button.innerHTML;button.disabled=true;button.textContent='Sending request…';signupForm.setAttribute('aria-busy','true');
 signupStatus.textContent='Sending your request…';
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch('https://formsubmit.co/ajax/beyondbordersucla@gmail.com',{method:'POST',body:new FormData(signupForm),headers:{Accept:'application/json'},signal:controller.signal});
  if(!response.ok)throw new Error('Request failed');
  const result=await response.json();if(result.success!==true&&result.success!=='true')throw new Error('Unconfirmed');
  signupStatus.textContent='Thank you. Your request has been sent to the Beyond Borders team for processing. This is not an automatic subscription confirmation.';
  signupForm.reset();
 }catch{
  signupStatus.textContent='We could not confirm your request was sent. Please try again or use the “Write to us” link below. Your email has not been cleared.';
 }finally{clearTimeout(timeout);button.disabled=false;button.innerHTML=label;signupForm.removeAttribute('aria-busy');}
});
