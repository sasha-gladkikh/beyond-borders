const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const year = document.getElementById("year");
const form = document.querySelector(".contact-form");
const note = document.querySelector(".form-note");

if (year) {
  year.textContent = "2026";
}

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open menu");
  });
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = form.querySelector('[type="submit"]');
  if (submit.disabled) return;
  const originalLabel = submit.innerHTML;
  submit.disabled = true;
  submit.textContent = "Sending…";
  form.setAttribute("aria-busy", "true");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  if (note) {
    note.hidden = false;
    note.textContent = "Sending…";
  }
  try {
    const response = await fetch("https://formsubmit.co/ajax/contact@beyondborders.charity", {
      method: "POST",
      signal: controller.signal,
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Request failed");
    const result = await response.json();
    if (result.success !== true && result.success !== "true") throw new Error("Submission not confirmed");
    window.location.href = "thank-you.html";
  } catch {
    if (note) {
      note.textContent = "Unable to send right now. Please try again or email contact@beyondborders.charity.";
    }
  } finally {
    clearTimeout(timeout);
    submit.disabled = false;
    submit.innerHTML = originalLabel;
    form.removeAttribute("aria-busy");
  }
});

const orgList = document.querySelector('[data-level="org"]');
const orgTabs = [...(orgList?.querySelectorAll('[role="tab"]') || [])];
const orgPanels = ["national", "university", "hs"].map((id) => document.getElementById(`panel-${id}`));

function showOrg(id) {
  orgTabs.forEach((tab) => {
    const selected = tab.dataset.entity === id;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  orgPanels.forEach((panel) => {
    if (panel) panel.hidden = panel.id !== `panel-${id}`;
  });
}

orgTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    showOrg(tab.dataset.entity);
    history.replaceState(null, "", `#${tab.dataset.entity}`);
  });
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      event.key === "ArrowRight"
        ? orgTabs[(index + 1) % orgTabs.length]
        : orgTabs[(index - 1 + orgTabs.length) % orgTabs.length];
    next.focus();
    next.click();
  });
});

const hash = window.location.hash.replace("#", "");
if (hash === "ucla" || hash === "usc" || hash === "university") {
  showOrg("university");
  document.getElementById("chapters")?.scrollIntoView();
} else if (["national", "hs"].includes(hash)) {
  showOrg(hash);
  document.getElementById("chapters")?.scrollIntoView();
}

// Route each involvement link to the appropriate inquiry selection.
document.querySelectorAll('[data-interest]').forEach((link) => {
  link.addEventListener('click', () => {
    const interest = form?.querySelector('[name="Area of interest"]');
    const chapter = form?.querySelector('[name="Chapter affiliation"]');
    if (interest) interest.value = link.dataset.interest;
    if (chapter) chapter.value = link.dataset.chapter || '';
    updateInquiry();
  });
});

// Keep the inquiry short and relevant to each visitor's purpose.
function updateInquiry() {
  if (!form) return;
  const interest = form.querySelector('[name="Area of interest"]').value;
  const chapterField = document.getElementById('chapter-field');
  const chapter = form.querySelector('[name="Chapter affiliation"]');
  const hints = {
    'Join a chapter': ['Find a place to contribute through service, advocacy, or research.', 'Tell us about your interests, skills, and the work you would like to support.'],
    'Start a chapter': ['Tell us where you would like to bring Beyond Borders.', 'Which school or community would your chapter serve? Share your ideas and any team you have begun building.'],
    'Partner with Beyond Borders': ['Connect your organization’s expertise with our community programs.', 'Tell us about your organization and the collaboration you have in mind.'],
    'Donate': ['Connect with our team about financial gifts, supplies, or sponsorships.', 'What type of contribution would you like to discuss? Please do not include bank or payment details.'],
    'Other': ['Questions and new ideas are welcome.', 'How can our team help?']
  };
  const selected = hints[interest] || ['Select the option that best matches your interest.', 'Tell us a little about yourself and how you would like to get involved.'];
  const showChapter = interest === 'Join a chapter';
  chapterField.hidden = !showChapter;
  chapter.disabled = !showChapter;
  document.getElementById('interest-hint').textContent = selected[0];
  form.querySelector('[name="Message"]').placeholder = selected[1];
  document.getElementById('organization-label').textContent = interest === 'Start a chapter' ? 'School or community' : 'School or organization';
}
form?.querySelector('[name="Area of interest"]')?.addEventListener('change', updateInquiry);
updateInquiry();

