document.getElementById("horse-count").addEventListener("change", () => {
  buildConfig();
  if (!state.running) buildTracks();
});

document.getElementById("speed-slider").addEventListener("input", function () {
  document.getElementById("speed-label").textContent = SPEED_LABELS[this.value];
});

document.getElementById("heart-attack-enabled").addEventListener("change", function () {
  document.getElementById("heart-attack-chance").disabled = !this.checked;
});

document.getElementById("heart-attack-chance").addEventListener("input", function () {
  document.getElementById("heart-attack-label").textContent = `${this.value}%`;
});

buildConfig();
buildTracks();
