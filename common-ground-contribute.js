const proposal=document.getElementById('cg-proposal');
const prompts={
 'Research commentary':'Which finding caught your attention? Tell us what it could help readers understand.',
 'Community perspective':'What experience or perspective would you like to share, and what might readers learn from it?',
 'Visual work':'What would you like readers to see or understand? Photography, illustration, and other visual formats are welcome.',
 'Open format':'Start with the question or story you want to explore. The format can come later.'
};
proposal.addEventListener('change',event=>{if(event.target.name==='format')document.getElementById('cg-format-prompt').textContent=prompts[event.target.value];});
proposal.addEventListener('submit',event=>{
 event.preventDefault();if(!proposal.reportValidity())return;
 const values=new FormData(proposal);const idea=String(values.get('idea')).trim();
 if(!idea){document.getElementById('cg-proposal-idea').focus();document.getElementById('cg-proposal-status').textContent='Please add a few words about your idea.';return;}
 const name=String(values.get('name')).trim();const format=values.get('format');
 const body=`Hello Common Ground team,\n\nI would like to share an idea.\n\nFormat: ${format}\n\n${idea}${name?`\n\nBest regards,\n${name}`:''}`;
 window.location.href=`mailto:beyondbordersucla@gmail.com?subject=${encodeURIComponent('Common Ground contribution: '+format)}&body=${encodeURIComponent(body)}`;
 document.getElementById('cg-proposal-status').textContent='Your email app should open with a draft. Nothing has been sent. If it does not open, copy your idea and use the email address below.';
});
