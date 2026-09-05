'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, 
  ChevronRight, Bot, Zap, Swords, Shield, AlertTriangle, 
  TrendingUp, Check, ExternalLink, Sparkles, Download, Mic 
} from 'lucide-react';
import { Language } from '../lib/translations';

interface Props {
  lang: Language;
  onNavigateTab: (tabId: string) => void;
  customVideoUrl: string;
  onSaveVideoUrl: (url: string) => void;
}

interface Chapter {
  id: number;
  start: number;
  end: number;
  titleEn: string;
  titleFr: string;
  icon: any;
}

const CHAPTERS: Chapter[] = [
  { id: 1, start: 0, end: 28, titleEn: '1. The Problem & Vision', titleFr: '1. Problème & Vision', icon: AlertTriangle },
  { id: 2, start: 28, end: 58, titleEn: '2. Bayesian AI Swarm', titleFr: '2. Essaim d\'IA Bayésien', icon: Bot },
  { id: 3, start: 58, end: 85, titleEn: '3. Execution on Somnia L1', titleFr: '3. Exécution Somnia L1', icon: Zap },
  { id: 4, start: 85, end: 110, titleEn: '4. Radar & 60s PvP Duels', titleFr: '4. Radar & Duels PvP 60s', icon: Swords },
  { id: 5, start: 110, end: 135, titleEn: '5. On-Chain Contracts', titleFr: '5. Contrats On-Chain', icon: Shield },
];

const SUBTITLES_EN: { start: number; end: number; text: string }[] = [
  { start: 0, end: 8, text: "Welcome to DreamSentinel AI — Autonomous Swarm Intelligence for DreamDEX on Somnia Layer 1." },
  { start: 8, end: 18, text: "Prediction markets face 3 critical bottlenecks: fragmented liquidity, slow latency, and human emotional sizing errors." },
  { start: 18, end: 28, text: "DreamSentinel AI solves this by fusing Bayesian probability models, Kelly Criterion, and Somnia's 105k TPS." },
  { start: 28, end: 40, text: "Meet our Autonomous Agent Swarm: Alpha Scalper detects microsecond Order Book Imbalances on DreamDEX CLOB." },
  { start: 40, end: 50, text: "Bayesian Arb calculates exact event odds via Pyth and sizes positions mathematically with Kelly: f* = (bp - q) / b." },
  { start: 50, end: 58, text: "Macro Hedger guards portfolio value against sudden volatility shocks. Every hypothesis is streamed live in Chain-of-Thought." },
  { start: 58, end: 72, text: "In our Trading Terminal, winning shares settle at exactly $1.00 USDso. Payouts and returns calculate in real-time." },
  { start: 72, end: 85, text: "Natural language AI Copilot generates actionable trade cards ready for single-click non-custodial execution." },
  { start: 85, end: 98, text: "Our Arbitrage Radar identifies mispricings between DreamDEX and Polymarket, while PvPDuelEscrow powers 60s binary duels." },
  { start: 98, end: 110, text: "ERC-4626 Vaults automate passive yield. All contracts are verified on Somnia Shannon Testnet (Chain ID 50312)!" },
  { start: 110, end: 135, text: "DreamSentinel AI brings institutional quantitative intelligence to on-chain prediction markets. Thank you for watching!" }
];

const SUBTITLES_FR: { start: number; end: number; text: string }[] = [
  { start: 0, end: 8, text: "Bienvenue sur DreamSentinel AI — L'infrastructure d'essaim d'agents IA pour DreamDEX sur la L1 Somnia." },
  { start: 8, end: 18, text: "Les marchés de prédiction souffrent de 3 écueils : carnets d'ordres fragmentés, forte latence et biais émotionnel humain." },
  { start: 18, end: 28, text: "DreamSentinel résout ces défis en fusionnant modèles bayésiens, critère de Kelly et les 105 000 TPS de Somnia." },
  { start: 28, end: 40, text: "Découvrez notre essaim autonome : Alpha Scalper analyse les déséquilibres du carnet d'ordres (OBI) en microsecondes." },
  { start: 40, end: 50, text: "Bayesian Arb calcule les probabilités réelles via Pyth et optimise le sizing avec le critère mathématique de Kelly." },
  { start: 50, end: 58, text: "Macro Hedger protège le portefeuille contre les chocs de volatilité. Chaque étape de pensée est transparente." },
  { start: 58, end: 72, text: "Dans le Terminal, chaque part gagnante règle à 1,00 $ USDso. Les gains et rendements sont calculés en temps réel." },
  { start: 72, end: 85, text: "Le Copilot IA conversationnel génère des ordres prêts à être exécutés en un seul clic sur Somnia." },
  { start: 85, end: 98, text: "Le Radar d'Arbitrage exploite les écarts DreamDEX vs Polymarket, tandis que PvPDuelEscrow régit les duels 60s." },
  { start: 98, end: 110, text: "Les Vaults ERC-4626 automatisent le copy-trading. Tous les contrats sont vérifiés sur Somnia Shannon (50312) !" },
  { start: 110, end: 135, text: "DreamSentinel AI apporte la finance quantitative aux marchés de prédiction sur Somnia. Merci beaucoup !" }
];

