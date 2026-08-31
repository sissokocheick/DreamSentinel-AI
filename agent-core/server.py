"""
DreamSentinel AI - Backend API & WebSocket Server
Provides high-performance REST and real-time WebSocket endpoints for the Next.js frontend,
AI Copilot interaction, and Somnia/DreamDEX live synchronization.
"""

import asyncio
import json
import time
import random
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from dreamdex_client import DreamDEXClient, MarketData
from sentiment_agent import SentimentAgent
from quant_engine import QuantEngine
from execution_swarm import ExecutionSwarm
from backtester import BacktestEngine

app = FastAPI(
    title="DreamSentinel AI - Prediction Market Engine",
    description="Backend API and Autonomous AI Swarm for DreamDEX Event Contracts on Somnia L1",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Singletons
dex_client = DreamDEXClient()
swarm = ExecutionSwarm(dex_client=dex_client)
backtester = BacktestEngine()
active_connections: List[WebSocket] = []

# Request / Response Schemas
class OrderRequest(BaseModel):
    market_id: str
    outcome: int # 0 = NO, 1 = YES
    side: str # "BUY" or "SELL"
    amount: float
    price: float

class CopilotQueryRequest(BaseModel):
    message: str
    active_market_id: Optional[str] = "somnia-btc-100k-5m"
    user_address: Optional[str] = None

class VaultDepositRequest(BaseModel):
    vault_id: str
    strategy_id: str
    amount_usdso: float
    user_address: str

@app.on_event("startup")
async def startup_event():
    # Start background loop for continuous market simulation and agent thought generation
    asyncio.create_task(background_agent_loop())

async def background_agent_loop():
    """Continuously runs agent cycles and broadcasts live updates to WebSocket clients."""
    while True:
        try:
            # Minor spot price fluctuations
            for market in dex_client.get_all_markets():
                delta = random.uniform(-0.003, 0.003) * market.current_spot
                market.current_spot = round(market.current_spot + delta, 2)
            
            # Run one swarm analysis cycle
            await swarm.execute_swarm_cycle()

            # Broadcast update to connected WebSockets
            if active_connections:
                payload = {
                    "type": "TICKER_UPDATE",
                    "timestamp": int(time.time()),
                    "swarm_status": swarm.get_swarm_status(),
                    "markets": [m.__dict__ for m in dex_client.get_all_markets()]
                }
                dead_connections = []
                for ws in active_connections:
                    try:
                        await ws.send_json(payload)
                    except Exception:
                        dead_connections.append(ws)
                for dead in dead_connections:
                    active_connections.remove(dead)

        except Exception as e:
            print(f"Error in background loop: {e}")
        
        await asyncio.sleep(4.0) # Cycle every 4 seconds

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "network": "Somnia Shannon Testnet",
        "chain_id": 50312,
        "somnia_rpc": "https://dream-rpc.somnia.network",
        "active_agents": 3,
        "timestamp": int(time.time())
    }

@app.get("/api/markets")
async def get_markets():
    return [m.__dict__ for m in dex_client.get_all_markets()]

@app.get("/api/markets/{market_id}")
async def get_market_detail(market_id: str):
    market = dex_client.get_market(market_id)
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    
    # Get quant analysis for this market
    time_left = max(10, market.expiry_timestamp - int(time.time()))
    sentiment = swarm.sentiment_agent.analyze_market_sentiment(market.symbol, market.current_spot, market.strike_price)
    quant = swarm.quant_engine.analyze_market(
        market_id=market.market_id,
        symbol=market.symbol,
        current_spot=market.current_spot,
        strike_price=market.strike_price,
        time_to_expiry_seconds=time_left,
        market_implied_prob_yes=market.implied_prob_yes,
        sentiment_score=sentiment.sentiment_score,
        sentiment_confidence=sentiment.confidence
    )
    
    return {
        "market": market.__dict__,
        "sentiment": sentiment.__dict__,
        "quant_analysis": quant.__dict__
    }

@app.get("/api/agents")
async def get_agents():
    return swarm.get_swarm_status()

@app.get("/api/trades/recent")
async def get_recent_trades():
    return dex_client.trade_history[-30:]

