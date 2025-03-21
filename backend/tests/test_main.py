from fastapi.testclient import TestClient

def test_root(client: TestClient):
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Robo Advisor API"}

def test_health_check(client: TestClient):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_risk_assessment(client: TestClient, test_risk_assessment_data):
    """Test the risk assessment endpoint."""
    response = client.post("/api/risk-assessment", json=test_risk_assessment_data)
    assert response.status_code == 200
    data = response.json()
    assert "risk_level" in data
    assert "risk_score" in data
    assert "recommended_allocation" in data

def test_create_portfolio(client: TestClient, test_portfolio_data):
    """Test portfolio creation endpoint."""
    response = client.post("/api/portfolio", json=test_portfolio_data)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "assets" in data
    assert len(data["assets"]) > 0

def test_get_portfolio_stats(client: TestClient):
    """Test getting portfolio statistics."""
    response = client.get("/api/portfolio/1/stats")
    assert response.status_code == 200
    data = response.json()
    assert "expected_annual_return" in data
    assert "annual_volatility" in data
    assert "sharpe_ratio" in data

def test_get_portfolio(client: TestClient):
    """Test getting portfolio details."""
    response = client.get("/api/portfolio/1")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "assets" in data
    assert "risk_level" in data

def test_rebalance_portfolio(client: TestClient):
    """Test portfolio rebalancing."""
    rebalance_data = {
        "portfolio_id": 1,
        "current_allocation": {
            "VTI": 0.4,
            "BND": 0.6
        }
    }
    response = client.post("/api/portfolio/rebalance", json=rebalance_data)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "success" 