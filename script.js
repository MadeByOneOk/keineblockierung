
async function playSong(url, title, author) {
  audio.src = url;
  await audio.play();

  message.textContent = "Jetzt läuft: " + title +
    (author ? " - " + author : "");

  message.classList.add("success");
}

// NORMAL SEARCH
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

    await playSong(result.url, result.title || code, result.author || "");

  } catch (error) {
    message.textContent = "Fehler: " + error.message;
    console.error(error);
  }
});

// RANDOM SONG
randomButton.addEventListener("click", async () => {
  randomButton.disabled = true;
  message.textContent = "Zufälliges Lied wird gesucht...";
  message.classList.remove("success");

  try {
    const response = await fetch(API_URL + "?action=random");
    const result = await response.json();

    if (!result.url) {
      throw new Error(result.error || "Kein Lied gefunden");
    }

    await playSong(result.url, result.title, result.author);

  } catch (error) {
    message.textContent = "Fehler: " + error.message;
    console.error(error);
  } finally {
    randomButton.disabled = false;
  }
});
