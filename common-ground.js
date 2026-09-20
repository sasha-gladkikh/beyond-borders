const search=document.getElementById('cg-search');
const format=document.getElementById('cg-format');
const cards=[...document.querySelectorAll('.cg-story')];
const grid=document.querySelector('.cg-story-grid');
document.querySelector('.cg-library-tools').hidden=false;
function filterStories(){
 const query=search.value.toLowerCase().trim();let count=0;
 cards.forEach(card=>{const match=(!query||card.dataset.search.includes(query))&&(format.value==='all'||card.dataset.format===format.value);card.hidden=!match;if(match)count++;});
 grid.classList.toggle('is-filtered',Boolean(query)||format.value!=='all');
 document.getElementById('cg-count').textContent=`${count} ${count===1?'article':'articles'}`;
 document.querySelector('.cg-no-results').hidden=count!==0;
}
search.addEventListener('input',filterStories);format.addEventListener('change',filterStories);
document.querySelector('.cg-library-tools').addEventListener('submit',event=>{event.preventDefault();filterStories();});
