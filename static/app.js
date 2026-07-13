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

// Which main page each stage type opens when selected in the sidebar.
// Task stages get their own content page; action stages jump to the grid.
const STAGE_PAGE = { task: "task", rt: "players", night: "players", final: "players" };

// Content for the task stages. A stage with more than one entry in `tasks`
// shows a sub-tab per subtask. A `reveals` entry is content hidden behind a
// button (riddles, images, the prize) so hosts can unveil it on cue — swap the
// placeholder `body` for the real riddle sheet / picture when ready.
const TASK_CONTENT = {
  T1: {
    tasks: [
      {
        name: "The Riddle Race",
        teamSize: "~4 players per team",
        prize: "1 shield — first team home",
        rules: "Each team races to solve five riddles. The first team to bring a fully correct sheet to a host wins. Hosts check the answers; a sheet with any wrong answer is sent back to be fixed. Reveal the riddles below once every team is ready.",
        reveals: [
          { button: "Reveal", label: "Riddles", body: `
            <ol class="riddle-list">
              <li>
                <p class="riddle-q">I am always old, but sometimes new. I'm never sad, but sometimes I am blue. I am never empty, but only sometimes full. I never push, but I always pull. What am I?</p>
              </li>
              <li>
                <p class="riddle-q">I don't have lungs yet air I need; and just like you on food I feed. Although, unchecked, I can cause strife; a douse with water ends my life. What am I?</p>
              </li>
              <li>
                <p class="riddle-q">I can be white or just barefaced; and leave the plodding truth outpaced. Yet under oath I'm redefined — for "perjury" you'll be confined. What am I?</p>
              </li>
              <li>
                <p class="riddle-q">I can be white or just barefaced; and leave the plodding truth outpaced. Yet under oath I'm redefined — for "perjury" you'll be confined. What am I?</p>
              </li>
              <li>
                <p class="riddle-q">I am an odd number. Take away a letter, and I become even. What number am I?</p>
              </li>
            </ol>` },
        ],
      },
    ],
  },
  T2: {
    tasks: [
      {
        name: "Hula Hoop Pass",
        teamSize: "~8 players per team",
        prize: "1 shield — fastest team",
        rules: "Teams link arms in a chain. The fastest team to pass a hula hoop all the way over — without breaking the chain — wins.",
      },
      {
        name: "Memory Game",
        teamSize: "~4 players per team",
        prize: "1 shield — most items recalled",
        rules: "A picture of assorted items is shown on screen for a minute. Teams then recall as many items as they can. Teams will swap sheets for marking; the team with the most correct items recalled wins.",
        reveals: [
          { button: "Reveal picture", label: "The picture", body: `<img class="reveal-img" src="/static/85_item_image.png" alt="Items to memorise">` },
          { button: "Reveal answers", label: "Answer sheet", body: `
            <ol class="answer-list">
              <li>(Henricks) gin</li>
              <li>Double decker bus</li>
              <li>Lego man</li>
              <li>Cafetière</li>
              <li>Headphones</li>
              <li>China plate</li>
              <li>(Ready salted) crisps</li>
              <li>Wrench</li>
              <li>WD40</li>
              <li>(Ikea) bag</li>
              <li>(Sockeye) salmon</li>
              <li>Marmite</li>
              <li>(Nissan) car</li>
              <li>Sunglasses</li>
              <li>(Financial Times) newspaper</li>
              <li>(Negroni) cocktail</li>
              <li>(Cheerios) cereal</li>
              <li>Hockey stick</li>
              <li>Camera</li>
              <li>(Colman's) mustard</li>
              <li>Spacehopper</li>
              <li>Bicycle</li>
              <li>(Haagen dazs) ice cream</li>
              <li>Airpods</li>
              <li>Vesper moped</li>
              <li>Sausage roll</li>
              <li>(Cypressa) olives</li>
              <li>(Nord) keyboard</li>
              <li>(Birkenstocks) sandal</li>
              <li>Barbecue</li>
              <li>Tinned tuna</li>
              <li>Greggs bag</li>
              <li>JCB digger</li>
              <li>Sunderland shirt</li>
              <li>Microphone</li>
              <li>(Green giant) sweetcorn</li>
              <li>Deck of cards</li>
              <li>Catan</li>
              <li>Water bottle</li>
              <li>Rollerskate</li>
              <li>Helicopter</li>
              <li>(Twinings) tea</li>
              <li>(Macbook) laptop</li>
              <li>Pen</li>
              <li>(Macallan) whiskey</li>
              <li>Lizard</li>
              <li>(Converse) shoes</li>
              <li>Nutella</li>
              <li>Calculator</li>
              <li>Monopoly</li>
              <li>Candle</li>
              <li>Umbrella</li>
              <li>Watch</li>
              <li>Lamp</li>
              <li>Lego brick</li>
              <li>Pritt stick</li>
              <li>Trowel</li>
              <li>Shuttlecock</li>
              <li>(Sopranos) Blu-ray boxset</li>
              <li>Keys</li>
              <li>Top hat</li>
              <li>Hoodie</li>
              <li>Brick phone</li>
              <li>Rugby ball</li>
              <li>Flask</li>
              <li>(Playstation) controller</li>
              <li>Fruit pastilles</li>
              <li>Penknife</li>
              <li>Toblerone</li>
              <li>Cellotape</li>
              <li>Dice</li>
              <li>Postbox</li>
              <li>(Tyrell's) crisps</li>
              <li>Rubber gloves</li>
              <li>Hairdryer</li>
              <li>(Madrí) beer</li>
              <li>Teapot</li>
              <li>Padlock</li>
              <li>HP sauce</li>
              <li>Batteries</li>
              <li>Parrot</li>
              <li>Dune uprising</li>
              <li>Paper aeroplane</li>
              <li>Skateboard</li>
              <li>Coca Cola</li>
            </ol>` },
        ],
      },
    ],
  },
  T3: {
    tasks: [
      {
        name: "Paper Aeroplane",
        teamSize: "~3 players per team",
        prize: "1 shield — longest flight",
        rules: "Teams construct paper aeroplanes from the supplied paper. Each team gets one measured throw; the plane that flies the furthest wins.",
      },
      {
        name: "Solo Cup Challenge",
        teamSize: "~6 players per team",
        prize: "1 shield — first to fill all cups",
        rules: "Ten cups are arranged for each team. The first team to land a ball in all ten cups wins.",
      },
    ],
  },
  FT: {
    tasks: [
      {
        name: "Stick or Swap",
        teamSize: "1 v 1 — 8 finalists",
        prize: "Special prize (see below)",
        rules: "A single-elimination bracket. In each round two players draw a card. One looks at their own card, then the other must decide to stick with the card they hold or swap it for their opponent's. The higher card wins and advances.",
        reveals: [
          { button: "Reveal", label: "Prize", body: "The winner takes one other finalist of their choosing into a separate room, who must then tell them truthfully whether they are a Traitor or a Faithful." },
        ],
      },
    ],
  },
};

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
  await render();
  // Reset returns the game to the start: stage is back to Task 1, so show its page.
  renderTaskPage("T1");
  showPage("task");
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

