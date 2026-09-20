const search=document.getElementById('cg-search');
const format=document.getElementById('cg-format');
const cards=[...document.querySelectorAll('.cg-story')];
const grid=document.querySelector('.cg-story-grid');
const tools=document.querySelector('.cg-library-tools');
if(tools && search && format){
 tools.hidden=false;
 const filterStories=()=>{
  const query=search.value.toLowerCase().trim();let count=0;
  cards.forEach(card=>{const match=(!query||card.dataset.search.includes(query))&&(format.value==='all'||card.dataset.format===format.value);card.hidden=!match;if(match)count++;});
  grid.classList.toggle('is-filtered',Boolean(query)||format.value!=='all');
  document.getElementById('cg-count').textContent=`${count} ${count===1?'article':'articles'}`;
  document.querySelector('.cg-no-results').hidden=count!==0;
 };
 search.addEventListener('input',filterStories);format.addEventListener('change',filterStories);
 tools.addEventListener('submit',event=>{event.preventDefault();filterStories();});
}
const topicFilters=document.querySelector('.cg-topic-filters');
if(topicFilters){
 topicFilters.hidden=false;
 topicFilters.addEventListener('click',event=>{
  const button=event.target.closest('button[data-topic]');if(!button)return;
  const topic=button.dataset.topic;let count=0;
  topicFilters.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  cards.forEach(card=>{const match=topic==='all'||JSON.parse(card.dataset.topics).includes(topic);card.hidden=!match;if(match)count++;});
  document.querySelector('.cg-topic-count').textContent=`${count} ${count===1?'article':'articles'}${topic==='all'?'':` · ${topic}`}`;
 });
}
// Static artwork remains available without JavaScript or with reduced motion.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const previewObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('cg-preview-running');previewObserver.unobserve(entry.target);}});
 },{threshold:0.35});
 document.querySelectorAll('.cg-story-image').forEach(preview=>previewObserver.observe(preview));
}
