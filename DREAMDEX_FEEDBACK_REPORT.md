# 📝 DreamDEX Event Contracts - Developer Feedback Report

*(Ce rapport est destiné à être soumis en tant que document "Optionnel" lors de la soumission DoraHacks pour maximiser les points dans l'évaluation finale de l'écosystème).*

---

## 1. Developer Experience (DX) & Onboarding
**Note globale : 8/10**

### Points Forts :
- La documentation de l'API de base et du `dreamdex-bot-kit` est claire et permet un démarrage rapide pour les opérations de routine.
- La compatibilité EVM de Somnia est excellente, permettant un déploiement fluide de nos contrats personnalisés (`PvPDuelEscrow` et `DreamSentinelVault`) sans friction avec l'outillage standard (Hardhat/Ethers.js).

### Axes d'amélioration :
- **Typage SDK** : Le Bot Kit mériterait des définitions TypeScript plus strictes (interfaces `Market`, `Orderbook`, etc.) expédiées par défaut dans le package npm pour faciliter l'intégration frontend (Next.js).
- **Environnement Local** : Un package `hardhat-dreamdex-mocks` officiel serait très apprécié. Actuellement, nous avons dû écrire nos propres `MockDreamDEXEventContract.sol` et `MockUSDso.sol` pour la CI/CD et les tests de nos algorithmes quantitatifs avant de passer au testnet.

## 2. API & WebSocket Performance
**Note globale : 9/10**

### Points Forts :
- La réactivité de la blockchain Somnia (très haut TPS) couplée à l'architecture Event Contracts permet une expérience de trading HFT (Haute Fréquence). 
- Dans notre implémentation, nos agents IA (Sentinel-Alpha) ont pu réagir à des opportunités d'arbitrage (Edge > 2%) avec une latence quasi nulle, ce qui valide la promesse de Somnia pour les carnets d'ordres (CLOB) on-chain.

### Axes d'amélioration :
- **WebSockets** : Il serait intéressant d'avoir un canal (channel) multiplexé sur le WebSocket officiel pour s'abonner aux changements d'ordres de *plusieurs* marchés avec une seule connexion, plutôt que de devoir potentiellement ouvrir un flux par marché.
- **Rate Limits explicites** : Ajouter un header `X-RateLimit-Remaining` sur les endpoints REST permettrait à notre moteur IA (Swarm) d'ajuster dynamiquement sa fréquence de "Perception" (polling) sans risquer un bannissement.

## 3. Fonctionnalités des "Event Contracts"
**Note globale : 9/10**

### Points Forts :
- Le design binaire (YES/NO) surperforme les AMM classiques pour les paris événementiels en concentrant la liquidité.
- La simplicité du contrat a permis de développer très facilement notre produit *PvP Duels 60s*, qui agit comme une surcouche de séquestre (Escrow) gamifiée au-dessus de vos marchés.

### Axes d'amélioration :
- **Ordres conditionnels On-chain (Hooks)** : Il serait révolutionnaire de pouvoir attacher un "Hook" (à la Uniswap V4) à un Event Contract. Par exemple : "Si la probabilité tombe à X%, exécuter le smart contract Y". Cela permettrait aux Vaults de notre IA de gérer le *stop-loss* de façon 100% décentralisée sans dépendre d'un exécuteur (Oracle/Backend) hors-chaîne.

---
*Soumis par l'équipe DreamSentinel AI dans le cadre du Hackathon Somnia × DreamDEX (Septembre 2026).*
