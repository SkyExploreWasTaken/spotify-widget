const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

if (!userId) {
    document.getElementById("spotify-activity").innerHTML =
        "<p style='color:white;padding:1rem;'>Discord User ID missing.</p>";
    throw new Error("Missing ?id=<Discord User ID> in URL");
}

async function fetchSpotifyData() {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const json = await res.json();
    return json.data?.listening_to_spotify ? json.data.spotify : null;
}

function msToMinSec(ms) {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

async function renderSpotifyWidget() {
    const container = document.getElementById("spotify-activity");
    if (!container) return;

    const data = await fetchSpotifyData();
    if (!data) {
        container.style.display = "none";
        return;
    } else {
        container.style.display = "block";
    }

    const { song, artist, album_art_url, timestamps, album } = data;
    const duration = timestamps.end - timestamps.start;

    document.querySelector("#spotify-title").textContent = song;
    document.querySelector("#spotify-artist").textContent = artist;
    document.querySelector("#spotify-album").textContent = album;
    document.querySelector(".spotify-cover").src = album_art_url;
    document.querySelector("#spotify-duration").textContent = msToMinSec(duration);

    const bar = document.querySelector("#spotify-bar");
    const elapsedEl = document.querySelector("#spotify-elapsed");

    function updateProgress() {
        const now = Date.now();
        const elapsed = now - timestamps.start;
        const percent = Math.min((elapsed / duration) * 100, 100);

        bar.style.width = `${percent}%`;
        elapsedEl.textContent = msToMinSec(elapsed);
    }

    updateProgress();
    setInterval(updateProgress, 1000);
}

renderSpotifyWidget();
setInterval(renderSpotifyWidget, 15000);