import numpy as np
import pandas as pd
import yfinance as yf
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from scipy.optimize import minimize

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

    def calculate_portfolio_volatility(self, weights: np.ndarray, cov_matrix: np.ndarray) -> float:
        """Calculate portfolio volatility."""
        return np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

    def calculate_portfolio_return(self, weights: np.ndarray, mean_returns: np.ndarray) -> float:
        """Calculate portfolio expected return."""
        return np.sum(mean_returns * weights)

    def calculate_sharpe_ratio(self, weights: np.ndarray, mean_returns: np.ndarray, 
                             cov_matrix: np.ndarray, risk_free_rate: float = 0.02) -> float:
        """Calculate Sharpe ratio for a portfolio."""
        portfolio_return = self.calculate_portfolio_return(weights, mean_returns)
        portfolio_volatility = self.calculate_portfolio_volatility(weights, cov_matrix)
        return (portfolio_return - risk_free_rate) / portfolio_volatility

    def optimize_portfolio(self, risk_level: str) -> Dict[str, float]:
        """Generate optimal portfolio allocation using modern portfolio theory."""
        # Get historical data
        symbols = list(self.asset_classes.values())
        data = self.get_historical_data(symbols)
        mean_returns, cov_matrix, _ = self.calculate_portfolio_metrics(data)

        # Define optimization constraints
        n_assets = len(symbols)
        constraints = (
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # weights sum to 1
            {'type': 'ineq', 'fun': lambda x: x}  # weights >= 0
        )

        # Define bounds for weights (0 to 1)
        bounds = tuple((0, 1) for _ in range(n_assets))

        # Risk level parameters for initial guess
        risk_params = {
            "conservative": {"stocks": 0.30, "bonds": 0.60, "alternatives": 0.10},
            "moderate_conservative": {"stocks": 0.50, "bonds": 0.40, "alternatives": 0.10},
            "moderate": {"stocks": 0.60, "bonds": 0.30, "alternatives": 0.10},
            "moderate_aggressive": {"stocks": 0.70, "bonds": 0.20, "alternatives": 0.10},
            "aggressive": {"stocks": 0.80, "bonds": 0.10, "alternatives": 0.10},
        }

        # Get initial weights based on risk level
        params = risk_params[risk_level]
        initial_weights = np.array([
            params["stocks"] * 0.6,    # VTI
            params["stocks"] * 0.4,    # VXUS
            params["bonds"] * 0.7,     # BND
            params["bonds"] * 0.3,     # BNDX
            params["alternatives"] * 0.5,  # VNQ
            params["alternatives"] * 0.5   # GSG
        ])

        # Optimize for maximum Sharpe ratio
        result = minimize(
            lambda w: -self.calculate_sharpe_ratio(w, mean_returns, cov_matrix),
            x0=initial_weights,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )

        # Convert optimized weights to dictionary
        allocation = dict(zip(symbols, result.x))

        # Add optimization metrics
        allocation['metrics'] = {
            'sharpe_ratio': -result.fun,
            'expected_return': self.calculate_portfolio_return(result.x, mean_returns),
            'volatility': self.calculate_portfolio_volatility(result.x, cov_matrix)
        }

        return allocation

    def calculate_efficient_frontier(self, n_points: int = 100) -> List[Dict]:
        """Calculate the efficient frontier for the portfolio."""
        symbols = list(self.asset_classes.values())
        data = self.get_historical_data(symbols)
        mean_returns, cov_matrix, _ = self.calculate_portfolio_metrics(data)
        n_assets = len(symbols)

        # Generate target returns
        min_return = np.min(mean_returns)
        max_return = np.max(mean_returns)
        target_returns = np.linspace(min_return, max_return, n_points)

        efficient_portfolios = []
        constraints = (
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
            {'type': 'eq', 'fun': lambda x: self.calculate_portfolio_return(x, mean_returns) - target_returns[0]},
            {'type': 'ineq', 'fun': lambda x: x}
        )
        bounds = tuple((0, 1) for _ in range(n_assets))

        for target_return in target_returns:
            constraints = (
                {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
                {'type': 'eq', 'fun': lambda x: self.calculate_portfolio_return(x, mean_returns) - target_return},
                {'type': 'ineq', 'fun': lambda x: x}
            )

            result = minimize(
                lambda w: self.calculate_portfolio_volatility(w, cov_matrix),
                x0=np.array([1/n_assets] * n_assets),
                method='SLSQP',
                bounds=bounds,
                constraints=constraints
            )

            if result.success:
                portfolio = {
                    'weights': dict(zip(symbols, result.x)),
                    'expected_return': target_return,
                    'volatility': result.fun,
                    'sharpe_ratio': (target_return - 0.02) / result.fun  # Assuming 2% risk-free rate
                }
                efficient_portfolios.append(portfolio)

        return efficient_portfolios

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

    def simulate_portfolio(self, allocation: Dict[str, float], 
                         initial_investment: float,
                         monthly_contribution: float,
                         time_horizon: int) -> List[Dict]:
        """
        Simulate portfolio performance over a given time horizon.
        Returns list of portfolio values over time.
        """
        symbols = list(allocation.keys())
        # Add SPY to get benchmark data
        symbols.append("SPY")
        data = self.get_historical_data(symbols, period=f"{time_horizon}y")
        returns = data.pct_change().dropna()
        
        # Calculate portfolio returns (excluding SPY)
        portfolio_returns = (returns[symbols[:-1]] * pd.Series(allocation)).sum(axis=1)
        
        # Calculate cumulative portfolio value
        portfolio_values = []
        current_value = initial_investment
        benchmark_value = initial_investment
        
        for date, ret in portfolio_returns.items():
            # Add monthly contribution
            if date.day == 1:  # First day of each month
                current_value += monthly_contribution
                benchmark_value += monthly_contribution
            
            # Apply portfolio return
            current_value *= (1 + ret)
            
            # Apply benchmark return (SPY)
            benchmark_value *= (1 + returns.loc[date, "SPY"])
            
            portfolio_values.append({
                "date": date.strftime("%Y-%m-%d"),
                "portfolioValue": round(current_value, 2),
                "benchmarkValue": round(benchmark_value, 2)
            })
        
        return portfolio_values

    def backtest_portfolio(self, allocation: Dict[str, float],
                         initial_investment: float,
                         time_horizon: int) -> List[Dict]:
        """
        Run a backtest of the portfolio over historical data.
        Returns list of portfolio values over time.
        """
        symbols = list(allocation.keys())
        # Add SPY to get benchmark data
        symbols.append("SPY")
        data = self.get_historical_data(symbols, period=f"{time_horizon}y")
        returns = data.pct_change().dropna()
        
        # Calculate portfolio returns (excluding SPY)
        portfolio_returns = (returns[symbols[:-1]] * pd.Series(allocation)).sum(axis=1)
        
        # Calculate cumulative portfolio value
        portfolio_values = []
        current_value = initial_investment
        benchmark_value = initial_investment
        
        for date, ret in portfolio_returns.items():
            # Apply portfolio return
            current_value *= (1 + ret)
            
            # Apply benchmark return (SPY)
            benchmark_value *= (1 + returns.loc[date, "SPY"])
            
            portfolio_values.append({
                "date": date.strftime("%Y-%m-%d"),
                "portfolioValue": round(current_value, 2),
                "benchmarkValue": round(benchmark_value, 2)
            })
        
        return portfolio_values

    def analyze_scenario(self, allocation: Dict[str, float],
                        initial_investment: float,
                        time_horizon: int) -> Dict:
        """
        Analyze a what-if scenario for the portfolio.
        Returns performance metrics for the scenario.
        """
        backtest_results = self.backtest_portfolio(allocation, initial_investment, time_horizon)
        
        # Calculate performance metrics
        portfolio_values = [p["portfolioValue"] for p in backtest_results]
        returns = np.diff(portfolio_values) / portfolio_values[:-1]
        
        metrics = {
            "total_return": (portfolio_values[-1] - initial_investment) / initial_investment,
            "annualized_return": (1 + returns.mean()) ** 252 - 1,
            "volatility": returns.std() * np.sqrt(252),
            "sharpe_ratio": (returns.mean() * 252) / (returns.std() * np.sqrt(252)),
            "max_drawdown": (np.maximum.accumulate(portfolio_values) - portfolio_values) / np.maximum.accumulate(portfolio_values),
            "backtest_results": backtest_results
        }
        
        return metrics 