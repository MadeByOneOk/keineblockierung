
const API_URL = "https://script.google.com/macros/s/AKfycbxpQMnd5R6rcEybyze9EPAfrSL3Ps0AmNah53Wy77dJs18dhaA4IkFfTX94QufQiH3yvA/exec";

const form = document.getElementById("lookupForm");
const input = document.getElementById("ytvid");
const audio = document.getElementById("audio");
const message = document.getElementById("message");
const randomButton = document.getElementById("randomSong");

// PLAY A SONG
async function playSong(result) {
  audio.src = result.url;
  await audio.play();

  const songName = result.title || result.code || "Unbekannt";
  const author = result.author ? " - " + result.author : "";

  message.textContent =
    "Jetzt läuft: " + songName + author;

  message.classList.add("success");
}

// NORMAL YTVID SEARCH
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const code = input.value.trim();

  if (!code) return;

  message.textContent = "Suche läuft...";
  message.classList.remove("success");

  try {
    const response = await fetch(
      API_URL + "?code=" + encodeURIComponent(code)
    );

    const result = await response.json();

    if (!result.url) {
      message.textContent = "Kein passendes Lied gefunden.";
      return;
    }

    await playSong(result);

  } catch (error) {
    message.textContent = "Fehler: " + error.message;
    console.error("Search error:", error);
  }
});

// RANDOM SONG BUTTON
randomButton.addEventListener("click", async () => {
  randomButton.disabled = true;

  message.textContent = "Zufälliges Lied wird gesucht...";
  message.classList.remove("success");

  try {
    const response = await fetch(API_URL + "?action=random");
    const result = await response.json();

    if (!result.url) {
      throw new Error(result.error || "Kein Lied gefunden.");
    }

    await playSong(result);

  } catch (error) {
    message.textContent = "Fehler: " + error.message;
    console.error("Random song error:", error);

  } finally {
    randomButton.disabled = false;
  }
});
