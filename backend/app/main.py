from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict
import uvicorn
from pydantic import BaseModel
import logging
from datetime import datetime

app = FastAPI(
    title="Robo Advisor API",
    description="API for automated financial advisory services",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskAssessmentRequest(BaseModel):
    age: int
    income: float
    investment_horizon: int
    risk_tolerance: int
    investment_goals: List[str]

class PortfolioCreate(BaseModel):
    risk_level: str
    investment_goals: List[str]
    recommended_allocation: Dict[str, float]

class RebalanceRequest(BaseModel):
    portfolio_id: int
    current_allocation: Dict[str, float]

class TransactionCreate(BaseModel):
    portfolio_id: int
    type: str
    symbol: str
    shares: float
    price: float

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float
    target_date: str
    type: str

@app.get("/")
async def root():
    return {"message": "Welcome to Robo Advisor API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/risk-assessment")
async def process_risk_assessment(data: RiskAssessmentRequest):
    try:
        logger.info(f"Received risk assessment request: {data}")
        
        # Calculate risk level based on inputs
        risk_score = (
            (data.age / 100) * 0.2 +
            (data.risk_tolerance / 10) * 0.4 +
            (data.investment_horizon / 30) * 0.4
        )
        
        logger.info(f"Calculated risk score: {risk_score}")
        
        # Determine risk level
        if risk_score < 0.3:
            risk_level = "conservative"
        elif risk_score < 0.5:
            risk_level = "moderate_conservative"
        elif risk_score < 0.7:
            risk_level = "moderate"
        elif risk_score < 0.8:
            risk_level = "moderate_aggressive"
        else:
            risk_level = "aggressive"

        logger.info(f"Determined risk level: {risk_level}")

        # Get risk summary based on risk level
        risk_summaries = {
            "conservative": {
                "description": "Focus on preserving capital with modest growth potential",
                "suitable_for": "Investors close to retirement or with low risk tolerance",
                "expected_return": "4-6% annually",
                "volatility": "Low",
                "investment_horizon": "1-3 years"
            },
            "moderate_conservative": {
                "description": "Balanced approach with emphasis on stability",
                "suitable_for": "Investors seeking steady growth with limited volatility",
                "expected_return": "5-7% annually",
                "volatility": "Low to Medium",
                "investment_horizon": "3-5 years"
            },
            "moderate": {
                "description": "Balance between growth and stability",
                "suitable_for": "Investors comfortable with market fluctuations",
                "expected_return": "6-8% annually",
                "volatility": "Medium",
                "investment_horizon": "5-10 years"
            },
            "moderate_aggressive": {
                "description": "Growth-oriented with higher risk tolerance",
                "suitable_for": "Long-term investors seeking capital appreciation",
                "expected_return": "7-9% annually",
                "volatility": "Medium to High",
                "investment_horizon": "10-15 years"
            },
            "aggressive": {
                "description": "Maximum growth potential with high risk tolerance",
                "suitable_for": "Young investors with long time horizons",
                "expected_return": "8-10%+ annually",
                "volatility": "High",
                "investment_horizon": "15+ years"
            }
        }

        result = {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "investment_goals": data.investment_goals,
            "risk_summary": risk_summaries[risk_level],
            "recommended_allocation": {
                "stocks": min(0.8, 0.3 + risk_score),
                "bonds": max(0.2, 0.7 - risk_score),
                "alternatives": 0.1
            }
        }

        logger.info(f"Sending response: {result}")
        return result
    except Exception as e:
        logger.error(f"Error processing risk assessment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio")
async def create_portfolio(data: PortfolioCreate):
    try:
        logger.info(f"Received portfolio creation request: {data}")
        
        # For now, we'll create a simple portfolio with a hardcoded ID
        # In a real application, this would create a record in the database
        portfolio = {
            "id": 1,  # This would come from the database in a real app
            "risk_level": data.risk_level,
            "investment_goals": data.investment_goals,
            "allocation": data.recommended_allocation,
            "total_value": 100000,  # Default value
            "cash_balance": 10000,  # Default value
            "assets": [
                {
                    "symbol": "VTI",
                    "allocation": data.recommended_allocation["stocks"] * 0.6,
                    "value": 60000,
                    "shares": 300
                },
                {
                    "symbol": "VXUS",
                    "allocation": data.recommended_allocation["stocks"] * 0.4,
                    "value": 40000,
                    "shares": 800
                },
                {
                    "symbol": "BND",
                    "allocation": data.recommended_allocation["bonds"] * 0.7,
                    "value": 70000,
                    "shares": 700
                },
                {
                    "symbol": "BNDX",
                    "allocation": data.recommended_allocation["bonds"] * 0.3,
                    "value": 30000,
                    "shares": 300
                }
            ]
        }
        
        logger.info(f"Sending portfolio response: {portfolio}")
        return portfolio
    except Exception as e:
        logger.error(f"Error creating portfolio: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/{portfolio_id}/stats")
async def get_portfolio_stats(portfolio_id: int):
    try:
        # For now, return mock data
        # In a real application, this would fetch from the database
        return {
            "expected_annual_return": 0.08,
            "annual_volatility": 0.15,
            "sharpe_ratio": 0.53,
            "max_drawdown": 0.12,
            "investment_amount": 100000,
            "estimated_annual_income": 2.5  # 2.5 ten thousand dollars = $25,000
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/{portfolio_id}")
async def get_portfolio(portfolio_id: int):
    try:
        # For now, return mock data
        # In a real application, this would fetch from the database
        return {
            "id": portfolio_id,
            "risk_level": "moderate",
            "investment_goals": ["growth", "income"],
            "allocation": {
                "stocks": 0.6,
                "bonds": 0.3,
                "alternatives": 0.1
            },
            "total_value": 100000,
            "cash_balance": 10000,
            "assets": [
                {
                    "symbol": "VTI",
                    "allocation": 0.36,
                    "value": 36000,
                    "shares": 180
                },
                {
                    "symbol": "VXUS",
                    "allocation": 0.24,
                    "value": 24000,
                    "shares": 480
                },
                {
                    "symbol": "BND",
                    "allocation": 0.21,
                    "value": 21000,
                    "shares": 210
                },
                {
                    "symbol": "BNDX",
                    "allocation": 0.09,
                    "value": 9000,
                    "shares": 90
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/rebalance")
async def rebalance_portfolio(data: RebalanceRequest):
    try:
        logger.info(f"Received rebalance request for portfolio {data.portfolio_id}")
        logger.info(f"Current allocation: {data.current_allocation}")
        
        # For now, we'll use a simple rebalancing strategy
        # In a real application, this would use the PortfolioManager class
        target_allocation = {
            "VTI": 0.36,    # 60% of stocks in US
            "VXUS": 0.24,   # 40% of stocks international
            "BND": 0.21,    # 70% of bonds in US
            "BNDX": 0.09,   # 30% of bonds international
            "VNQ": 0.05,    # 50% of alternatives in real estate
            "GSG": 0.05     # 50% of alternatives in commodities
        }
        
        # Calculate the trades needed
        trades = {}
        for symbol, target in target_allocation.items():
            current = data.current_allocation.get(symbol, 0)
            diff = target - current
            if abs(diff) > 0.01:  # Only trade if difference is more than 1%
                trades[symbol] = diff
        
        logger.info(f"Calculated trades: {trades}")
        
        # For now, return mock data
        return {
            "status": "success",
            "trades": trades,
            "new_allocation": target_allocation,
            "message": "Portfolio rebalanced successfully"
        }
    except Exception as e:
        logger.error(f"Error rebalancing portfolio: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/{portfolio_id}/performance")
async def get_portfolio_performance(portfolio_id: int):
    try:
        # For now, return mock performance data
        # In a real application, this would calculate actual performance
        from datetime import datetime, timedelta
        import random

        # Generate 30 days of mock data
        dates = [(datetime.now() - timedelta(days=x)).strftime('%Y-%m-%d') for x in range(30)]
        base_value = 100000
        performance_data = []
        
        for date in dates:
            # Add some random variation to the portfolio value
            portfolio_value = base_value * (1 + random.uniform(-0.02, 0.02))
            # Generate benchmark value (e.g., S&P 500)
            benchmark_value = base_value * (1 + random.uniform(-0.015, 0.015))
            
            performance_data.append({
                "date": date,
                "value": round(portfolio_value, 2),
                "benchmark": round(benchmark_value, 2)
            })
        
        return performance_data
    except Exception as e:
        logger.error(f"Error getting portfolio performance: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/{portfolio_id}/transactions")
async def get_portfolio_transactions(portfolio_id: int):
    try:
        # For now, return mock transaction data
        # In a real application, this would fetch from the database
        transactions = [
            {
                "id": 1,
                "type": "buy",
                "symbol": "VTI",
                "shares": 10,
                "price": 150.25,
                "timestamp": "2024-03-20T10:00:00Z"
            },
            {
                "id": 2,
                "type": "dividend",
                "symbol": "VTI",
                "shares": 0.5,
                "price": 150.25,
                "timestamp": "2024-03-19T10:00:00Z"
            },
            {
                "id": 3,
                "type": "sell",
                "symbol": "VXUS",
                "shares": 5,
                "price": 45.75,
                "timestamp": "2024-03-18T10:00:00Z"
            }
        ]
        return transactions
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/transactions")
async def create_transaction(data: TransactionCreate):
    try:
        logger.info(f"Creating transaction: {data}")
        # In a real application, this would create a record in the database
        transaction = {
            "id": 1,  # This would come from the database
            "type": data.type,
            "symbol": data.symbol,
            "shares": data.shares,
            "price": data.price,
            "timestamp": datetime.utcnow().isoformat()
        }
        return transaction
    except Exception as e:
        logger.error(f"Error creating transaction: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/goals")
async def get_goals():
    try:
        # For now, return mock goal data
        # In a real application, this would fetch from the database
        goals = [
            {
                "id": 1,
                "name": "Retirement",
                "target_amount": 1000000,
                "current_amount": 250000,
                "target_date": "2040-12-31",
                "type": "retirement"
            },
            {
                "id": 2,
                "name": "House Down Payment",
                "target_amount": 100000,
                "current_amount": 50000,
                "target_date": "2025-12-31",
                "type": "house"
            }
        ]
        return goals
    except Exception as e:
        logger.error(f"Error fetching goals: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/goals")
async def create_goal(data: GoalCreate):
    try:
        logger.info(f"Creating goal: {data}")
        # In a real application, this would create a record in the database
        goal = {
            "id": 1,  # This would come from the database
            "name": data.name,
            "target_amount": data.target_amount,
            "current_amount": data.current_amount,
            "target_date": data.target_date,
            "type": data.type
        }
        return goal
    except Exception as e:
        logger.error(f"Error creating goal: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/goals/{goal_id}")
async def update_goal(goal_id: int, data: GoalCreate):
    try:
        logger.info(f"Updating goal {goal_id}: {data}")
        # In a real application, this would update a record in the database
        goal = {
            "id": goal_id,
            "name": data.name,
            "target_amount": data.target_amount,
            "current_amount": data.current_amount,
            "target_date": data.target_date,
            "type": data.type
        }
        return goal
    except Exception as e:
        logger.error(f"Error updating goal: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/goals/{goal_id}")
async def delete_goal(goal_id: int):
    try:
        logger.info(f"Deleting goal {goal_id}")
        # In a real application, this would delete a record from the database
        return {"message": "Goal deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting goal: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 