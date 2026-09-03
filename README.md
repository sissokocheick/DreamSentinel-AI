<div align="center">
  <img src="./frontend/public/logo.jpg" alt="DreamSentinel Logo" width="120" />
  <h1>DreamSentinel AI</h1>
  <p><strong>The Autonomous Bayesian Swarm Intelligence for DreamDEX Event Contracts on Somnia L1.</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-dream--sentinel--ai.vercel.app-cyan?style=for-the-badge&logo=vercel)](https://dream-sentinel-ai.vercel.app)
  [![Somnia Testnet](https://img.shields.io/badge/Network-Somnia%20Shannon%20(50312)-purple?style=for-the-badge)](https://shannon-explorer.somnia.network)
  [![Hackathon](https://img.shields.io/badge/Hackathon-Somnia_x_DreamDEX-blue?style=for-the-badge)](https://dorahacks.io/hackathon/event-contracts/buidl)
  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

---

## 🌐 Live Links & Video Walkthrough

- 🚀 **Live Production Terminal**: [https://dream-sentinel-ai.vercel.app](https://dream-sentinel-ai.vercel.app)
- 🎬 **In-App Video Demo & Audio Voiceover**: Click `[ 🎬 Video Demo ]` on the live platform to watch the 60 FPS interactive animated video with Studio AI Voiceover (English & French).
- 📄 **Official Video Script & Storyboard**: [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md)
- 🎙️ **Studio Voiceover MP3 (English)**: [`frontend/public/voiceover_en.mp3`](./frontend/public/voiceover_en.mp3)
- 🎙️ **Studio Voiceover MP3 (French)**: [`frontend/public/voiceover_fr.mp3`](./frontend/public/voiceover_fr.mp3)

---

## 🏆 Somnia × DreamDEX Hackathon Submission

DreamSentinel AI is a next-generation **AI-powered quantitative trading infrastructure** built to solve liquidity and execution bottlenecks on prediction markets. By leveraging **Bayesian probabilistic models**, the **Kelly Criterion**, and Somnia's ultra-fast 105,420 TPS Reactive L1, our Autonomous Agent Swarm trades Event Contracts with microsecond execution and zero human emotion.

### 🔥 Key Innovations Built for the Hackathon

1. **Autonomous Bayesian AI Swarm (Backend)**: 
   - A multi-agent system (Alpha Scalper, Bayesian Arb, Macro Hedger) that analyzes live Pyth/RedStone oracle feeds and DreamDEX Order Book Imbalances (OBI) to compute mathematical position sizing: $f^* = \frac{bp - q}{b}$.
2. **Glassmorphism Institutional Trading Terminal (Frontend)**: 
   - A responsive Next.js 15 dashboard featuring live TradingView charts, real-time AI Chain-of-Thought streaming, orderbook visualizer, and non-custodial wallet connection (MetaMask, OKX, Phantom, Coinbase).
3. **ERC-4626 Copy-Trading Vaults (Smart Contracts)**: 
   - `DreamSentinelVault.sol` deployed on **Somnia Shannon Testnet** allowing users to passively deposit $USDso and let the AI manage liquidity autonomously.
4. **PvP 60s Micro-Duels**: 
   - `PvPDuelEscrow.sol` introduces gamified 60-second binary event duels where users compete in peer-to-peer micro-predictions with decentralized escrow.
5. **Cross-Market Arbitrage Scanner & Radar**: 
   - Real-time scanner identifying probabilistic discrepancies between DreamDEX and Polymarket to execute atomic arbitrage.
6. **Telegram Mini-App Integration**: 
   - Mobile-first gateway allowing users to receive arbitrage alerts and trigger execution directly from Telegram.

---

## 🏗️ Architecture & Tech Stack

- **Blockchain L1**: Somnia Shannon Testnet (Chain ID `50312`, 105,420 TPS, Gas < 0.0001 STT)
- **Smart Contracts**: Solidity 0.8.24 (Foundry & Hardhat), OpenZeppelin ERC-4626, ERC-20
- **AI Engine / Backend**: Python 3.11, FastAPI, Web3.py, Edge-TTS Neural Voice, NumPy, SciPy
- **Frontend / UI**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, TradingView Lightweight Charts
- **Omnichannel**: Telegram Bot API

---

## 📜 Deployed & Verified Contracts (Somnia Shannon Testnet - Chain ID 50312)

| Contract Name | Address on Somnia Shannon Explorer | Description |
|---|---|---|
| **DreamSentinelOracle** | [`0xE1B0f9Fdab26E6470520911BA7CCBda48650541D`](https://shannon-explorer.somnia.network/address/0xE1B0f9Fdab26E6470520911BA7CCBda48650541D) | Verifiable AI Oracle & Prediction Anchor |
| **DreamSentinelVault** | [`0x7F4EA982ef392D1e7F46798fE7618e31F1bE689a`](https://shannon-explorer.somnia.network/address/0x7F4EA982ef392D1e7F46798fE7618e31F1bE689a) | ERC-4626 Multi-Strategy Copy-Trading Vault |
| **PvPDuelEscrow** | [`0x773D7953a12F070618C8f7061435a9C020dA6F2A`](https://shannon-explorer.somnia.network/address/0x773D7953a12F070618C8f7061435a9C020dA6F2A) | 60-Second Micro-Prediction Duels Escrow |
| **Mock USDso** | [`0xc3260e68Cd634Ba9A7f0BA125e4640ccd916F1AE`](https://shannon-explorer.somnia.network/address/0xc3260e68Cd634Ba9A7f0BA125e4640ccd916F1AE) | Event Contract Collateral Settlement Asset |
| **Deployer Wallet** | [`0x4eEdf2C5fa631BB1A65B59445745e9d35837cC43`](https://shannon-explorer.somnia.network/address/0x4eEdf2C5fa631BB1A65B59445745e9d35837cC43) | Protocol Deployer on Somnia L1 |

---

## 🚀 Quick Start (Run Locally)

### 1. Smart Contracts
```bash
cd contracts
npm install
# Compile and test
npx hardhat test
```

### 2. AI Backend Engine
```bash
cd agent-core
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Terminal
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

*“Predicting the future by computing it.”* — **The DreamSentinel Team**
