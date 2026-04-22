// src/lib/steam.js — Client que chama nosso backend /api/steam

async function steamFetch(endpoint, params = {}) {
  const qs = new URLSearchParams({ endpoint, ...params }).toString();
  const res = await fetch(`/api/steam?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function resolveId(input) {
  input = input.trim();
  if (/^7656119\d{10}$/.test(input)) return input;
  const mProfile = input.match(/\/profiles\/(\d+)/);
  if (mProfile) return mProfile[1];
  let vanity = input;
  const mId = input.match(/\/id\/([^/?]+)/);
  if (mId) vanity = mId[1];
  vanity = vanity.replace(/\/$/, '').trim();
  const data = await steamFetch('ISteamWebAPIUtil/ResolveVanityURL/v1', { vanityurl: vanity });
  if (data?.response?.success === 1) return data.response.steamid;
  return null;
}

export async function getOwnedGames(steamid) {
  const data = await steamFetch('IPlayerService/GetOwnedGames/v1', {
    steamid,
    include_appinfo: 1,
    include_played_free_games: 1,
  });
  return data?.response?.games || [];
}

export async function getPlayerSummaries(steamids) {
  // Pode receber array, manda como string separada por vírgula
  const ids = Array.isArray(steamids) ? steamids.join(',') : steamids;
  const data = await steamFetch('ISteamUser/GetPlayerSummaries/v2', { steamids: ids });
  return data?.response?.players || [];
}

// Busca tags/categorias de um app via Steam Store API
// (não precisa de API key, mas chamamos via proxy do nosso backend pra evitar CORS)
export async function getAppDetails(appids) {
  // appids: array de números
  // Steam Store API: /api/appdetails?appids=...
  const ids = appids.join(',');
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${ids}&filters=categories`);
  if (!res.ok) return {};
  return res.json();
}

// Categorias relevantes da Steam (IDs oficiais)
export const CATEGORY_IDS = {
  multiplayer:    { id: 1,  label: 'Multiplayer' },
  coop:           { id: 9,  label: 'Co-op' },
  localCoop:      { id: 39, label: 'Co-op Local' },
  localMulti:     { id: 7,  label: 'Multi Local' },
  remotePlay:     { id: 44, label: 'Remote Play Together' },
  onlineCoop:     { id: 38, label: 'Co-op Online' },
  pvp:            { id: 49, label: 'PvP' },
};
