const grid = document.getElementById("grid");
const resetBtn = document.getElementById("reset-btn");

let players = [];

async function fetchState() {
  const res = await fetch("/api/state");
  players = await res.json();
  return players;
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

async function render() {
  await fetchState();
  grid.innerHTML = players.map(cardHTML).join("");
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

const titleScreen = document.getElementById("title-screen");
const enterBtn = document.getElementById("enter-btn");
enterBtn.addEventListener("click", () => {
  titleScreen.classList.add("hidden");
  setTimeout(() => titleScreen.remove(), 800);
});

render();
