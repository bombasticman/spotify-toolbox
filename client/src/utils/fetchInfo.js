export async function fetchAlbums(limit = 50) {
  const token = localStorage.getItem("accessToken");
  const albums = [];
  let reachedEnd = false;
  while (!reachedEnd) {
    let url = `https://api.spotify.com/v1/me/albums?limit=${limit}`;
    if (albums.length > 0) {
      url += `&offset=${albums.length}`;
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to retrieve liked albums.");
    }
    const data = await response.json();
    const newAlbums = data.items.map((item) => item.album.id);
    if (newAlbums.length === 0) {
      reachedEnd = true;
    } else {
      albums.push(...newAlbums);
    }
  }
  return albums;
}

export async function fetchArtists(limit = 50, allData = false) {
  const token = localStorage.getItem("accessToken");
  const artists = [];
  let reachedEnd = false;
  while (!reachedEnd) {
    let url = `https://api.spotify.com/v1/me/following?type=artist&limit=${limit}`;
    if (artists.length > 0) {
      url += `&after=${artists[artists.length - 1]}`;
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to retrieve followed artists.");
    }
    const data = await response.json();
    if (allData == false) {
      const newArtists = data.artists.items.map((artist) => artist.id);
      if (newArtists.length === 0) {
        reachedEnd = true;
      } else {
        artists.push(...newArtists);
      }
    } else {
      const newArtists = data.artists.items.map((artist) => artist);
      if (newArtists.length === 0) {
        reachedEnd = true;
      } else {
        artists.push(...newArtists);
      }
    }
  }
  return artists;
}

export async function fetchProfile() {
  const token = localStorage.getItem("accessToken");
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function fetchTracks(limit = 50, offset = 0) {
  const token = localStorage.getItem("accessToken");
  const tracks = [];
  while (true) {
    const response = await fetch(
      `https://api.spotify.com/v1/me/tracks?market=ES&limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to retrieve liked tracks.");
    }
    const data = await response.json();
    const newTracks = data.items.map((item) => item.track.id);
    tracks.push(...newTracks);
    if (newTracks.length < limit) {
      break;
    }
    offset += limit;
  }
  return tracks;
}

export async function getTopItems(limit = 50, offsetLimit = null) {
  const token = localStorage.getItem("accessToken");
  const topItems = [];
  let offset = 0;
  while (true) {
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to retrieve top items.");
    }
    const data = await response.json();
    const newItems = data.items;
    topItems.push(...data.items);
    if (newItems.length < limit) {
      break;
    }
    offset += limit;
    if (offsetLimit != null && offset >= offsetLimit) {
      return topItems;
    }
    return topItems;
  }
}
