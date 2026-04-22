// api/steam.js — Vercel Serverless Function
// Todas as chamadas à Steam passam por aqui, a API key fica só no servidor.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.STEAM_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'STEAM_API_KEY não configurada no Vercel.' });

  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'endpoint obrigatório' });

  // Rota especial: proxy para Steam Store API (sem API key)
  if (endpoint === 'store/appdetails') {
    const { appids, filters = 'categories,price_overview' } = params;
    // Removido cc=br e l=portuguese para testar se a API responde melhor com o padrão
    const url = `https://store.steampowered.com/api/appdetails?appids=${appids}&filters=${filters}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Steam Store respondeu com ${response.status}`);
      const data = await response.json();
      res.setHeader('Cache-Control', 's-maxage=86400'); // cache 24h
      return res.status(200).json(data);
    } catch (err) {
      return res.status(502).json({ error: 'Erro ao contatar Steam Store', detail: err.message });
    }
  }

  // Endpoints Steam Web API (com API key)
  const ALLOWED = [
    'IPlayerService/GetOwnedGames/v1',
    'ISteamUser/GetPlayerSummaries/v2',
    'ISteamWebAPIUtil/ResolveVanityURL/v1',
  ];
  if (!ALLOWED.includes(endpoint)) {
    return res.status(403).json({ error: 'Endpoint não permitido.' });
  }

  const qs = new URLSearchParams({ key: API_KEY, format: 'json', ...params }).toString();
  const url = `https://api.steampowered.com/${endpoint}?${qs}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Erro ao contatar a Steam API', detail: err.message });
  }
}
