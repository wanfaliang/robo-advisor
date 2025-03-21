from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
import uvicorn
from pydantic import BaseModel
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from . import models, schemas
from .core.database import SessionLocal, engine
from app.services.portfolio_manager import PortfolioManager
import json

app = FastAPI(
    title="Robo Advisor API",
    description="API for automated financial advisory services",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
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

class TaxLossHarvestRequest(BaseModel):
    symbol: str

class NewsItem(BaseModel):
    id: int
    title: str
    summary: str
    source: str
    url: str
    category: str
    published_at: str

class EducationalContent(BaseModel):
    id: int
    title: str
    description: str
    category: str
    difficulty: str
    reading_time: int

class SimulationRequest(BaseModel):
    time_horizon: int
    initial_investment: float
    monthly_contribution: float

class BacktestRequest(BaseModel):
    allocation: Dict[str, float]
    time_horizon: int
    initial_investment: float

class ScenarioRequest(BaseModel):
    allocation: Dict[str, float]
    time_horizon: int
    initial_investment: float

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

@app.get("/api/portfolio/{portfolio_id}/tax-loss-harvest")
async def get_tax_loss_opportunities(portfolio_id: int):
    try:
        logger.info(f"Fetching tax loss opportunities for portfolio {portfolio_id}")
        
        # Get current prices (mock data for now)
        current_prices = {
            "VTI": 220.50,
            "VXUS": 55.25,
            "BND": 72.30,
            "BNDX": 48.75,
            "VNQ": 82.40,
            "GSG": 20.15
        }
        
        # Get transaction history (mock data for now)
        transactions = [
            {"symbol": "VTI", "price": 230.50, "shares": 100},
            {"symbol": "VXUS", "price": 58.75, "shares": 200},
            {"symbol": "BND", "price": 75.30, "shares": 150},
        ]
        
        portfolio_manager = PortfolioManager()
        opportunities = portfolio_manager.calculate_tax_loss_harvest(transactions, current_prices)
        
        # Add current prices to the opportunities
        for opp in opportunities:
            opp["current_price"] = current_prices[opp["symbol"]]
            opp["purchase_price"] = next(
                t["price"] for t in transactions if t["symbol"] == opp["symbol"]
            )
        
        logger.info(f"Found {len(opportunities)} tax loss harvesting opportunities")
        return {"opportunities": opportunities}
    except Exception as e:
        logger.error(f"Error calculating tax loss opportunities: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/{portfolio_id}/tax-loss-harvest")
async def execute_tax_loss_harvest(portfolio_id: int, data: TaxLossHarvestRequest):
    try:
        logger.info(f"Executing tax loss harvest for portfolio {portfolio_id}, symbol {data.symbol}")
        
        # In a real application, this would:
        # 1. Sell the losing position
        # 2. Buy a similar but not substantially identical security
        # 3. Record the tax loss
        # 4. Update the portfolio
        
        # For now, just return a success message
        return {
            "message": f"Successfully harvested tax loss for {data.symbol}",
            "realized_loss": 1000  # Mock data
        }
    except Exception as e:
        logger.error(f"Error executing tax loss harvest: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news")
async def get_news():
    try:
        logger.info("Fetching market news")
        # In a real application, this would fetch from a news API
        # For now, return mock data
        news = [
            {
                "id": 1,
                "title": "Market Rally Continues as Tech Stocks Lead Gains",
                "summary": "Major indices posted strong gains today as technology companies reported better-than-expected earnings.",
                "source": "Financial Times",
                "url": "https://example.com/news/1",
                "category": "Market Analysis",
                "published_at": "2024-03-20T10:00:00Z"
            },
            {
                "id": 2,
                "title": "Federal Reserve Maintains Interest Rates",
                "summary": "The Federal Reserve kept interest rates unchanged, citing stable inflation and continued economic growth.",
                "source": "Reuters",
                "url": "https://example.com/news/2",
                "category": "Economic News",
                "published_at": "2024-03-19T15:30:00Z"
            },
            {
                "id": 3,
                "title": "New ESG Investment Guidelines Released",
                "summary": "Regulatory body releases updated guidelines for environmental, social, and governance investments.",
                "source": "Bloomberg",
                "url": "https://example.com/news/3",
                "category": "ESG",
                "published_at": "2024-03-18T09:15:00Z"
            }
        ]
        return {"news": news}
    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/education")
async def get_educational_content():
    try:
        logger.info("Fetching educational content")
        # In a real application, this would fetch from a content management system
        # For now, return mock data
        content = [
            {
                "id": 1,
                "title": "Understanding Asset Allocation",
                "description": "Learn the fundamentals of portfolio diversification and how to create a balanced investment strategy.",
                "category": "Portfolio Management",
                "difficulty": "beginner",
                "reading_time": 5
            },
            {
                "id": 2,
                "title": "Advanced Options Trading Strategies",
                "description": "Explore sophisticated options trading techniques and risk management strategies.",
                "category": "Trading",
                "difficulty": "advanced",
                "reading_time": 15
            },
            {
                "id": 3,
                "title": "Tax-Efficient Investing Guide",
                "description": "Understanding tax implications of different investment strategies and how to minimize your tax burden.",
                "category": "Tax Planning",
                "difficulty": "intermediate",
                "reading_time": 8
            },
            {
                "id": 4,
                "title": "Market Analysis Fundamentals",
                "description": "Learn how to analyze market trends, read financial statements, and make informed investment decisions.",
                "category": "Analysis",
                "difficulty": "beginner",
                "reading_time": 10
            }
        ]
        return {"content": content}
    except Exception as e:
        logger.error(f"Error fetching educational content: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/{portfolio_id}/efficient-frontier")
async def get_efficient_frontier(portfolio_id: int):
    try:
        logger.info(f"Starting efficient frontier calculation for portfolio {portfolio_id}")
        portfolio_manager = PortfolioManager()
        logger.info("Created PortfolioManager instance")
        
        efficient_frontier = portfolio_manager.calculate_efficient_frontier()
        logger.info(f"Calculated efficient frontier with {len(efficient_frontier)} points")
        
        # Log a sample point for debugging
        if efficient_frontier:
            logger.info(f"Sample portfolio point: {efficient_frontier[0]}")
        
        return {"efficient_frontier": efficient_frontier}
    except Exception as e:
        logger.error(f"Error calculating efficient frontier: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/{portfolio_id}/simulate")
async def simulate_portfolio(portfolio_id: int, data: SimulationRequest):
    try:
        logger.info(f"Starting portfolio simulation for portfolio {portfolio_id}")
        portfolio_manager = PortfolioManager()
        
        # Get current portfolio allocation
        portfolio = await get_portfolio(portfolio_id)
        current_allocation = {asset["symbol"]: asset["allocation"] for asset in portfolio["assets"]}
        
        # Run simulation
        simulation_results = portfolio_manager.simulate_portfolio(
            current_allocation,
            data.initial_investment,
            data.monthly_contribution,
            data.time_horizon
        )
        
        logger.info(f"Simulation completed with {len(simulation_results)} data points")
        return {"simulation_results": simulation_results}
    except Exception as e:
        logger.error(f"Error running portfolio simulation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/{portfolio_id}/backtest")
async def backtest_portfolio(portfolio_id: int, data: BacktestRequest):
    try:
        logger.info(f"Starting portfolio backtest for portfolio {portfolio_id}")
        portfolio_manager = PortfolioManager()
        
        # Run backtest
        backtest_results = portfolio_manager.backtest_portfolio(
            data.allocation,
            data.initial_investment,
            data.time_horizon
        )
        
        logger.info(f"Backtest completed with {len(backtest_results)} data points")
        return {"backtest_results": backtest_results}
    except Exception as e:
        logger.error(f"Error running portfolio backtest: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/{portfolio_id}/analyze-scenario")
async def analyze_scenario(portfolio_id: int, data: ScenarioRequest):
    try:
        logger.info(f"Starting scenario analysis for portfolio {portfolio_id}")
        portfolio_manager = PortfolioManager()
        
        # Run scenario analysis
        scenario_results = portfolio_manager.analyze_scenario(
            data.allocation,
            data.initial_investment,
            data.time_horizon
        )
        
        logger.info("Scenario analysis completed successfully")
        return scenario_results
    except Exception as e:
        logger.error(f"Error running scenario analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Self-defined portfolio endpoints
@app.post("/api/self-defined-portfolios/", response_model=schemas.SelfDefinedPortfolio)
def create_self_defined_portfolio(
    portfolio: schemas.SelfDefinedPortfolioCreate,
    db: Session = Depends(get_db)
):
    db_portfolio = models.SelfDefinedPortfolio(
        name=portfolio.name,
        total_investment=portfolio.total_investment
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    
    # Add assets
    for asset in portfolio.assets:
        db_asset = models.SelfDefinedPortfolioAsset(
            portfolio_id=db_portfolio.id,
            symbol=asset.symbol,
            allocation=asset.allocation,
            shares=asset.shares,
            value=asset.value
        )
        db.add(db_asset)
    
    db.commit()
    return db_portfolio

@app.get("/api/self-defined-portfolios/", response_model=List[schemas.SelfDefinedPortfolio])
def get_self_defined_portfolios(db: Session = Depends(get_db)):
    return db.query(models.SelfDefinedPortfolio).all()

@app.get("/api/self-defined-portfolios/{portfolio_id}", response_model=schemas.SelfDefinedPortfolio)
def get_self_defined_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(models.SelfDefinedPortfolio).filter(models.SelfDefinedPortfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@app.put("/api/self-defined-portfolios/{portfolio_id}", response_model=schemas.SelfDefinedPortfolio)
def update_self_defined_portfolio(
    portfolio_id: int,
    portfolio: schemas.SelfDefinedPortfolioUpdate,
    db: Session = Depends(get_db)
):
    db_portfolio = db.query(models.SelfDefinedPortfolio).filter(models.SelfDefinedPortfolio.id == portfolio_id).first()
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Update portfolio attributes
    for key, value in portfolio.dict(exclude_unset=True).items():
        if key != "assets":
            setattr(db_portfolio, key, value)
    
    # Update assets if provided
    if portfolio.assets:
        # Remove existing assets
        db.query(models.SelfDefinedPortfolioAsset).filter(
            models.SelfDefinedPortfolioAsset.portfolio_id == portfolio_id
        ).delete()
        
        # Add new assets
        for asset in portfolio.assets:
            db_asset = models.SelfDefinedPortfolioAsset(
                portfolio_id=portfolio_id,
                symbol=asset.symbol,
                allocation=asset.allocation,
                shares=asset.shares,
                value=asset.value
            )
            db.add(db_asset)
    
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

@app.delete("/api/self-defined-portfolios/{portfolio_id}")
def delete_self_defined_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(models.SelfDefinedPortfolio).filter(models.SelfDefinedPortfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    db.delete(portfolio)
    db.commit()
    return {"message": "Portfolio deleted successfully"}

# Portfolio simulation endpoints
@app.post("/api/self-defined-portfolios/{portfolio_id}/simulate")
def simulate_portfolio(
    portfolio_id: int,
    simulation: schemas.PortfolioSimulationCreate,
    db: Session = Depends(get_db)
):
    portfolio = db.query(models.SelfDefinedPortfolio).filter(models.SelfDefinedPortfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get portfolio allocation
    allocation = {asset.symbol: asset.allocation for asset in portfolio.assets}
    
    # Run simulation
    portfolio_manager = PortfolioManager()
    results = portfolio_manager.simulate_portfolio(
        allocation=allocation,
        initial_investment=simulation.initial_investment,
        monthly_contribution=simulation.monthly_contribution,
        time_horizon=simulation.time_horizon
    )
    
    # Save simulation results
    db_simulation = models.PortfolioSimulation(
        portfolio_id=portfolio_id,
        name=simulation.name,
        time_horizon=simulation.time_horizon,
        initial_investment=simulation.initial_investment,
        monthly_contribution=simulation.monthly_contribution,
        results=json.dumps(results)
    )
    db.add(db_simulation)
    db.commit()
    
    return results

@app.get("/api/self-defined-portfolios/{portfolio_id}/simulations")
def get_portfolio_simulations(portfolio_id: int, db: Session = Depends(get_db)):
    simulations = db.query(models.PortfolioSimulation).filter(
        models.PortfolioSimulation.portfolio_id == portfolio_id
    ).all()
    return simulations

# Portfolio comparison endpoint
@app.post("/api/self-defined-portfolios/compare")
def compare_portfolios(
    comparison: schemas.PortfolioComparison,
    db: Session = Depends(get_db)
):
    portfolio_manager = PortfolioManager()
    results = {}
    
    for portfolio_id in comparison.portfolio_ids:
        portfolio = db.query(models.SelfDefinedPortfolio).filter(
            models.SelfDefinedPortfolio.id == portfolio_id
        ).first()
        if not portfolio:
            continue
        
        # Get portfolio allocation
        allocation = {asset.symbol: asset.allocation for asset in portfolio.assets}
        
        # Run simulation
        simulation_results = portfolio_manager.simulate_portfolio(
            allocation=allocation,
            initial_investment=comparison.initial_investment,
            monthly_contribution=comparison.monthly_contribution,
            time_horizon=comparison.time_horizon
        )
        
        results[portfolio.name] = simulation_results
    
    return results

@app.get("/api/available-symbols")
def get_available_symbols():
    """Get list of available symbols for portfolio creation."""
    return [
        "VTI",   # Vanguard Total Stock Market ETF
        "VXUS",  # Vanguard Total International Stock ETF
        "BND",   # Vanguard Total Bond Market ETF
        "BNDX",  # Vanguard Total International Bond ETF
        "VNQ",   # Vanguard Real Estate ETF
        "GSG",   # iShares S&P GSCI Commodity ETF
        "SPY",   # SPDR S&P 500 ETF
        "QQQ",   # Invesco QQQ Trust
        "IWM",   # iShares Russell 2000 ETF
        "AGG",   # iShares Core U.S. Aggregate Bond ETF
        "TLT",   # iShares 20+ Year Treasury Bond ETF
        "GLD",   # SPDR Gold Trust
        "SLV",   # iShares Silver Trust
        "DIA",   # SPDR Dow Jones Industrial Average ETF
        "XLF",   # Financial Select Sector SPDR Fund
        "XLK",   # Technology Select Sector SPDR Fund
        "XLE",   # Energy Select Sector SPDR Fund
        "XLV",   # Health Care Select Sector SPDR Fund
        "XLP",   # Consumer Staples Select Sector SPDR Fund
        "XLY",   # Consumer Discretionary Select Sector SPDR Fund
    ]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 