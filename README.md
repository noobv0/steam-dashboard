# 🎮 Steam Family Hub

<p align="center">
  <strong>Dashboard inteligente para gerenciar e comparar bibliotecas da Steam entre amigos e família.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

---

## ✨ Funcionalidades

- 📊 **Visão Geral Detalhada**: Estatísticas totais de jogos, horas jogadas e valor da biblioteca em **R$**.
- 🏆 **Rankings Dinâmicos**: Veja quem tem mais jogos, quem é o mais viciado em horas e quem investiu mais na conta.
- 🤝 **Aba "Em Comum"**: Filtre instantaneamente jogos que todos (ou duplas) possuem para facilitar a jogatina multiplayer.
- 🏷️ **Filtros Inteligentes**: Categorias como *Multiplayer*, *Co-op*, *Co-op Online* e *Remote Play* carregadas via cache.
- ⚡ **Performance Extrema**: Carregamento instantâneo via sistema de cache persistente.
- 🤖 **Automação Total**: Sincronização diária automática com a Steam API via GitHub Actions.

## 🚀 Tecnologias

- **Frontend**: React.js com Vite
- **Estilização**: CSS Moderno (Variáveis, Flexbox, Grid)
- **Backend**: Vercel Serverless Functions (Proxy de API)
- **Dados**: GitHub Actions para sincronização de cache (Node.js)

## 🛠️ Como configurar o seu

### 1. Requisitos
- Node.js 18+
- Uma [Steam API Key](https://steamcommunity.com/dev/apikey)

### 2. Instalação Local
```bash
# Clone o repositório
git clone https://github.com/noobv0/steam-dashboard.git

# Entre na pasta
cd steam-dashboard

# Instale as dependências
npm install
```

### 3. Sincronização de Dados
Para carregar os dados das contas configuradas:
```bash
# No Windows (CMD)
set STEAM_API_KEY=sua_chave_aqui
npm run sync-steam

# No Linux/Mac
export STEAM_API_KEY="sua_chave_aqui"
npm run sync-steam
```

## 🤖 Automação (GitHub Actions)

O projeto está configurado para se atualizar sozinho! 
1. Adicione sua `STEAM_API_KEY` nos **Secrets** do repositório no GitHub.
2. O workflow em `.github/workflows/sync-steam.yml` rodará todos os dias às 03:00 AM.

## 👥 Contas Monitoradas

Atualmente o dashboard monitora os seguintes perfis:
- Lírio
- Kiri
- Dudu
- Bambo
- Nino
- Carrot

---

<p align="center">
  Desenvolvido para facilitar a escolha do próximo jogo no final de semana! 🕹️
</p>
