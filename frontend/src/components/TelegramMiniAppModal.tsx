'use client';

import React, { useState } from 'react';
import { X, Send, Bot, CheckCircle2, Zap, ArrowUpRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { Language, translations } from '../lib/translations';

interface TelegramMiniAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSimulateTrade?: (amount: number) => void;
}

export function TelegramMiniAppModal({
  isOpen,
  onClose,
  lang,
  onSimulateTrade
}: TelegramMiniAppModalProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string; card?: boolean }>>([
    {
      sender: 'bot',
      text: lang === 'en' 
        ? '🤖 **DreamSentinel AI Copilot**: Connected to Somnia Shannon L1 (105,420 TPS). Monitoring DreamDEX CLOB orderbooks 24/7.' 
        : '🤖 **DreamSentinel AI Copilot** : Connecté à Somnia Shannon L1 (105 420 TPS). Surveillance active des carnets DreamDEX 24h/24.',
      time: '12:40'
    },
    {
      sender: 'bot',
      text: lang === 'en'
        ? '🚨 **HIGH-FREQUENCY ARBITRAGE DETECTED**\n• Market: BTC > $98,500 (5m)\n• DreamDEX YES: $0.51\n• Polymarket YES: $0.59\n• Spread: +15.6% Expected Edge\n• Gas Fee: < 0.0001 STT'
        : '🚨 **OPPORTUNITÉ D\'ARBITRAGE DÉTECTÉE**\n• Marché : BTC > 98 500 $ (5m)\n• DreamDEX YES : 0.51 $\n• Polymarket YES : 0.59 $\n• Écart de Spread : +15.6% d\'avantage\n• Frais de gaz : < 0.0001 STT',
      time: '12:41',
      card: true
    }
  ]);

  const [simulatedExecuted, setSimulatedExecuted] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  if (!isOpen) return null;

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  const handleExecuteTelegramOrder = () => {
    if (simulatedExecuted) return;
    setSimulatedExecuted(true);

    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: lang === 'en' ? '⚡ Execute 100 USDso Buy YES' : '⚡ Exécuter Achat YES 100 USDso',
        time: '12:42'
      },
      {
        sender: 'bot',
        text: lang === 'en'
          ? '✅ **TRANSACTION SETTLED ON SOMNIA L1**\n• Tx Hash: `0x8a92f...c31b`\n• 196 YES Shares acquired @ $0.51\n• Sub-300ms finality confirmed.\n• Contract: `DreamSentinelOracle.sol`'
          : '✅ **TRANSACTION VALIDÉE SUR SOMNIA L1**\n• Tx Hash : `0x8a92f...c31b`\n• 196 parts YES acquises @ 0.51 $\n• Finalité sub-300ms confirmée.\n• Contrat : `DreamSentinelOracle.sol`',
        time: '12:42'
      }
    ]);

    if (onSimulateTrade) {
      onSimulateTrade(100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-950 border border-cyan-500/40 rounded-[2.5rem] p-4 shadow-2xl shadow-cyan-500/10 space-y-4 overflow-hidden ring-1 ring-white/10">
        
        {/* Smartphone Notch */}
        <div className="flex items-center justify-between px-4 pt-1">
          <span className="text-[11px] font-mono text-slate-400 font-bold">12:42</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full border border-white/10" />
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Telegram Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20 relative">
              <Bot className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-100">{t('telegram_bot_name')}</h4>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
              </div>
              <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {t('telegram_status')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Chat Stream */}
        <div className="h-80 overflow-y-auto space-y-3 px-2 py-1 font-sans text-xs scrollbar-thin">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-md whitespace-pre-line leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-bold rounded-tr-sm'
                    : 'bg-slate-900 border border-white/[0.08] text-slate-200 rounded-tl-sm'
                }`}
              >
                {msg.text}

                {msg.card && !simulatedExecuted && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                    <button
                      onClick={handleExecuteTelegramOrder}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{t('telegram_sim_btn')}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-mono text-slate-500 px-1 mt-0.5">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Telegram Chat Input Mockup */}
        <div className="pt-2 border-t border-white/[0.08] px-2 flex items-center gap-2">
          <input
            type="text"
            placeholder={lang === 'en' ? 'Type a command or question...' : 'Message ou question au Copilote...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                setMessages(prev => [
                  ...prev,
                  { sender: 'user', text: inputValue, time: '12:43' },
                  { sender: 'bot', text: lang === 'en' ? 'Analyzing DreamDEX orderbook for: ' + inputValue : 'Analyse du carnet DreamDEX pour : ' + inputValue, time: '12:43' }
                ]);
                setInputValue('');
              }
            }}
            className="flex-1 bg-slate-900/90 border border-white/10 rounded-2xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={() => {
              if (inputValue.trim()) {
                setMessages(prev => [
                  ...prev,
                  { sender: 'user', text: inputValue, time: '12:43' },
                  { sender: 'bot', text: lang === 'en' ? 'Analyzing DreamDEX orderbook for: ' + inputValue : 'Analyse du carnet DreamDEX pour : ' + inputValue, time: '12:43' }
                ]);
                setInputValue('');
              }
            }}
            className="p-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-center text-slate-500 pt-1 flex items-center justify-center gap-2">
          <span>Python Engine : <code>agent-core/telegram_bot.py</code></span>
          <a
            href="https://github.com/sissokocheick/DreamSentinel-AI/blob/main/agent-core/telegram_bot.py"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-0.5"
          >
            Code <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
