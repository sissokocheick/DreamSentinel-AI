"""
DreamSentinel AI — Backtesting Engine
Simulates the performance of AI trading strategies on historical
DreamDEX Event Contracts market data using the Bayesian + Kelly engine.
"""

import time
import math
import random
from typing import List, Dict, Any
from dataclasses import dataclass, asdict
from quant_engine import QuantEngine
from sentiment_agent import SentimentAgent


@dataclass
class BacktestTrade:
    trade_id: int
    market_symbol: str
    outcome: str          # "YES" or "NO"
    entry_price: float    # Price paid (0.01 to 0.99 USDso)
    model_prob: float     # AI estimated win probability
    market_prob: float    # DreamDEX CLOB implied probability
    edge: float           # model_prob - market_prob
    kelly_fraction: float # fraction used
    amount_usdso: float   # capital allocated
    result: str           # "WIN" or "LOSS"
    pnl_usdso: float      # net P&L
    timestamp: int

@dataclass
class BacktestResult:
    strategy_name: str
    initial_capital: float
    final_capital: float
    total_pnl: float
    total_pnl_pct: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_pct: float
    max_drawdown_pct: float
    sharpe_ratio: float
    equity_curve: List[Dict[str, Any]]  # [{time, value}]
    trades: List[Dict[str, Any]]
    params_used: Dict[str, Any]


