"""
Quantitative & Bayesian Probability Engine (Sentinel-Quant)
Computes real-time theoretical fair value of Event Contracts,
detects mispricing on DreamDEX CLOB, and calculates optimal Kelly-criterion capital allocation.
"""

import math
from typing import Dict, Any, Tuple
from dataclasses import dataclass

@dataclass
class QuantitativeAnalysis:
    market_id: str
    symbol: str
    prior_prob_yes: float
    posterior_prob_yes: float
    market_implied_prob_yes: float
    edge_yes: float # Positive means YES is undervalued (buy YES)
    edge_no: float  # Positive means NO is undervalued (buy NO)
    recommended_outcome: str # "YES", "NO", or "HOLD"
    kelly_fraction: float # Optimal fraction of capital (0.0 to 1.0)
    expected_value_pct: float
    confidence_interval: Tuple[float, float]
    reasoning: str

class QuantEngine:
    def __init__(self, kelly_scale: float = 0.5):
        """
        :param kelly_scale: Fractional Kelly factor (0.5 = Half-Kelly for risk mitigation)
        """
        self.kelly_scale = kelly_scale

    def calculate_bayesian_probability(
        self,
        current_spot: float,
        strike_price: float,
        time_to_expiry_seconds: int,
        sentiment_score: float, # -1.0 to +1.0
        sentiment_confidence: float # 0.0 to 1.0
    ) -> Tuple[float, float]:
        """
        Calculates prior and posterior probability of the event resolving YES.
        Uses Black-Scholes binary option delta adjusted by Bayesian sentiment updates.
        """
        # Time in years
        t_years = max(time_to_expiry_seconds, 10) / (365.25 * 86400)
        volatility = 0.60 # 60% annualized crypto vol baseline

        # d2 in Black-Scholes for binary call
        denom = volatility * math.sqrt(t_years)
        if denom == 0:
            denom = 1e-6
        
        d2 = (math.log(current_spot / strike_price) - (0.5 * volatility**2) * t_years) / denom
        
        # Standard normal CDF approximation (Prior Probability)
        prior_prob = 0.5 * (1.0 + math.erf(d2 / math.sqrt(2.0)))
        prior_prob = max(0.01, min(0.99, prior_prob))

        # Bayesian Likelihood update from Sentiment Agent
        # Likelihood ratio LR = P(Signal | YES) / P(Signal | NO)
        shift = sentiment_score * sentiment_confidence * 0.4
        likelihood_ratio = math.exp(shift)

        # Posterior Odds = Prior Odds * Likelihood Ratio
        prior_odds = prior_prob / (1.0 - prior_prob)
        posterior_odds = prior_odds * likelihood_ratio
        posterior_prob = posterior_odds / (1.0 + posterior_odds)
        posterior_prob = max(0.02, min(0.98, posterior_prob))

        return round(prior_prob, 4), round(posterior_prob, 4)

    def calculate_kelly_fraction(self, win_prob: float, market_price: float) -> float:
        """
        Computes Kelly Criterion: f* = (b*p - q) / b
        where b is payout odds: (1 - market_price) / market_price
        """
        if market_price <= 0.01 or market_price >= 0.99:
            return 0.0

        p = win_prob
        q = 1.0 - p
        b = (1.0 - market_price) / market_price

        kelly = (b * p - q) / b
        if kelly <= 0:
            return 0.0

        # Apply fractional Kelly for variance reduction
        fractional_kelly = min(0.35, kelly * self.kelly_scale)
        return round(fractional_kelly, 4)

    def analyze_market(
        self,
        market_id: str,
        symbol: str,
        current_spot: float,
        strike_price: float,
        time_to_expiry_seconds: int,
        market_implied_prob_yes: float,
        sentiment_score: float = 0.0,
        sentiment_confidence: float = 0.8
    ) -> QuantitativeAnalysis:
        prior_prob, posterior_prob = self.calculate_bayesian_probability(
            current_spot=current_spot,
            strike_price=strike_price,
            time_to_expiry_seconds=time_to_expiry_seconds,
            sentiment_score=sentiment_score,
            sentiment_confidence=sentiment_confidence
        )

        edge_yes = posterior_prob - market_implied_prob_yes
        edge_no = (1.0 - posterior_prob) - (1.0 - market_implied_prob_yes)

        # Minimum edge threshold to trigger trade (3.5% edge)
        MIN_EDGE = 0.035

        if edge_yes > MIN_EDGE:
            recommended = "YES"
            kelly = self.calculate_kelly_fraction(posterior_prob, market_implied_prob_yes)
            ev_pct = (posterior_prob * (1.0 / market_implied_prob_yes) - 1.0) * 100.0
            reasoning = f"YES is undervalued by {round(edge_yes*100, 1)}%. Model fair probability is {round(posterior_prob*100, 1)}% vs market {round(market_implied_prob_yes*100, 1)}%."
        elif edge_no > MIN_EDGE:
            recommended = "NO"
            prob_no = 1.0 - posterior_prob
            market_price_no = 1.0 - market_implied_prob_yes
            kelly = self.calculate_kelly_fraction(prob_no, market_price_no)
            ev_pct = (prob_no * (1.0 / market_price_no) - 1.0) * 100.0
            reasoning = f"NO is undervalued by {round(edge_no*100, 1)}%. Model fair probability of NO is {round(prob_no*100, 1)}% vs market {round(market_price_no*100, 1)}%."
        else:
            recommended = "HOLD"
            kelly = 0.0
            ev_pct = 0.0
            reasoning = "Market is currently efficiently priced within statistical error margins. No edge detected."

        ci_low = max(0.01, round(posterior_prob - 0.06, 3))
        ci_high = min(0.99, round(posterior_prob + 0.06, 3))

        return QuantitativeAnalysis(
            market_id=market_id,
            symbol=symbol,
            prior_prob_yes=prior_prob,
            posterior_prob_yes=posterior_prob,
            market_implied_prob_yes=market_implied_prob_yes,
            edge_yes=round(edge_yes, 4),
            edge_no=round(edge_no, 4),
            recommended_outcome=recommended,
            kelly_fraction=kelly,
            expected_value_pct=round(ev_pct, 2),
            confidence_interval=(ci_low, ci_high),
            reasoning=reasoning
        )
