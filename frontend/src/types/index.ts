export interface Market {
  market_id: string;
  symbol: string;
  title: string;
  category: string;
  expiry_timestamp: number;
  strike_price: number;
  current_spot: number;
  yes_best_bid: number;
  yes_best_ask: number;
  no_best_bid: number;
  no_best_ask: number;
  volume_24h: number;
  open_interest: number;
  implied_prob_yes: number;
  is_resolved?: boolean;
}

export interface AgentProfile {
  agent_id: string;
  name: string;
  avatar: string;
  role: string;
  strategy_type: string;
  risk_profile: string;
  allocated_usdso: number;
  total_pnl_usdso: number;
  win_rate_pct: number;
  sharpe_ratio: number;
  trades_count: number;
  is_active: boolean;
  status_message: string;
}

export interface ThoughtLog {
  id: string;
  timestamp: number;
  agent_name: string;
  agent_role: string;
  market_symbol: string;
  thought_type: "PERCEPTION" | "QUANT" | "EXECUTION" | "RISK_CHECK";
  content: string;
  confidence: number;
  action_taken: string;
}

export interface SwarmStatus {
  agents: AgentProfile[];
  recent_thoughts: ThoughtLog[];
  total_vault_pnl: number;
  total_trades: number;
}

export interface ActionCard {
  market_id: string;
  market_title: string;
  recommended_outcome: "YES" | "NO";
  outcome_index: number;
  suggested_price: number;
  suggested_amount: number;
  expected_ev_pct: number;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: number;
  action_card?: ActionCard;
}
