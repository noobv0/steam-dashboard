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
    // total steps: resolve + games per account + avatars + categories
    const totalSteps = accounts.length * 2 + 2;
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
            };
          }
          newGames[g.appid].totalHours += (g.playtime_forever || 0) / 60;
          newGames[g.appid].owners.push(acc.name);
        }
      } catch { newData[acc.name] = []; }
    }

    // Avatares
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

    // Categorias via nosso backend (sem CORS)
    tick('categorias');
    const commonAppids = Object.values(newGames)
      .filter(g => g.owners.length > 1)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 300)
      .map(g => g.appid);

    for (let i = 0; i < commonAppids.length; i += 10) {
      const batch = commonAppids.slice(i, i + 10);
      try {
        const res = await fetch(`/api/steam?endpoint=store/appdetails&appids=${batch.join(',')}`);
        const json = await res.json();
        for (const appid of batch) {
          const d = json?.[appid];
          if (d?.success && newGames[appid]) {
            newGames[appid].categories = (d.data?.categories || []).map(c => c.id);
            newGames[appid].price = d.data?.price_overview?.final_formatted || null;
          }
        }
      } catch {}
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