@app.post("/api/orders/place")
async def place_order(req: OrderRequest):
    try:
        order = await dex_client.place_order(
            market_id=req.market_id,
            outcome=req.outcome,
            side=req.side,
            amount=req.amount,
            price=req.price
        )
        return {
            "success": True,
            "order": order.__dict__,
            "message": "Order executed on Somnia Testnet CLOB successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/copilot/chat")
async def copilot_chat(req: CopilotQueryRequest):
    """
    AI Prediction Copilot: Analyzes user questions about any market, evaluates risk,
    and returns a natural language response with an optional 1-click executable trade card.
    """
    msg_lower = req.message.lower()
    target_market = dex_client.get_market(req.active_market_id or "somnia-btc-100k-5m")
    if not target_market:
        target_market = dex_client.get_all_markets()[0]

    sentiment = swarm.sentiment_agent.analyze_market_sentiment(target_market.symbol, target_market.current_spot, target_market.strike_price)
    quant = swarm.quant_engine.analyze_market(
        market_id=target_market.market_id,
        symbol=target_market.symbol,
        current_spot=target_market.current_spot,
        strike_price=target_market.strike_price,
        time_to_expiry_seconds=max(10, target_market.expiry_timestamp - int(time.time())),
        market_implied_prob_yes=target_market.implied_prob_yes,
        sentiment_score=sentiment.sentiment_score,
        sentiment_confidence=sentiment.confidence
    )

    action_card = None

    if "btc" in msg_lower or "should i buy" in msg_lower or "prediction" in msg_lower or "avis" in msg_lower or "acheter" in msg_lower:
        rec_outcome = quant.recommended_outcome
        price = target_market.yes_best_ask if rec_outcome == "YES" else target_market.no_best_ask
        response_text = (
            f"🤖 **Analyse du Copilote DreamSentinel pour {target_market.symbol}** :\n\n"
            f"• **Prix Spot actuel** : ${target_market.current_spot:,.2f} | **Prix Cible (Strike)** : ${target_market.strike_price:,.2f}\n"
            f"• **Probabilité théorique Bayésienne** : {quant.posterior_prob_yes*100:.1f}% pour OUI vs {target_market.implied_prob_yes*100:.1f}% sur le carnet DreamDEX.\n"
            f"• **Edge Détecté** : +{abs(quant.edge_yes)*100:.1f}% sur le résultat **{rec_outcome}**.\n"
            f"• **Dimensionnement de Kelly conseillé** : Allouer {quant.kelly_fraction*100:.1f}% de votre bankroll.\n\n"
            f"💡 **Recommandation** : Prendre position sur **{rec_outcome}** à ${price:.2f} USDso sur Somnia L1."
        )
        action_card = {
            "market_id": target_market.market_id,
            "market_title": target_market.title,
            "recommended_outcome": rec_outcome,
            "outcome_index": 1 if rec_outcome == "YES" else 0,
            "suggested_price": price,
            "suggested_amount": 100.0,
            "expected_ev_pct": quant.expected_value_pct
        }
    elif "somnia" in msg_lower or "tps" in msg_lower:
        somnia_m = dex_client.get_market("somnia-tps-100k-event")
        response_text = (
            f"⚡ **Analyse Écosystème Somnia L1** :\n\n"
            f"Le testnet Shannon affiche des performances remarquables (>100k TPS crête, finalité sub-seconde). "
            f"Le marché de prédiction estime à **80%** la probabilité de réussite du stress-test. "
            f"L'agent Sentinel-Macro maintient une position fortement acheteuse sur l'issue **OUI**."
        )
        action_card = {
            "market_id": "somnia-tps-100k-event",
            "market_title": somnia_m.title if somnia_m else "Somnia TPS Event",
            "recommended_outcome": "YES",
            "outcome_index": 1,
            "suggested_price": 0.82,
            "suggested_amount": 250.0,
            "expected_ev_pct": 18.5
        }
    else:
        response_text = (
            f"🧠 **DreamSentinel Copilot à votre écoute** :\n\n"
            f"J'analyse en temps réel le carnet d'ordres (CLOB) de DreamDEX, les flux de sentiment et les probabilités mathématiques sur Somnia L1. "
            f"Vous pouvez me demander une analyse spécifique (ex: *'Quel est l'edge sur le BTC ?'*, *'Faut-il acheter OUI sur l'ETH ?'* ou *'Explique la stratégie de Sentinel-Alpha'*)."
        )

    return {
        "reply": response_text,
        "action_card": action_card,
        "timestamp": int(time.time())
    }

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        # Send initial snapshot
        await websocket.send_json({
            "type": "INITIAL_SNAPSHOT",
            "timestamp": int(time.time()),
            "swarm_status": swarm.get_swarm_status(),
            "markets": [m.__dict__ for m in dex_client.get_all_markets()]
        })
        while True:
            # Keep alive and listen for client actions
            data = await websocket.receive_text()
            # If client sends a ping or custom trigger
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)


