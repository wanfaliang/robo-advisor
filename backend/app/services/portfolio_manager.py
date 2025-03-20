import numpy as np
import pandas as pd
import yfinance as yf
from typing import List, Dict, Tuple
from datetime import datetime, timedelta

class PortfolioManager:
    def __init__(self):
        # Define asset classes and their representative ETFs
        self.asset_classes = {
            "US_STOCKS": "VTI",      # Vanguard Total Stock Market ETF
            "INTL_STOCKS": "VXUS",   # Vanguard Total International Stock ETF
            "US_BONDS": "BND",       # Vanguard Total Bond Market ETF
            "INTL_BONDS": "BNDX",    # Vanguard Total International Bond ETF
            "REAL_ESTATE": "VNQ",    # Vanguard Real Estate ETF
            "COMMODITIES": "GSG",     # iShares S&P GSCI Commodity ETF
        }

    def get_historical_data(self, symbols: List[str], period: str = "5y") -> pd.DataFrame:
        """Fetch historical data for given symbols."""
        data = pd.DataFrame()
        for symbol in symbols:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)["Close"]
            data[symbol] = hist
        return data

    def calculate_portfolio_metrics(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Calculate returns, volatility, and correlation matrix."""
        returns = data.pct_change().dropna()
        mean_returns = returns.mean() * 252  # Annualized returns
        cov_matrix = returns.cov() * 252     # Annualized covariance
        return mean_returns, cov_matrix, returns

    def optimize_portfolio(self, risk_level: str) -> Dict[str, float]:
        """Generate optimal portfolio allocation based on risk level."""
        # Get historical data
        symbols = list(self.asset_classes.values())
        data = self.get_historical_data(symbols)
        mean_returns, cov_matrix, _ = self.calculate_portfolio_metrics(data)

        # Risk level parameters
        risk_params = {
            "conservative": {"stocks": 0.30, "bonds": 0.60, "alternatives": 0.10},
            "moderate_conservative": {"stocks": 0.50, "bonds": 0.40, "alternatives": 0.10},
            "moderate": {"stocks": 0.60, "bonds": 0.30, "alternatives": 0.10},
            "moderate_aggressive": {"stocks": 0.70, "bonds": 0.20, "alternatives": 0.10},
            "aggressive": {"stocks": 0.80, "bonds": 0.10, "alternatives": 0.10},
        }

        params = risk_params[risk_level]
        
        # Basic allocation based on risk level
        allocation = {
            "VTI": params["stocks"] * 0.6,    # 60% of stocks in US
            "VXUS": params["stocks"] * 0.4,   # 40% of stocks international
            "BND": params["bonds"] * 0.7,     # 70% of bonds in US
            "BNDX": params["bonds"] * 0.3,    # 30% of bonds international
            "VNQ": params["alternatives"] * 0.5,  # 50% of alternatives in real estate
            "GSG": params["alternatives"] * 0.5,  # 50% of alternatives in commodities
        }

        return allocation

    def rebalance_portfolio(self, current_allocation: Dict[str, float], 
                          target_allocation: Dict[str, float], 
                          threshold: float = 0.05) -> Dict[str, float]:
        """
        Determine trades needed to rebalance portfolio.
        Returns dictionary of trades needed (positive for buy, negative for sell).
        """
        trades = {}
        for symbol in target_allocation:
            current = current_allocation.get(symbol, 0)
            target = target_allocation[symbol]
            diff = target - current
            if abs(diff) > threshold:
                trades[symbol] = diff
        return trades

    def calculate_tax_loss_harvest(self, transactions: List[Dict], 
                                 current_prices: Dict[str, float]) -> List[Dict]:
        """
        Identify tax loss harvesting opportunities.
        Returns list of recommended trades.
        """
        harvest_opportunities = []
        for transaction in transactions:
            symbol = transaction["symbol"]
            purchase_price = transaction["price"]
            current_price = current_prices.get(symbol)
            
            if current_price and current_price < purchase_price:
                loss = (current_price - purchase_price) * transaction["shares"]
                if abs(loss) > 1000:  # Minimum loss threshold
                    harvest_opportunities.append({
                        "symbol": symbol,
                        "shares": transaction["shares"],
                        "potential_loss": loss
                    })
        return harvest_opportunities

    def get_portfolio_stats(self, allocation: Dict[str, float], 
                          investment_amount: float) -> Dict:
        """Calculate portfolio statistics."""
        symbols = list(allocation.keys())
        data = self.get_historical_data(symbols, period="1y")
        returns = data.pct_change().dropna()
        
        portfolio_returns = (returns * pd.Series(allocation)).sum(axis=1)
        stats = {
            "expected_annual_return": portfolio_returns.mean() * 252,
            "annual_volatility": portfolio_returns.std() * np.sqrt(252),
            "sharpe_ratio": (portfolio_returns.mean() * 252) / (portfolio_returns.std() * np.sqrt(252)),
            "max_drawdown": (portfolio_returns + 1).cumprod().div((portfolio_returns + 1).cumprod().cummax()) - 1,
            "investment_amount": investment_amount,
            "estimated_annual_income": self._calculate_estimated_income(allocation, investment_amount)
        }
        return stats

    def _calculate_estimated_income(self, allocation: Dict[str, float], 
                                 investment_amount: float) -> float:
        """Calculate estimated annual income from dividends."""
        annual_income = 0
        for symbol, weight in allocation.items():
            ticker = yf.Ticker(symbol)
            try:
                dividend_yield = ticker.info.get('dividendYield', 0)
                # Convert to ten thousand dollars
                annual_income += (weight * investment_amount * dividend_yield) / 10000
            except:
                continue
        return annual_income 