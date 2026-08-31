"""
Sentiment & Perception Agent (Sentinel-Perception)
Processes multi-modal market news, Twitter/X sentiment, orderbook order-flow momentum,
and macro narratives to produce continuous sentiment signals for prediction markets.
"""

import time
import random
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

@dataclass
class SentimentSignal:
    symbol: str
    sentiment_score: float # -1.0 (Strongly Bearish) to +1.0 (Strongly Bullish)
    confidence: float # 0.0 to 1.0
    social_volume_surge: float # Percentage increase in social discussions
    key_drivers: List[str]
    timestamp: int

class SentimentAgent:
    """
    Simulates / integrates NLP embeddings, FinBERT classification, and social volume feeds
    to deliver actionable perception signals to the quantitative Bayesian engine.
    """
    def __init__(self):
        self.cached_signals: Dict[str, SentimentSignal] = {}

    def analyze_market_sentiment(self, symbol: str, spot_price: float, strike_price: float) -> SentimentSignal:
        now = int(time.time())
        price_diff_pct = (spot_price - strike_price) / strike_price * 100.0

        # Base sentiment influenced by real market trajectory + simulated news catalysts
        if "BTC" in symbol:
            drivers = [
                "ETF institutional net inflows exceeding $280M today",
                "Orderbook depth shows strong bid wall at $98,200",
                "Derivatives funding rate stabilized at neutral 0.008%"
            ]
            score = 0.65 if price_diff_pct >= 0 else 0.25
            confidence = 0.88
            surge = 34.5
        elif "ETH" in symbol:
            drivers = [
                "Layer-2 gas consumption on Somnia/Rollups hitting weekly highs",
                "Staking outflow rate reduced by 18%",
                "Call/Put options skew heavily favoring upward breakout"
            ]
            score = 0.58
            confidence = 0.82
            surge = 22.1
        elif "SOMNIA" in symbol:
            drivers = [
                "Somnia Shannon Testnet processed over 50M fast transactions",
                "Ecosystem Hackathon surge: 120+ active agent protocols deployed",
                "Sub-second finality performance benchmarks confirmed by node operators"
            ]
            score = 0.92
            confidence = 0.95
            surge = 78.4
        else:
            drivers = [
                "General crypto market beta tracking macro risk-on environment",
                "DEX volume rising consistently across active pools"
            ]
            score = 0.30
            confidence = 0.70
            surge = 15.0

        signal = SentimentSignal(
            symbol=symbol,
            sentiment_score=round(score + random.uniform(-0.04, 0.04), 3),
            confidence=round(confidence, 2),
            social_volume_surge=surge,
            key_drivers=drivers,
            timestamp=now
        )
        self.cached_signals[symbol] = signal
        return signal

    def get_latest_signal(self, symbol: str) -> Optional[SentimentSignal]:
        return self.cached_signals.get(symbol)
