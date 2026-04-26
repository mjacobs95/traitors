const grid = document.getElementById("grid");
const resetBtn = document.getElementById("reset-btn");

async function fetchState() {
  const res = await fetch("/api/state");
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

async function resetGame() {
  await fetch("/api/reset", { method: "POST" });
  render();
}

function cardHTML(p) {
  const photoUrl = `/static/photos/${p.photo}`;
  const roleClass = p.status === "banished" ? "revealed " + p.role : "";
  const roleText = p.status === "banished" ? p.role : "&nbsp;";
  return `
    <div class="card ${p.status}" data-id="${p.id}">
      <div class="frame">
        <div class="photo" style="background-image: url('${photoUrl}')">
          <div class="cross"></div>
          <div class="overlay"></div>
        </div>
      </div>
      <div class="name">${p.name}</div>
      <div class="role ${roleClass}">${roleText}</div>
      <div class="actions">
        <button data-action="active"   class="${p.status === 'active' ? 'active' : ''}">Active</button>
        <button data-action="banished" class="${p.status === 'banished' ? 'active' : ''}">Banish</button>
        <button data-action="murdered" class="${p.status === 'murdered' ? 'active' : ''}">Murder</button>
      </div>
    </div>
  `;
}

async function render() {
  const players = await fetchState();
  grid.innerHTML = players.map(cardHTML).join("");
}

grid.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const card = btn.closest(".card");
  const id = card.dataset.id;
  const status = btn.dataset.action;
  await setStatus(id, status);
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
