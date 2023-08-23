import * as fetchInfo from "./fetchInfo.js";

export async function resetAlbums() {
  const token = localStorage.getItem("accessToken");
  const albums = await fetchInfo.fetchAlbums();
  const chunkSize = 50;
  while (albums.length > 0) {
    const chunk = albums.splice(0, chunkSize);
    const albumIds = chunk.join();
    await fetch(`https://api.spotify.com/v1/me/albums?ids=${albumIds}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export async function resetArtists() {
  const token = localStorage.getItem("accessToken");
  const artists = await fetchInfo.fetchArtists();
  const chunkSize = 50;
  while (artists.length > 0) {
    const chunk = artists.splice(0, chunkSize);
    const artistIds = chunk.join();
    await fetch(
      `https://api.spotify.com/v1/me/following?type=artist&ids=${artistIds}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }
}

export async function resetTracks() {
  const token = localStorage.getItem("accessToken");
  const tracks = await fetchInfo.fetchTracks();
  const chunkSize = 50;
  while (tracks.length > 0) {
    const chunk = tracks.splice(0, chunkSize);
    const trackIds = chunk.join();
    await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackIds}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
