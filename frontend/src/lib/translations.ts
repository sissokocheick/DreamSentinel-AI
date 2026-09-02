export type Language = 'en' | 'fr';

export const translations = {
  en: {
    // Header & Ticker
    brand_tag: 'Somnia L1',
    brand_sub: 'Autonomous Event Contracts & AI Prediction Terminal',
    onchain_contracts_btn: 'On-Chain Contracts',
    somnia_network: 'Somnia Shannon (50312)',
    faucet_btn: 'STT Faucet',
    connect_wallet: 'Connect Wallet',
    disconnect_wallet: 'Disconnect',
    demo_mode: 'Demo Mode',
    
    // Ticker Stats
    ticker_tps: 'Somnia TPS',
    ticker_finality: 'Finality',
    ticker_gas: 'Gas Fee',
    ticker_accuracy: 'AI Bayesian Win Rate',
    ticker_volume: '24h Volume',
    ticker_tvl: 'Vault TVL',
    ticker_oracle: 'Oracle',

    // Navigation Tabs
    tab_terminal: 'CLOB Terminal',
    tab_swarm: 'AI Swarm Live',
    tab_copilot: 'AI Copilot',
    tab_scanner: 'Arbitrage Scanner',
    tab_backtest: 'Quant Backtest',
    tab_pvp: 'PvP 60s Duels',
    tab_vaults: 'Copy-Trading Vaults',
    tab_leaderboard: 'Leaderboard',

    // Terminal & Market Selector
    market_select_title: 'Select Prediction Market',
    strike_label: 'Target Strike',
    expiry_label: 'Time to Expiry',
    spot_price_label: 'Spot Price',
    volume_label: '24h Volume',
    open_interest_label: 'Open Interest',
    best_bid: 'Best Bid',
    best_ask: 'Best Ask',

    // Order Placement
    order_panel_title: 'Place Event Contract Order',
    buy_yes: 'BUY YES',
    buy_no: 'BUY NO',
    yes_sub: 'Predict event happens',
    no_sub: 'Predict event fails',
    order_amount_label: 'Investment Amount (USDso)',
    quick_presets: 'Quick Amounts',
    shares_acquired: 'Shares Acquired',
    payout_at_settlement: 'Potential Payout at Expiry',
    net_profit: 'Potential Net Return',
    place_order_btn: 'Execute Order on Somnia L1',
    order_success: 'Order Executed on Somnia L1',

    // Bayesian AI Alpha & Edge
    ai_alpha_title: 'Bayesian Swarm Signal & Alpha Edge',
    market_prob: 'Market Implied Prob',
    ai_bayesian_prob: 'AI Bayesian Forecast',
    arbitrage_edge: 'Alpha Edge',
    kelly_allocation: 'Kelly Sizing',
    signal_strong_buy: 'STRONG BUY YES',
    signal_strong_sell: 'STRONG BUY NO',
    signal_neutral: 'NEUTRAL HOLD',
    brier_score_label: 'On-Chain Brier Score',

    // Orderbook CLOB
    orderbook_title: 'DreamDEX CLOB Orderbook',
    price_col: 'Price (USDso)',
    size_col: 'Size',
    total_col: 'Total (USDso)',
    spread: 'Spread',

    // Recent Trades
    recent_trades_title: 'Live On-Chain Matches',
    time_col: 'Time',
    side_col: 'Side',
    tx_hash_col: 'Tx Hash',

    // Swarm Tab
    swarm_title: 'Autonomous Swarm Intelligence (DeepMind Inspired)',
    swarm_sub: 'Four specialized AI agents continuously analyzing orderbook microstructure, macro signals, and on-chain settlements.',
    agent_status_active: 'Active • Analyzing',
    agent_status_idle: 'Monitoring Stream',
    recent_thoughts_title: 'Swarm Neural Stream & Decision Log',

    // Copilot Tab
    copilot_title: 'DreamSentinel AI Copilot',
    copilot_sub: 'Ask any question regarding prediction markets, Kelly betting sizing, DreamDEX liquidity, or request instant trade execution.',
    copilot_placeholder: 'Ask the Swarm (e.g. "Scan for arbitrage opportunities on BTC 5M market")...',
    copilot_send: 'Send',
    copilot_quick_1: 'What is the current BTC 5M edge?',
    copilot_quick_2: 'Explain Kelly sizing for YES contracts',
    copilot_quick_3: 'Show DreamSentinel on-chain vault APY',

    // Vaults Tab
    vaults_title: 'ERC-4626 Copy-Trading Vaults',
    vaults_sub: 'Deposit $USDso into audited algorithmic vaults managed autonomously by DreamSentinel Swarm on Somnia L1.',
    vault_deposit_btn: 'Deposit USDso',
    vault_apy: 'Historical APY',
    vault_tvl: 'Total Value Locked',
    vault_your_balance: 'Your Deposited Balance',
    vault_strategy: 'Strategy',

    // Duels Tab
    pvp_title: '60-Second PvP Micro-Prediction Duels',
    pvp_sub: 'Stake USDso against fellow traders in ultra-fast 60-second crypto micro-prediction duels with instant smart contract settlement.',
    pvp_create: 'Create Duel Room',
    pvp_join: 'Join Duel',
    pvp_wager: 'Wager Amount',
    pvp_pool: 'Total Pot',
    pvp_resolved: 'Resolved on Somnia L1',

    // Modals
    wallet_modal_title: 'Connect a Web3 Wallet',
    wallet_modal_sub: 'Choose your wallet to trade on Somnia Shannon Testnet.',
    wallet_metamask: 'MetaMask',
    wallet_metamask_sub: 'Rabby, Brave Wallet or any EVM extension',
    wallet_phantom: 'Phantom Wallet',
    wallet_phantom_sub: 'EVM multi-chain support',
    wallet_demo: 'Somnia Demo Mode (1-Click)',
    wallet_demo_sub: 'Instant access with $5,420.00 USDso pre-loaded',
    recommended_badge: 'Recommended',
    evm_badge: 'EVM Natif',
    instant_badge: 'Instant 1-Click',
    contracts_modal_title: 'Deployed & Verified On-Chain Contracts',
    contracts_modal_sub: 'Somnia Shannon Testnet • Chain ID: 50312 • RPC: https://dream-rpc.somnia.network',
    copy_address: 'Copy',
    view_explorer: 'Explorer',
    copied_toast: 'Address copied to clipboard!',
    deposit_modal_title: 'Deposit into Vault',
    deposit_modal_sub: 'Your USDso will be staked into the selected algorithmic copy-trading strategy.',
    confirm_deposit: 'Confirm On-Chain Deposit',
    cancel: 'Cancel',
    amount_usdso: 'Amount in USDso'
  },
  fr: {
    // Header & Ticker
    brand_tag: 'Somnia L1',
    brand_sub: 'Terminal Autonome d\'Event Contracts & IA Prédictive',
    onchain_contracts_btn: 'Contrats On-Chain',
    somnia_network: 'Somnia Shannon (50312)',
    faucet_btn: 'Faucet STT',
    connect_wallet: 'Connecter Portefeuille',
    disconnect_wallet: 'Déconnecter',
    demo_mode: 'Mode Démo',

    // Ticker Stats
    ticker_tps: 'Somnia TPS',
    ticker_finality: 'Finalité',
    ticker_gas: 'Frais de Gas',
    ticker_accuracy: 'Victoire IA Bayésienne',
    ticker_volume: 'Volume 24h',
    ticker_tvl: 'TVL Vaults',
    ticker_oracle: 'Oracle',

    // Navigation Tabs
    tab_terminal: 'Terminal CLOB',
    tab_swarm: 'Essaim IA Live',
    tab_copilot: 'Copilote IA',
    tab_scanner: 'Scanner d\'Arbitrage',
    tab_backtest: 'Backtest Quant',
    tab_pvp: 'Duels PvP 60s',
    tab_vaults: 'Vaults Copy-Trading',
    tab_leaderboard: 'Classement',

    // Terminal & Market Selector
    market_select_title: 'Sélectionner le Marché de Prédiction',
    strike_label: 'Prix Cible (Strike)',
    expiry_label: 'Temps avant Expiration',
    spot_price_label: 'Prix Spot Réel',
    volume_label: 'Volume 24h',
    open_interest_label: 'Intérêt Ouvert',
    best_bid: 'Meilleure Offre (Bid)',
    best_ask: 'Meilleure Demande (Ask)',

    // Order Placement
    order_panel_title: 'Passer un Ordre Event Contract',
    buy_yes: 'ACHETER OUI',
    buy_no: 'ACHETER NON',
    yes_sub: 'L\'événement se réalise',
    no_sub: 'L\'événement échoue',
    order_amount_label: 'Montant à Investir (USDso)',
    quick_presets: 'Montants Rapides',
    shares_acquired: 'Parts Obtenues',
    payout_at_settlement: 'Paiement Potentiel à Résolution',
    net_profit: 'Gain Net Estimé',
    place_order_btn: 'Exécuter l\'Ordre sur Somnia L1',
    order_success: 'Ordre Exécuté sur Somnia L1',

    // Bayesian AI Alpha & Edge
    ai_alpha_title: 'Signal Bayésien de l\'Essaim & Alpha Edge',
    market_prob: 'Probabilité Implicite du Marché',
    ai_bayesian_prob: 'Prédiction Bayésienne IA',
    arbitrage_edge: 'Alpha Edge',
    kelly_allocation: 'Allocation de Kelly',
    signal_strong_buy: 'ACHAT FORT OUI',
    signal_strong_sell: 'ACHAT FORT NON',
    signal_neutral: 'ATTENTE NEUTRE',
    brier_score_label: 'Score de Brier On-Chain',

    // Orderbook CLOB
    orderbook_title: 'Carnet d\'Ordres CLOB DreamDEX',
    price_col: 'Prix (USDso)',
    size_col: 'Taille',
    total_col: 'Total (USDso)',
    spread: 'Écart (Spread)',

    // Recent Trades
    recent_trades_title: 'Transactions On-Chain Récentes',
    time_col: 'Heure',
    side_col: 'Côté',
    tx_hash_col: 'Hash Tx',

    // Swarm Tab
    swarm_title: 'Intelligence d\'Essaim Autonome (Style DeepMind)',
    swarm_sub: 'Quatre agents IA spécialisés analysant en continu la microstructure du carnet d\'ordres, les flux macro et les règlements on-chain.',
    agent_status_active: 'Actif • En Analyse',
    agent_status_idle: 'Surveillance du Flux',
    recent_thoughts_title: 'Flux Neuronal & Journal de Décisions',

    // Copilot Tab
    copilot_title: 'Copilote IA DreamSentinel',
    copilot_sub: 'Posez vos questions sur les marchés de prédiction, la formule de Kelly, la liquidité DreamDEX ou demandez une exécution immédiate.',
    copilot_placeholder: 'Posez une question à l\'Essaim (ex: "Scanne les opportunités d\'arbitrage sur BTC 5M")...',
    copilot_send: 'Envoyer',
    copilot_quick_1: 'Quel est l\'edge actuel sur BTC 5M ?',
    copilot_quick_2: 'Explique la formule de Kelly sur les parts OUI',
    copilot_quick_3: 'Affiche l\'APY du vault on-chain DreamSentinel',

    // Vaults Tab
    vaults_title: 'Vaults de Copy-Trading ERC-4626',
    vaults_sub: 'Déposez vos $USDso dans des coffres algorithmiques gérés de manière autonome par l\'Essaim DreamSentinel sur Somnia L1.',
    vault_deposit_btn: 'Déposer USDso',
    vault_apy: 'APY Historique',
    vault_tvl: 'Valeur Totale Verrouillée',
    vault_your_balance: 'Votre Solde Déposé',
    vault_strategy: 'Stratégie',

    // Duels Tab
    pvp_title: 'Duels de Micro-Prédiction PvP 60s',
    pvp_sub: 'Misez des USDso contre d\'autres traders dans des micro-duels de 60 secondes avec arbitrage et règlement instantané par smart contract.',
    pvp_create: 'Créer une Salle de Duel',
    pvp_join: 'Rejoindre le Duel',
    pvp_wager: 'Mise Recommandée',
    pvp_pool: 'Cagnotte Totale',
    pvp_resolved: 'Résolu sur Somnia L1',

    // Modals
    wallet_modal_title: 'Connecter un Portefeuille Web3',
    wallet_modal_sub: 'Choisissez votre portefeuille pour trader sur Somnia Shannon Testnet.',
    wallet_metamask: 'MetaMask',
    wallet_metamask_sub: 'Rabby, Brave Wallet ou extension EVM',
    wallet_phantom: 'Phantom Wallet',
    wallet_phantom_sub: 'Support multi-chaîne EVM',
    wallet_demo: 'Mode Démo Somnia (1-Clic)',
    wallet_demo_sub: 'Accès instantané avec $5,420.00 USDso préchargés',
    recommended_badge: 'Recommandé',
    evm_badge: 'EVM Natif',
    instant_badge: 'Instantané 1-Clic',
    contracts_modal_title: 'Contrats Déployés & Vérifiés On-Chain',
    contracts_modal_sub: 'Somnia Shannon Testnet • Chain ID: 50312 • RPC: https://dream-rpc.somnia.network',
    copy_address: 'Copier',
    view_explorer: 'Explorer',
    copied_toast: 'Adresse copiée dans le presse-papier !',
    deposit_modal_title: 'Déposer dans le Vault',
    deposit_modal_sub: 'Vos USDso seront investis dans la stratégie de copy-trading algorithmique sélectionnée.',
    confirm_deposit: 'Confirmer le Dépôt On-Chain',
    cancel: 'Annuler',
    amount_usdso: 'Montant en USDso'
  }
};
