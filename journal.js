const steps=[
 ['Did the invitation reach the person?','An online notice may never reach someone who does not use that platform.','Compare outreach channels and ask how participants first heard about the service.'],
 ['Are the instructions understandable?','Receiving a message does not guarantee that its language or instructions are clear.','Ask participants to explain the next step in their own words; test materials with intended readers.'],
 ['Can the person complete the booking?','Account setup or an unfamiliar form can interrupt an otherwise straightforward appointment request.','Compare attempted and completed bookings, including assisted and telephone routes.'],
 ['Can the person attend and use the service?','A confirmed booking can still be difficult to use if timing, transport, or communication needs are unresolved.','Distinguish attendance from booking, and invite feedback about practical obstacles.']
];
const tabs=[...document.querySelectorAll('.access-tabs [role="tab"]')];
function selectStep(index,focus=false){
 tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
 const [question,example,measure]=steps[index];
 document.getElementById('access-question').textContent=question;
 document.getElementById('access-example').textContent=example;
 document.getElementById('access-measure').textContent=measure;
 document.getElementById('access-panel').setAttribute('aria-labelledby',`access-tab-${index}`);
 if(focus)tabs[index].focus();
}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectStep(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%4;else if(e.key==='ArrowLeft')next=(i+3)%4;else if(e.key==='Home')next=0;else if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();selectStep(next,true);}});});
const progress=document.querySelector('.reading-progress span');
function updateProgress(){const main=document.querySelector('main');const end=main.offsetTop+main.offsetHeight-innerHeight;const ratio=end>0?Math.min(1,Math.max(0,scrollY/end)):1;progress.style.transform=`scaleX(${ratio})`;}
window.addEventListener('scroll',updateProgress,{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
// Citation links still lead to the reference when JavaScript is unavailable.
const sourceDialog=document.getElementById('source-dialog');
if(sourceDialog){
 document.querySelectorAll('a[href="#ref-1"]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  document.getElementById('source-claim').textContent=link.closest('p').textContent.replace(/\[1\]/g,'').trim();
  sourceDialog.showModal();
 }));
 sourceDialog.querySelector('.source-close').addEventListener('click',()=>sourceDialog.close());
}