// Campus locations identify the universities, not chapter meeting venues.
const campuses = [
  { id:'ucla', label:'UCLA', coords:[34.0689,-118.4452] },
  { id:'usc', label:'USC', coords:[34.0224,-118.2851] },
  { id:'csuf', label:'Cal State Fullerton', coords:[33.8829,-117.8854] }
];
const campusMarkers = {};
function selectCampus(id) {
  showOrg('university');
  document.querySelectorAll('[data-campus]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.campus === id)));
  document.querySelectorAll('.campus-block').forEach(card => card.classList.toggle('is-selected', !!card.querySelector(`#campus-${id}`)));
  Object.entries(campusMarkers).forEach(([key, marker]) => {
    marker.getElement()?.classList.toggle('is-active', key === id);
    marker.getElement()?.setAttribute('aria-pressed', String(key === id));
  });
  document.dispatchEvent(new CustomEvent('chapter-selected', {detail:{id}}));
  const campus = campuses.find(item => item.id === id);
  document.querySelector('.map-status').textContent = `${campus.label} selected. Explore chapter leadership and ways to get involved.`;
}
document.querySelectorAll('[data-campus]').forEach(button => button.addEventListener('click', () => selectCampus(button.dataset.campus)));
const mapElement = document.getElementById('chapter-map');
if (mapElement && window.L) {
  const map = L.map(mapElement, {scrollWheelZoom:false, zoomControl:false}).fitBounds(campuses.map(c => c.coords), {padding:[75,85], maxZoom:10});
  map.attributionControl.setPrefix(false);
  L.control.zoom({position:'bottomright'}).addTo(map);
  const mapKey = window.BEYOND_BORDERS_MAPS?.maptilerKey;
  const tileUrl = mapKey ? `https://api.maptiler.com/maps/dataviz-v4-light/256/{z}/{x}/{y}@2x.png?key=${encodeURIComponent(mapKey)}` : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' + (mapKey ? ' &copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>' : '');
  const tiles = L.tileLayer(tileUrl, {maxZoom:19, attribution}).addTo(map);
  mapElement.classList.toggle('uses-maptiler', Boolean(mapKey));
  document.addEventListener('chapter-selected', event => {
    const campus = campuses.find(item => item.id === event.detail.id);
    if (campus) map.flyTo(campus.coords, 11, {animate:!window.matchMedia('(prefers-reduced-motion: reduce)').matches, duration:.8});
  });
  mapElement.querySelector('.map-fallback')?.remove();
  tiles.on('tileerror', () => { document.querySelector('.map-status').textContent = 'Map imagery is unavailable. Use the campus buttons to explore chapter details.'; });
  campuses.forEach(campus => {
    const label = campus.id === 'csuf' ? 'CSUF' : campus.label;
    campusMarkers[campus.id] = L.marker(campus.coords, {title:`Explore ${campus.label}`,alt:`Explore ${campus.label}`,icon:L.divIcon({className:'campus-pin',html:`<span>${label}</span>`,iconSize:[70,34],iconAnchor:[35,17]})}).addTo(map).on('click', () => selectCampus(campus.id));
  });
}

// Native modal provides focus trapping and Escape-to-close behavior.
const viewer = document.querySelector('.image-viewer');
let viewerTrigger;
let galleryItems = [], galleryIndex = 0;
const altadenaGallery = [
 ['assets/altadena-community-clean-ground.jpg','Coalition for Humane Immigrant Rights (CHIRLA) Community Health Fair · Community and partners'],
 ['assets/altadena-resources-focus.jpg','Health insurance resources · Altadena'],
 ['assets/altadena-supplies-stickers-only.png','Health and hygiene kits prepared for distribution · Altadena']
];
function renderGallery() {
 const [src,caption] = galleryItems[galleryIndex];
 viewer.querySelector('img').src=src;
 viewer.querySelector('img').alt=caption;
 viewer.querySelector('figcaption').textContent=caption;
 viewer.querySelector('.gallery-count').textContent=`${galleryIndex+1} / ${galleryItems.length}`;
}

document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
  if (!viewer?.showModal) return;
  event.preventDefault();
  viewerTrigger = link;
  const collage = link.dataset.gallery === 'altadena';
  viewer.classList.toggle('is-collage',collage);
  viewer.querySelector('.event-collage').hidden=!collage;
  viewer.querySelector(':scope > figure').hidden=collage;
  viewer.setAttribute('aria-labelledby',collage?'collage-title':'viewer-caption');
  galleryItems = [[link.href,link.dataset.caption]];
  galleryIndex=0;
  viewer.querySelector('.gallery-controls').hidden=galleryItems.length<2;
  renderGallery();
  viewer.showModal();
  viewer.scrollTop=0;
  document.body.classList.add('viewer-open');
}));
viewer?.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer?.addEventListener('click', event => {
  const rect = viewer.getBoundingClientRect();
  if (event.target === viewer && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) viewer.close();
});
viewer?.addEventListener('close', () => { document.body.classList.remove('viewer-open'); viewerTrigger?.focus(); });