const DEFAULT_DEMO_VIDEO_URL = 'https://youtu.be/Bw-AFazHjrg';

const getEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  const url = rawUrl.trim();
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
    return `https://www.youtube.com/embed/${id}?rel=0`;
  }
  if (url.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(url);
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?rel=0`;
    } catch {
      const id = url.split('watch?v=')[1]?.split('&')[0]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?rel=0`;
    }
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  if (url.includes('loom.com/share/')) {
    return url.replace('share', 'embed');
  }
  return url;
};

export const InteractiveVideoPlayer: React.FC<Props> = ({
  lang,
  onNavigateTab,
  customVideoUrl,
  onSaveVideoUrl
}) => {
  const effectiveVideoUrl = customVideoUrl || DEFAULT_DEMO_VIDEO_URL;
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [videoMode, setVideoMode] = useState<'interactive' | 'external'>('external');
  const [urlInput, setUrlInput] = useState<string>(effectiveVideoUrl);
  const [duration, setDuration] = useState<number>(120);

  useEffect(() => {
    if (customVideoUrl) {
      setUrlInput(customVideoUrl);
    }
  }, [customVideoUrl]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceSrc = lang === 'fr' ? '/voiceover_fr.mp3' : '/voiceover_en.mp3';

  // Handle audio timeupdate to sync currentTime
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle audio loaded metadata for duration
  const handleAudioLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  // Synchronize audio state with playback controls
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current.muted = isMuted;

    if (isPlaying) {
      audioRef.current.play().catch(e => console.warn('Audio play error:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, playbackSpeed, isMuted, voiceSrc]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Get current chapter
  const currentChapter = CHAPTERS.find(c => currentTime >= c.start && currentTime < c.end) || CHAPTERS[0];

  // Get current subtitle
  const subtitles = lang === 'fr' ? SUBTITLES_FR : SUBTITLES_EN;
  const currentSubtitle = subtitles.find(s => currentTime >= s.start && currentTime < s.end)?.text || '';

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  // Jump to chapter
  const jumpToChapter = (start: number) => {
    setCurrentTime(start);
    if (audioRef.current) {
      audioRef.current.currentTime = start;
    }
    setIsPlaying(true);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Hidden Audio Element for AI Studio Voiceover */}
      <audio
        ref={audioRef}
        src={voiceSrc}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      {/* Mode Selector Toggle: Interactive 60fps Demo vs External Video (Loom/YouTube) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-2xl bg-slate-950/70 border border-white/[0.08]">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => setVideoMode('external')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              videoMode === 'external'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'en' ? '🎬 YouTube Pitch Video' : '🎬 Vidéo Démo YouTube'}</span>
          </button>
          <button
            onClick={() => setVideoMode('interactive')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              videoMode === 'interactive'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'en' ? '✨ Interactive Storyboard (60 FPS)' : '✨ Storyboard Interactif (60 FPS)'}</span>
          </button>
        </div>

        {/* AI Voice Badge & Download Link */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono text-purple-300">
            <Mic className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>{lang === 'en' ? 'Studio AI Voice (US English)' : 'Voix IA Studio (Français)'}</span>
          </div>
          <a
            href={voiceSrc}
            download={`dream_sentinel_${lang}_voiceover.mp3`}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 transition-all text-xs"
            title={lang === 'en' ? 'Download Voiceover MP3' : 'Télécharger le fichier Audio MP3'}
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-mono">MP3</span>
          </a>
        </div>
      </div>

      {/* MODE 1: INTERACTIVE SIMULATED VIDEO PLAYER */}
      {videoMode === 'interactive' && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/15 shadow-2xl flex flex-col justify-between select-none">
          
          {/* Top Overlay: Chapter & TPS Ticker */}
          <div className="p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <span className="text-xs font-bold text-purple-200 uppercase tracking-wider font-mono">
                {lang === 'fr' ? currentChapter.titleFr : currentChapter.titleEn}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Center Stage: DYNAMIC VISUAL SCENE */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            
            {/* Ambient Animated Glow */}
            <div className="absolute inset-0 bg-radial from-purple-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />

            {/* SCENE 1: (0 - 28s) THE PROBLEM & VISION */}
            {currentTime >= 0 && currentTime < 28 && (
              <div className="relative z-10 max-w-lg w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'The Prediction Market Problem' : 'Le Problème des Marchés de Prédiction'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-rose-300 bg-clip-text text-transparent">
                  DreamSentinel AI × Somnia L1
                </h2>
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/30 text-center">
                    <div className="text-sm font-bold text-rose-400">12s+</div>
                    <div className="text-[10px] text-slate-400">Slow Latency</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-center">
                    <div className="text-sm font-bold text-amber-400">Fragmented</div>
                    <div className="text-[10px] text-slate-400">Order Books</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-center">
                    <div className="text-sm font-bold text-emerald-400">Kelly Edge</div>
                    <div className="text-[10px] text-slate-400">Mathematical</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2: (28 - 58s) BAYESIAN SWARM INTELLIGENCE */}
            {currentTime >= 28 && currentTime < 58 && (
              <div className="relative z-10 max-w-lg w-full space-y-3 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Autonomous Agent Swarm</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Active Computation</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mx-auto mb-1 animate-pulse" />
                    <div className="text-xs font-bold text-cyan-300">Alpha Scalper</div>
                    <div className="text-[9px] text-slate-400 font-mono">OBI: +0.42</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-teal-500/40 text-center">
                    <div className="w-2 h-2 rounded-full bg-teal-400 mx-auto mb-1 animate-pulse" />
                    <div className="text-xs font-bold text-teal-300">Bayesian Arb</div>
                    <div className="text-[9px] text-slate-400 font-mono">P(YES) = 64.2%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-center">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mx-auto mb-1 animate-pulse" />
                    <div className="text-xs font-bold text-purple-300">Macro Hedger</div>
                    <div className="text-[9px] text-slate-400 font-mono">Shock: 0.12</div>
                  </div>
                </div>

                {/* Simulated Live Thought Log */}
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 space-y-1 shadow-inner">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Live Bayesian Reasoning:</div>
                  <div className="text-cyan-300">&gt; Pyth Oracles synced: BTC @ $96,420</div>
                  <div className="text-emerald-400">&gt; Calculated Kelly fraction: f* = 14.8% ($148.00 USDso)</div>
                  <div className="text-slate-400">&gt; Submitting high-frequency limit order to Somnia CLOB...</div>
                </div>
              </div>
            )}

            {/* SCENE 3: (58 - 85s) HIGH-FREQUENCY SOMNIA L1 EXECUTION */}
            {currentTime >= 58 && currentTime < 85 && (
              <div className="relative z-10 max-w-lg w-full space-y-3 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant CLOB Execution</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">Latency: 280ms</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">BTC &gt; $95,000 Event Contract</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">YES 51¢</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-300 pt-1">
                    <span>Investment: $100.00 USDso</span>
                    <span className="text-emerald-400 font-bold">Payout: $196.08 USDso (+96%)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Transaction Confirmed • Gas: &lt; 0.0001 STT</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 4: (85 - 110s) ARBITRAGE RADAR & 60S PVP DUELS */}
            {currentTime >= 85 && currentTime < 110 && (
              <div className="relative z-10 max-w-lg w-full space-y-3 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    <Swords className="w-3.5 h-3.5" />
                    <span>Radar & 60s PvP Duels</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 font-bold animate-pulse">LIVE ESCROW</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Radar Arbitrage</div>
                    <div className="text-xs font-bold text-cyan-300">DreamDEX vs Polymarket</div>
                    <div className="text-sm font-extrabold text-emerald-400 font-mono">+11.4% Spread</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">PvP Micro-Duel</div>
                    <div className="text-xs font-bold text-rose-300">Sol vs BTC (60s)</div>
                    <div className="text-sm font-extrabold text-white font-mono">Timer: 00:42 ⏳</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 5: (110 - 135s) VERIFIED ON-CHAIN CONTRACTS */}
            {currentTime >= 110 && (
              <div className="relative z-10 max-w-lg w-full space-y-3 animate-in fade-in duration-500">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Somnia Shannon Testnet Verified</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">4 Smart Contracts Live On-Chain</h3>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 font-mono text-[11px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Oracle:</span>
                    <span className="text-cyan-300 font-bold">0xE1B0...541D</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vault (ERC-4626):</span>
                    <span className="text-cyan-300 font-bold">0x7F4E...689a</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PvP Escrow:</span>
                    <span className="text-cyan-300 font-bold">0x773D...6F2A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">USDso Collateral:</span>
                    <span className="text-cyan-300 font-bold">0xc326...F1AE</span>
                  </div>
                </div>
              </div>
            )}

            {/* Big Play Overlay if Paused */}
            {!isPlaying && (
              <div 
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer z-20 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white translate-x-1" />
                </div>
                <span className="mt-3 text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  {lang === 'en' ? 'Click to Play Video Demo (With Studio Voice)' : 'Cliquez pour Écouter et Lancer la Démo Vidéo'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 font-mono">
                  {lang === 'en' ? 'Auto-narrated with US English Voice' : 'Voix-off narrative IA en Français'}
                </span>
              </div>
            )}
          </div>

          {/* Subtitles Overlay Bar */}
          {showSubtitles && currentSubtitle && (
            <div className="px-4 py-2.5 bg-black/90 backdrop-blur-md border-t border-b border-white/10 text-center z-10 animate-in fade-in duration-150">
              <p className="text-xs sm:text-sm text-yellow-300 font-medium tracking-wide">
                "{currentSubtitle}"
              </p>
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="p-3 bg-gradient-to-t from-black via-black/90 to-transparent space-y-2 z-10">
            
            {/* Scrubber Progress Bar */}
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 120}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Control Buttons Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={() => {
                    setCurrentTime(0);
                    if (audioRef.current) audioRef.current.currentTime = 0;
                    setIsPlaying(true);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Volume Mute / Unmute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={isMuted ? 'Unmute AI Voice' : 'Mute Voice'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <div className="font-mono text-slate-400 text-[11px]">
                  <span className="text-white font-bold">{formatTime(currentTime)}</span> / {formatTime(duration)}
                </div>
              </div>

              {/* Right Controls: Subtitles, Speed */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${
                    showSubtitles ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-white/5 text-slate-400'
                  }`}
                  title="Toggle Subtitles"
                >
                  CC
                </button>

                <button
                  onClick={() => setPlaybackSpeed(s => s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1)}
                  className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-mono font-bold"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: EXTERNAL VIDEO EMBED (OFFICIAL YOUTUBE PITCH / CUSTOM LOOM) */}
      {videoMode === 'external' && (
        <div className="space-y-3">
          {/* Top Bar with YouTube direct link and Official Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {lang === 'en' ? 'Official Pitch Walkthrough' : 'Pitch Démo Officiel'}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
                Somnia × DreamDEX Hackathon
              </span>
            </div>
            <a
              href={effectiveVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-red-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Open video directly on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Open on YouTube' : 'Ouvrir sur YouTube'}</span>
            </a>
          </div>

          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl flex items-center justify-center">
            {effectiveVideoUrl ? (
              <iframe
                src={getEmbedUrl(effectiveVideoUrl)}
                title="DreamSentinel Video Walkthrough"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Play className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    {lang === 'en' ? 'No External Video Linked Yet' : 'Aucun Lien Vidéo Externe Renseigné'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {lang === 'en' 
                      ? 'Paste your Loom or YouTube video recording URL below to embed it directly.'
                      : 'Collez votre lien Loom ou YouTube ci-dessous pour l\'afficher directement ici.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video URL Input Field */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>{lang === 'en' ? 'Embed your Loom / YouTube Pitch Video:' : 'Intégrer votre vidéo Loom / YouTube :'}</span>
              <div className="flex items-center gap-2">
                {urlInput !== DEFAULT_DEMO_VIDEO_URL && (
                  <button
                    onClick={() => {
                      setUrlInput(DEFAULT_DEMO_VIDEO_URL);
                      onSaveVideoUrl(DEFAULT_DEMO_VIDEO_URL);
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 underline font-mono"
                  >
                    {lang === 'en' ? 'Reset to Official Demo' : 'Rétablir la démo officielle'}
                  </button>
                )}
                <span className="text-[10px] text-slate-500 font-mono">Auto-Saved</span>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://youtu.be/Bw-AFazHjrg"
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => onSaveVideoUrl(urlInput.trim())}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold transition-all shrink-0 active:scale-95"
              >
                {lang === 'en' ? 'Save & Play' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Chapter Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {CHAPTERS.map(c => {
          const Icon = c.icon;
          const isActive = currentTime >= c.start && currentTime < c.end && videoMode === 'interactive';
          return (
            <button
              key={c.id}
              onClick={() => {
                setVideoMode('interactive');
                jumpToChapter(c.start);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all group active:scale-95 ${
                isActive 
                  ? 'bg-purple-500/20 border-purple-500/50 shadow-sm' 
                  : 'bg-slate-950/60 border-white/[0.06] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-300' : 'text-slate-400'}`} />
                <span className="text-[10px] font-mono text-slate-500">{formatTime(c.start)}</span>
              </div>
              <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {lang === 'fr' ? c.titleFr : c.titleEn}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