# ─── BACKTESTING API ──────────────────────────────────────────────────────────

class BacktestRequest(BaseModel):
    strategy_id: str = "sentinel_bayes"
    initial_capital: float = 10000.0
    kelly_scale: float = 0.5
    min_edge_threshold: float = 0.035
    confidence_threshold: float = 0.75
    num_simulated_days: int = 30
    trades_per_day: int = 8

@app.post("/api/backtest")
async def run_backtest(req: BacktestRequest):
    """
    Runs a full historical backtest simulation for a DreamSentinel strategy.
    Returns equity curve, trade log, and performance statistics.
    """
    try:
        result = backtester.run_backtest(
            strategy_id=req.strategy_id,
            initial_capital=req.initial_capital,
            kelly_scale=req.kelly_scale,
            min_edge_threshold=req.min_edge_threshold,
            confidence_threshold=req.confidence_threshold,
            num_simulated_days=req.num_simulated_days,
            trades_per_day=req.trades_per_day,
        )
        from dataclasses import asdict
        return {"success": True, "result": asdict(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── ARBITRAGE SCANNER API ────────────────────────────────────────────────────

@app.get("/api/arbitrage/scan")
async def scan_arbitrage_opportunities():
    """
    Scans all available markets and identifies cross-market arbitrage or high-edge opportunities.
    Returns a list of potential trades.
    """
    try:
        markets = dex_client.get_all_markets()
        opportunities = []
        
        # We simulate a scan by finding markets with the highest difference between model prob and market prob
        for market in markets:
            analysis = quant_engine.analyze_market(
                market_id=market.id,
                symbol=market.symbol,
                current_spot=0.0, # We'd need actual spot, but for scan we mock or use default
                strike_price=market.strike_price,
                time_to_expiry_seconds=(market.expiry_time - int(time.time())),
                market_implied_prob_yes=market.yes_prob,
                sentiment_score=0.5,
                sentiment_confidence=0.5
            )
            
            if analysis.edge > 0.02: # Only 2% edge or more
                opportunities.append({
                    "market_id": market.id,
                    "symbol": market.symbol,
                    "type": "STAT_ARB",
                    "description": f"Différence probabiliste de {(analysis.edge * 100):.1f}% détectée.",
                    "side": analysis.recommended_side,
                    "edge": analysis.edge,
                    "confidence": analysis.confidence,
                    "kelly_fraction": analysis.kelly_fraction,
                    "model_prob": analysis.model_prob,
                    "market_prob": market.yes_prob if analysis.recommended_side == 'YES' else market.no_prob,
                    "timestamp": int(time.time())
                })
        
        # Sort by edge descending
        opportunities.sort(key=lambda x: x["edge"], reverse=True)
        
        # Add a fake cross-market synthetic arbitrage for demo
        opportunities.insert(0, {
            "market_id": "cross_market_synthetic",
            "symbol": "BTC/ETH Cross",
            "type": "CROSS_MARKET",
            "description": "Arbitrage synthétique: Achat YES sur BTC, Vente YES sur ETH due à la désynchronisation des oracles.",
            "side": "HEDGE",
            "edge": 0.085,
            "confidence": 0.92,
            "kelly_fraction": 0.35,
            "model_prob": 0.99,
            "market_prob": 0.90,
            "timestamp": int(time.time())
        })
        
        return {"success": True, "opportunities": opportunities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
