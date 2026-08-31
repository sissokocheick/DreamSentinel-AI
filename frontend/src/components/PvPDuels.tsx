'use client';

import React, { useState, useEffect } from 'react';
import { Swords, Clock, User, Shield, Target, Zap } from 'lucide-react';

interface Duel {
  id: number;
  asset: string;
  strike: number;
  stake: number;
  expiry: number;
  playerYes: string | null;
  playerNo: string | null;
  status: 'WAITING' | 'LIVE' | 'RESOLVED';
  winner?: string;
}

export function PvPDuels() {
  const [duels, setDuels] = useState<Duel[]>([
    { id: 1, asset: 'BTC', strike: 95500, stake: 50, expiry: Date.now() + 45000, playerYes: '0x1A4...9B2', playerNo: null, status: 'WAITING' },
    { id: 2, asset: 'ETH', strike: 3100, stake: 25, expiry: Date.now() + 15000, playerYes: '0x88C...3D1', playerNo: '0x44F...9A9', status: 'LIVE' },
    { id: 3, asset: 'SOMNIA', strike: 4.5, stake: 100, expiry: Date.now() - 5000, playerYes: '0x2B1...1F8', playerNo: '0x99A...4C4', status: 'RESOLVED', winner: '0x99A...4C4' },
  ]);

  const [activeTab, setActiveTab] = useState<'arena' | 'create'>('arena');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Swords className="text-rose-400 w-6 h-6" /> Arène PvP 60s
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Affrontez d'autres traders en duel sur 60 secondes. Smart Contract Escrow sur Somnia.
          </p>
        </div>
        <div className="flex gap-2 bg-surface/60 p-1 rounded-xl border border-surfaceBorder">
          <button 
            onClick={() => setActiveTab('arena')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'arena' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Arène
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Créer un Duel
          </button>
        </div>
      </div>

      {activeTab === 'arena' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {duels.map(duel => (
            <div key={duel.id} className="glass-panel rounded-3xl overflow-hidden border border-surfaceBorder/60 hover:border-rose-500/30 transition-colors">
              <div className={`p-3 text-center text-xs font-bold uppercase tracking-wider ${
                duel.status === 'WAITING' ? 'bg-amber-500/20 text-amber-400' :
                duel.status === 'LIVE' ? 'bg-rose-500/20 text-rose-400 animate-pulse' :
                'bg-slate-800 text-slate-400'
              }`}>
                {duel.status === 'WAITING' ? 'En attente d\'adversaire' :
                 duel.status === 'LIVE' ? 'Duel en cours' : 'Terminé'}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-black text-slate-100">{duel.asset}</span>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Strike Price</div>
                    <div className="text-sm font-mono text-cyan-400 font-bold">${duel.strike.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 mb-1">Player YES</div>
                    <div className={`font-mono text-xs ${duel.playerYes ? (duel.winner === duel.playerYes ? 'text-emerald-400 font-bold' : 'text-slate-300') : 'text-slate-600'}`}>
                      {duel.playerYes || '---'}
                    </div>
                  </div>
                  <Swords className="w-5 h-5 text-rose-500/50" />
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 mb-1">Player NO</div>
                    <div className={`font-mono text-xs ${duel.playerNo ? (duel.winner === duel.playerNo ? 'text-emerald-400 font-bold' : 'text-slate-300') : 'text-slate-600'}`}>
                      {duel.playerNo || '---'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-surface/50 border border-surfaceBorder mb-5">
                  <div>
                    <div className="text-[10px] text-slate-500">Mise Totale (Pool)</div>
                    <div className="text-lg font-black text-emerald-400">${duel.stake * 2}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">Temps restant</div>
                    <div className="text-sm font-mono text-slate-300 flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5" /> 
                      {duel.status === 'RESOLVED' ? '0s' : `${Math.max(0, Math.floor((duel.expiry - Date.now())/1000))}s`}
                    </div>
                  </div>
                </div>

                {duel.status === 'WAITING' && (
                  <button className="w-full py-3 rounded-xl font-bold text-sm bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all border border-rose-500/30 hover:border-rose-400">
                    Rejoindre (Mise: ${duel.stake})
                  </button>
                )}
                {duel.status === 'LIVE' && (
                  <button disabled className="w-full py-3 rounded-xl font-bold text-sm bg-surface/50 text-slate-500 border border-surfaceBorder cursor-not-allowed">
                    Duel Verrouillé
                  </button>
                )}
                {duel.status === 'RESOLVED' && (
                  <div className="w-full py-3 rounded-xl font-bold text-sm bg-slate-800/50 text-slate-400 border border-slate-700/50 text-center">
                    Gagnant: <span className="font-mono text-emerald-400">{duel.winner}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="glass-panel rounded-3xl p-8 max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Zap className="text-rose-400" /> Configurer un nouveau Duel
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Actif (Symbol)</label>
              <input type="text" defaultValue="BTC" className="w-full bg-surface/50 border border-surfaceBorder rounded-xl px-4 py-3 text-slate-100 font-mono focus:border-rose-500/50 outline-none" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Prix Cible (Strike)</label>
              <input type="number" defaultValue={95000} className="w-full bg-surface/50 border border-surfaceBorder rounded-xl px-4 py-3 text-slate-100 font-mono focus:border-rose-500/50 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Votre Prédiction (à 60s)</label>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 rounded-xl font-bold text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
                  Prix {'>='} Strike (YES)
                </button>
                <button className="py-3 rounded-xl font-bold text-sm bg-surface/50 text-slate-400 border border-surfaceBorder hover:border-slate-600">
                  Prix {'<'} Strike (NO)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Votre Mise (USDso)</label>
              <input type="number" defaultValue={50} className="w-full bg-surface/50 border border-surfaceBorder rounded-xl px-4 py-3 text-emerald-400 font-mono font-bold focus:border-rose-500/50 outline-none" />
            </div>

            <button className="w-full py-4 mt-4 rounded-xl font-black text-sm bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-xl shadow-rose-900/40 hover:from-rose-500 hover:to-orange-500 transition-all flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> Créer le Duel Escrow
            </button>
            <p className="text-center text-[10px] text-slate-500">
              Les fonds seront verrouillés dans le smart contract PvPDuelEscrow.sol
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
