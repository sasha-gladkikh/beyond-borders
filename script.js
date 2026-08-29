const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const year = document.getElementById("year");
const form = document.querySelector(".contact-form");
const note = document.querySelector(".form-note");

if (year) {
  year.textContent = "2025";
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

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

function showEntity(id) {
  tabs.forEach((tab) => {
    const selected = tab.dataset.entity === id;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  panels.forEach((panel) => {
    panel.hidden = panel.id !== `panel-${id}`;
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    showEntity(tab.dataset.entity);
    history.replaceState(null, "", `#${tab.dataset.entity}`);
  });
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      event.key === "ArrowRight"
        ? tabs[(index + 1) % tabs.length]
        : tabs[(index - 1 + tabs.length) % tabs.length];
    next.focus();
    next.click();
  });
});

const entityFromHash = window.location.hash.replace("#", "");
if (["national", "ucla", "usc", "hs"].includes(entityFromHash)) {
  showEntity(entityFromHash);
  document.getElementById("chapters")?.scrollIntoView();
}
