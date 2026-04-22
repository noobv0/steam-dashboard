#!/usr/bin/env node
/**
 * Script de sincronização de dados da Steam
 * Busca dados dos 6 usuários fixos e salva em cache
 * Respeita rate limits da API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, '../src/data/steam_cache.json');
const STEAM_API_KEY = process.env.STEAM_API_KEY;

const ACCOUNTS = {
  "Lírio": "76561198158302059",
  "Kiri": "76561199011715965",
  "Dudu": "76561198833523657",
  "Bambo": "76561199148095723",
  "Nino": "76561198394798327",
  "Carrot": "76561199001083134",
};

// Funções auxiliares
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`Rate limited (429), aguardando ${5000 * (i + 1)}ms...`);
        await sleep(5000 * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(2000 * (i + 1));
    }
  }
}

async function getOwnedGames(steamid) {
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1?key=${STEAM_API_KEY}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1&format=json`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  return data?.response?.games || [];
}

async function getPlayerSummaries(steamids) {
  const ids = Array.isArray(steamids) ? steamids.join(',') : steamids;
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?key=${STEAM_API_KEY}&steamids=${ids}&format=json`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  return data?.response?.players || [];
}

async function getAppDetails(appid) {
  // Chamada individual é mais estável para evitar HTTP 400
  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=categories,price_overview&cc=br&l=portuguese`;
  const res = await fetchWithRetry(url);
  return res.json();
}

async function syncSteamData() {
  console.log('🔄 Iniciando sincronização de dados da Steam...');
  
  const newData = {};
  const newGames = {};
  const steamids = {};

  // 1. Buscar jogos de cada conta
  console.log('\n📥 Buscando jogos de cada conta...');
  for (const [name, sid] of Object.entries(ACCOUNTS)) {
    try {
      console.log(`  → ${name}...`);
      const games = await getOwnedGames(sid);
      newData[name] = games;
      steamids[name] = sid;

      for (const g of games) {
        if (!newGames[g.appid]) {
          newGames[g.appid] = {
            name: g.name || `App ${g.appid}`,
            appid: g.appid,
            totalHours: 0,
            owners: [],
            img: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`,
            categories: [],
            price: null,
            priceUSD: 0,
          };
        }
        newGames[g.appid].totalHours += (g.playtime_forever || 0) / 60;
        newGames[g.appid].owners.push(name);
      }
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ Erro ao buscar ${name}:`, e.message);
    }
  }

  console.log(`✓ Total de ${Object.keys(newGames).length} jogos únicos encontrados`);

  // 2. Buscar avatares
  console.log('\n👤 Buscando avatares...');
  const players = {};
  try {
    const sids = Object.values(steamids);
    const summaries = await getPlayerSummaries(sids);
    summaries.forEach(p => {
      const name = Object.keys(steamids).find(n => steamids[n] === p.steamid);
      if (name) players[name] = p;
    });
    console.log(`✓ ${summaries.length} avatares carregados`);
  } catch (e) {
    console.error('✗ Erro ao buscar avatares:', e.message);
  }

  // 3. Buscar categorias e preços (priorizar jogos em comum)
  console.log('\n💰 Buscando categorias e preços (isso pode demorar)...');
  const accountNames = Object.keys(newData);
  const allAppids = Object.values(newGames)
    .sort((a, b) => {
      const aCommon = a.owners.length === accountNames.length;
      const bCommon = b.owners.length === accountNames.length;
      if (aCommon && !bCommon) return -1;
      if (!aCommon && bCommon) return 1;
      return b.totalHours - a.totalHours;
    })
    .slice(0, 400) // Limite de 400 jogos para não demorar horas
    .map(g => g.appid);

  let successCount = 0;
  for (let i = 0; i < allAppids.length; i++) {
    const appid = allAppids[i];
    try {
      if (i % 10 === 0) {
        console.log(`  → Processando jogo ${i + 1}/${allAppids.length}...`);
      }
      
      const json = await getAppDetails(appid);
      const d = json?.[appid];
      
      if (d?.success && d.data && newGames[appid]) {
        newGames[appid].categories = (d.data.categories || []).map(c => c.id);
        newGames[appid].price = d.data.price_overview?.final_formatted || null;
        newGames[appid].priceUSD = d.data.price_overview?.final || 0;
        successCount++;
      }
      
      // Delay de 1.5s entre cada jogo para ser bem seguro contra rate limit
      await sleep(1500);
    } catch (e) {
      console.error(`  ✗ Erro no appid ${appid}:`, e.message);
      await sleep(3000); // Espera mais se der erro
    }
  }
  console.log(`✓ ${successCount} jogos com dados de categoria/preço atualizados`);

  // 4. Salvar cache
  console.log('\n💾 Salvando cache...');
  const cache = {
    timestamp: new Date().toISOString(),
    data: newData,
    games: newGames,
    players: players,
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`✓ Cache salvo em ${CACHE_FILE}`);
  console.log('\n✅ Sincronização concluída!');
}

// Executar
if (!STEAM_API_KEY) {
  console.error('❌ STEAM_API_KEY não configurada!');
  process.exit(1);
}

syncSteamData().catch(e => {
  console.error('❌ Erro fatal:', e);
  process.exit(1);
});
