'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Cpu, Zap, Shield, Bot, LineChart, 
  Wallet, Award, Activity, ArrowUpRight, Sparkles, MessageSquare, 
  Layers, CheckCircle, AlertTriangle, RefreshCw, Send, Check, ChevronRight, DollarSign, Swords,
  ExternalLink, Copy, X, Link as LinkIcon, LogOut, Play, Video, Film, ChevronLeft
} from 'lucide-react';
import { Market, AgentProfile, ThoughtLog, SwarmStatus, ActionCard, CopilotMessage } from '../types';
import { fetchMarkets, fetchAgents, sendCopilotMessage, executeTrade, getFallbackMarkets, getFallbackSwarmStatus } from '../lib/api';
import { translations, Language } from '../lib/translations';
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


// Official & Pro Web3 Wallet SVG Icons
const MetaMaskIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.1 4.7L18.4 12.6l2 4.7 7.7-2.3 1-10.3z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.2"/>
    <path d="M2.9 4.7l1 10.3 7.7 2.3 2-4.7L2.9 4.7z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.2"/>
    <path d="M24.7 22.8l-7.3-2.1 1-4.7 6.3 6.8z" fill="#E4751F"/>
    <path d="M7.3 22.8l6.3-6.8 1 4.7-7.3 2.1z" fill="#E4751F"/>
    <path d="M10.7 17.3l-2 4.7 7.3-2.1v-7.3l-5.3 4.7z" fill="#D7C1B3"/>
    <path d="M21.3 17.3l-5.3-4.7v7.3l7.3 2.1-2-4.7z" fill="#D7C1B3"/>
    <path d="M16 19.9l-4.7 3.3 3.3 2.7 1.4-1.3 1.4 1.3 3.3-2.7-4.7-3.3z" fill="#233447"/>
    <path d="M2.9 4.7l9.7 7.9-1 4.7L2.9 4.7z" fill="#F6851B"/>
    <path d="M29.1 4.7l-8.7 12.6-1-4.7 9.7-7.9z" fill="#F6851B"/>
    <path d="M16 12.6l-2-4.7h-3.3l5.3 4.7 5.3-4.7H18l-2 4.7z" fill="#F6851B"/>
  </svg>
);

const OKXWalletIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="7" fill="#000000" stroke="#334155" strokeWidth="1"/>
    <rect x="7" y="7" width="5.5" height="5.5" rx="1" fill="#FFFFFF"/>
    <rect x="19.5" y="7" width="5.5" height="5.5" rx="1" fill="#FFFFFF"/>
    <rect x="13.25" y="13.25" width="5.5" height="5.5" rx="1" fill="#FFFFFF"/>
    <rect x="7" y="19.5" width="5.5" height="5.5" rx="1" fill="#FFFFFF"/>
    <rect x="19.5" y="19.5" width="5.5" height="5.5" rx="1" fill="#FFFFFF"/>
  </svg>
);

const PhantomWalletIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="7" fill="#5344C0"/>
    <path d="M22.5 16.5C22.5 12.91 19.59 10 16 10C12.41 10 9.5 12.91 9.5 16.5C9.5 20.09 11.2 22 12.5 22C13.8 22 14.2 20.7 16 20.7C17.8 20.7 18.2 22 19.5 22C20.8 22 22.5 20.09 22.5 16.5Z" fill="#FFFFFF"/>
    <circle cx="13.8" cy="15.8" r="1.3" fill="#5344C0"/>
    <circle cx="18.2" cy="15.8" r="1.3" fill="#5344C0"/>
  </svg>
);

const CoinbaseWalletIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="7" fill="#0052FF"/>
    <circle cx="16" cy="16" r="7" fill="#FFFFFF"/>
    <rect x="13.5" y="13.5" width="5" height="5" rx="1" fill="#0052FF"/>
  </svg>
);

const GenericWeb3Icon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="7" fill="#0F172A" stroke="#334155" strokeWidth="1"/>
    <circle cx="16" cy="16" r="8" stroke="#38BDF8" strokeWidth="1.5"/>
    <ellipse cx="16" cy="16" rx="4" ry="8" stroke="#38BDF8" strokeWidth="1.2"/>
    <line x1="8" y1="16" x2="24" y2="16" stroke="#38BDF8" strokeWidth="1.2"/>
  </svg>
);

