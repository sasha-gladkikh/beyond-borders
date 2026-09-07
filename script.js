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
  });
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (note) {
    note.hidden = false;
    note.textContent = "Sending…";
  }
  try {
    const response = await fetch("https://formsubmit.co/ajax/beyondbordersucla@gmail.com", {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Request failed");
    window.location.href = "thank-you.html";
  } catch {
    if (note) {
      note.textContent = "Something went wrong. Please email beyondbordersucla@gmail.com.";
    }
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