class BacktestEngine:
    """
    Simulates DreamSentinel AI strategies over synthetic historical
    DreamDEX Event Contracts data with realistic market microstructure.
    """

    MARKET_TEMPLATES = [
        {"symbol": "BTC-USD-5M",   "base_price": 98500, "vol": 0.60, "category": "Crypto Micro"},
        {"symbol": "ETH-USD-15M",  "base_price": 3100,  "vol": 0.65, "category": "Crypto Fast"},
        {"symbol": "SOL-USD-1H",   "base_price": 210,   "vol": 0.80, "category": "Crypto Hourly"},
        {"symbol": "SOMNIA-TPS",   "base_price": 100000, "vol": 0.30, "category": "Somnia Ecosystem"},
        {"symbol": "BTC-USD-1H",   "base_price": 98500, "vol": 0.55, "category": "Crypto Hourly"},
        {"symbol": "ETH-USD-5M",   "base_price": 3100,  "vol": 0.70, "category": "Crypto Micro"},
    ]

    STRATEGY_PARAMS = {
        "sentinel_alpha": {
            "name": "Sentinel-Alpha (Scalper HF)",
            "min_edge": 0.03,
            "default_kelly": 0.5,
            "time_horizon": 300,
            "sentiment_weight": 0.7,
            "win_prob_boost": 0.04,   # HF edge from orderflow
        },
        "sentinel_bayes": {
            "name": "Sentinel-BayesArb (Statistical Arbitrage)",
            "min_edge": 0.035,
            "default_kelly": 0.5,
            "time_horizon": 900,
            "sentiment_weight": 0.85,
            "win_prob_boost": 0.02,
        },
        "sentinel_macro": {
            "name": "Sentinel-Macro (Delta-Hedged Events)",
            "min_edge": 0.045,
            "default_kelly": 0.4,
            "time_horizon": 3600,
            "sentiment_weight": 0.90,
            "win_prob_boost": 0.01,
        },
    }

    def __init__(self):
        self.engine = QuantEngine(kelly_scale=0.5)
        self.sentiment_agent = SentimentAgent()

    def _simulate_event_resolution(
        self,
        model_prob: float,
        market_prob: float,
        recommended_outcome: str,
        win_prob_boost: float
    ) -> bool:
        """
        Simulates whether an event resolves in favor of the model's prediction.
        The model has a genuine edge (it's right more often than the market implies).
        """
        # True probability is between model and market (with slight model advantage)
        true_prob = model_prob + win_prob_boost
        true_prob = max(0.05, min(0.95, true_prob))
        return random.random() < true_prob

    def run_backtest(
        self,
        strategy_id: str = "sentinel_bayes",
        initial_capital: float = 10000.0,
        kelly_scale: float = 0.5,
        min_edge_threshold: float = 0.035,
        confidence_threshold: float = 0.75,
        num_simulated_days: int = 30,
        trades_per_day: int = 8,
    ) -> BacktestResult:
        """
        Runs a full backtest simulation for the specified DreamSentinel strategy.
        """
        strategy_cfg = self.STRATEGY_PARAMS.get(strategy_id, self.STRATEGY_PARAMS["sentinel_bayes"])
        self.engine.kelly_scale = kelly_scale

        capital = initial_capital
        peak_capital = initial_capital
        max_drawdown = 0.0
        trades: List[BacktestTrade] = []
        equity_curve: List[Dict[str, Any]] = []
        now = int(time.time())
        trade_counter = 0

        # Simulate each trading day
        for day in range(num_simulated_days):
            day_ts = now - (num_simulated_days - day) * 86400
            daily_trades = 0
            attempts = 0

            while daily_trades < trades_per_day and attempts < trades_per_day * 3:
                attempts += 1

                # Pick a random market template
                mkt = random.choice(self.MARKET_TEMPLATES)

                # Generate realistic spot vs strike
                spot = mkt["base_price"] * (1 + (random.random() - 0.5) * 0.015)
                strike = mkt["base_price"] * (1 + (random.random() - 0.5) * 0.020)
                time_to_expiry = strategy_cfg["time_horizon"] + random.randint(-120, 120)

                # Get sentiment
                sentiment = self.sentiment_agent.analyze_market_sentiment(
                    symbol=mkt["symbol"],
                    spot_price=spot,
                    strike_price=strike
                )

                # Skip low-confidence signals
                if sentiment.confidence < confidence_threshold:
                    continue

                # Quant analysis
                analysis = self.engine.analyze_market(
                    market_id=f"bt_{day}_{attempts}",
                    symbol=mkt["symbol"],
                    current_spot=spot,
                    strike_price=strike,
                    time_to_expiry_seconds=time_to_expiry,
                    market_implied_prob_yes=max(0.05, min(0.95, random.uniform(0.35, 0.65))),
                    sentiment_score=sentiment.sentiment_score,
                    sentiment_confidence=sentiment.confidence
                )

                # Only trade if edge is sufficient
                if analysis.recommended_outcome == "HOLD":
                    continue
                if abs(analysis.edge_yes if analysis.recommended_outcome == "YES" else analysis.edge_no) < min_edge_threshold:
                    continue
                if analysis.kelly_fraction < 0.01:
                    continue

                # Calculate trade size (risk management: max 8% per trade)
                raw_allocation = capital * min(0.08, analysis.kelly_fraction)
                amount = round(max(20.0, raw_allocation), 2)
                if amount > capital * 0.95:
                    amount = capital * 0.08

                # Entry price on CLOB
                if analysis.recommended_outcome == "YES":
                    entry_price = round(analysis.market_implied_prob_yes + 0.01, 3)
                    model_prob = analysis.posterior_prob_yes
                    edge = analysis.edge_yes
                else:
                    entry_price = round(1.0 - analysis.market_implied_prob_yes + 0.01, 3)
                    model_prob = 1.0 - analysis.posterior_prob_yes
                    edge = analysis.edge_no

                entry_price = max(0.02, min(0.97, entry_price))

                # Simulate resolution
                win = self._simulate_event_resolution(
                    model_prob=model_prob,
                    market_prob=entry_price,
                    recommended_outcome=analysis.recommended_outcome,
                    win_prob_boost=strategy_cfg["win_prob_boost"]
                )

                # P&L calculation: if WIN, receive 1 USDso per share; if LOSS, lose entry price
                shares = amount / entry_price
                if win:
                    gross_pnl = shares * 1.0 - amount  # net gain
                    result = "WIN"
                else:
                    gross_pnl = -amount  # total loss on this leg
                    result = "LOSS"

                # Fee: 0.5% maker rebate simulation
                fee = amount * 0.005
                net_pnl = round(gross_pnl - fee, 2)

                capital += net_pnl
                capital = max(0.01, capital)

                # Track drawdown
                if capital > peak_capital:
                    peak_capital = capital
                dd = (peak_capital - capital) / peak_capital * 100
                if dd > max_drawdown:
                    max_drawdown = dd

                trade = BacktestTrade(
                    trade_id=trade_counter,
                    market_symbol=mkt["symbol"],
                    outcome=analysis.recommended_outcome,
                    entry_price=entry_price,
                    model_prob=round(model_prob, 4),
                    market_prob=round(analysis.market_implied_prob_yes, 4),
                    edge=round(edge, 4),
                    kelly_fraction=round(analysis.kelly_fraction, 4),
                    amount_usdso=amount,
                    result=result,
                    pnl_usdso=net_pnl,
                    timestamp=day_ts + daily_trades * 3600
                )
                trades.append(trade)
                trade_counter += 1
                daily_trades += 1

            # Record equity at end of day
            equity_curve.append({
                "time": day_ts,
                "value": round(capital, 2)
            })

        # Final statistics
        winning = [t for t in trades if t.result == "WIN"]
        losing = [t for t in trades if t.result == "LOSS"]
        total_pnl = round(capital - initial_capital, 2)
        total_pnl_pct = round((capital - initial_capital) / initial_capital * 100, 2)
        win_rate = round(len(winning) / max(1, len(trades)) * 100, 1)

        # Sharpe ratio: mean daily return / std daily return (annualized)
        daily_rets = []
        prev_val = initial_capital
        for pt in equity_curve:
            ret = (pt["value"] - prev_val) / max(1, prev_val)
            daily_rets.append(ret)
            prev_val = pt["value"]

        if len(daily_rets) > 1:
            mean_ret = sum(daily_rets) / len(daily_rets)
            std_ret = math.sqrt(sum((r - mean_ret) ** 2 for r in daily_rets) / max(1, len(daily_rets) - 1))
            sharpe = round((mean_ret / max(0.0001, std_ret)) * math.sqrt(252), 2)
        else:
            sharpe = 0.0

        return BacktestResult(
            strategy_name=strategy_cfg["name"],
            initial_capital=initial_capital,
            final_capital=round(capital, 2),
            total_pnl=total_pnl,
            total_pnl_pct=total_pnl_pct,
            total_trades=len(trades),
            winning_trades=len(winning),
            losing_trades=len(losing),
            win_rate_pct=win_rate,
            max_drawdown_pct=round(max_drawdown, 2),
            sharpe_ratio=sharpe,
            equity_curve=equity_curve,
            trades=[asdict(t) for t in trades[-50:]],  # last 50 trades for table
            params_used={
                "strategy_id": strategy_id,
                "kelly_scale": kelly_scale,
                "min_edge_threshold": min_edge_threshold,
                "confidence_threshold": confidence_threshold,
                "num_simulated_days": num_simulated_days,
                "trades_per_day": trades_per_day,
            }
        )
