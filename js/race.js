function getFinishX() {
  const track = document.getElementById("track-0");
  return track ? track.clientWidth - 52 : 400;
}

function addBadge(horse, text) {
  const badge = document.createElement("div");
  badge.className = "winner-badge";
  badge.textContent = text;
  document.getElementById(`track-${horse.id}`).appendChild(badge);
}

function pickDoomedHorse() {
  if (Math.random() >= getHeartAttackChance()) return;

  const { collapseMin, collapseMax } = HEART_ATTACK;
  const horse = state.horses[Math.floor(Math.random() * state.horses.length)];
  horse.collapseAt = collapseMin + Math.random() * (collapseMax - collapseMin);
}

function getCollapsePos(horse, finishX) {
  return horse.collapseAt === null ? Infinity : horse.collapseAt * (finishX - 80);
}

function rollStep(horse) {
  if (horse.collapseAt === null) return Math.random() * (MAX_STEP - 0.5) + 0.5;

  const { sprintStepMin, sprintStepMax } = HEART_ATTACK;
  return sprintStepMin + Math.random() * (sprintStepMax - sprintStepMin);
}

function collapseHorse(horse, el) {
  horse.collapsed = true;
  el.classList.remove("running");
  el.classList.add("collapsed");
  addBadge(horse, "💀 Infarto");
  setStatus(`💔 ¡A ${horse.name} le dio un infarto a metros de la meta!`);
}

function isRaceOver() {
  return state.horses.every((h) => h.finished || h.collapsed);
}

function tick() {
  const finishX = getFinishX();
  const { speed } = getConfig();

  state.horses.forEach((h) => {
    if (h.finished || h.collapsed) return;

    const collapsePos = getCollapsePos(h, finishX);
    h.pos = Math.min(h.pos + rollStep(h) * speed * 1.4, collapsePos);
    const el = document.getElementById(`horse-${h.id}`);
    el.style.left = Math.min(80 + h.pos, finishX) + "px";

    if (h.pos >= collapsePos) {
      collapseHorse(h, el);
      return;
    }

    if (80 + h.pos >= finishX) {
      h.finished = true;
      state.finished.push(h);
      el.classList.remove("running");

      const place = state.finished.length;
      addBadge(h, place === 1 ? "🥇 1°" : place === 2 ? "🥈 2°" : place === 3 ? "🥉 3°" : `${place}°`);

      if (place === 1) setStatus(`¡${h.name} va primero!`);
    }
  });

  if (isRaceOver()) {
    clearInterval(state.raceInterval);
    state.running = false;
    showResults();
  }
}

function startRace() {
  if (state.running) return;

  // If last race is fully done, reset before starting a new one
  if (state.finished.length > 0 && isRaceOver()) {
    resetRace();
    return;
  }

  if (!state.horses.length) buildTracks();

  state.running = true;
  document.getElementById("podium").style.display = "none";
  setStatus("¡Y arrancan los caballos!");

  state.horses.forEach((h) => {
    const el = document.getElementById(`horse-${h.id}`);
    const nameVal = document.getElementById(`name-${h.id}`)?.value || DEFAULT_NAMES[h.id];
    const iconVal = document.getElementById(`icon-${h.id}`)?.value || DEFAULT_EMOJIS[h.id];

    h.name = nameVal;
    h.icon = iconVal;
    h.flipped = state.flipState[h.id];

    document.getElementById(`inner-${h.id}`).textContent = iconVal;
    document.getElementById(`lane-label-${h.id}`).textContent = nameVal;

    el.classList.add("running");
    el.classList.remove("configurable");
  });

  pickDoomedHorse();

  const { speed } = getConfig();
  state.raceInterval = setInterval(tick, Math.round(220 / speed));
}

function resetRace() {
  clearInterval(state.raceInterval);
  state.running = false;
  document.getElementById("podium").style.display = "none";
  setStatus("Configura y presiona Iniciar para arrancar la carrera.");
  buildTracks();
}
