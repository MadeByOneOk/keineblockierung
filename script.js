const API_URL = "https://script.google.com/macros/s/AKfycbxpQMnd5R6rcEybyze9EPAfrSL3Ps0AmNah53Wy77dJs18dhaA4IkFfTX94QufQiH3yvA/exec";

const form = document.getElementById("lookupForm");
const input = document.getElementById("ytvid");
const message = document.getElementById("message");
const randomButton = document.getElementById("randomSong");

const bassSlider = document.getElementById("bassSlider");
const bassValue = document.getElementById("bassValue");
const bassFace = document.getElementById("bassFace");

const bassFilter = new Tone.Filter({
  type: "lowshelf",
  frequency: 150,
  gain: 1
}).toDestination();

let player = null;
let loopEnabled = false;

const loopButton = document.getElementById("loopButton");

loopButton.addEventListener("click", () => {
  loopEnabled = !loopEnabled;

  if (player) {
    player.loop = loopEnabled;
  }

  loopButton.textContent = loopEnabled ? "LOOP: ON" : "LOOP: OFF";
});

/* BASS CONTROL */
function updateBass() {
  const value = Number(bassSlider.value);

  bassFilter.gain.rampTo(value, 0.1);
  bassValue.textContent = value + " dB";

  if (value <= 10) {
    bassFace.textContent = ";)";
  } else if (value <= 20) {
    bassFace.textContent = ":)";
  } else if (value <= 30) {
    bassFace.textContent = ":0";
  } else if (value <= 40) {
    bassFace.textContent = ":l";
  } else {
    bassFace.textContent = ">:)";
  }
}

bassSlider.addEventListener("input", updateBass);
updateBass();

/* STOP CURRENT SONG SAFELY */
function stopCurrentPlayer() {
  if (!player) return;

  try {
    if (player.state === "started") {
      player.stop();
    }
  } catch (error) {
    console.warn("Player stop:", error);
  }

  player.dispose();
  player = null;
}

/* PLAY A SONG */
async function playSong(result) {
  stopCurrentPlayer();

  if (!result.url) {
    throw new Error(result.error || "Kein Lied gefunden.");
  }

  const nextPlayer = new Tone.Player({
    url: result.url,

    onload: () => {
      if (player !== nextPlayer) return;

      nextPlayer.start();
      

      message.textContent =
        "Jetzt läuft: " +
        (result.title || result.code || "Unbekannt") +
        (result.author ? " - " + result.author : "");

      message.classList.add("success");
    },

    onerror: (error) => {
  message.textContent = "Audiofehler: " + error.message;
  message.classList.remove("success");
}
});

player = nextPlayer;
nextPlayer.loop = loopEnabled;
nextPlayer.connect(bassFilter);
}
/* LOOKUP SONG */
async function lookup(url) {
  stopCurrentPlayer();

  message.textContent = "Suche läuft...";
  message.classList.remove("success");

  const response = await fetch(url);
  const result = await response.json();

  if (!result.url) {
    throw new Error(result.error || "Kein passendes Lied gefunden.");
  }

  await playSong(result);
}

/* NORMAL SONG SEARCH */
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const code = input.value.trim();

  if (!code) return;

  try {
    await Tone.start();

    await lookup(
      API_URL + "?code=" + encodeURIComponent(code)
    );

  } catch (error) {
    message.textContent = "Fehler: " + error.message;
    message.classList.remove("success");
    console.error("Search error:", error);
  }
});

/* RANDOM SONG */
randomButton.addEventListener("click", async () => {
  randomButton.disabled = true;

  try {
    await Tone.start();

    await lookup(API_URL + "?action=random");

  } catch (error) {
    message.textContent = "Fehler: " + error.message;
    message.classList.remove("success");
    console.error("Random song error:", error);

  } finally {
    randomButton.disabled = false;
  }
});

/* AUDIO VISUALIZER */
const analyser = new Tone.Analyser("fft", 64);
bassFilter.connect(analyser);

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  const data = analyser.getValue();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bars = 48;
  const barWidth = canvas.width / bars;

  for (let i = 0; i < bars; i++) {
    const value = Math.max(
      0,
      Math.min(1, (data[i] + 100) / 100)
    );

    const height = Math.max(2, value * canvas.height);

    ctx.fillStyle = "#ff1018";
    ctx.shadowColor = "#ff1018";
    ctx.shadowBlur = 12;

    ctx.fillRect(
      i * barWidth + 2,
      canvas.height - height,
      barWidth - 4,
      height
    );
  }

  ctx.shadowBlur = 0;
}

drawVisualizer();
