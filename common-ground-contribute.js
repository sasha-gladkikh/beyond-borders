const proposal=document.getElementById('cg-proposal');
const prompts={
 'Research commentary':'Which finding caught your attention, and what could it help readers understand?',
 'Personal or community perspective':'What experience or perspective would you like to share?',
 'Photography, illustration, or visual work':'What would you like readers to see or understand?',
 'Another format':'Tell us which format would best serve your idea.',
 'I am still exploring':'Start with a question or subject that interests you. The format can come later.'
};
proposal.addEventListener('change',event=>{if(event.target.name==='format')document.getElementById('cg-format-prompt').textContent=prompts[event.target.value];});
proposal.addEventListener('submit',async event=>{
 event.preventDefault();if(!proposal.reportValidity())return;
 const status=document.getElementById('cg-proposal-status');
 const idea=document.getElementById('cg-proposal-idea');
 if(!idea.value.trim()){idea.focus();status.textContent='Please add a few words about your idea.';return;}
 const button=proposal.querySelector('button[type="submit"]');if(button.disabled)return;
 const label=button.innerHTML;button.disabled=true;button.textContent='Sending…';proposal.setAttribute('aria-busy','true');status.textContent='Sending your idea…';
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch('https://formsubmit.co/ajax/beyondbordersucla@gmail.com',{method:'POST',body:new FormData(proposal),headers:{Accept:'application/json'},signal:controller.signal});
  if(!response.ok)throw new Error('Request failed');
  const result=await response.json();if(result.success!==true&&result.success!=='true')throw new Error('Unconfirmed');
  status.textContent='Thank you for sharing your idea. Your message has been sent to the Common Ground editorial team.';
  proposal.reset();document.getElementById('cg-format-prompt').textContent='Choose the closest fit. Your idea can evolve.';
 }catch{
  status.textContent='We could not confirm that your idea was sent. Your answers are still here. Please try again or email beyondbordersucla@gmail.com.';
 }finally{clearTimeout(timeout);button.disabled=false;button.innerHTML=label;proposal.removeAttribute('aria-busy');}
});
