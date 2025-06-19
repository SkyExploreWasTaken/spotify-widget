const userId = '1049263707177353247';

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
  const container = document.getElementById('spotify-activity');
  if (!container) return;

  const data = await fetchSpotifyData();
  if (!data) {
    container.innerHTML = '';
    return;
  }

  const templateRes = await fetch('spotify-widget-template.html');
  const templateHtml = await templateRes.text();
  container.innerHTML = templateHtml;

  const { song, artist, album_art_url, timestamps } = data;
  const duration = timestamps.end - timestamps.start;

  document.querySelector('#spotify-title').textContent = song;
  document.querySelector('#spotify-artist').textContent = artist;
  document.querySelector('#spotify-album').textContent = data.album;
  document.querySelector('.spotify-cover').src = album_art_url;
  document.querySelector('#spotify-duration').textContent = msToMinSec(duration);

  const bar = document.querySelector('#spotify-bar');
  const elapsedEl = document.querySelector('#spotify-elapsed');

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