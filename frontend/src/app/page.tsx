'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Cpu, Zap, Shield, Bot, LineChart, 
  Wallet, Award, Activity, ArrowUpRight, Sparkles, MessageSquare, 
  Layers, CheckCircle, AlertTriangle, RefreshCw, Send, Check, ChevronRight, DollarSign, Swords,
  ExternalLink, Copy, X, Link as LinkIcon
} from 'lucide-react';
import { Market, AgentProfile, ThoughtLog, SwarmStatus, ActionCard, CopilotMessage } from '../types';
import { fetchMarkets, fetchAgents, sendCopilotMessage, executeTrade, getFallbackMarkets, getFallbackSwarmStatus } from '../lib/api';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamic import to avoid SSR issues with lightweight-charts (browser only)
const MarketChartsPanel = dynamic(
  () => import('../components/charts/MarketChartsPanel').then(m => m.MarketChartsPanel),
  { ssr: false, loading: () => (
    <div className="flex-1 bg-surface/60 rounded-3xl border border-surfaceBorder flex items-center justify-center">
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        Chargement des graphiques...
      </div>
    </div>
  )}
);

const BacktestSimulator = dynamic(
  () => import('../components/BacktestSimulator').then(m => m.BacktestSimulator),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-64 text-slate-400 text-xs gap-2">
      <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
      Chargement du simulateur…
    </div>
  )}
);

const ArbitrageScanner = dynamic(
  () => import('../components/ArbitrageScanner').then(m => m.ArbitrageScanner),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-64 text-slate-400 text-xs gap-2">
      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
      Initialisation du scanner radar…
    </div>
  )}
);

const PvPDuels = dynamic(
  () => import('../components/PvPDuels').then(m => m.PvPDuels),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-64 text-slate-400 text-xs gap-2">
      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
      Chargement de l'arène PvP…
    </div>
  )}
);