function renderPhaseDiagram() {
  const container = document.getElementById("phase-diagram");
  if (!container) return;
  const groups = [];
  for (const s of STAGES) {
    let g = groups.find((g) => g.name === s.group);
    if (!g) {
      g = { name: s.group, items: [] };
      groups.push(g);
    }
    g.items.push(s);
  }
  container.innerHTML = groups.map((g) => `
    <div class="phase-row">
      <div class="phase-day-label">${g.name}</div>
      <div class="phase-cards">
        ${g.items.map((s, i) => `
          ${i > 0 ? '<div class="phase-arrow">&rarr;</div>' : ""}
          <div class="phase-card phase-${s.type}">
            <span class="phase-icon">${STAGE_ICONS[s.type]}</span>
            <span class="phase-name">${s.label}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function taskBlockHTML(t) {
  return `
    <div class="task-block">
      <div class="task-block-head">
        <h2 class="task-name">${t.name}</h2>
        <div class="task-badges">
          <span class="task-badge">${t.teamSize}</span>
          <span class="task-badge prize">${t.prize}</span>
        </div>
      </div>
      <p class="task-rules">${t.rules}</p>
      ${(t.reveals && t.reveals.length) ? `
        <div class="reveal-row">
          ${t.reveals.map((r, i) => `
            <button class="reveal-btn" type="button" data-reveal="${i}" data-label="${r.button}">${r.button}</button>
          `).join("")}
        </div>
        ${t.reveals.map((r, i) => `
          <div class="reveal-body" data-reveal="${i}" hidden>
            ${r.label ? `<div class="task-media-label">${r.label}</div>` : ""}
            <div class="reveal-content">${r.body}</div>
          </div>
        `).join("")}
      ` : ""}
    </div>
  `;
}

// Multi-subtask stages (Tasks 2 & 3) show one subtask at a time behind sub-tabs.
function renderTaskPage(stageId, subtaskIndex = 0) {
  const container = document.getElementById("task-content");
  if (!container) return;
  const stage = STAGES.find((s) => s.id === stageId);
  const content = TASK_CONTENT[stageId];
  if (!content) {
    container.innerHTML = `<p class="placeholder">No task content for this stage yet.</p>`;
    return;
  }
  container.dataset.stage = stageId;
  const tasks = content.tasks;
  const active = Math.min(Math.max(subtaskIndex, 0), tasks.length - 1);
  // Tabs use a neutral label ("Sub-task N") so players can't read the next
  // task's name off the tab bar. Override per subtask with a `tab` attribute.
  const subtabs = tasks.length > 1 ? `
    <div class="subtask-tabs">
      ${tasks.map((t, i) => `
        <button class="subtask-tab ${i === active ? "active" : ""}" type="button" data-subtask="${i}">${t.tab || `Sub-task ${i + 1}`}</button>
      `).join("")}
    </div>
  ` : "";
  container.innerHTML = `
    <div class="task-eyebrow">${stage.group} &middot; ${stage.label}</div>
    ${subtabs}
    ${taskBlockHTML(tasks[active])}
  `;
}

function showPage(name) {
  document.querySelectorAll(".page").forEach((el) => {
    el.classList.toggle("hidden", el.dataset.page !== name);
  });
  document.querySelectorAll(".page-nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === name);
  });
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
  const stageId = btn.dataset.stage;
  const stage = STAGES.find((s) => s.id === stageId);
  if (stageId !== currentStage) {
    await setStage(stageId);
    await render();
  }
  const page = STAGE_PAGE[stage.type] || "players";
  if (page === "task") renderTaskPage(stageId);
  showPage(page);
});

document.querySelector(".page-nav").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-page]");
  if (!btn) return;
  showPage(btn.dataset.page);
});

const taskContent = document.getElementById("task-content");
taskContent.addEventListener("click", (e) => {
  const subtab = e.target.closest(".subtask-tab");
  if (subtab) {
    renderTaskPage(taskContent.dataset.stage, Number(subtab.dataset.subtask));
    return;
  }
  const revealBtn = e.target.closest(".reveal-btn");
  if (revealBtn) {
    const idx = revealBtn.dataset.reveal;
    const body = revealBtn.closest(".task-block").querySelector(`.reveal-body[data-reveal="${idx}"]`);
    body.hidden = !body.hidden;
    revealBtn.textContent = body.hidden ? revealBtn.dataset.label : "Hide";
    revealBtn.classList.toggle("revealed", !body.hidden);
  }
});

renderPhaseDiagram();

const titleScreen = document.getElementById("title-screen");
const enterBtn = document.getElementById("enter-btn");
enterBtn.addEventListener("click", () => {
  titleScreen.classList.add("hidden");
  setTimeout(() => titleScreen.remove(), 800);
});

render();