function stepGallery(direction) { galleryIndex=(galleryIndex+direction+galleryItems.length)%galleryItems.length; renderGallery(); }
viewer?.querySelector('.gallery-prev').addEventListener('click',()=>stepGallery(-1));
viewer?.querySelector('.gallery-next').addEventListener('click',()=>stepGallery(1));
viewer?.addEventListener('keydown',event=>{if(galleryItems.length>1 && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();stepGallery(event.key==='ArrowLeft'?-1:1);}});
const kitViewer=document.querySelector('.kit-viewer');
const kitTrigger=document.querySelector('.kit-explore');
const kitItems=[['Toothbrush','Individually wrapped oral-care supplies for an everyday routine.'],['Comb','A compact grooming essential that fits easily inside the reusable bag.'],['Razor','Individually packaged shaving supplies, shown here alongside other personal-care items.'],['Bandages','Individually wrapped adhesive bandages included among the everyday essentials.'],['Personal care','Travel-size toiletries, including deodorant, shampoo, and conditioner, are visible in this example kit.']];
kitTrigger?.addEventListener('click',()=>{kitViewer.showModal();kitViewer.scrollTop=0;kitViewer.querySelector('.kit-close').focus({preventScroll:true});document.body.classList.add('viewer-open');});
kitViewer?.querySelector('.kit-close').addEventListener('click',()=>kitViewer.close());
kitViewer?.addEventListener('close',()=>{document.body.classList.remove('viewer-open');kitTrigger.focus();});
kitViewer?.querySelectorAll('[data-kit-item]').forEach(button=>button.addEventListener('click',()=>{
 const index=Number(button.dataset.kitItem);
 kitViewer.querySelectorAll('[data-kit-item]').forEach(item=>item.setAttribute('aria-pressed',String(Number(item.dataset.kitItem)===index)));
 kitViewer.querySelector('.kit-detail h3').textContent=kitItems[index][0];
 kitViewer.querySelector('.kit-detail p').textContent=kitItems[index][1];
}));

// A keyboard-accessible walkthrough of a typical fair, with no automatic advance.
const fairSteps = [["A place to begin", "Start with a warm welcome.", "Meet the volunteers, learn what services are available, and choose where to begin. Let the team know your language preferences.", "Student volunteers and community partners", "A clear introduction to the services available."], ["Preventive care", "Check in on your health.", "Explore blood pressure, blood glucose, pulmonary, and kidney health screenings, depending on the services available at each fair. Qualified healthcare professionals explain results and recommend appropriate follow-up.", "Trained screening personnel and healthcare professionals", "An opportunity to understand your results and ask questions."], ["Finding care", "Make sense of your options.", "Ask enrollment partners about health insurance and local care options. Volunteers help you find the right resource station.", "Enrollment specialists and resource-navigation partners", "Information about where and how to seek care."], ["Everyday essentials", "Pick up practical support.", "Collect available health and hygiene supplies, selected around community needs and partner requests.", "Student volunteers and distribution partners", "Essential supplies and useful resource information."], ["Looking ahead", "Know your next step.", "Where referrals are available, leave with a service name and contact information. Partner-supported follow-up is a priority we are developing.", "Healthcare professionals and referral partners", "A clearer direction for seeking continued care."]];
const fairIcons = ["<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 20V8l7-4 7 4v12M3 20h18M10 20v-7h4v7\"/></svg>", "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 12h4l3-7 4 14 3-7h4\"/></svg>", "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m16 8-3 5-5 3 3-5Z\"/></svg>", "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 8h14v13H5ZM9 8V6a3 3 0 0 1 6 0v2\"/></svg>", "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 21V3m0 1h13l-3 4 3 4H5\"/></svg>"];
const fairNames = ["Welcome","Screening","Navigation","Resources","Next steps"];
let fairIndex=0;
const fairTabs=[...document.querySelectorAll('[data-fair-step]')];
function showFairStep(index,focus=false){
 fairIndex=index;
 const [kicker,heading,description,team,result]=fairSteps[index];
 for(const [id,value] of Object.entries({'fair-heading':heading,'fair-description':description,'fair-progress':`Station ${index+1} of 5`}))document.getElementById(id).textContent=value;

 fairTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
 document.getElementById('fair-panel').setAttribute('aria-labelledby',`fair-tab-${index}`);
 document.getElementById('fair-prev').disabled=index===0;
 document.getElementById('fair-next').disabled=index===4;
 if(focus)fairTabs[index].focus();
}
fairTabs.forEach((tab,i)=>{tab.addEventListener('click',()=>showFairStep(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%5;else if(e.key==='ArrowLeft')next=(i+4)%5;else if(e.key==='Home')next=0;else if(e.key==='End')next=4;if(next!==undefined){e.preventDefault();showFairStep(next,true);}});});
document.getElementById('fair-prev')?.addEventListener('click',()=>showFairStep(Math.max(0,fairIndex-1)));
document.getElementById('fair-next')?.addEventListener('click',()=>showFairStep(Math.min(4,fairIndex+1)));

if(fairTabs.length) showFairStep(0);
