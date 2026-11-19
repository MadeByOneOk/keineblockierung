const API_URL = "https://script.google.com/macros/s/AKfycbxpQMnd5R6rcEybyze9EPAfrSL3Ps0AmNah53Wy77dJs18dhaA4IkFfTX94QufQiH3yvA/exec";

const form = document.getElementById("lookupForm");
const input = document.getElementById("ytvid");
const audio = document.getElementById("audio");
const message = document.getElementById("message");

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

    audio.src = result.url;
    await audio.play();

    message.textContent = "Treffer gefunden! Lied wird abgespielt!";
message.classList.add("success");
  } catch (error) {
    message.textContent = "Fehler: " + error.message;
console.error("Audio error:", error);
    console.error(error);
  }
});
