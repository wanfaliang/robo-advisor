export interface RiskAssessmentResult {
  risk_level: string;
  risk_score: number;
  investment_goals: string[];
  risk_summary: {
    description: string;
    suitable_for: string;
    expected_return: string;
    volatility: string;
    investment_horizon: string;
  };
  recommended_allocation: {
    stocks: number;
    bonds: number;
    cash: number;
  };
}

export interface PortfolioStats {
  total_value: number;
  daily_change: number;
  daily_change_percent: number;
  estimated_annual_income: number;
  expected_annual_return: number;
  annual_volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  investment_amount: number;
}

export interface Asset {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  value: number;
  allocation: number;
}

export interface Portfolio {
  id: number;
  risk_level: string;
  investment_goals: string[];
  allocation: {
    stocks: number;
    bonds: number;
    cash: number;
  };
  total_value: number;
  cash_balance: number;
  assets: Asset[];
}

export interface Transaction {
  id: number;
  type: 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal';
  symbol: string;
  shares: number;
  price: number;
  timestamp: string;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  type: 'retirement' | 'house' | 'education' | 'other';
} 