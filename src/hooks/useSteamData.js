// src/hooks/useSteamData.js
import { useState, useCallback } from 'react';
import { resolveId, getOwnedGames, getPlayerSummaries } from '../lib/steam';

export function useSteamData() {
  const [phase, setPhase] = useState('setup'); // setup | loading | done
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingTotal, setLoadingTotal] = useState(0);
  const [error, setError] = useState('');
  const [allData, setAllData] = useState({});   // { name: games[] }
  const [allGames, setAllGames] = useState({});  // { appid: GameEntry }
  const [players, setPlayers] = useState({});    // { name: playerSummary }

  const load = useCallback(async (accounts) => {
    setError('');
    setPhase('loading');
    setLoadingTotal(accounts.length);
    setLoadingStep(0);

    const newData = {};
    const newGames = {};
    const steamids = {};

    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      setLoadingMsg(`Resolvendo perfil de ${acc.name}...`);
      setLoadingStep(i);

      let sid;
      try {
        sid = await resolveId(acc.id);
      } catch {}

      if (!sid) {
        setError(prev => prev + `\nNão foi possível resolver: ${acc.name}`);
        newData[acc.name] = [];
        continue;
      }
      steamids[acc.name] = sid;

      setLoadingMsg(`Carregando jogos de ${acc.name}... (${i + 1}/${accounts.length})`);
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
              categories: [],   // preenchido depois
              price: null,
            };
          }
          newGames[g.appid].totalHours += (g.playtime_forever || 0) / 60;
          newGames[g.appid].owners.push(acc.name);
        }
      } catch (err) {
        console.error(err);
        newData[acc.name] = [];
      }
    }

    setLoadingMsg('Carregando avatares...');
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

    // Busca categorias dos jogos em comum (top 200 para não sobrecarregar)
    setLoadingMsg('Buscando categorias dos jogos...');
    const names = Object.keys(newData);
    const commonAppids = Object.values(newGames)
      .filter(g => g.owners.length > 1)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 200)
      .map(g => g.appid);

    // Busca em lotes de 10 (limite da Steam Store API)
    for (let i = 0; i < commonAppids.length; i += 10) {
      const batch = commonAppids.slice(i, i + 10);
      try {
        const res = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${batch.join(',')}&filters=categories,price_overview`
        );
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
    setLoadingStep(accounts.length);
    setPhase('done');
  }, []);

  const reset = useCallback(() => {
    setPhase('setup');
    setAllData({});
    setAllGames({});
    setPlayers({});
    setError('');
  }, []);

  return { phase, loadingMsg, loadingStep, loadingTotal, error, allData, allGames, players, load, reset };
}
