const homeView = document.getElementById("home-view");
const unitView = document.getElementById("unit-view");
const unitBubbles = document.getElementById("unit-bubbles");
const backBtn = document.getElementById("back-btn");
const zoomOverlay = document.getElementById("unit-zoom-overlay");

let activeUnitId = null;

const UNIT_THEMES = {
  "unit-1": {
    primary: "#4e2a84",
    secondary: "#836eaa",
    gradient: "radial-gradient(circle at 35% 30%, #836eaa, #4e2a84)",
    text: "#ffffff",
    textMuted: "#e4e0ee",
  },
  "unit-2": {
    primary: "#401f68",
    secondary: "#4e2a84",
    gradient: "radial-gradient(circle at 35% 30%, #4e2a84, #401f68)",
    text: "#ffffff",
    textMuted: "#e4e0ee",
  },
  assignment: {
    primary: "#836eaa",
    secondary: "#4e2a84",
    gradient: "radial-gradient(circle at 35% 30%, #836eaa, #401f68)",
    text: "#ffffff",
    textMuted: "#e4e0ee",
  },
};

function renderUnitBubbles() {
  unitBubbles.innerHTML = COURSE_DATA.units
    .map(
      (unit, index) => `
    <button
      class="unit-bubble"
      type="button"
      data-unit-id="${unit.id}"
      style="--bubble-index: ${index}"
      aria-label="Open ${unit.title}"
    >
      <span class="bubble-inner">
        <span class="bubble-number">${unit.number}</span>
        <span class="bubble-label">${unit.shortLabel}</span>
      </span>
    </button>
  `
    )
    .join("");

  unitBubbles.querySelectorAll(".unit-bubble").forEach((btn) => {
    btn.addEventListener("click", () => openUnit(btn.dataset.unitId, btn));
  });
}

function applyUnitTheme(unitId) {
  const theme = UNIT_THEMES[unitId];
  if (!theme) return;

  unitView.classList.add("unit-theme-active");
  unitView.dataset.unitTheme = unitId;
  unitView.style.setProperty("--unit-primary", theme.primary);
  unitView.style.setProperty("--unit-secondary", theme.secondary);
  unitView.style.setProperty("--unit-text", theme.text);
  unitView.style.setProperty("--unit-text-muted", theme.textMuted);
}

function clearUnitTheme() {
  unitView.classList.remove("unit-theme-active");
  delete unitView.dataset.unitTheme;
}

function renderUnitNav(activeId) {
  const nav = document.getElementById("unit-nav-bubbles");
  nav.innerHTML = COURSE_DATA.units
    .map(
      (unit) => `
    <button
      type="button"
      class="unit-nav-bubble${unit.id === activeId ? " is-active" : ""}"
      data-unit-id="${unit.id}"
      aria-label="Open ${unit.title}"
      ${unit.id === activeId ? 'aria-current="page"' : ""}
    >
      <span class="unit-nav-bubble-label">${unit.shortLabel}</span>
    </button>
  `
    )
    .join("");

  nav.querySelectorAll(".unit-nav-bubble").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.unitId !== activeUnitId) {
        openUnit(btn.dataset.unitId);
      }
    });
  });
}

function animateUnitOpen(button, unitId, onComplete) {
  const inner = button.querySelector(".bubble-inner");
  const rect = inner.getBoundingClientRect();
  const theme = UNIT_THEMES[unitId];
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  zoomOverlay.style.background = theme.gradient;
  zoomOverlay.style.left = `${cx}px`;
  zoomOverlay.style.top = `${cy}px`;
  zoomOverlay.style.width = `${rect.width}px`;
  zoomOverlay.style.height = `${rect.height}px`;
  zoomOverlay.hidden = false;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      zoomOverlay.classList.add("is-expanding");
    });
  });

  const finish = () => {
    zoomOverlay.classList.remove("is-expanding");
    zoomOverlay.hidden = true;
    onComplete();
  };

  zoomOverlay.addEventListener("transitionend", finish, { once: true });
  setTimeout(finish, 900);
}

function workMeta(work) {
  return [work.author, work.year, work.album ? `from ${work.album}` : ""]
    .filter(Boolean)
    .join(" · ");
}

function renderWorks(unit) {
  const worksGrid = document.getElementById("works-grid");

  if (unit.isAssignment) {
    const details = unit.assignmentDetails;
    worksGrid.innerHTML = `
      <div class="assignment-card">
        <h2>Requirements</h2>
        <ul class="assignment-list">
          ${details.requirements.map((r) => `<li>${r}</li>`).join("")}
        </ul>
        <h2>Approach</h2>
        <p>${details.goal}</p>
        <h2>Final Reflection</h2>
        <p>${details.reflection}</p>
      </div>
    `;
    worksGrid.classList.add("assignment-only");
    return;
  }

  worksGrid.classList.remove("assignment-only");
  worksGrid.innerHTML = unit.works
    .map(
      (work, index) => `
    <article class="work-item ${index % 2 === 1 ? "work-item--reverse" : ""}" style="--work-index: ${index}">
      <div class="work-visual">
        <div class="work-image-bubble">
          ${
            work.image
              ? `<img src="${work.image}" alt="${work.title} cover" class="work-cover-image">`
              : `<div class="work-cover-placeholder"><span>${work.type}</span></div>`
          }
        </div>
        ${
          work.link
            ? `<a class="work-link-btn" href="${work.link}" target="_blank" rel="noopener noreferrer">View resource →</a>`
            : `<span class="work-link-btn work-link-btn--disabled">Link coming soon</span>`
        }
      </div>
      <div class="work-details">
        <p class="work-type">${work.type}</p>
        <h2 class="work-item-title">${work.title}</h2>
        <p class="work-meta">${workMeta(work)}</p>
        <p class="work-description">${work.description}</p>
      </div>
    </article>
  `
    )
    .join("");
}

function showUnitContent(unit) {
  activeUnitId = unit.id;

  document.getElementById("unit-number").textContent = unit.number;
  document.getElementById("unit-title").textContent = unit.title;
  document.getElementById("unit-description").textContent = unit.description;

  const heroBubble = document.getElementById("unit-hero-bubble");
  heroBubble.querySelector(".unit-hero-number").textContent = unit.number;
  heroBubble.querySelector(".unit-hero-label").textContent = unit.shortLabel;

  const theme = UNIT_THEMES[unit.id];
  if (theme) {
    heroBubble.style.background = theme.gradient;
  }

  renderWorks(unit);
  applyUnitTheme(unit.id);
  renderUnitNav(unit.id);

  homeView.classList.remove("active");
  homeView.hidden = true;
  unitView.hidden = false;
  unitView.classList.add("active");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function openUnit(unitId, sourceButton) {
  const unit = COURSE_DATA.units.find((u) => u.id === unitId);
  if (!unit) return;

  const fromHome = sourceButton && !activeUnitId;

  if (fromHome) {
    animateUnitOpen(sourceButton, unitId, () => showUnitContent(unit));
  } else {
    showUnitContent(unit);
  }
}

function goHome() {
  activeUnitId = null;
  clearUnitTheme();
  unitView.classList.remove("active");
  unitView.hidden = true;
  homeView.hidden = false;
  homeView.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

backBtn.addEventListener("click", goHome);

renderUnitBubbles();
