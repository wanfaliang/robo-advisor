import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)

@pytest.fixture
def test_portfolio_data():
    """Sample portfolio data for testing."""
    return {
        "risk_level": "moderate",
        "investment_goals": ["growth", "income"],
        "recommended_allocation": {
            "stocks": 0.6,
            "bonds": 0.3,
            "alternatives": 0.1
        }
    }

@pytest.fixture
def test_risk_assessment_data():
    """Sample risk assessment data for testing."""
    return {
        "age": 30,
        "income": 100000,
        "investment_horizon": 20,
        "risk_tolerance": 7,
        "investment_goals": ["growth", "income"]
    } 