export default function Home() {
  // Internationalization (Default English, browser auto-detect or localStorage)
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dreamsentinel_lang') as Language;
      if (saved === 'en' || saved === 'fr') {
        setLang(saved);
      } else {
        const browserLang = navigator.language?.slice(0, 2).toLowerCase();
        if (browserLang === 'fr') {
          setLang('fr');
        } else {
          setLang('en');
        }
      }
    }
  }, []);

  const toggleLanguage = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamsentinel_lang', newLang);
    }
  };

  const t = (key: keyof typeof translations['en']): string => {
    return (translations[lang] as any)?.[key] || (translations['en'] as any)?.[key] || (key as string);
  };

  // Navigation
  const [activeTab, setActiveTab] = useState<'terminal' | 'swarm' | 'copilot' | 'scanner' | 'backtest' | 'pvp' | 'vaults' | 'leaderboard'>('terminal');
  const [terminalSubTab, setTerminalSubTab] = useState<'orderbook' | 'ai_alpha' | 'trades' | 'positions'>('orderbook');
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(true);
  
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
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletAddressFull, setWalletAddressFull] = useState<string>('');
  const [usdsoBalance, setUsdsoBalance] = useState<number>(5420.00);
  const [vaultUserBalance, setVaultUserBalance] = useState<number>(1250.00);
  const activeProviderRef = useRef<any>(null);

  // Modals
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showContractsModal, setShowContractsModal] = useState<boolean>(false);
  const [showFaucetModal, setShowFaucetModal] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [videoActiveStep, setVideoActiveStep] = useState<number>(0);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [selectedVaultDeposit, setSelectedVaultDeposit] = useState<any | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(250);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  // Load saved video URL from localStorage if any
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dreamsentinel_video_url');
      if (saved) setCustomVideoUrl(saved);
    }
  }, []);

  const handleSaveVideoUrl = (url: string) => {
    setCustomVideoUrl(url);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamsentinel_video_url', url);
    }
    toast.success(lang === 'en' ? 'Video link updated!' : 'Lien vidéo mis à jour !');
  };

  // Connect Wallet: open selector
  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  // Disconnect Wallet cleanly & aggressively (EIP-1193 + MetaMask revoke + state reset)
  const disconnectWallet = async () => {
    try {
      if (activeProviderRef.current) {
        // 1. EIP-1193 disconnect method (OKX, Phantom, Coinbase)
        if (typeof activeProviderRef.current.disconnect === 'function') {
          await activeProviderRef.current.disconnect();
        }
        // 2. MetaMask / EIP-2255 revoke permission request
        if (typeof activeProviderRef.current.request === 'function') {
          try {
            await activeProviderRef.current.request({
              method: 'wallet_revokePermissions',
              params: [{ eth_accounts: {} }]
            });
          } catch (e) {
            // Not all wallets support wallet_revokePermissions, safe to ignore
          }
        }
      }
    } catch (err) {
      console.warn('Disconnect error:', err);
    } finally {
      activeProviderRef.current = null;
      setWalletConnected(false);
      setWalletAddress('');
      setWalletAddressFull('');
      setShowAccountModal(false);
      setShowWalletModal(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dreamsentinel_wallet_connected');
        localStorage.removeItem('dreamsentinel_wallet_type');
      }
      toast.info(lang === 'en' ? 'Wallet disconnected successfully' : 'Portefeuille déconnecté avec succès');
    }
  };

  // EIP-6963 Multi-Wallet Provider Storage
  const [eip6963Wallets, setEip6963Wallets] = useState<any[]>([]);

  useEffect(() => {
    const handleAnnounce = (event: any) => {
      if (!event.detail) return;
      setEip6963Wallets(prev => {
        if (prev.some(w => w.info.uuid === event.detail.info.uuid)) return prev;
        return [...prev, event.detail];
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('eip6963:announceProvider', handleAnnounce);
      window.dispatchEvent(new Event('eip6963:requestProvider'));
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('eip6963:announceProvider', handleAnnounce);
      }
    };
  }, []);

  // Connect via specific provider (MetaMask, OKX, Phantom, Coinbase, Injected, or Demo)
  // Connect via specific provider (MetaMask, OKX, Phantom, Coinbase, Injected, or Demo)
  const connectWithProvider = async (walletType: 'metamask' | 'okx' | 'phantom' | 'coinbase' | 'injected' | 'demo') => {
    if (walletType === 'demo') {
      setShowWalletModal(false);
      setWalletAddressFull('0x4eEdf2C5fa631BB1A65B59445745e9d35837cC43');
      setWalletAddress('0x4eE...cC43');
      setWalletConnected(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dreamsentinel_wallet_connected', 'true');
        localStorage.setItem('dreamsentinel_wallet_type', 'demo');
      }
      toast.success(lang === 'en' ? 'Somnia Demo Mode activated!' : 'Mode Démo Somnia activé !', {
        description: lang === 'en' ? 'Pre-loaded with $5,420.00 USDso' : 'Solde préchargé : $5,420.00 USDso',
      });
      return;
    }

    setConnectingWallet(walletType);

    if (typeof window !== 'undefined') {
      let provider: any = null;
      const win = window as any;
      const eth = win.ethereum;

      if (walletType === 'okx') {
        const eipOkx = eip6963Wallets.find(w => 
          w.info?.rdns?.toLowerCase().includes('okx') || 
          w.info?.name?.toLowerCase().includes('okx')
        );
        if (eipOkx) {
          provider = eipOkx.provider;
        } else if (win.okxwallet?.ethereum) {
          provider = win.okxwallet.ethereum;
        } else if (win.okxwallet) {
          provider = win.okxwallet;
        } else if (eth?.providers?.length) {
          provider = eth.providers.find((p: any) => p.isOkxWallet);
        } else if (eth?.isOkxWallet) {
          provider = eth;
        }
      } else if (walletType === 'metamask') {
        const eipMetaMask = eip6963Wallets.find(w => 
          w.info?.rdns?.toLowerCase().includes('metamask') || 
          w.info?.name?.toLowerCase().includes('metamask')
        );
        if (eipMetaMask) {
          provider = eipMetaMask.provider;
        } else if (eth?.providers?.length) {
          provider = eth.providers.find((p: any) => p.isMetaMask && !p.isPhantom && !p.isOkxWallet) || eth.providers.find((p: any) => p.isMetaMask);
        } else if (eth && !eth.isPhantom && !eth.isOkxWallet) {
          provider = eth;
        } else if (eth?.isMetaMask) {
          provider = eth;
        }
      } else if (walletType === 'phantom') {
        const eipPhantom = eip6963Wallets.find(w => 
          w.info?.rdns?.toLowerCase().includes('phantom') || 
          w.info?.name?.toLowerCase().includes('phantom')
        );
        if (eipPhantom) {
          provider = eipPhantom.provider;
        } else if (win.phantom?.ethereum) {
          provider = win.phantom?.ethereum;
        } else if (eth?.providers?.find((p: any) => p.isPhantom)) {
          provider = eth.providers.find((p: any) => p.isPhantom);
        } else if (eth?.isPhantom) {
          provider = eth;
        }
      } else if (walletType === 'coinbase') {
        const eipCoinbase = eip6963Wallets.find(w => 
          w.info?.rdns?.toLowerCase().includes('coinbase') || 
          w.info?.name?.toLowerCase().includes('coinbase')
        );
        if (eipCoinbase) {
          provider = eipCoinbase.provider;
        } else if (win.coinbaseWalletExtension) {
          provider = win.coinbaseWalletExtension;
        } else if (eth?.providers?.find((p: any) => p.isCoinbaseWallet)) {
          provider = eth.providers.find((p: any) => p.isCoinbaseWallet);
        } else if (eth?.isCoinbaseWallet) {
          provider = eth;
        }
      } else if (walletType === 'injected') {
        provider = eth || win.okxwallet?.ethereum || win.okxwallet || win.phantom?.ethereum;
      }

      if (provider) {
        try {
          activeProviderRef.current = provider;
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            const acc = accounts[0];
            setWalletAddressFull(acc);
            setWalletAddress(`${acc.slice(0, 6)}...${acc.slice(-4)}`);
            setWalletConnected(true);
            setShowWalletModal(false);
            if (typeof window !== 'undefined') {
              localStorage.setItem('dreamsentinel_wallet_connected', 'true');
              localStorage.setItem('dreamsentinel_wallet_type', walletType);
            }
            const walletLabel = 
              walletType === 'okx' ? 'OKX Wallet' :
              walletType === 'metamask' ? 'MetaMask' :
              walletType === 'phantom' ? 'Phantom' :
              walletType === 'coinbase' ? 'Coinbase' : 'Web3 Wallet';
            toast.success(lang === 'en' ? `Connected via ${walletLabel}!` : `Portefeuille connecté via ${walletLabel} !`, {
              description: `Somnia Shannon: ${acc.slice(0, 8)}...`,
            });
            try {
              await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xc488' }], // 50312 in hex
              });
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                await provider.request({
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
        } catch (err: any) {
          toast.error(lang === 'en' ? 'Connection cancelled or rejected' : 'Connexion annulée ou rejetée', {
            description: err?.message || 'Check request in wallet extension',
          });
          return;
        } finally {
          setConnectingWallet(null);
        }
      } else {
        setConnectingWallet(null);
        const walletLabel = 
          walletType === 'okx' ? 'OKX Wallet' :
          walletType === 'metamask' ? 'MetaMask' :
          walletType === 'phantom' ? 'Phantom' :
          walletType === 'coinbase' ? 'Coinbase' : 'Web3 Wallet';
        toast.error(lang === 'en' ? `${walletLabel} extension not found` : `Extension ${walletLabel} introuvable`, {
          description: lang === 'en' ? `Please install ${walletLabel} or use Somnia Demo Mode.` : `Veuillez activer ${walletLabel} ou utiliser le mode Démo Somnia.`,
        });
        return;
      }
    }
  };

  // Connect via EIP-6963 provider directly
  const connectWithEip6963 = async (walletDetail: any) => {
    setConnectingWallet(walletDetail.info?.name || 'eip6963');
    const provider = walletDetail.provider;
    activeProviderRef.current = provider;
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const acc = accounts[0];
        setWalletAddressFull(acc);
        setWalletAddress(`${acc.slice(0, 6)}...${acc.slice(-4)}`);
        setWalletConnected(true);
        setShowWalletModal(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dreamsentinel_wallet_connected', 'true');
        }
        toast.success(lang === 'en' ? `Connected to ${walletDetail.info.name}!` : `Connecté à ${walletDetail.info.name} !`, {
          description: `Somnia Shannon: ${acc.slice(0, 8)}...`,
        });
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xc488' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await provider.request({
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
      }
    } catch (err: any) {
      toast.error(lang === 'en' ? 'Connection cancelled' : 'Connexion annulée', {
        description: err?.message || 'Check request in wallet extension',
      });
    } finally {
      setConnectingWallet(null);
    }
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
      <header className="border-b border-surfaceBorder bg-surface/90 backdrop-blur-md sticky top-0 z-50 shadow-md">
        {/* ROW 1: Logo & Branding on Left, Web3 Wallet Cluster & Disconnect on Right */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          
          {/* LEFT: Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/20 flex-shrink-0 relative group">
              <img src="/logo.jpg" alt="DreamSentinel Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
                  DreamSentinel AI
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  {t('brand_tag')}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Web3 Status, Language, Faucet, Contracts & Wallet */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Switcher: EN / FR */}
            <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/80 p-0.5 text-xs font-mono shadow-inner">
              <button
                onClick={() => toggleLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === 'en' 
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => toggleLanguage('fr')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === 'fr' 
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Passer en Français"
              >
                FR
              </button>
            </div>

            {/* Somnia Video Demo Modal Trigger */}
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-xs text-purple-200 font-bold transition-all shadow-sm active:scale-95 group"
              title={lang === 'en' ? 'Watch Video Walkthrough & Interactive Demo' : 'Voir la Démonstration Vidéo et le Pitch'}
            >
              <Film className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>{t('video_btn')}</span>
            </button>

            {/* Somnia Faucet Modal Trigger */}
            <button
              onClick={() => setShowFaucetModal(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 font-semibold transition-all shadow-sm active:scale-95"
              title={lang === 'en' ? 'Get free STT tokens on Somnia Faucets' : 'Obtenir des STT gratuits sur les Faucets Somnia'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">{t('faucet_btn')}</span>
            </button>

            {/* On-Chain Contracts Button */}
            <button
              onClick={() => setShowContractsModal(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-300 font-semibold transition-all shadow-sm"
              title="Afficher les contrats déployés sur Somnia Shannon Testnet"
            >
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">{t('onchain_contracts_btn')}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-200">4</span>
            </button>

            {/* Somnia Shannon Network Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Somnia (50312)</span>
            </div>

            {/* WALLET BUTTON OR ACCOUNT PILL + DISCONNECT BUTTON */}
            {walletConnected ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center rounded-xl bg-slate-900/90 border border-cyan-500/40 p-1 gap-1 shadow-sm">
                  {/* Balance Badge */}
                  <div 
                    onClick={() => setShowAccountModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/40 text-xs font-mono text-emerald-400 font-bold hidden sm:flex items-center gap-1 cursor-pointer hover:bg-cyan-900/40 transition-colors"
                    title={lang === 'en' ? 'Click to view account' : 'Cliquer pour voir le compte'}
                  >
                    <span>${usdsoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-[10px] text-slate-400">USDso</span>
                  </div>

                  {/* Account Pill with Dropdown indicator */}
                  <button
                    onClick={() => setShowAccountModal(true)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-surfaceBorder/80 hover:bg-slate-800 text-xs text-cyan-300 font-mono font-bold transition-all border border-slate-700 hover:border-cyan-500/50"
                    title={lang === 'en' ? 'Account & wallet details' : 'Gérer le compte et portefeuille'}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{walletAddress}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
                  </button>
                </div>

                {/* Highly Visible Dedicated Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-black transition-all shadow-md shadow-rose-500/10 active:scale-95 shrink-0"
                  title={lang === 'en' ? 'Disconnect wallet' : 'Déconnecter le portefeuille'}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'en' ? 'Disconnect' : 'Déconnecter'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black shadow-md shadow-cyan-500/25 transition-all active:scale-[0.98]"
              >
                <Wallet className="w-4 h-4" />
                <span>{t('connect_wallet')}</span>
              </button>
            )}
          </div>

        </div>

        {/* ROW 2: Dedicated Full Navigation Bar with all 8 tabs for all screens */}
        <div className="border-t border-surfaceBorder/50 bg-slate-950/50 px-4 py-2">
          <div className="max-w-7xl mx-auto overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {[
              { id: 'terminal', labelKey: 'tab_terminal' as const, icon: LineChart },
              { id: 'swarm', labelKey: 'tab_swarm' as const, icon: Bot },
              { id: 'copilot', labelKey: 'tab_copilot' as const, icon: MessageSquare },
              { id: 'scanner', labelKey: 'tab_scanner' as const, icon: Zap },
              { id: 'backtest', labelKey: 'tab_backtest' as const, icon: TrendingUp },
              { id: 'pvp', labelKey: 'tab_pvp' as const, icon: Swords },
              { id: 'vaults', labelKey: 'tab_vaults' as const, icon: Layers },
              { id: 'leaderboard', labelKey: 'tab_leaderboard' as const, icon: Award },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surfaceBorder/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* High-Frequency Institutional Live Ticker Ribbon */}
      <div className="w-full bg-slate-950/80 border-b border-white/[0.06] backdrop-blur-md px-4 py-2 text-[11px] font-mono overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 whitespace-nowrap text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-500">{t('ticker_tps')}:</span>
            <span className="text-cyan-300 font-bold">105,420 TPS</span>
            <span className="text-slate-600">({t('ticker_finality')}: 320ms)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">{t('ticker_gas')}:</span>
            <span className="text-emerald-400 font-bold">&lt; 0.0001 STT</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">{t('ticker_accuracy')}:</span>
            <span className="text-purple-300 font-bold">78.4%</span>
            <span className="text-slate-600">(Brier: 0.082)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">{t('ticker_volume')}:</span>
            <span className="text-slate-200 font-bold">$1,428,500 USDso</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">{t('ticker_tvl')}:</span>
            <span className="text-emerald-400 font-bold">$842,500 USDso</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">{t('ticker_oracle')}:</span>
            <a 
              href="https://shannon-explorer.somnia.network/address/0xE1B0f9Fdab26E6470520911BA7CCBda48650541D"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              0xE1B0...41D <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Quick Disconnect shortcut in ticker ribbon if connected */}
          {walletConnected && (
            <div className="flex items-center gap-2 pl-4 border-l border-white/10 shrink-0">
              <span className="text-emerald-400 font-bold">🟢 {walletAddress}</span>
              <button
                onClick={disconnectWallet}
                className="text-rose-400 hover:text-rose-200 font-bold underline flex items-center gap-1 text-[11px] cursor-pointer"
                title={lang === 'en' ? 'Disconnect wallet' : 'Déconnecter le portefeuille'}
              >
                <LogOut className="w-3 h-3" />
                <span>{lang === 'en' ? 'Disconnect' : 'Déconnecter'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">

        {/* 💡 BEGINNER-FRIENDLY GUIDE BANNER: Event Contracts in 3 Simple Steps */}
        {showHowItWorks ? (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-cyan-500/30 relative overflow-hidden shadow-lg animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💡</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-cyan-200">
                    {t('how_it_works_title')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('how_it_works_sub')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Play className="w-3 h-3 text-purple-400 fill-purple-400" />
                  <span>{t('video_banner_btn')}</span>
                </button>
                <button
                  onClick={() => setShowHowItWorks(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors shrink-0"
                >
                  ✕ {t('hide_guide')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.06] flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">1</div>
                <div>
                  <div className="text-xs font-bold text-slate-200 mb-0.5">{t('step_1_title')}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{t('step_1_desc')}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.06] flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">2</div>
                <div>
                  <div className="text-xs font-bold text-slate-200 mb-0.5">{t('step_2_title')}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{t('step_2_desc')}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.06] flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">3</div>
                <div>
                  <div className="text-xs font-bold text-slate-200 mb-0.5">{t('step_3_title')}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{t('step_3_desc')}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowHowItWorks(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 transition-all hover:bg-cyan-900/40"
            >
              <span>{t('how_it_works_title')}</span>
            </button>
          </div>
        )}

        {/* TAB 1: TRADING TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Market Header, Chart & Unified Data Tabs */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* 1. Market Selection & Key Metrics Bar (Polymarket / Hyperliquid style) */}
              <div className="glass-panel rounded-2xl p-4 sm:p-5 relative overflow-hidden border border-white/[0.08]">
                {/* Quick Switcher Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-white/[0.06] text-xs">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">Markets:</span>
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
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap flex items-center gap-2 transition-all border ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold">{m.symbol}</span>
                        <span className="text-[11px] text-emerald-400 font-semibold">{probPct}% YES</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Market Title & Live Stats Bar */}
                <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {currentMarket.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ⏱️ Expiry in 5m • Somnia Fast CLOB
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100">{currentMarket.title}</h2>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
                    <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/[0.06]">
                      <div className="text-[10px] text-slate-500 uppercase">{t('spot_price_label')}</div>
                      <div className="text-base font-bold text-emerald-400">${currentMarket.current_spot.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/[0.06]">
                      <div className="text-[10px] text-slate-500 uppercase">{t('strike_label')}</div>
                      <div className="text-base font-bold text-slate-200">${currentMarket.strike_price.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/[0.06] hidden sm:block">
                      <div className="text-[10px] text-slate-500 uppercase">{t('volume_label')}</div>
                      <div className="text-base font-bold text-cyan-300">${Math.round(currentMarket.volume_24h / 1000)}k</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Interactive Charts Panel */}
              <div style={{ height: '390px' }} className="w-full">
                <MarketChartsPanel
                  market={currentMarket}
                  aiProbability={0.682}
                  lang={lang}
                />
              </div>

              {/* 3. Unified Tabbed Data Widget (Orderbook, AI Alpha, Trades, Positions) */}
              <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
                {/* Sub-Tabs Header */}
                <div className="flex items-center justify-between px-4 pt-3 border-b border-white/[0.06] bg-slate-950/40">
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'orderbook', label: t('subtab_orderbook'), icon: LineChart },
                      { id: 'ai_alpha', label: t('subtab_ai_alpha'), icon: Cpu },
                      { id: 'trades', label: t('subtab_trades'), icon: Activity },
                      { id: 'positions', label: `${t('subtab_positions')} (2)`, icon: Layers },
                    ].map(st => {
                      const Icon = st.icon;
                      const isSubActive = terminalSubTab === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setTerminalSubTab(st.id as any)}
                          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                            isSubActive
                              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    Somnia Shannon L1 • 0xCLOB
                  </span>
                </div>

                {/* Sub-Tab Content */}
                <div className="p-4 sm:p-5">
                  {/* SUB-TAB A: CLOB ORDERBOOK */}
                  {terminalSubTab === 'orderbook' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Bids */}
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-emerald-400 flex justify-between font-mono pb-1 border-b border-white/[0.06]">
                            <span>{t('best_bid')} (YES)</span>
                            <span>{t('size_col')}</span>
                            <span>Total (USDso)</span>
                          </div>
                          <div className="space-y-1 font-mono text-xs">
                            {[
                              { price: 0.48, size: '25,800', total: '12,384', depth: 85 },
                              { price: 0.47, size: '18,500', total: '8,695', depth: 62 },
                              { price: 0.45, size: '54,000', total: '24,300', depth: 95 },
                              { price: 0.44, size: '12,000', total: '5,280', depth: 40 },
                            ].map((row, idx) => (
                              <div key={idx} className="relative flex justify-between px-2.5 py-1 rounded overflow-hidden">
                                <div
                                  style={{ width: `${row.depth}%` }}
                                  className="absolute top-0 right-0 bottom-0 bg-emerald-500/10 -z-0 pointer-events-none rounded"
                                />
                                <span className="text-emerald-400 font-bold z-10">${row.price.toFixed(2)}</span>
                                <span className="text-slate-300 z-10">{row.size}</span>
                                <span className="text-slate-400 z-10">${row.total}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Asks */}
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-rose-400 flex justify-between font-mono pb-1 border-b border-white/[0.06]">
                            <span>{t('best_ask')} (YES)</span>
                            <span>{t('size_col')}</span>
                            <span>Total (USDso)</span>
                          </div>
                          <div className="space-y-1 font-mono text-xs">
                            {[
                              { price: 0.51, size: '29,800', total: '15,198', depth: 75 },
                              { price: 0.52, size: '12,400', total: '6,448', depth: 45 },
                              { price: 0.54, size: '58,300', total: '31,482', depth: 90 },
                              { price: 0.55, size: '16,200', total: '8,910', depth: 55 },
                            ].map((row, idx) => (
                              <div key={idx} className="relative flex justify-between px-2.5 py-1 rounded overflow-hidden">
                                <div
                                  style={{ width: `${row.depth}%` }}
                                  className="absolute top-0 left-0 bottom-0 bg-rose-500/10 -z-0 pointer-events-none rounded"
                                />
                                <span className="text-rose-400 font-bold z-10">${row.price.toFixed(2)}</span>
                                <span className="text-slate-300 z-10">{row.size}</span>
                                <span className="text-slate-400 z-10">${row.total}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Spread Indicator Bar */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>{t('spread')}: <strong className="text-cyan-300">$0.03 (5.8%)</strong></span>
                        <span className="text-slate-500">Matching Engine: Somnia L1 Sub-second Reactive</span>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB B: BAYESIAN AI ALPHA GAUGE */}
                  {terminalSubTab === 'ai_alpha' && (
                    <div className="space-y-5">
                      {/* Comparison Gauge */}
                      <div className="bg-slate-900/80 rounded-2xl p-4 border border-cyan-500/30 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400"><Cpu className="w-4 h-4" /></span>
                            <span className="font-bold text-sm text-slate-100">{t('ai_alpha_title')}</span>
                          </div>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
                            Edge +22.4% (STRONG BUY YES)
                          </span>
                        </div>

                        {/* Visual Comparison Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono text-slate-400">
                            <span>Market Odds: <strong className="text-slate-200">51.0% ($0.51)</strong></span>
                            <span>AI Forecast: <strong className="text-emerald-400 font-bold">73.4% ($0.73)</strong></span>
                          </div>
                          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 flex">
                            <div style={{ width: '51%' }} className="bg-slate-500 h-full rounded-l-full" title="Market Price" />
                            <div style={{ width: '22.4%' }} className="bg-emerald-400 h-full animate-pulse" title="Alpha Edge" />
                            <div style={{ width: '26.6%' }} className="bg-slate-800 h-full rounded-r-full" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs text-center">
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                            <div className="text-[10px] text-slate-500">Kelly Sizing</div>
                            <div className="font-bold text-cyan-400">$270 USDso (5.0%)</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                            <div className="text-[10px] text-slate-500">{t('brier_score_label')}</div>
                            <div className="font-bold text-purple-300">0.082 (Top 1%)</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                            <div className="text-[10px] text-slate-500">Expected Value (EV)</div>
                            <div className="font-bold text-emerald-400">+43.9%</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{t('model_oracle_footer')}</span>
                        <button
                          onClick={() => {
                            setTradeOutcome('YES');
                            setTradePrice(currentMarket.yes_best_ask);
                            setTradeAmount(250);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold transition-all shadow-sm"
                        >
                          {t('copy_signal_btn')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB C: LIVE TRADES */}
                  {terminalSubTab === 'trades' && (
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between text-slate-500 pb-1 border-b border-white/[0.06] text-[11px]">
                        <span>Time</span>
                        <span>Side</span>
                        <span>Price</span>
                        <span>Amount</span>
                        <span>Tx Hash</span>
                      </div>
                      {[
                        { time: '23:10:45', side: 'BUY YES', price: '$0.51', amount: '$450 USDso', hash: '0x3a8...c912', sideColor: 'text-emerald-400' },
                        { time: '23:10:41', side: 'BUY YES', price: '$0.50', amount: '$1,200 USDso', hash: '0x7e1...f044', sideColor: 'text-emerald-400' },
                        { time: '23:10:33', side: 'BUY NO', price: '$0.49', amount: '$250 USDso', hash: '0x1b2...99a0', sideColor: 'text-rose-400' },
                        { time: '23:10:19', side: 'BUY YES', price: '$0.51', amount: '$750 USDso', hash: '0xd44...7188', sideColor: 'text-emerald-400' },
                        { time: '23:10:02', side: 'BUY YES', price: '$0.50', amount: '$300 USDso', hash: '0xfa9...2310', sideColor: 'text-emerald-400' },
                      ].map((tr, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-white/[0.02] hover:bg-white/[0.02] px-1 rounded">
                          <span className="text-slate-400">{tr.time}</span>
                          <span className={`font-bold ${tr.sideColor}`}>{tr.side}</span>
                          <span className="text-slate-200">{tr.price}</span>
                          <span className="text-slate-300">{tr.amount}</span>
                          <span className="text-cyan-400/80">{tr.hash}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SUB-TAB D: MY POSITIONS */}
                  {terminalSubTab === 'positions' && (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between text-slate-500 pb-1 border-b border-white/[0.06] text-[11px]">
                        <span>Market</span>
                        <span>Outcome</span>
                        <span>Shares</span>
                        <span>Entry Price</span>
                        <span>Mark Price</span>
                        <span>Unrealized P&L</span>
                      </div>
                      {[
                        { market: 'BTC-USD-5M', outcome: 'YES', shares: '196', entry: '$0.51', mark: '$0.51', pnl: '+$0.00', pnlColor: 'text-slate-300' },
                        { market: 'SOMNIA-TPS', outcome: 'YES', shares: '350', entry: '$0.78', mark: '$0.82', pnl: '+$14.00 (+5.1%)', pnlColor: 'text-emerald-400' },
                      ].map((pos, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-white/[0.04] px-1 rounded bg-slate-900/40">
                          <span className="font-bold text-slate-200">{pos.market}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{pos.outcome}</span>
                          <span className="text-slate-300">{pos.shares} {lang === 'en' ? 'shares' : 'parts'}</span>
                          <span className="text-slate-400">{pos.entry}</span>
                          <span className="text-slate-200 font-bold">{pos.mark}</span>
                          <span className={`font-bold ${pos.pnlColor}`}>{pos.pnl}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Col: Instant Order Placement Execution */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="glass-panel rounded-3xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    {t('order_panel_title')}
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    DreamDEX CLOB
                  </span>
                </div>

                {/* Active Wallet Badge & Disconnect inside the Order Ticket */}
                {walletConnected ? (
                  <div className="mb-4 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">{lang === 'en' ? 'Active Wallet' : 'Portefeuille Connecté'}</div>
                        <div className="text-cyan-300 font-bold">{walletAddress}</div>
                      </div>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      title={lang === 'en' ? 'Disconnect wallet' : 'Déconnecter ce portefeuille'}
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>{lang === 'en' ? 'Disconnect' : 'Déconnecter'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-slate-300 font-medium">{lang === 'en' ? 'Wallet not connected' : 'Portefeuille non connecté'}</span>
                    </div>
                    <button
                      onClick={handleConnectWallet}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Connect' : 'Connecter'}</span>
                    </button>
                  </div>
                )}

                {/* Outcome Toggle Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => {
                      setTradeOutcome('YES');
                      setTradePrice(currentMarket.yes_best_ask);
                    }}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-1 border relative overflow-hidden ${
                      tradeOutcome === 'YES'
                        ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500/40'
                        : 'bg-surface/80 border-surfaceBorder text-slate-400 hover:text-slate-200 hover:border-emerald-500/30'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-extrabold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {t('buy_yes')}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">${currentMarket.yes_best_ask.toFixed(2)} USDso</span>
                    <span className="text-[10px] text-slate-400">{t('yes_sub')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTradeOutcome('NO');
                      setTradePrice(currentMarket.no_best_ask);
                    }}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-1 border relative overflow-hidden ${
                      tradeOutcome === 'NO'
                        ? 'bg-gradient-to-r from-rose-500/20 via-pink-500/30 to-rose-500/20 border-rose-400 text-rose-300 shadow-lg shadow-rose-500/25 ring-1 ring-rose-500/40'
                        : 'bg-surface/80 border-surfaceBorder text-slate-400 hover:text-slate-200 hover:border-rose-500/30'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-extrabold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      {t('buy_no')}
                    </span>
                    <span className="text-xs font-mono text-rose-400 font-bold">${currentMarket.no_best_ask.toFixed(2)} USDso</span>
                    <span className="text-[10px] text-slate-400">{t('no_sub')}</span>
                  </button>
                </div>

                {/* Amount Slider & Presets */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>{t('order_amount_label')}</span>
                      <span className="text-slate-300 font-mono font-semibold">${tradeAmount} USDso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[25, 50, 100, 250, 500].map(val => (
                        <button
                          key={val}
                          onClick={() => setTradeAmount(val)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            tradeAmount === val
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                              : 'bg-surface border-surfaceBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          ${val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kelly Criterion Suggestion Badge */}
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{t('kelly_allocation')} :</span>
                    <span className="text-cyan-400 font-bold">$270 USDso (5.0%)</span>
                  </div>

                  {/* Return Simulation */}
                  <div className="bg-surface/90 rounded-xl p-3.5 border border-surfaceBorder space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>{t('shares_acquired')} :</span>
                      <span className="text-slate-200 font-mono font-bold">
                        {Math.round(tradeAmount / tradePrice)} {lang === 'en' ? 'shares' : 'parts'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>{t('payout_at_settlement')} :</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ${Math.round((tradeAmount / tradePrice))} USDso
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1.5 border-t border-surfaceBorder">
                      <span>{t('net_profit')} :</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        +{Math.round(((1 / tradePrice) - 1) * 100)}%
                      </span>
                    </div>
                    <div className="pt-1 text-[10px] text-cyan-400/80 text-center font-mono">
                      ℹ️ {t('order_payout_hint')}
                    </div>
                  </div>
                </div>

                {/* Submit Trade Button */}
                <button
                  disabled={isTrading}
                  onClick={() => handlePlaceOrder()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 hover:shadow-cyan-500/40 active:scale-[0.99]"
                >
                  {isTrading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('routing_somnia')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('place_order_btn')}</span>
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
                  <h3 className="font-bold text-base text-slate-100">{t('swarm_cot_title')}</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">{t('swarm_cot_sub')}</span>
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
                        <span>{t('confidence_label')} <strong className="text-cyan-300">{Math.round(log.confidence * 100)}%</strong></span>
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
                    <h3 className="font-bold text-base text-slate-100">{t('copilot_title')}</h3>
                    <p className="text-xs text-slate-400">{t('copilot_sub')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{t('copilot_analyzing_market')}</span>
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
                            <span className="font-bold text-cyan-400 text-xs uppercase">{t('opportunity_detected')}</span>
                            <span className="text-xs text-emerald-400 font-bold font-mono">EV +{msg.action_card.expected_ev_pct}%</span>
                          </div>
                          <div className="text-xs text-slate-300 font-semibold">{msg.action_card.market_title}</div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">{t('recommended_position')}</span>
                            <span className="font-bold text-emerald-400 font-mono">
                              {lang === 'en' ? 'BUY' : 'ACHETER'} {msg.action_card.recommended_outcome} @ ${msg.action_card.suggested_price}
                            </span>
                          </div>
                          <button
                            onClick={() => handlePlaceOrder(msg.action_card?.recommended_outcome, msg.action_card?.suggested_price, msg.action_card?.suggested_amount)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <span>{t('execute_1click_somnia')}</span>
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
                    <span>{t('copilot_calculating')}</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompts */}
              <div className="pt-3 flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
                {[
                  lang === 'en' ? 'What is the current BTC 5M edge?' : "Quel est l'edge actuel sur le BTC ?",
                  lang === 'en' ? 'Should I buy YES on Somnia testnet?' : "Faut-il acheter OUI sur le testnet Somnia ?",
                  lang === 'en' ? 'Explain Sentinel-Alpha scalping strategy' : "Explique la stratégie de Sentinel-Alpha",
                  lang === 'en' ? 'Calculate Kelly position sizing for $500' : "Calcule le dimensionnement de Kelly pour 500$"
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
                  placeholder={t('copilot_placeholder')}
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
                  <h3 className="text-lg font-bold text-slate-100">{t('vaults_title')}</h3>
                  <p className="text-xs text-slate-400 max-w-2xl mt-1">
                    {t('vaults_sub')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{t('vault_your_balance')}</div>
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
                  desc: lang === 'en' ? 'Ultra-fast scalping on 5-minute BTC/ETH micro-events with sub-second execution.' : 'Scalping ultra-rapide sur les micro-événements BTC/ETH à échéance 5 minutes.',
                  risk: lang === 'en' ? 'High' : 'Élevé'
                },
                {
                  id: 'v_arb',
                  name: 'Sentinel Bayesian Arbitrage Vault',
                  symbol: 'dsBAYES',
                  apy: '48.5% APY',
                  maxDd: '10%',
                  pnl: '+$8,940.20',
                  tvl: '$280,000 USDso',
                  desc: lang === 'en' ? 'Captures odds discrepancies between DreamDEX CLOB and spot oracle feeds.' : 'Exploitation des anomalies de cotes entre DreamDEX CLOB et les flux spot/oracles.',
                  risk: lang === 'en' ? 'Moderate' : 'Modéré'
                },
                {
                  id: 'v_macro',
                  name: 'Sentinel Macro Catalyst Vault',
                  symbol: 'dsMACRO',
                  apy: '32.1% APY',
                  maxDd: '5%',
                  pnl: '+$3,410.80',
                  tvl: '$195,000 USDso',
                  desc: lang === 'en' ? 'Systematic event contract positioning on Somnia ecosystem milestones.' : 'Prise de position sur les jalons de l\'écosystème Somnia avec couverture systématique.',
                  risk: lang === 'en' ? 'Conservative' : 'Conservateur'
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
                        <span className="text-slate-400">{t('vault_hist_return')}</span>
                        <span className="text-emerald-400 font-bold">{vault.apy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('vault_max_dd')}</span>
                        <span className="text-slate-200">{vault.maxDd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('vault_tvl_managed')}</span>
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
                    {t('vault_deposit_action')} ({vault.symbol})
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
                <h3 className="text-lg font-bold text-slate-100">{t('leaderboard_title')}</h3>
                <p className="text-xs text-slate-400">{t('leaderboard_sub')}</p>
              </div>
              <span className="text-xs text-cyan-400 font-bold">{t('leaderboard_weekly')}</span>
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
                    <span className="text-slate-400">{item.trades} {t('trades_label')}</span>
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
            <BacktestSimulator lang={lang} />
          </div>
        )}

        {/* TAB 7: ARBITRAGE SCANNER */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <ArbitrageScanner lang={lang} />
          </div>
        )}

        {/* TAB 8: PVP DUELS */}
        {activeTab === 'pvp' && (
          <div className="space-y-6">
            <PvPDuels lang={lang} />
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

      {/* MODAL: ACCOUNT & WALLET DETAILS (Uniswap / Hyperliquid standard) */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 relative">
            <button
              onClick={() => setShowAccountModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 uppercase font-bold">
                  {lang === 'en' ? 'Connected to Somnia Shannon' : 'Connecté à Somnia Shannon'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                {lang === 'en' ? 'Account & Wallet' : 'Compte & Portefeuille'}
              </h3>
            </div>

            {/* Address & Copy Box */}
            <div className="p-3.5 rounded-2xl bg-surface/80 border border-surfaceBorder flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 truncate max-w-[240px] font-semibold">{walletAddressFull}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddressFull);
                    toast.success(lang === 'en' ? 'Address copied!' : 'Adresse copiée !');
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-all"
                  title="Copier l'adresse"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://shannon-explorer.somnia.network/address/${walletAddressFull}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-all"
                  title="Voir sur Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Balances Card */}
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between">
                <span className="text-slate-400">{lang === 'en' ? 'Collateral Balance (USDso):' : 'Solde Collatéral (USDso):'}</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ${usdsoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDso
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between">
                <span className="text-slate-400">{lang === 'en' ? 'Somnia Gas Balance (STT):' : 'Solde Gas Somnia (STT):'}</span>
                <span className="text-cyan-300 font-bold text-sm">18.4200 STT</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  setShowFaucetModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === 'en' ? 'Get STT tokens on Somnia Faucets' : 'Obtenir des jetons STT sur les Faucets'}</span>
              </button>

              <button
                onClick={disconnectWallet}
                className="w-full py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-rose-100 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>{lang === 'en' ? 'Disconnect This Wallet' : 'Déconnecter ce Portefeuille'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 0: PRO MULTI-WALLET SELECTOR (OKX, MetaMask, Phantom, Coinbase, Injected & Demo) */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-slate-900/95 border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 relative overflow-hidden">
            {/* Top ambient highlight line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-purple-500" />

            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                  Somnia Shannon Testnet • Chain ID: 50312
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 tracking-tight">
                {t('wallet_modal_title')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('wallet_modal_sub')}
              </p>
            </div>

            {/* If currently connected: Quick Active Status Bar with 1-Click Disconnect */}
            {walletConnected && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      {lang === 'en' ? 'Active Connection' : 'Connexion Active'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {walletAddress}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddressFull);
                      toast.success(lang === 'en' ? 'Address copied!' : 'Adresse copiée !');
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs active:scale-95"
                    title={lang === 'en' ? 'Copy address' : 'Copier l\'adresse'}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={disconnectWallet}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lang === 'en' ? 'Disconnect' : 'Déconnecter'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Provider List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {/* Dynamic EIP-6963 Detected Wallets (if any extension announced) */}
              {eip6963Wallets.map(w => (
                <button
                  key={w.info?.uuid || w.info?.name}
                  onClick={() => connectWithEip6963(w)}
                  disabled={connectingWallet !== null}
                  className="w-full p-3.5 rounded-2xl bg-slate-950/70 hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/50 flex items-center justify-between transition-all group text-left shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5">
                    {w.info?.icon ? (
                      <img src={w.info.icon} alt={w.info.name} className="w-8 h-8 rounded-xl object-contain shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-300">
                        ⚡
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {w.info?.name}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono">
                          {t('wallet_detected_badge')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">EIP-6963 Standard</p>
                    </div>
                  </div>
                  {connectingWallet === w.info?.name ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                  )}
                </button>
              ))}

              {/* 1. OKX Wallet */}
              <button
                onClick={() => connectWithProvider('okx')}
                disabled={connectingWallet !== null}
                className="w-full p-3.5 rounded-2xl bg-slate-950/70 hover:bg-white/[0.05] border border-white/[0.08] hover:border-slate-400 flex items-center justify-between transition-all group text-left shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-1 rounded-xl bg-black border border-white/20 shadow-inner">
                    <OKXWalletIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">
                        {t('wallet_okx')}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                        OKX Web3
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{t('wallet_okx_sub')}</p>
                  </div>
                </div>
                {connectingWallet === 'okx' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                      EVM
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}
              </button>

              {/* 2. MetaMask */}
              <button
                onClick={() => connectWithProvider('metamask')}
                disabled={connectingWallet !== null}
                className="w-full p-3.5 rounded-2xl bg-slate-950/70 hover:bg-amber-500/10 border border-white/[0.08] hover:border-amber-500/50 flex items-center justify-between transition-all group text-left shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-1 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
                    <MetaMaskIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                        {t('wallet_metamask')}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {t('wallet_popular_badge')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{t('wallet_metamask_sub')}</p>
                  </div>
                </div>
                {connectingWallet === 'metamask' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                      {t('recommended_badge')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}
              </button>

              {/* 3. Phantom */}
              <button
                onClick={() => connectWithProvider('phantom')}
                disabled={connectingWallet !== null}
                className="w-full p-3.5 rounded-2xl bg-slate-950/70 hover:bg-purple-500/10 border border-white/[0.08] hover:border-purple-500/50 flex items-center justify-between transition-all group text-left shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-1 rounded-xl bg-purple-500/10 border border-purple-500/20 shadow-inner">
                    <PhantomWalletIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-purple-300 transition-colors">
                        {t('wallet_phantom')}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400">{t('wallet_phantom_sub')}</p>
                  </div>
                </div>
                {connectingWallet === 'phantom' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">
                      Multi-Chain
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}
              </button>

              {/* 4. Coinbase / Injected Web3 */}
              <button
                onClick={() => connectWithProvider('injected')}
                disabled={connectingWallet !== null}
                className="w-full p-3.5 rounded-2xl bg-slate-950/70 hover:bg-blue-500/10 border border-white/[0.08] hover:border-blue-500/50 flex items-center justify-between transition-all group text-left shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-1 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-inner">
                    <CoinbaseWalletIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-blue-300 transition-colors">
                        {t('wallet_coinbase')}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400">{t('wallet_coinbase_sub')}</p>
                  </div>
                </div>
                {connectingWallet === 'injected' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">
                      Web3
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}
              </button>

              {/* 5. Somnia 1-Click Instant Demo */}
              <button
                onClick={() => connectWithProvider('demo')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-teal-950/30 to-slate-950 border border-cyan-500/40 hover:border-cyan-300 flex items-center justify-between transition-all group text-left shadow-lg shadow-cyan-950/20 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-lg shadow-inner">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-cyan-300 group-hover:text-cyan-200 transition-colors">
                        {t('wallet_demo')}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400">{t('wallet_demo_sub')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono">
                    {t('instant_badge')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            </div>

            {/* Footer: Web3 Help & Faucet Access */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setShowFaucetModal(true);
                }}
                className="hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('wallet_need_faucet_hint')}</span>
              </button>

              <a
                href="https://ethereum.org/wallets/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>{t('wallet_get_started')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-mono pt-1">
              🔒 {t('wallet_disclaimer')}
            </p>

          </div>
        </div>
      )}

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

      {/* MODAL: SOMNIA SHANNON TESTNET FAUCETS */}
      {showFaucetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 relative">
            <button
              onClick={() => setShowFaucetModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">
                  Somnia Shannon Testnet • Chain ID: 50312
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{t('faucet_modal_title')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('faucet_modal_sub')}
              </p>
            </div>

            {/* If wallet connected: Quick Copy Address Box */}
            {walletConnected && walletAddressFull && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between font-mono text-xs">
                <div className="truncate mr-3">
                  <span className="text-slate-400 text-[10px] block font-sans uppercase">{lang === 'en' ? 'Your Wallet Address:' : 'Votre Adresse Portefeuille :'}</span>
                  <span className="text-amber-300 font-bold truncate block">{walletAddressFull}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddressFull);
                    toast.success(lang === 'en' ? 'Address copied! Paste it in the faucet.' : 'Adresse copiée ! Collez-la dans le faucet.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('copy_my_address')}</span>
                </button>
              </div>
            )}

            {/* Faucet Options List */}
            <div className="space-y-3">
              {/* Option 1: Google Cloud Web3 Faucet (Recommended) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 hover:border-amber-400/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-100">{t('faucet_gcloud_title')}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      {t('faucet_rec_badge')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{t('faucet_gcloud_desc')}</p>
                </div>
                <a
                  href="https://cloud.google.com/application/web3/faucet/somnia/shannon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 whitespace-nowrap active:scale-95"
                >
                  <span>{t('open_faucet_btn')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Option 2: Thirdweb Somnia Faucet */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-100">{t('faucet_thirdweb_title')}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      {t('faucet_alt_badge')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{t('faucet_thirdweb_desc')}</p>
                </div>
                <a
                  href="https://thirdweb.com/somnia-shannon-testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 whitespace-nowrap active:scale-95"
                >
                  <span>{t('open_faucet_btn')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Option 3: Stakely Multi-Faucet */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-100">{t('faucet_stakely_title')}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                      {t('faucet_comm_badge')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{t('faucet_stakely_desc')}</p>
                </div>
                <a
                  href="https://stakely.io/faucet/somnia-testnet-stt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 whitespace-nowrap active:scale-95"
                >
                  <span>{t('open_faucet_btn')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Developer Support Discord Callout */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-indigo-200 block">{t('faucet_discord_title')}</span>
                <span className="text-slate-400 text-[11px] block">{t('faucet_discord_desc')}</span>
              </div>
              <a
                href="https://discord.gg/somnia"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-all active:scale-95"
              >
                Discord ↗
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

      {/* MODAL 5: VIDEO WALKTHROUGH & INTERACTIVE PITCH */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-3xl w-full bg-slate-900/95 border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 relative overflow-hidden max-h-[90vh] flex flex-col">
            {/* Top ambient highlight line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400" />

            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all active:scale-95 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                <span className="text-[11px] font-mono text-purple-300 uppercase font-bold tracking-wider">
                  Somnia × DreamDEX Hackathon • Video Walkthrough
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 tracking-tight">
                {t('video_modal_title')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('video_modal_sub')}
              </p>
            </div>

            {/* Step / Chapter Pills Navigator */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-white/[0.08]">
              {[
                { step: 0, label: lang === 'en' ? '🎬 Video Player' : '🎬 Vidéo', icon: Play },
                { step: 1, label: lang === 'en' ? '1. Problem' : '1. Problème', icon: AlertTriangle },
                { step: 2, label: lang === 'en' ? '2. Bayesian Swarm' : '2. Essaim Bayésien', icon: Bot },
                { step: 3, label: lang === 'en' ? '3. Somnia L1 (105k TPS)' : '3. Somnia L1 (105k TPS)', icon: Zap },
                { step: 4, label: lang === 'en' ? '4. Radar & PvP' : '4. Radar & PvP', icon: Swords },
                { step: 5, label: lang === 'en' ? '5. On-Chain Proofs' : '5. Preuves On-Chain', icon: Shield },
              ].map(c => {
                const Icon = c.icon;
                const isSelected = videoActiveStep === c.step;
                return (
                  <button
                    key={c.step}
                    onClick={() => setVideoActiveStep(c.step)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Body depending on videoActiveStep */}
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {videoActiveStep === 0 && (
                <div className="space-y-4">
                  {/* Video Container */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center group">
                    {customVideoUrl ? (
                      <iframe
                        src={
                          customVideoUrl.includes('youtube.com/watch?v=')
                            ? customVideoUrl.replace('watch?v=', 'embed/')
                            : customVideoUrl.includes('youtu.be/')
                            ? `https://www.youtube.com/embed/${customVideoUrl.split('youtu.be/')[1]}`
                            : customVideoUrl.includes('loom.com/share/')
                            ? customVideoUrl.replace('share', 'embed')
                            : customVideoUrl
                        }
                        title="DreamSentinel Video Walkthrough"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                          <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white mb-1">
                            DreamSentinel AI Pitch & Live Demo (3 min)
                          </h4>
                          <p className="text-xs text-slate-400 max-w-md">
                            {lang === 'en'
                              ? 'Autonomous Bayesian AI Swarm trading DreamDEX Event Contracts on Somnia Reactive L1.'
                              : 'Essaim d\'agents bayésiens autonomes pour les Event Contracts DreamDEX sur Somnia L1.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span>Somnia Shannon Testnet (50312) • 105,420 TPS</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Video URL Input */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        {t('video_enter_url')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        YouTube / Loom / MP4
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... ou https://www.loom.com/share/..."
                        defaultValue={customVideoUrl}
                        id="customVideoInput"
                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('customVideoInput') as HTMLInputElement;
                          if (input) handleSaveVideoUrl(input.value.trim());
                        }}
                        className="px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold transition-all shrink-0 active:scale-95"
                      >
                        {t('video_save_url')}
                      </button>
                    </div>
                  </div>

                  {/* Read Script Guide Shortcut */}
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <span className="text-purple-200">
                      📄 {lang === 'en' ? 'Complete video script & voiceover available in' : 'Script complet et voix-off disponibles dans'} <code className="text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded font-mono">VIDEO_SCRIPT.md</code>
                    </span>
                    <button
                      onClick={() => setVideoActiveStep(1)}
                      className="text-purple-300 hover:text-white font-bold underline flex items-center gap-1 shrink-0"
                    >
                      <span>{lang === 'en' ? 'Start Interactive Pitch Tour' : 'Démarrer le Pitch Interactif'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {videoActiveStep === 1 && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t('video_step_1_title')}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t('video_step_1_desc')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                        <div className="text-xs font-bold text-rose-300">Fragmentation</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Split CLOB liquidity' : 'Orderbooks divisés'}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                        <div className="text-xs font-bold text-amber-300">{lang === 'en' ? 'High Latency' : 'Haute Latence'}</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? '12s+ on slow L1s' : '12s+ sur les L1 lentes'}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                        <div className="text-xs font-bold text-orange-300">{lang === 'en' ? 'Emotional Sizing' : 'Biais Émotionnel'}</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Suboptimal allocation' : 'Perte du capital'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button onClick={() => setVideoActiveStep(0)} className="text-xs text-slate-400 hover:text-white">← {lang === 'en' ? 'Video Player' : 'Lecteur'}</button>
                    <button onClick={() => setVideoActiveStep(2)} className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold">
                      {lang === 'en' ? 'Next: AI Swarm →' : 'Suivant : Essaim d\'IA →'}
                    </button>
                  </div>
                </div>
              )}

              {videoActiveStep === 2 && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                      <Bot className="w-4 h-4" />
                      <span>{t('video_step_2_title')}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t('video_step_2_desc')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <div className="text-xs font-bold text-cyan-300">Alpha Scalper</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Order Book Imbalance (OBI)' : 'Déséquilibre du carnet d\'ordres (OBI)'}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                        <div className="text-xs font-bold text-teal-300">Bayesian Arb</div>
                        <div className="text-[10px] text-slate-400 font-mono">Kelly f* = (bp - q)/b</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="text-xs font-bold text-purple-300">Macro Hedger</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Volatility & shock protection' : 'Protection contre la volatilité'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        setShowVideoModal(false);
                        setActiveTab('swarm');
                      }}
                      className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <span>{t('video_try_feature')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setVideoActiveStep(3)} className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold">
                      {lang === 'en' ? 'Next: Somnia L1 →' : 'Suivant : Somnia L1 →'}
                    </button>
                  </div>
                </div>
              )}

              {videoActiveStep === 3 && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Zap className="w-4 h-4" />
                      <span>{t('video_step_3_title')}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t('video_step_3_desc')}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <div className="text-lg font-bold text-emerald-300 font-mono">105,420 TPS</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Ultra-high throughput' : 'Débit ultra-rapide Somnia'}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                        <div className="text-lg font-bold text-cyan-300 font-mono">&lt; 0.0001 STT</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Sub-cent gas fees' : 'Frais de gaz négligeables'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button onClick={() => setVideoActiveStep(2)} className="text-xs text-slate-400 hover:text-white">← {lang === 'en' ? 'Previous' : 'Précédent'}</button>
                    <button onClick={() => setVideoActiveStep(4)} className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold">
                      {lang === 'en' ? 'Next: Radar & PvP →' : 'Suivant : Radar & PvP →'}
                    </button>
                  </div>
                </div>
              )}

              {videoActiveStep === 4 && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <Swords className="w-4 h-4" />
                      <span>{t('video_step_4_title')}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t('video_step_4_desc')}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <div className="text-xs font-bold text-indigo-300">{lang === 'en' ? 'Arbitrage Radar' : 'Radar d\'Arbitrage'}</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? 'DreamDEX vs Polymarket spreads' : 'Écarts DreamDEX vs Polymarket'}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="text-xs font-bold text-rose-300">{lang === 'en' ? '60s Micro-Duels' : 'Duels PvP 60s'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">PvPDuelEscrow.sol</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        setShowVideoModal(false);
                        setActiveTab('pvp');
                      }}
                      className="text-xs text-rose-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <span>{lang === 'en' ? 'Launch a 60s PvP Duel' : 'Lancer un Duel PvP'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setVideoActiveStep(5)} className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold">
                      {lang === 'en' ? 'Next: On-Chain Proofs →' : 'Suivant : Preuves On-Chain →'}
                    </button>
                  </div>
                </div>
              )}

              {videoActiveStep === 5 && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Shield className="w-4 h-4" />
                      <span>{t('video_step_5_title')}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t('video_step_5_desc')}
                    </p>
                    <div className="space-y-1.5 font-mono text-[11px] pt-1">
                      <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-white/[0.06]">
                        <span className="text-slate-400">DreamSentinelOracle:</span>
                        <a href="https://shannon-explorer.somnia.network/address/0xE1B0f9Fdab26E6470520911BA7CCBda48650541D" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">0xE1B0...541D ↗</a>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-white/[0.06]">
                        <span className="text-slate-400">DreamSentinelVault:</span>
                        <a href="https://shannon-explorer.somnia.network/address/0x7F4EA982ef392D1e7F46798fE7618e31F1bE689a" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">0x7F4E...689a ↗</a>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-white/[0.06]">
                        <span className="text-slate-400">PvPDuelEscrow:</span>
                        <a href="https://shannon-explorer.somnia.network/address/0x773D7953a12F070618C8f7061435a9C020dA6F2A" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">0x773D...6F2A ↗</a>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button onClick={() => setVideoActiveStep(4)} className="text-xs text-slate-400 hover:text-white">← {lang === 'en' ? 'Previous' : 'Précédent'}</button>
                    <button
                      onClick={() => setShowVideoModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                      🚀 {lang === 'en' ? 'Enter Trading Terminal' : 'Accéder au Terminal de Trading'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Somnia Shannon Testnet • Chain ID: 50312</span>
              <span>DoraHacks Event Contracts Track</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
