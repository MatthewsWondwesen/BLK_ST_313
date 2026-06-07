const homeView = document.getElementById("home-view");
const unitView = document.getElementById("unit-view");
const unitBubbles = document.getElementById("unit-bubbles");
const backBtn = document.getElementById("back-btn");
const workModal = document.getElementById("work-modal");

let activeUnitId = null;

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
      <span class="bubble-tooltip" role="tooltip">
        <strong>${unit.title}</strong>
        <span>${unit.description}</span>
      </span>
    </button>
  `
    )
    .join("");

  unitBubbles.querySelectorAll(".unit-bubble").forEach((btn) => {
    btn.addEventListener("click", () => openUnit(btn.dataset.unitId));
  });
}

function openUnit(unitId) {
  const unit = COURSE_DATA.units.find((u) => u.id === unitId);
  if (!unit) return;

  activeUnitId = unitId;

  document.getElementById("unit-number").textContent = unit.number;
  document.getElementById("unit-title").textContent = unit.title;
  document.getElementById("unit-description").textContent = unit.description;

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
  } else {
    worksGrid.classList.remove("assignment-only");
    worksGrid.innerHTML = unit.works
      .map(
        (work, index) => `
      <button
        class="work-bubble"
        type="button"
        data-work-id="${work.id}"
        data-unit-id="${unit.id}"
        style="--work-index: ${index}"
        aria-label="View ${work.title} by ${work.author}"
      >
        <span class="work-bubble-inner">
          <span class="work-type">${work.type}</span>
          <span class="work-title">${work.title}</span>
          <span class="work-author">${work.author}</span>
        </span>
        <span class="work-tooltip" role="tooltip">${truncate(work.description, 140)}</span>
      </button>
    `
      )
      .join("");

    worksGrid.querySelectorAll(".work-bubble").forEach((btn) => {
      btn.addEventListener("click", () =>
        openWorkModal(btn.dataset.unitId, btn.dataset.workId)
      );
    });
  }

  homeView.classList.remove("active");
  homeView.hidden = true;
  unitView.hidden = false;
  unitView.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goHome() {
  activeUnitId = null;
  unitView.classList.remove("active");
  unitView.hidden = true;
  homeView.hidden = false;
  homeView.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openWorkModal(unitId, workId) {
  const unit = COURSE_DATA.units.find((u) => u.id === unitId);
  const work = unit?.works.find((w) => w.id === workId);
  if (!work) return;

  document.getElementById("modal-type").textContent = work.type;
  document.getElementById("modal-title").textContent = work.title;
  document.getElementById("modal-meta").textContent = [
    work.author,
    work.year,
    work.album ? `from ${work.album}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  document.getElementById("modal-description").textContent = work.description;

  const modalImage = document.getElementById("modal-image");
  const placeholder = document.getElementById("modal-image-placeholder");
  const linkEl = document.getElementById("modal-link");
  const linkPlaceholder = document.getElementById("modal-link-placeholder");

  if (work.image) {
    modalImage.src = work.image;
    modalImage.alt = `${work.title} cover`;
    modalImage.hidden = false;
    placeholder.hidden = true;
  } else {
    modalImage.hidden = true;
    modalImage.removeAttribute("src");
    placeholder.hidden = false;
  }

  if (work.link) {
    linkEl.href = work.link;
    linkEl.hidden = false;
    linkPlaceholder.hidden = true;
  } else {
    linkEl.hidden = true;
    linkPlaceholder.hidden = false;
  }

  workModal.showModal();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

backBtn.addEventListener("click", goHome);
document.getElementById("modal-close").addEventListener("click", () => workModal.close());
workModal.addEventListener("click", (e) => {
  if (e.target === workModal) workModal.close();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && workModal.open) workModal.close();
});

renderUnitBubbles();
