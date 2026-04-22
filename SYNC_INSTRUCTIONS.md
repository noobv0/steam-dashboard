# 🔄 Sincronização de Dados - SteamKin

Este projeto agora usa um sistema de **cache com sincronização automática** para evitar problemas de rate limit da Steam API.

## 📋 Como Funciona

1. **Script de Sincronização** (`scripts/sync-steam-data.js`): Busca dados dos 6 usuários fixos e salva em `src/data/steam_cache.json`
2. **Frontend Rápido**: O dashboard carrega instantaneamente do cache, sem fazer requisições à Steam
3. **Atualização Periódica**: Execute o script manualmente ou via GitHub Actions para atualizar os dados

## 🚀 Executar Sincronização Manualmente

### Localmente (com Node.js 18+)

```bash
# Defina a variável de ambiente com sua chave da Steam API
export STEAM_API_KEY="sua_chave_aqui"

# Execute o script
npm run sync-steam
```

### No Vercel (via CLI)

```bash
# Instale o Vercel CLI
npm i -g vercel

# Execute com a chave de ambiente
vercel env pull
npm run sync-steam
```

## ⏰ Atualização Automática (GitHub Actions)

Para automatizar a sincronização, crie um arquivo `.github/workflows/sync-steam.yml`:

```yaml
name: Sincronizar Dados da Steam

on:
  schedule:
    - cron: '0 */6 * * *'  # A cada 6 horas
  workflow_dispatch:  # Permitir execução manual

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run sync-steam
        env:
          STEAM_API_KEY: ${{ secrets.STEAM_API_KEY }}
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'chore: atualizar cache de dados da Steam'
          file_pattern: 'src/data/steam_cache.json'
```

## 📊 Estrutura do Cache

O arquivo `src/data/steam_cache.json` contém:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "Lírio": [...],
    "Kiri": [...],
    ...
  },
  "games": {
    "730": {
      "name": "Counter-Strike 2",
      "appid": 730,
      "categories": [1, 9, 38],
      "priceUSD": 0,
      ...
    },
    ...
  },
  "players": {
    "Lírio": {...},
    ...
  }
}
```

## 🔑 Configurando a Chave da Steam API

1. Acesse: https://steamcommunity.com/dev/apikey
2. Copie sua chave
3. Configure como variável de ambiente:
   - **Localmente**: `export STEAM_API_KEY="..."`
   - **Vercel**: Adicione em Project Settings → Environment Variables
   - **GitHub**: Adicione em Settings → Secrets → New repository secret

## ⚠️ Limitações

- O script carrega dados dos **6 usuários fixos** apenas
- Prioriza jogos em comum e os top 400 jogos por horas
- Respeita rate limits da Steam (1 requisição a cada 1 segundo)
- Cada sincronização leva **~10-15 minutos**

## 🐛 Troubleshooting

**Erro: "STEAM_API_KEY não configurada"**
- Certifique-se de que a variável de ambiente está definida

**Erro: "Rate limited"**
- O script aguarda automaticamente. Deixe rodar.

**Cache vazio**
- Execute `npm run sync-steam` manualmente
- Verifique se a chave da API é válida

---

**Última atualização**: Configurado com 6 usuários fixos para melhor performance
