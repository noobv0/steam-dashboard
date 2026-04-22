// src/hooks/useSteamData.js
import { useState, useCallback, useEffect } from 'react';
import steamCache from '../data/steam_cache.json';

export function useSteamData() {
  const [phase, setPhase] = useState('done');
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingTotal, setLoadingTotal] = useState(0);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [allData, setAllData] = useState({});
  const [allGames, setAllGames] = useState({});
  const [players, setPlayers] = useState({});

  // Carregar dados do cache na inicialização
  useEffect(() => {
    if (steamCache && steamCache.data) {
      setAllData(steamCache.data);
      setAllGames(steamCache.games);
      setPlayers(steamCache.players);
      setPhase('done');
    }
  }, []);

  const load = useCallback(async (accounts) => {
    // Função load não é mais usada, pois os dados vêm do cache
    // Mas mantemos por compatibilidade com a interface
    setPhase('done');
  }, []);

  const reset = useCallback(() => {
    setPhase('done');
    // Os dados continuam carregados do cache
  }, []);

  return { phase, loadingStep, loadingTotal, loadingLabel, allData, allGames, players, load, reset };
}
