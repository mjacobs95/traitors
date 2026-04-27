const grid = document.getElementById("grid");
const resetBtn = document.getElementById("reset-btn");
const sidebarStages = document.getElementById("sidebar-stages");

let players = [];
let currentStage = "T1";

const STAGE_ICONS = {
  task: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>`,
  rt:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="5"/><circle cx="12" cy="3.5" r="1.5" fill="currentColor"/><circle cx="20.5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="20.5" r="1.5" fill="currentColor"/><circle cx="3.5" cy="12" r="1.5" fill="currentColor"/></svg>`,
  night: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  final: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18 L4.5 8 L9 12 L12 6 L15 12 L19.5 8 L21 18 Z"/><rect x="3" y="18.4" width="18" height="2"/></svg>`,
};

const STAGES = [
  { id: "T1",  group: "Day 1",  type: "task",  label: "Task 1" },
  { id: "RT1", group: "Day 1",  type: "rt",    label: "Round Table 1" },
  { id: "N1",  group: "Day 1",  type: "night", label: "Night 1" },
  { id: "T2",  group: "Day 2",  type: "task",  label: "Task 2" },
  { id: "RT2", group: "Day 2",  type: "rt",    label: "Round Table 2" },
  { id: "N2",  group: "Day 2",  type: "night", label: "Night 2" },
  { id: "T3",  group: "Day 3",  type: "task",  label: "Task 3" },
  { id: "RT3", group: "Day 3",  type: "rt",    label: "Round Table 3" },
  { id: "N3",  group: "Day 3",  type: "night", label: "Night 3" },
  { id: "FT",  group: "Finale", type: "task", label: "Final Task" },
  { id: "F",   group: "Finale", type: "final", label: "Final" },
];

async function fetchState() {
  const res = await fetch("/api/state");
  const data = await res.json();
  players = data.players;
  currentStage = data.stage;
  return data;
}

async function setStage(stage) {
  const res = await fetch("/api/stage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error(`failed: ${res.status}`);
  return res.json();
}

async function setStatus(id, status) {
  const res = await fetch(`/api/player/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`failed: ${res.status}`);
  return res.json();
}

async function setShield(id, shielded) {
  const res = await fetch(`/api/player/${id}/shield`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shielded }),
  });
  if (!res.ok) throw new Error(`failed: ${res.status}`);
  return res.json();
}

async function resetGame() {
  await fetch("/api/reset", { method: "POST" });
  render();
}

function cardHTML(p) {
  const photoUrl = `/static/photos/${p.photo}`;
  const roleClass = p.status === "banished" ? "revealed " + p.role : "";
  const roleText = p.status === "banished" ? p.role : "&nbsp;";
  const isShielded = p.shielded && p.status === "active";
  const shieldHTML = isShielded ? `
    <div class="shield-overlay">
      <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 4 L 96 18 V 60 Q 96 100 50 116 Q 4 100 4 60 V 18 Z"
              fill="#c9a24a" stroke="#3a2810" stroke-width="3"/>
        <path d="M 50 12 L 88 23 V 60 Q 88 94 50 107 Q 12 94 12 60 V 23 Z"
              fill="none" stroke="#6b4d1a" stroke-width="2"/>
        <path d="M 50 8 L 92 20 V 56 Q 92 72 78 80"
              fill="none" stroke="#f0d488" stroke-width="2.5" opacity="0.8"/>
      </svg>
    </div>
  ` : "";
  const shieldDisabled = p.status !== "active" ? "disabled" : "";
  const murderDisabled = isShielded ? "disabled" : "";
  return `
    <div class="card ${p.status} ${isShielded ? 'shielded' : ''}" data-id="${p.id}">
      <div class="frame">
        <div class="photo" style="background-image: url('${photoUrl}')">
          <div class="cross"></div>
          <div class="overlay"></div>
          ${shieldHTML}
        </div>
      </div>
      <div class="name">${p.name}</div>
      <div class="role ${roleClass}">${roleText}</div>
      <div class="actions">
        <button data-action="active"   class="${p.status === 'active' ? 'active' : ''}">Active</button>
        <button data-action="banished" class="${p.status === 'banished' ? 'active' : ''}">Banish</button>
        <button data-action="murdered" class="${p.status === 'murdered' ? 'active' : ''}" ${murderDisabled}>Murder</button>
        <button data-action="shield"   class="${isShielded ? 'active' : ''}" ${shieldDisabled}>${isShielded ? 'Unshield' : 'Shield'}</button>
      </div>
    </div>
  `;
}

function renderSidebar() {
  const groups = [];
  for (const s of STAGES) {
    let g = groups.find((g) => g.name === s.group);
    if (!g) {
      g = { name: s.group, items: [] };
      groups.push(g);
    }
    g.items.push(s);
  }
  sidebarStages.innerHTML = groups.map((g) => `
    <div class="stage-group">
      <div class="stage-group-label">${g.name}</div>
      ${g.items.map((s) => `
        <button class="stage-item ${s.id === currentStage ? "current" : ""}" data-stage="${s.id}" type="button">
          <span class="stage-icon">${STAGE_ICONS[s.type]}</span>
          <span class="stage-label">${s.label}</span>
        </button>
      `).join("")}
    </div>
  `).join("");
}

async function render() {
  await fetchState();
  grid.innerHTML = players.map(cardHTML).join("");
  renderSidebar();
}

grid.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn || btn.disabled) return;
  const card = btn.closest(".card");
  const id = card.dataset.id;
  const action = btn.dataset.action;
  if (action === "shield") {
    const player = players.find((p) => p.id === id);
    await setShield(id, !player.shielded);
  } else {
    await setStatus(id, action);
  }
  render();
});

resetBtn.addEventListener("click", () => {
  if (confirm("Reset the game? All players will be marked active.")) resetGame();
});

sidebarStages.addEventListener("click", async (e) => {
  const btn = e.target.closest(".stage-item");
  if (!btn) return;
  const stage = btn.dataset.stage;
  if (stage === currentStage) return;
  await setStage(stage);
  render();
});

const titleScreen = document.getElementById("title-screen");
const enterBtn = document.getElementById("enter-btn");
enterBtn.addEventListener("click", () => {
  titleScreen.classList.add("hidden");
  setTimeout(() => titleScreen.remove(), 800);
});

render();
