import pytest
from app.services.portfolio_manager import PortfolioManager

def test_portfolio_manager_initialization():
    """Test that PortfolioManager initializes correctly."""
    manager = PortfolioManager()
    assert manager.asset_classes is not None
    assert "US_STOCKS" in manager.asset_classes
    assert manager.asset_classes["US_STOCKS"] == "VTI"

def test_optimize_portfolio():
    """Test portfolio optimization for different risk levels."""
    manager = PortfolioManager()
    
    # Test conservative portfolio
    conservative = manager.optimize_portfolio("conservative")
    assert sum(conservative.values()) == pytest.approx(1.0)
    assert conservative["VTI"] == pytest.approx(0.18, rel=0.01)  # 60% of 30% stocks
    
    # Test aggressive portfolio
    aggressive = manager.optimize_portfolio("aggressive")
    assert sum(aggressive.values()) == pytest.approx(1.0)
    assert aggressive["VTI"] == pytest.approx(0.48, rel=0.01)  # 60% of 80% stocks

def test_rebalance_portfolio():
    """Test portfolio rebalancing logic."""
    manager = PortfolioManager()
    current = {"VTI": 0.5, "BND": 0.5}
    target = {"VTI": 0.6, "BND": 0.4}
    
    trades = manager.rebalance_portfolio(current, target)
    assert trades["VTI"] == pytest.approx(0.1)
    assert trades["BND"] == pytest.approx(-0.1)

def test_calculate_tax_loss_harvest():
    """Test tax loss harvesting calculation."""
    manager = PortfolioManager()
    transactions = [
        {"symbol": "VTI", "price": 100, "shares": 10},
        {"symbol": "BND", "price": 50, "shares": 20}
    ]
    current_prices = {"VTI": 90, "BND": 45}
    
    opportunities = manager.calculate_tax_loss_harvest(transactions, current_prices)
    assert len(opportunities) == 2
    assert opportunities[0]["potential_loss"] == -100  # (90-100) * 10
    assert opportunities[1]["potential_loss"] == -100  # (45-50) * 20 