// src/hooks/useSteamData.js
import { useState, useCallback } from 'react';
import { resolveId, getOwnedGames, getPlayerSummaries } from '../lib/steam';

export function useSteamData() {
  const [phase, setPhase] = useState('setup');
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingTotal, setLoadingTotal] = useState(0);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [allData, setAllData] = useState({});
  const [allGames, setAllGames] = useState({});
  const [players, setPlayers] = useState({});

  const load = useCallback(async (accounts) => {
    setPhase('loading');
    const totalSteps = accounts.length * 2 + 3;
    setLoadingTotal(totalSteps);
    setLoadingStep(0);

    let step = 0;
    const tick = (label) => { step++; setLoadingStep(step); setLoadingLabel(label); };

    const newData = {};
    const newGames = {};
    const steamids = {};

    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      tick(acc.name);
      let sid;
      try { sid = await resolveId(acc.id); } catch {}
      if (!sid) { newData[acc.name] = []; continue; }
      steamids[acc.name] = sid;

      tick(acc.name);
      try {
        const games = await getOwnedGames(sid);
        newData[acc.name] = games;
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
          newGames[g.appid].owners.push(acc.name);
        }
      } catch { newData[acc.name] = []; }
    }

    tick('avatares');
    try {
      const sids = Object.values(steamids);
      const summaries = await getPlayerSummaries(sids);
      const playerMap = {};
      summaries.forEach(p => {
        const name = Object.keys(steamids).find(n => steamids[n] === p.steamid);
        if (name) playerMap[name] = p;
      });
      setPlayers(playerMap);
    } catch {}

    tick('categorias e precos');
    const accountNames = Object.keys(newData);
    // Priorizar jogos em comum entre todos, depois por horas
    const allAppids = Object.values(newGames)
      .sort((a, b) => {
        const aCommon = a.owners.length === accountNames.length;
        const bCommon = b.owners.length === accountNames.length;
        if (aCommon && !bCommon) return -1;
        if (!aCommon && bCommon) return 1;
        return b.totalHours - a.totalHours;
      })
      .slice(0, 400)
      .map(g => g.appid);

    // Batches menores para evitar timeout e bloqueio
    for (let i = 0; i < allAppids.length; i += 5) {
      const batch = allAppids.slice(i, i + 5);
      try {
        const res = await fetch(`/api/steam?endpoint=store/appdetails&appids=${batch.join(',')}`);
        if (!res.ok) {
          console.error(`Erro API Store: ${res.status}`);
          continue;
        }
        const json = await res.json();
        for (const appid of batch) {
          const d = json?.[appid];
          if (d?.success && d.data && newGames[appid]) {
            newGames[appid].categories = (d.data.categories || []).map(c => c.id);
            newGames[appid].price = d.data.price_overview?.final_formatted || null;
            newGames[appid].priceUSD = d.data.price_overview?.final || 0;
          }
        }
      } catch (e) {
        console.error("Erro ao processar batch:", e);
      }
      // Delay maior entre batches para respeitar rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setAllData(newData);
    setAllGames(newGames);
    setLoadingStep(totalSteps);
    setPhase('done');
  }, []);

  const reset = useCallback(() => {
    setPhase('setup');
    setAllData({});
    setAllGames({});
    setPlayers({});
  }, []);

  return { phase, loadingStep, loadingTotal, loadingLabel, allData, allGames, players, load, reset };
}