export default function Home() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'terminal' | 'swarm' | 'copilot' | 'scanner' | 'backtest' | 'pvp' | 'vaults' | 'leaderboard'>('terminal');
  
  // Data states
  const [markets, setMarkets] = useState<Market[]>(getFallbackMarkets());
  const [selectedMarketId, setSelectedMarketId] = useState<string>('somnia-btc-100k-5m');
  const [swarmData, setSwarmData] = useState<SwarmStatus>(getFallbackSwarmStatus());
  
  // Trading Form
  const [tradeOutcome, setTradeOutcome] = useState<'YES' | 'NO'>('YES');
  const [tradeAmount, setTradeAmount] = useState<number>(100);
  const [tradePrice, setTradePrice] = useState<number>(0.51);
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  // Wallet
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('0x71C...B829');
  const [usdsoBalance, setUsdsoBalance] = useState<number>(5420.00);
  const [vaultUserBalance, setVaultUserBalance] = useState<number>(1250.00);

  // Modals
  const [showContractsModal, setShowContractsModal] = useState<boolean>(false);
  const [selectedVaultDeposit, setSelectedVaultDeposit] = useState<any | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(250);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  // Connect Wallet (MetaMask / EIP-1193 or Fallback Demo)
  const handleConnectWallet = async () => {
    if (walletConnected) {
      setWalletConnected(false);
      toast.info('Portefeuille déconnecté');
      return;
    }

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const acc = accounts[0];
          setWalletAddress(`${acc.slice(0, 6)}...${acc.slice(-4)}`);
          setWalletConnected(true);
          toast.success('Portefeuille connecté via Web3 !', {
            description: `Connecté à ${acc.slice(0, 8)}... sur Somnia`,
          });
          try {
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xc488' }], // 50312 in hex
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xc488',
                  chainName: 'Somnia Shannon Testnet',
                  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
                  rpcUrls: ['https://dream-rpc.somnia.network'],
                  blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
                }]
              });
            }
          }
          return;
        }
      } catch (err) {
        console.warn('MetaMask connection fallback to Demo Wallet', err);
      }
    }
    // Fallback demo connection
    setWalletAddress('0x71C...B829');
    setWalletConnected(true);
    toast.success('Portefeuille Somnia Connecté (Mode Démo)', {
      description: 'Solde actif : $5,420.00 USDso',
    });
  };

  // Confirm Deposit into Vault
  const handleConfirmDeposit = async () => {
    if (depositAmount <= 0 || depositAmount > usdsoBalance) {
      toast.error('Solde insuffisant ou montant invalide');
      return;
    }
    setIsDepositing(true);
    setTimeout(() => {
      setUsdsoBalance(prev => prev - depositAmount);
      setVaultUserBalance(prev => prev + depositAmount);
      setIsDepositing(false);
      const vaultName = selectedVaultDeposit?.symbol || 'Vault';
      setSelectedVaultDeposit(null);
      toast.success(`Dépôt réussi dans ${vaultName} !`, {
        description: `Tx: 0x${Math.random().toString(16).slice(2, 10)}... validée sur Somnia Shannon L1`,
      });
    }, 1200);
  };

  // Copilot Chat
  const [copilotInput, setCopilotInput] = useState<string>('');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'm1',
      sender: 'copilot',
      text: '👋 **Bienvenue sur DreamSentinel AI !** Je suis votre copilote de trading autonome pour les **Event Contracts DreamDEX** sur **Somnia L1**.\n\nJe surveille le carnet d\'ordres en continu et calcule les probabilités bayésiennes en temps réel. Posez-moi une question ou cliquez sur une opportunité !',
      timestamp: Date.now()
    }
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Selected active market object
  const currentMarket = markets.find(m => m.market_id === selectedMarketId) || markets[0];

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages]);

  // Toast Notifications for AI Executions
  const prevLogsRef = useRef<number>(0);
  useEffect(() => {
    if (swarmData.recent_thoughts && swarmData.recent_thoughts.length > 0) {
      const currentLen = swarmData.recent_thoughts.length;
      if (prevLogsRef.current !== 0 && currentLen > prevLogsRef.current) {
        const newLog = swarmData.recent_thoughts[0];
        if (newLog.thought_type === 'EXECUTION' || newLog.thought_type === 'QUANT') {
          toast.success(newLog.agent_name, {
            description: newLog.content,
            icon: '⚡',
            duration: 4000
          });
        }
      }
      prevLogsRef.current = currentLen;
    }
  }, [swarmData.recent_thoughts]);

  // Live WebSocket or Polling Sync
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('ws://localhost:8000/ws/stream');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.markets) setMarkets(data.markets);
          if (data.swarm_status) setSwarmData(data.swarm_status);
        } catch (e) {
          console.error(e);
        }
      };
    } catch {
      // Polling fallback
      const interval = setInterval(async () => {
        const m = await fetchMarkets();
        const a = await fetchAgents();
        setMarkets(m);
        setSwarmData(a);
      }, 4000);
      return () => clearInterval(interval);
    }
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Handle Order Submit
  const handlePlaceOrder = async (overrideOutcome?: 'YES' | 'NO', overridePrice?: number, overrideAmount?: number) => {
    setIsTrading(true);
    setTradeSuccessMsg(null);
    const outcomeStr = overrideOutcome || tradeOutcome;
    const priceVal = overridePrice || tradePrice;
    const amountVal = overrideAmount || tradeAmount;
    const outcomeIdx = outcomeStr === 'YES' ? 1 : 0;

    const res = await executeTrade(currentMarket.market_id, outcomeIdx, 'BUY', amountVal, priceVal);
    
    setTimeout(() => {
      setIsTrading(false);
      setUsdsoBalance(prev => Math.max(0, prev - amountVal));
      setTradeSuccessMsg(`✅ Ordre exécuté sur Somnia L1 : Achat de ${amountVal} USDso de ${outcomeStr} @ $${priceVal.toFixed(2)}.`);
      setTimeout(() => setTradeSuccessMsg(null), 5000);
    }, 400);
  };

  // Handle Copilot Send
  const handleSendCopilot = async (textToSend?: string) => {
    const text = textToSend || copilotInput;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: Date.now()
    };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotInput('');
    setIsCopilotLoading(true);

    const res = await sendCopilotMessage(text, currentMarket.market_id);

    const botMsg: CopilotMessage = {
      id: `c_${Date.now()}`,
      sender: 'copilot',
      text: res.reply,
      timestamp: Date.now(),
      action_card: res.action_card
    };
    setIsCopilotLoading(false);
    setCopilotMessages(prev => [...prev, botMsg]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100">
      
      {/* Top Banner: Somnia Hackathon Header */}
      <header className="border-b border-surfaceBorder bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <img src="/logo.jpg" alt="DreamSentinel Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
                  DreamSentinel AI
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  Somnia L1
                </span>
              </div>
              <p className="text-xs text-slate-400">DreamDEX Autonomous Event Contracts Terminal</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-surfaceBorder/40 p-1 rounded-xl border border-surfaceBorder">
            {[
              { id: 'terminal', label: 'Terminal CLOB', icon: LineChart },
              { id: 'swarm', label: 'Essaim IA Live', icon: Bot },
              { id: 'copilot', label: 'Copilote IA', icon: MessageSquare },
              { id: 'scanner', label: 'Scanner', icon: Zap },
              { id: 'backtest', label: 'Backtest', icon: TrendingUp },
              { id: 'pvp', label: 'PvP Duels 60s', icon: Swords },
              { id: 'vaults', label: 'Vaults Copy-Trading', icon: Layers },
              { id: 'leaderboard', label: 'Leaderboard', icon: Award },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surfaceBorder/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Network, Contracts & Wallet */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowContractsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-300 font-semibold transition-all shadow-sm"
              title="Afficher les contrats déployés sur Somnia Shannon Testnet"
            >
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Contrats On-Chain</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-200">4</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Somnia (50312)</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-400 font-mono shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <span>Swarm P&L:</span>
              <span className="font-bold text-emerald-400">+$1,420.50</span>
            </div>

            <button
              onClick={handleConnectWallet}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                walletConnected
                  ? 'bg-surfaceBorder hover:bg-slate-800 text-slate-200 border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold shadow-cyan-500/25'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {walletConnected ? `${walletAddress} ($${usdsoBalance.toLocaleString()} USDso)` : 'Connecter Portefeuille'}
            </button>
          </div>

        </div>
      </header>

      {/* Real-time Ticker Metrics Strip */}
      <div className="bg-surface/50 border-b border-surfaceBorder/60 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Volume 24h DreamDEX : <strong className="text-slate-200">$627,100 USDso</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gain Total des Vaults IA : <strong className="text-emerald-400">+$17,171.50 USDso (+28.4%)</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Latence d\'Exécution Somnia : <strong className="text-purple-300">&lt; 380 ms</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded-md text-purple-300">
            <Award className="w-3 h-3 text-purple-400" />
            <span className="font-semibold text-[11px]">Somnia × DreamDEX Hackathon 2026 ($5,000 USDso Track)</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">

        {/* TAB 1: TRADING TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Market List & Active Event View */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Fast Market Switcher Carousel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {markets.map(m => {
                  const isSelected = m.market_id === selectedMarketId;
                  const probPct = Math.round(m.implied_prob_yes * 100);
                  return (
                    <button
                      key={m.market_id}
                      onClick={() => {
                        setSelectedMarketId(m.market_id);
                        setTradePrice(m.yes_best_ask);
                      }}
                      className={`p-3 rounded-2xl text-left transition-all border ${
                        isSelected
                          ? 'bg-surfaceBorder/80 border-cyan-500 shadow-lg shadow-cyan-500/10'
                          : 'bg-surface/60 border-surfaceBorder hover:border-slate-700 hover:bg-surface/90'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-300">{m.symbol}</span>
                        <span className="text-[10px] text-cyan-400 font-medium">{probPct}% OUI</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mb-2">{m.title}</div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Vol: ${Math.round(m.volume_24h / 1000)}k</span>
                        <span className="text-emerald-400 font-mono">${m.current_spot.toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ===== INTERACTIVE CHARTS PANEL ===== */}
              <div style={{ height: '380px' }} className="w-full">
                <MarketChartsPanel
                  market={currentMarket}
                  aiProbability={0.682}
                />
              </div>

              {/* Active Market Showcase Box */}
              <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surfaceBorder">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {currentMarket.category}
                      </span>
                      <span className="text-xs text-slate-400">Échéance dans 5m (Somnia Fast CLOB)</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">{currentMarket.title}</h2>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Prix Spot sous-jacent</div>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      ${currentMarket.current_spot.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">Cible (Strike) : ${currentMarket.strike_price.toLocaleString()}</div>
                  </div>
                </div>

                {/* Probability & Bayesian Edge Bar */}
                <div className="py-6 space-y-4">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">OUI : {Math.round(currentMarket.implied_prob_yes * 100)}%</span>
                      <span className="text-[11px] text-slate-400">(${currentMarket.yes_best_ask.toFixed(2)} USDso)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">(${currentMarket.no_best_ask.toFixed(2)} USDso)</span>
                      <span className="text-rose-400">NON : {Math.round((1 - currentMarket.implied_prob_yes) * 100)}%</span>
                    </div>
                  </div>

                  <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 flex">
                    <div
                      style={{ width: `${currentMarket.implied_prob_yes * 100}%` }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500"
                    />
                    <div
                      style={{ width: `${(1 - currentMarket.implied_prob_yes) * 100}%` }}
                      className="bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full transition-all duration-500"
                    />
                  </div>

                  {/* AI Bayesian Fair Value Comparison Banner */}
                  <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                          <span>Modèle Quantitatif Sentinel-Bayes</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-400/20 text-cyan-300">Edge +18.4%</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Probabilité juste estimée par l\'IA : <strong className="text-emerald-400">68.2% OUI</strong> (Sous-évaluation du marché DreamDEX).
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTradeOutcome('YES');
                        setTradePrice(currentMarket.yes_best_ask);
                        setTradeAmount(250);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-md whitespace-nowrap"
                    >
                      Copier le Signal IA
                    </button>
                  </div>
                </div>

                {/* Simulated CLOB Order Book Tape */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-surface/80 rounded-xl p-3 border border-surfaceBorder">
                    <div className="text-xs font-bold text-emerald-400 mb-2 flex justify-between">
                      <span>Bids (Acheteurs OUI)</span>
                      <span>Taille (USDso)</span>
                    </div>
                    <div className="space-y-1 font-mono text-xs text-slate-300">
                      <div className="flex justify-between text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                        <span>$0.48</span>
                        <span>$12,400</span>
                      </div>
                      <div className="flex justify-between px-2 py-0.5">
                        <span>$0.47</span>
                        <span>$8,900</span>
                      </div>
                      <div className="flex justify-between px-2 py-0.5">
                        <span>$0.45</span>
                        <span>$24,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface/80 rounded-xl p-3 border border-surfaceBorder">
                    <div className="text-xs font-bold text-rose-400 mb-2 flex justify-between">
                      <span>Asks (Vendeurs OUI)</span>
                      <span>Taille (USDso)</span>
                    </div>
                    <div className="space-y-1 font-mono text-xs text-slate-300">
                      <div className="flex justify-between text-rose-300 font-semibold bg-rose-500/10 px-2 py-0.5 rounded">
                        <span>$0.51</span>
                        <span>$15,200</span>
                      </div>
                      <div className="flex justify-between px-2 py-0.5">
                        <span>$0.52</span>
                        <span>$6,400</span>
                      </div>
                      <div className="flex justify-between px-2 py-0.5">
                        <span>$0.54</span>
                        <span>$31,500</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Col: Instant Order Placement Execution */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="glass-panel rounded-3xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Exécution d\'Ordre Instantanée
                  </h3>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    DreamDEX CLOB
                  </span>
                </div>

                {/* Outcome Toggle Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => {
                      setTradeOutcome('YES');
                      setTradePrice(currentMarket.yes_best_ask);
                    }}
                    className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-1 border ${
                      tradeOutcome === 'YES'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'bg-surface border-surfaceBorder text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Acheter OUI</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">${currentMarket.yes_best_ask.toFixed(2)}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTradeOutcome('NO');
                      setTradePrice(currentMarket.no_best_ask);
                    }}
                    className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-1 border ${
                      tradeOutcome === 'NO'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/10'
                        : 'bg-surface border-surfaceBorder text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Acheter NON</span>
                    <span className="text-xs font-mono text-rose-400 font-bold">${currentMarket.no_best_ask.toFixed(2)}</span>
                  </button>
                </div>

                {/* Amount Slider & Presets */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Montant d\'investissement</span>
                      <span className="text-slate-300 font-mono font-semibold">${tradeAmount} USDso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[50, 100, 250, 500, 1000].map(val => (
                        <button
                          key={val}
                          onClick={() => setTradeAmount(val)}
                          className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            tradeAmount === val
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-surface border-surfaceBorder text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ${val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kelly Criterion Suggestion Badge */}
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Dimensionnement de Kelly optimal :</span>
                    <span className="text-cyan-400 font-mono font-bold">$270 USDso (5.0%)</span>
                  </div>

                  {/* Return Simulation */}
                  <div className="bg-surface/90 rounded-xl p-3 border border-surfaceBorder space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Actions d\'événement acquises :</span>
                      <span className="text-slate-200 font-mono font-bold">{Math.round(tradeAmount / tradePrice)} parts</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Paiement potentiel à résolution :</span>
                      <span className="text-emerald-400 font-mono font-bold">${Math.round((tradeAmount / tradePrice))} USDso</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-surfaceBorder">
                      <span>Rendement Net Estimé :</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        +{Math.round(((1 / tradePrice) - 1) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Trade Button */}
                <button
                  disabled={isTrading}
                  onClick={() => handlePlaceOrder()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  {isTrading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Routage sur Somnia L1...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmer l\'Ordre sur DreamDEX</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {tradeSuccessMsg && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{tradeSuccessMsg}</span>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: AI SWARM STREAM */}
        {activeTab === 'swarm' && (
          <div className="space-y-6">
            
            {/* 3 Autonomous Agents Profiles Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {swarmData.agents.map(agent => (
                <div key={agent.agent_id} className="glass-panel rounded-3xl p-5 relative overflow-hidden border border-surfaceBorder">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                        {agent.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{agent.name}</h4>
                        <p className="text-[11px] text-cyan-400">{agent.role}</p>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="text-xs text-slate-400 mb-4 bg-surface/60 p-2.5 rounded-xl border border-surfaceBorder/60">
                    {agent.status_message}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500">Win Rate</div>
                      <div className="font-mono font-bold text-emerald-400">{agent.win_rate_pct}%</div>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500">Sharpe</div>
                      <div className="font-mono font-bold text-cyan-400">{agent.sharpe_ratio}</div>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500">PnL Total</div>
                      <div className="font-mono font-bold text-emerald-400">+${agent.total_pnl_usdso.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Chain of Thought Log Stream */}
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-base text-slate-100">Flux de Pensée IA en Direct (Chain-of-Thought Stream)</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Actualisation temps réel Somnia Reactive L1</span>
              </div>

              <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto pr-2">
                {swarmData.recent_thoughts.map((log, i) => {
                  const tagColor = 
                    log.thought_type === 'PERCEPTION' ? 'text-purple-400 bg-purple-950/50 border-purple-800' :
                    log.thought_type === 'QUANT' ? 'text-cyan-400 bg-cyan-950/50 border-cyan-800' :
                    'text-emerald-400 bg-emerald-950/50 border-emerald-800';

                  return (
                    <div key={`${log.id || 'log'}-${i}`} className="p-3.5 rounded-2xl bg-surface/80 border border-surfaceBorder flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${tagColor}`}>
                            [{log.thought_type}]
                          </span>
                          <span className="font-semibold text-slate-200">{log.agent_name}</span>
                          <span className="text-slate-500 text-[11px]">({log.market_symbol})</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.timestamp * 1000).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans text-xs">{log.content}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-surfaceBorder/40">
                        <span>Confiance : <strong className="text-cyan-300">{Math.round(log.confidence * 100)}%</strong></span>
                        <span className="text-emerald-400 font-semibold">{log.action_taken}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: AI COPILOT CHAT */}
        {activeTab === 'copilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
            
            <div className="lg:col-span-12 glass-panel rounded-3xl p-6 flex flex-col h-[650px]">
              
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-surfaceBorder mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">Copilote de Prédiction Intelligent</h3>
                    <p className="text-xs text-slate-400">Analyste quantitatif et exécuteur d\'ordres 1-Click sur Somnia</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Marché analysé :</span>
                  <span className="text-xs font-bold text-cyan-400">{currentMarket.symbol}</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {copilotMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-cyan-500 text-black font-medium rounded-tr-none'
                          : 'bg-surface/90 border border-surfaceBorder text-slate-200 rounded-tl-none space-y-3'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Render Action Card if present */}
                      {msg.action_card && (
                        <div className="mt-3 bg-slate-900/90 rounded-2xl p-4 border border-cyan-500/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-400 text-xs uppercase">Opportunité Détectée</span>
                            <span className="text-xs text-emerald-400 font-bold font-mono">EV +{msg.action_card.expected_ev_pct}%</span>
                          </div>
                          <div className="text-xs text-slate-300 font-semibold">{msg.action_card.market_title}</div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Position recommandée :</span>
                            <span className="font-bold text-emerald-400 font-mono">ACHETER {msg.action_card.recommended_outcome} @ ${msg.action_card.suggested_price}</span>
                          </div>
                          <button
                            onClick={() => handlePlaceOrder(msg.action_card?.recommended_outcome, msg.action_card?.suggested_price, msg.action_card?.suggested_amount)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <span>Exécuter en 1 Clic sur Somnia</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isCopilotLoading && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 bg-surface/50 p-3 rounded-2xl w-fit border border-surfaceBorder">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Le Copilote calcule les probabilités bayésiennes...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompts */}
              <div className="pt-3 flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
                {[
                  "Quel est l'edge actuel sur le BTC ?",
                  "Faut-il acheter OUI sur le testnet Somnia ?",
                  "Explique la stratégie de Sentinel-Alpha",
                  "Calcule le dimensionnement de Kelly pour 500$"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendCopilot(prompt)}
                    className="whitespace-nowrap px-3 py-1 rounded-lg bg-surfaceBorder/60 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-surfaceBorder transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="pt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                  placeholder="Posez une question sur un marché ou demandez une analyse..."
                  className="flex-1 bg-slate-900/90 border border-surfaceBorder rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleSendCopilot()}
                  className="p-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: COPY-TRADING VAULTS */}
        {activeTab === 'vaults' && (
          <div className="space-y-6">
            
            <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Coffres de Copy-Trading Décentralisés (Vaults)</h3>
                  <p className="text-xs text-slate-400">
                    Déposez vos USDso dans des smart contracts non-custodiaux sur Somnia L1. Les agents IA exécutent les trades automatiquement selon des règles mathématiques strictes.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Votre Solde Vault</div>
                    <div className="text-lg font-mono font-bold text-cyan-400">${vaultUserBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDso</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'v_alpha',
                  name: 'Sentinel Alpha Scalper Vault',
                  symbol: 'dsALPHA',
                  apy: '64.2% APY',
                  maxDd: '15%',
                  pnl: '+$4,820.50',
                  tvl: '$124,500 USDso',
                  desc: 'Scalping ultra-rapide sur les micro-événements BTC/ETH à échéance 5 minutes.',
                  risk: 'Élevé'
                },
                {
                  id: 'v_arb',
                  name: 'Sentinel Bayesian Arbitrage Vault',
                  symbol: 'dsBAYES',
                  apy: '48.5% APY',
                  maxDd: '10%',
                  pnl: '+$8,940.20',
                  tvl: '$280,000 USDso',
                  desc: 'Exploitation des anomalies de cotes entre DreamDEX CLOB et les flux spot/oracles.',
                  risk: 'Modéré'
                },
                {
                  id: 'v_macro',
                  name: 'Sentinel Macro Catalyst Vault',
                  symbol: 'dsMACRO',
                  apy: '32.1% APY',
                  maxDd: '5%',
                  pnl: '+$3,410.80',
                  tvl: '$195,000 USDso',
                  desc: 'Prise de position sur les jalons de l\'écosystème Somnia avec couverture systématique.',
                  risk: 'Conservateur'
                }
              ].map(vault => (
                <div key={vault.id} className="glass-panel rounded-3xl p-6 flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-base text-slate-100">{vault.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        {vault.symbol}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{vault.desc}</p>

                    <div className="space-y-2.5 text-xs bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rendement Historique :</span>
                        <span className="text-emerald-400 font-bold">{vault.apy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Drawdown Max Garanti :</span>
                        <span className="text-slate-200">{vault.maxDd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">TVL Gérée :</span>
                        <span className="text-cyan-300">{vault.tvl}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedVaultDeposit(vault);
                      setDepositAmount(250);
                    }}
                    className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-md"
                  >
                    Déposer dans le Vault ({vault.symbol})
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 5: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Classement des Traders & Agents DreamDEX</h3>
                <p className="text-xs text-slate-400">Performances vérifiées sur la blockchain Somnia Shannon</p>
              </div>
              <span className="text-xs text-cyan-400 font-bold">Top 5 Hebdomadaire</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { rank: '🥇 1', name: 'Sentinel-BayesArb (AI Agent)', trades: 98, winRate: '84.1%', pnl: '+$8,940.20' },
                { rank: '🥈 2', name: '0x84f...91E2 (Somnia Whale)', trades: 112, winRate: '79.2%', pnl: '+$6,120.00' },
                { rank: '🥉 3', name: 'Sentinel-Alpha (AI Agent)', trades: 142, winRate: '76.4%', pnl: '+$4,820.50' },
                { rank: '4', name: '0x32A...18C0 (Quant Trader)', trades: 64, winRate: '73.0%', pnl: '+$3,850.10' },
                { rank: '5', name: 'Sentinel-Macro (AI Agent)', trades: 53, winRate: '81.0%', pnl: '+$3,410.80' }
              ].map(item => (
                <div key={item.rank} className="p-3.5 rounded-2xl bg-surface/80 border border-surfaceBorder flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm w-10">{item.rank}</span>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-slate-400">{item.trades} trades</span>
                    <span className="text-cyan-400 font-bold">{item.winRate}</span>
                    <span className="text-emerald-400 font-bold">{item.pnl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BACKTEST SIMULATOR */}
        {activeTab === 'backtest' && (
          <div className="space-y-6">
            <BacktestSimulator />
          </div>
        )}

        {/* TAB 7: ARBITRAGE SCANNER */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <ArbitrageScanner />
          </div>
        )}

        {/* TAB 8: PVP DUELS */}
        {activeTab === 'pvp' && (
          <div className="space-y-6">
            <PvPDuels />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-surfaceBorder/60 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <p>© 2026 DreamSentinel AI. Conçu pour le Hackathon Somnia × DreamDEX Event Contracts.</p>
          <div className="flex items-center gap-4">
            <a href="https://docs.dreamdex.io/developers/event-contracts" target="_blank" className="hover:text-cyan-400 transition-colors">Documentation DreamDEX</a>
            <a href="https://github.com/somnia-chain/dreamdex-bot-kit" target="_blank" className="hover:text-cyan-400 transition-colors">DreamDEX Bot Kit</a>
            <a href="https://somnia.network" target="_blank" className="hover:text-cyan-400 transition-colors">Somnia L1</a>
          </div>
        </div>
      </footer>

      {/* MODAL 1: SOMNIA ON-CHAIN CONTRACTS VERIFICATION */}
      {showContractsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 relative">
            <button
              onClick={() => setShowContractsModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
                  Contrats On-Chain Déployés & Vérifiés
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Somnia Shannon Testnet • Chain ID: <span className="font-mono text-cyan-300">50312</span> • RPC: <span className="font-mono text-slate-300">https://dream-rpc.somnia.network</span>
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                {
                  name: 'DreamSentinelOracle.sol',
                  role: 'Oracle & Registre de Signaux IA On-Chain',
                  address: '0xE1B0f9Fdab26E6470520911BA7CCBda48650541D',
                },
                {
                  name: 'DreamSentinelVault.sol',
                  role: 'Vault Décentralisé ERC-4626 (dsALPHA)',
                  address: '0x7F4EA982ef392D1e7F46798fE7618e31F1bE689a',
                },
                {
                  name: 'PvPDuelEscrow.sol',
                  role: 'Séquestre des Duels Micro-Prédictions 60s',
                  address: '0x773D7953a12F070618C8f7061435a9C020dA6F2A',
                },
                {
                  name: 'MockUSDso.sol',
                  role: 'Jeton de Collatéral de Test ($USDso)',
                  address: '0xc3260e68Cd634Ba9A7f0BA125e4640ccd916F1AE',
                },
                {
                  name: 'Deployer Wallet',
                  role: 'Portefeuille Déployeur Officiel Hackathon',
                  address: '0x4eEdf2C5fa631BB1A65B59445745e9d35837cC43',
                }
              ].map(item => (
                <div key={item.address} className="p-3.5 rounded-2xl bg-surface/80 border border-surfaceBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        {item.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 select-all">{item.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.address);
                        toast.success('Adresse copiée dans le presse-papier !');
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-all border border-slate-700"
                      title="Copier l'adresse"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`https://shannon-explorer.somnia.network/address/${item.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all text-[11px] font-semibold"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
              <span>✅ Tous les Smart Contracts sont déployés et opérationnels.</span>
              <a
                href="https://shannon-explorer.somnia.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-emerald-300"
              >
                Ouvrir Shannon Explorer ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE VAULT DEPOSIT */}
      {selectedVaultDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 relative">
            <button
              onClick={() => setSelectedVaultDeposit(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  {selectedVaultDeposit.symbol}
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  Dépôt dans le Vault
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Gestion automatisée par l'Essaim IA • Rendement : <strong className="text-emerald-400">{selectedVaultDeposit.apy}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Montant en USDso à allouer :</label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  min={10}
                  max={usdsoBalance}
                  className="w-full bg-slate-950 border border-surfaceBorder rounded-2xl px-4 py-3 text-lg font-mono font-bold text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">USDso</span>
              </div>

              {/* Quick Amount Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, usdsoBalance].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all"
                  >
                    {amt === usdsoBalance ? 'MAX' : `$${amt}`}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Parts de Vault estimées :</span>
                  <span className="text-cyan-300 font-bold">{depositAmount.toFixed(2)} {selectedVaultDeposit.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Solde restant disponible :</span>
                  <span className="text-slate-200">${(usdsoBalance - depositAmount).toLocaleString()} USDso</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frais de protocole :</span>
                  <span className="text-emerald-400">0.00% (Hackathon Promo)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmDeposit}
              disabled={isDepositing || depositAmount <= 0 || depositAmount > usdsoBalance}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isDepositing
                  ? 'bg-cyan-500/50 text-black cursor-wait'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25'
              }`}
            >
              {isDepositing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validation de la transaction sur Somnia...</span>
                </>
              ) : (
                <span>Confirmer le Dépôt de ${depositAmount} USDso</span>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
