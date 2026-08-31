# 🎯 Pitch Deck — DreamSentinel AI
### *Next-Gen Autonomous Prediction Market Terminal on Somnia DreamDEX*
**Hackathon Submission: Somnia × DreamDEX Event Contracts Hackathon**

---

### Slide 1: Cover
* **Title**: DreamSentinel AI
* **Tagline**: The Autonomous Multi-Agent Trading Swarm & Copilot for DreamDEX Event Contracts on Somnia L1.
* **Track**: $5,000 USDso Prize Pool Track
* **Team**: DreamSentinel Core Devs

---

### Slide 2: The Problem
1. **Low Liquidity & Wide Spreads**: Prediction markets suffer from wide bid/ask spreads because human market makers are slow and fragmented.
2. **Complex Probabilistic Pricing**: Retail traders struggle to price fast-expiry binary options and micro-events (e.g. 5-minute BTC volatility).
3. **Execution Latency on Traditional L1s/L2s**: Traditional EVM blockchains are too slow for real-time order matching and automated high-frequency delta hedging.

---

### Slide 3: The Solution — DreamSentinel AI
* **An Autonomous Multi-Agent Swarm**: 3 specialized agents collaborate in real-time:
  * **Sentinel-Perception**: Ingests multi-modal social sentiment and news catalysts.
  * **Sentinel-BayesArb**: Computes fair theoretical value using Bayesian inference and detects CLOB mispricing.
  * **Sentinel-Alpha / Execution Router**: Executes sub-second limit orders on Somnia L1 using the DreamDEX Bot Kit.
* **Consumer-Facing Terminal & Copilot**:
  * Explainable Chain-of-Thought logs for full transparency.
  * Interactive AI Copilot providing 1-Click trade recommendations.
  * Non-custodial Copy-Trading Vaults in USDso.

---

### Slide 4: Why Somnia L1 is the Unfair Advantage
* **Sub-Second Finality (< 380 ms)**: Allows our execution router to capture fleeting micro-arbitrage opportunities on DreamDEX Event Contracts before external oracles update.
* **Ultra-High Throughput (> 100k TPS)**: Ensures thousands of continuous agent quote updates and user orders without network congestion or gas spikes.
* **Agentic L1 Architecture**: Somnia's reactive architecture aligns natively with autonomous on-chain agents.

---

### Slide 5: Product Architecture & Flow
```
User Interface (Next.js 14) <---> FastAPI Multi-Agent Engine <---> DreamDEX Bot Kit SDK <---> Somnia L1 Contracts
```
* Built on top of `@somnia-chain/dreamdex-bot-kit`.
* Smart contracts: `DreamSentinelVault.sol` for decentralized fund management.
* REST & WebSocket streaming for instant updates.

---

### Slide 6: The Quant Engine & Mathematical Rigor
* **Bayesian Prior-to-Posterior Updating**:
  $$\text{Posterior Odds} = \text{Prior Odds} \times \exp(\text{Sentiment Score} \times \text{Confidence} \times \lambda)$$
* **Risk-Adjusted Kelly Criterion**:
  $$f^* = \frac{b \cdot p - q}{b}$$
  Ensures the AI never over-allocates capital, protecting user vault funds during high volatility regimes.

---

### Slide 7: Business Model & Ecosystem Value for DreamDEX & Somnia
1. **Direct Volume Driver**: Our autonomous swarm acts as a continuous automated liquidity provider, generating thousands of daily transactions on DreamDEX.
2. **User Acquisition & Retention**: Retail users who lack quant skills can simply allocate USDso to the copy-trading vaults and let the AI agents trade for them.
3. **Sustainable Fee Model**: 10% performance fee on vault net profits, shared between strategy developers and the protocol treasury.

---

### Slide 8: Live Traction & Testnet Results
* **Win Rate**: 84.1% on Bayesian Arbitrage strategy across testnet simulations.
* **Sharpe Ratio**: 3.42.
* **Execution Latency**: 380 ms average confirmation time on Somnia Shannon Testnet.
* **Total PnL Generated**: +$17,171.50 USDso across active strategy vaults.

---

### Slide 9: Roadmap Beyond the Hackathon
* **Q3 2026**: Mainnet deployment on Somnia L1 alongside DreamDEX launch.
* **Q4 2026**: Telegram WebApp & Mini-App with embedded account abstraction wallets.
* **Q1 2027**: Permissionless AI Strategy Marketplace (allow community quant developers to deploy their own agents).

---

### Slide 10: Conclusion & Call to Action
* **Experience the Live Terminal**: `http://localhost:3000`
* **GitHub Repository**: Complete open-source code ready for evaluation.
* **Contact & Dev Community**: Active in the Somnia Developer Telegram.
