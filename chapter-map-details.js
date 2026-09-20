(() => {
 const detail = document.getElementById('chapter-map-detail');
 if (!detail) return;
 function renderChapter(id) {
  const campus = campuses.find(item => item.id === id);
  const card = document.getElementById(`campus-${id}`)?.closest('.campus-block');
  if (!campus || !card) return;
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'University chapter';
  const title = document.createElement('h3'); title.textContent = `Beyond Borders at ${campus.label}`;
  const location = document.createElement('p'); location.className = 'map-card-location'; location.textContent = card.querySelector('.chapter-location').textContent;
  const leader = document.createElement('p'); leader.className = 'map-card-leader'; leader.textContent = `President · ${card.querySelector('.board-name').textContent.trim()}`;
  const join = card.querySelector('.chapter-join').cloneNode(true); join.className = 'map-card-join'; join.textContent = 'Join this chapter';
  join.addEventListener('click', () => {
   form.querySelector('[name="Area of interest"]').value = 'Join a chapter';
   form.querySelector('[name="Chapter affiliation"]').value = join.dataset.chapter;
   updateInquiry();
  });
  const social = card.querySelector('.ig a').cloneNode(true); social.className = 'map-card-social';
  detail.replaceChildren(eyebrow, title, location, leader, join, social);
 }
 document.addEventListener('chapter-selected', event => {
  const id = event.detail.id; renderChapter(id);

 });
 renderChapter('ucla');
 campusMarkers.ucla?.getElement()?.classList.add('is-active');
 document.querySelector('[data-campus="ucla"]')?.setAttribute('aria-pressed','true');
})();
