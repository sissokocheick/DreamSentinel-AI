import unittest
import math
from quant_engine import QuantEngine
from sentiment_agent import SentimentAgent

class TestQuantEngine(unittest.TestCase):
    def setUp(self):
        self.engine = QuantEngine(kelly_scale=0.5)
        self.sentiment_agent = SentimentAgent()

    def test_bayesian_probability_bounds(self):
        prior, posterior = self.engine.calculate_bayesian_probability(
            current_spot=98400.0,
            strike_price=98500.0,
            time_to_expiry_seconds=300,
            sentiment_score=0.6,
            sentiment_confidence=0.85
        )
        self.assertGreaterEqual(prior, 0.01)
        self.assertLessEqual(prior, 0.99)
        self.assertGreaterEqual(posterior, 0.01)
        self.assertLessEqual(posterior, 0.98)

    def test_kelly_fraction_positive_edge(self):
        # Win probability 70%, market price 50 cents (implied prob 50%) -> positive edge
        kelly = self.engine.calculate_kelly_fraction(win_prob=0.70, market_price=0.50)
        self.assertGreater(kelly, 0.0)
        self.assertLessEqual(kelly, 0.35) # Capped by risk threshold

    def test_kelly_fraction_negative_edge(self):
        # Win probability 30%, market price 50 cents -> negative edge, should return 0.0
        kelly = self.engine.calculate_kelly_fraction(win_prob=0.30, market_price=0.50)
        self.assertEqual(kelly, 0.0)

    def test_market_analysis_recommendation(self):
        analysis = self.engine.analyze_market(
            market_id="test-mkt",
            symbol="BTC-5M",
            current_spot=99000.0,
            strike_price=98000.0, # Spot is higher than strike -> YES should have edge
            time_to_expiry_seconds=300,
            market_implied_prob_yes=0.45,
            sentiment_score=0.8,
            sentiment_confidence=0.9
        )
        self.assertIn(analysis.recommended_outcome, ["YES", "NO", "HOLD"])
        self.assertIsInstance(analysis.expected_value_pct, float)

if __name__ == "__main__":
    unittest.main()
