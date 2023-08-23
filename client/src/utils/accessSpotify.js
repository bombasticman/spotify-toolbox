export default async function checkAuth() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const expiresIn = localStorage.getItem("expiresIn");

  // If there's no access token and no 'code' parameter in the URL, initiate the Spotify authentication process.
  if (!accessToken && !code) {
    // First-time connection, so redirect the user to Spotify's authentication flow.
    redirectToAuthCodeFlow(clientId);
  } else if (!accessToken && code) {
    // User has returned from authentication, but there is no access token yet.
    // Get the access token using the received 'code'.
    const tokens = await getAccessToken(clientId, code);
    setStorage(tokens); // Save the access token and related information in local storage.
  } else if (expiresIn < Date.now()) {
    // The access token is expired. Attempt to refresh it using the refresh token.
    const tokens = await refreshAccessToken(clientId, refreshToken);
    if ("error" in tokens) {
      // If the refresh token is invalid, redirect the user to the authentication flow again.
      redirectToAuthCodeFlow(clientId);
      setStorage(tokens); // Save the new access token (if obtained) and related information in local storage.
    } else {
      // The access token has been successfully refreshed.
      setStorage(tokens); // Save the new access token and related information in local storage.
    }
  }
}

async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append(
    "scope",
    "user-read-private user-top-read user-library-read user-library-modify user-follow-read user-follow-modify"
  );
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const tokens = await result.json();
  return tokens;
}

async function refreshAccessToken(clientId, refreshToken) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const tokens = await result.json();
  return tokens;
}

function setStorage(tokens) {
  localStorage.setItem("accessToken", tokens.access_token);
  localStorage.setItem("expiresIn", tokens.expires_in * 1000 + Date.now());
  if ("refresh_token" in tokens) {
    localStorage.setItem("refreshToken", tokens.refresh_token);
  }
}
