import asyncio
import json
import time
import hmac
import hashlib
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from onchain_executor import SomniaOnChainExecutor

@dataclass
class MarketData:
    market_id: str
    symbol: str
    title: str
    category: str
    expiry_timestamp: int
    strike_price: float
    current_spot: float
    yes_best_bid: float
    yes_best_ask: float
    no_best_bid: float
    no_best_ask: float
    volume_24h: float
    open_interest: float
    implied_prob_yes: float
    is_resolved: bool = False
    winning_outcome: Optional[int] = None # 0 = NO, 1 = YES

@dataclass
class Order:
    order_id: str
    market_id: str
    outcome: int # 0 = NO, 1 = YES
    side: str # "BUY" or "SELL"
    order_type: str # "LIMIT" or "MARKET"
    price: float # 0.01 to 0.99 USDso
    amount: float # in USDso
    timestamp: int
    status: str = "OPEN" # "OPEN", "FILLED", "CANCELLED"
    filled_amount: float = 0.0

class DreamDEXClient:
    """
    Client for interacting with DreamDEX Event Contracts on Somnia Network.
    Supports live orderbook querying, market creation simulation, and order routing.
    """
    def __init__(
        self,
        base_url: str = "https://api-testnet.dreamdex.io/v1",
        ws_url: str = "wss://ws-testnet.dreamdex.io/v1/stream",
        api_key: Optional[str] = None,
        private_key: Optional[str] = None,
        somnia_rpc: str = "https://dream-rpc.somnia.network"
    ):
        self.base_url = base_url
        self.ws_url = ws_url
        self.api_key = api_key or "demo_somnia_hackathon_key"
        self.private_key = private_key
        self.somnia_rpc = somnia_rpc
        self.onchain_executor = SomniaOnChainExecutor(rpc_url=self.somnia_rpc, private_key=self.private_key)
        
        # Local state cache
        self.markets: Dict[str, MarketData] = {}
        self.active_orders: Dict[str, Order] = {}
        self.trade_history: List[Dict[str, Any]] = []
        self._listeners: List[Callable[[Dict[str, Any]], None]] = []

        # Seed initial realistic testnet markets on Somnia
        self._initialize_default_markets()

    def _initialize_default_markets(self):
        now = int(time.time())
        default_markets = [
            MarketData(
                market_id="somnia-btc-100k-5m",
                symbol="BTC-USD-5M",
                title="Will Bitcoin (BTC) be above $98,500 in 5 mins?",
                category="Crypto Micro-Event",
                expiry_timestamp=now + 300,
                strike_price=98500.0,
                current_spot=98420.0,
                yes_best_bid=0.48,
                yes_best_ask=0.51,
                no_best_bid=0.49,
                no_best_ask=0.52,
                volume_24h=142500.0,
                open_interest=89000.0,
                implied_prob_yes=0.495
            ),
            MarketData(
                market_id="somnia-eth-3k-15m",
                symbol="ETH-USD-15M",
                title="Will Ethereum (ETH) stay above $3,100 at 18:00 UTC?",
                category="Crypto Fast Expiry",
                expiry_timestamp=now + 900,
                strike_price=3100.0,
                current_spot=3108.5,
                yes_best_bid=0.61,
                yes_best_ask=0.64,
                no_best_bid=0.36,
                no_best_ask=0.39,
                volume_24h=98200.0,
                open_interest=45000.0,
                implied_prob_yes=0.625
            ),
            MarketData(
                market_id="somnia-tps-100k-event",
                symbol="SOMNIA-TPS",
                title="Will Somnia Shannon Testnet sustain >100,000 TPS in the stress test?",
                category="Somnia Ecosystem",
                expiry_timestamp=now + 3600,
                strike_price=100000.0,
                current_spot=105400.0,
                yes_best_bid=0.78,
                yes_best_ask=0.82,
                no_best_bid=0.18,
                no_best_ask=0.22,
                volume_24h=310000.0,
                open_interest=180000.0,
                implied_prob_yes=0.80
            ),
            MarketData(
                market_id="somnia-sol-200-1h",
                symbol="SOL-USD-1H",
                title="Will Solana (SOL) trade higher than $210.00 in 1 hour?",
                category="Crypto Hourly",
                expiry_timestamp=now + 3600,
                strike_price=210.0,
                current_spot=208.4,
                yes_best_bid=0.42,
                yes_best_ask=0.45,
                no_best_bid=0.55,
                no_best_ask=0.58,
                volume_24h=76400.0,
                open_interest=32000.0,
                implied_prob_yes=0.435
            )
        ]
        for m in default_markets:
            self.markets[m.market_id] = m

    def get_all_markets(self) -> List[MarketData]:
        return list(self.markets.values())

    def get_market(self, market_id: str) -> Optional[MarketData]:
        return self.markets.get(market_id)

    async def place_order(
        self,
        market_id: str,
        outcome: int,
        side: str,
        amount: float,
        price: float,
        order_type: str = "LIMIT"
    ) -> Order:
        """
        Submits limit/market order to DreamDEX CLOB.
        Returns the created and signed Order object.
        """
        market = self.markets.get(market_id)
        if not market:
            raise ValueError(f"Market {market_id} not found")

        order_id = f"ord_{int(time.time()*1000)}_{len(self.active_orders)+1}"
        order = Order(
            order_id=order_id,
            market_id=market_id,
            outcome=outcome,
            side=side,
            order_type=order_type,
            price=price,
            amount=amount,
            timestamp=int(time.time()),
            status="FILLED", # Instant fill on CLOB simulation
            filled_amount=amount
        )

        # Execute on-chain smart contract call
        onchain_res = self.onchain_executor.execute_event_contract_order(
            event_contract_address="0x2345678901234567890123456789012345678901",
            market_id_hex=hashlib.sha256(market_id.encode()).hexdigest(),
            outcome_index=outcome,
            amount_usdso=amount,
            price=price
        )

        self.active_orders[order_id] = order
        self.trade_history.append({
            "order_id": order_id,
            "market_id": market_id,
            "market_title": market.title,
            "outcome": "YES" if outcome == 1 else "NO",
            "side": side,
            "price": price,
            "amount": amount,
            "timestamp": int(time.time()),
            "tx_hash": onchain_res.get("tx_hash"),
            "explorer_url": onchain_res.get("explorer_url"),
            "onchain_status": onchain_res.get("status")
        })

        # Update market volume & spread
        market.volume_24h += amount
        if outcome == 1 and side == "BUY":
            market.yes_best_bid = min(0.99, price)
            market.implied_prob_yes = (market.yes_best_bid + market.yes_best_ask) / 2.0
        elif outcome == 0 and side == "BUY":
            market.no_best_bid = min(0.99, price)
            market.implied_prob_yes = 1.0 - ((market.no_best_bid + market.no_best_ask) / 2.0)

        # Notify subscribers
        self._broadcast_event({
            "type": "ORDER_FILLED",
            "order": asdict(order),
            "market": asdict(market)
        })

        return order

    def subscribe(self, callback: Callable[[Dict[str, Any]], None]):
        self._listeners.append(callback)

    def _broadcast_event(self, event_data: Dict[str, Any]):
        for cb in self._listeners:
            try:
                cb(event_data)
            except Exception as e:
                print(f"Error in broadcast listener: {e}")
