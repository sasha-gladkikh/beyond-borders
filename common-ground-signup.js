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
  const response=await fetch('https://formsubmit.co/ajax/contact@beyondborders.charity',{method:'POST',body:new FormData(signupForm),headers:{Accept:'application/json'},signal:controller.signal});
  if(!response.ok)throw new Error('Request failed');
  const result=await response.json();if(result.success!==true&&result.success!=='true')throw new Error('Unconfirmed');
  signupStatus.textContent='Thank you. Your request has been sent to our team. Your signup still needs to be processed.';
  signupForm.reset();
 }catch{
  signupStatus.textContent='We could not confirm that your request was sent. Please try again or use “Write to us” below. Your email is still in the form.';
 }finally{clearTimeout(timeout);button.disabled=false;button.innerHTML=label;signupForm.removeAttribute('aria-busy');}
});
