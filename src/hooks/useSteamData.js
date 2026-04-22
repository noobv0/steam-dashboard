// src/hooks/useSteamData.js
import { useState, useCallback } from 'react';
import steamCache from '../data/steam_cache.json';

// Inicializa direto com o cache — sem flash de tela vazia
const initialData    = steamCache?.data    || {};
const initialGames   = steamCache?.games   || {};
const initialPlayers = steamCache?.players || {};

export function useSteamData() {
  const [allData]   = useState(initialData);
  const [allGames]  = useState(initialGames);
  const [players]   = useState(initialPlayers);

  const load  = useCallback(async () => {}, []);
  const reset = useCallback(() => {}, []);

  return {
    phase: 'done',
    loadingStep: 0,
    loadingTotal: 0,
    loadingLabel: '',
    allData,
    allGames,
    players,
    load,
    reset,
  };
}
