function getConfig() {
  return {
    count: parseInt(document.getElementById("horse-count").value),
    speed: parseInt(document.getElementById("speed-slider").value),
  };
}

function getHeartAttackChance() {
  const enabled = document.getElementById("heart-attack-enabled").checked;
  const percent = parseInt(document.getElementById("heart-attack-chance").value);
  return enabled ? percent / 100 : 0;
}

function toggleFlip(i) {
  state.flipState[i] = !state.flipState[i];
  const inner = document.getElementById(`inner-${i}`);
  if (inner) inner.classList.toggle("flipped", state.flipState[i]);
  const hint = document.getElementById(`flip-hint-${i}`);
}

function buildConfig(savedOverride) {
  const { count } = getConfig();
  const panel = document.getElementById("config-panel");

  const saved = savedOverride ?? Array.from({ length: 8 }, (_, i) => ({
    name: document.getElementById(`name-${i}`)?.value ?? DEFAULT_NAMES[i],
    icon: document.getElementById(`icon-${i}`)?.value ?? DEFAULT_EMOJIS[i],
  }));

  panel.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const row = document.createElement("div");
    row.className = "config-row";

    const num = document.createElement("span");
    num.className = "horse-num";
    num.textContent = i + 1;

    const iconSel = document.createElement("select");
    iconSel.className = "icon-select";
    iconSel.id = `icon-${i}`;
    ALL_EMOJIS.forEach((e) => {
      const opt = document.createElement("option");
      opt.value = e;
      opt.textContent = e;
      if (e === saved[i].icon) opt.selected = true;
      iconSel.appendChild(opt);
    });

    const nameIn = document.createElement("input");
    nameIn.type = "text";
    nameIn.className = "name-input";
    nameIn.id = `name-${i}`;
    nameIn.maxLength = 16;
    nameIn.placeholder = DEFAULT_NAMES[i];
    nameIn.value = saved[i].name;

    const hint = document.createElement("span");
    hint.className = "flip-hint";
    hint.id = `flip-hint-${i}`;

    row.append(num, iconSel, nameIn, hint);

    if (count > 2) {
      const del = document.createElement("button");
      del.className = "remove-horse";
      del.textContent = "×";
      del.title = "Eliminar caballo";
      del.onclick = () => removeHorse(i);
      row.appendChild(del);
    }

    panel.appendChild(row);
  }
}

function removeHorse(index) {
  const saved = Array.from({ length: 8 }, (_, i) => ({
    name: document.getElementById(`name-${i}`)?.value ?? DEFAULT_NAMES[i],
    icon: document.getElementById(`icon-${i}`)?.value ?? DEFAULT_EMOJIS[i],
  }));

  saved.splice(index, 1);

  const { count } = getConfig();
  document.getElementById("horse-count").value = count - 1;
  buildConfig(saved);
  if (!state.running) buildTracks();
}

function buildTracks() {
  const { count } = getConfig();
  const container = document.getElementById("tracks");
  container.innerHTML = "";
  state.horses = [];
  state.finished = [];

  for (let i = 0; i < count; i++) {
    const name = document.getElementById(`name-${i}`)?.value || DEFAULT_NAMES[i];
    const icon = document.getElementById(`icon-${i}`)?.value || DEFAULT_EMOJIS[i];

    const track = document.createElement("div");
    track.className = "track";
    track.id = `track-${i}`;

    const finishLine = document.createElement("div");
    finishLine.className = "finish-line";

    const label = document.createElement("div");
    label.className = "lane-label";
    label.id = `lane-label-${i}`;
    label.textContent = name;

    const horseEl = document.createElement("div");
    horseEl.className = "horse configurable";
    horseEl.id = `horse-${i}`;
    horseEl.style.left = "80px";
    horseEl.title = "Click para voltear";
    horseEl.onclick = () => { if (!state.running) toggleFlip(i); };

    const inner = document.createElement("span");
    inner.className = "horse-inner" + (state.flipState[i] ? " flipped" : "");
    inner.id = `inner-${i}`;
    inner.textContent = icon;

    horseEl.appendChild(inner);
    track.append(finishLine, label, horseEl);
    container.appendChild(track);

    state.horses.push({ id: i, pos: 0, name, icon, finished: false, collapseAt: null, collapsed: false });
  }
}

function showResults() {
  document.getElementById("status-msg").textContent =
    `¡Carrera terminada! Ganador: ${state.finished[0].name} 🎉`;

  const list = document.getElementById("podium-list");
  list.innerHTML = "";
  const collapsed = state.horses.filter((h) => h.collapsed);
  [...state.finished, ...collapsed].forEach((h, i) => {
    const item = document.createElement("div");
    item.className = "podium-item";
    const medal = h.collapsed ? "💀" : MEDALS[i] ?? `${i + 1}°`;
    item.innerHTML = `<span class="medal">${medal}</span> <span>${h.icon} ${h.name}</span>`;
    list.appendChild(item);
  });

  document.getElementById("podium").style.display = "block";
}

function bulkLoadNames(str) {
  const names = str.split(";").map((s) => s.trim()).filter(Boolean);
  if (!names.length) return;

  const count = Math.min(Math.max(names.length, 2), 8);
  document.getElementById("horse-count").value = count;
  buildConfig();
  if (!state.running) buildTracks();

  names.slice(0, count).forEach((name, i) => {
    const input = document.getElementById(`name-${i}`);
    if (input) input.value = name;
  });

  setStatus(`${Math.min(names.length, count)} caballos cargados.`);
}

function setStatus(msg) {
  document.getElementById("status-msg").textContent = msg;
}
