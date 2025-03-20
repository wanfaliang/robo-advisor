from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List
from ...core.database import get_db
from ...services.portfolio_manager import PortfolioManager
from ...services.risk_assessor import RiskAssessor
from ...models import models
from pydantic import BaseModel

router = APIRouter()
portfolio_manager = PortfolioManager()
risk_assessor = RiskAssessor()

class RiskAssessmentRequest(BaseModel):
    answers: Dict

class PortfolioAllocationRequest(BaseModel):
    risk_level: str
    investment_amount: float

class RebalanceRequest(BaseModel):
    portfolio_id: int
    current_allocation: Dict[str, float]

@router.post("/risk-assessment")
async def assess_risk(request: RiskAssessmentRequest, db: Session = Depends(get_db)):
    """Calculate risk profile based on questionnaire answers."""
    risk_score = risk_assessor.calculate_risk_score(request.answers)
    risk_level = risk_assessor.determine_risk_level(risk_score)
    investment_goals = risk_assessor.get_investment_goals(request.answers)
    risk_summary = risk_assessor.get_risk_profile_summary(risk_level)
    
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "investment_goals": investment_goals,
        "risk_summary": risk_summary
    }

@router.post("/portfolio/optimize")
async def optimize_portfolio(request: PortfolioAllocationRequest, db: Session = Depends(get_db)):
    """Generate optimal portfolio allocation."""
    try:
        allocation = portfolio_manager.optimize_portfolio(request.risk_level)
        stats = portfolio_manager.get_portfolio_stats(allocation, request.investment_amount)
        
        return {
            "allocation": allocation,
            "portfolio_stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/portfolio/rebalance")
async def rebalance_portfolio(request: RebalanceRequest, db: Session = Depends(get_db)):
    """Calculate rebalancing trades needed."""
    try:
        portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == request.portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        target_allocation = portfolio.allocation
        trades = portfolio_manager.rebalance_portfolio(
            request.current_allocation,
            target_allocation
        )
        
        return {
            "trades": trades,
            "target_allocation": target_allocation
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/portfolio/{portfolio_id}/tax-loss-harvest")
async def get_tax_loss_harvest(portfolio_id: int, db: Session = Depends(get_db)):
    """Get tax loss harvesting opportunities."""
    try:
        portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        transactions = db.query(models.Transaction).filter(
            models.Transaction.portfolio_id == portfolio_id
        ).all()
        
        # Get current prices for all symbols in the portfolio
        symbols = set(t.symbol for t in transactions)
        current_prices = {symbol: portfolio_manager.get_current_price(symbol) for symbol in symbols}
        
        opportunities = portfolio_manager.calculate_tax_loss_harvest(
            [t.__dict__ for t in transactions],
            current_prices
        )
        
        return {
            "tax_loss_opportunities": opportunities
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/portfolio/{portfolio_id}/stats")
async def get_portfolio_stats(portfolio_id: int, db: Session = Depends(get_db)):
    """Get portfolio statistics and performance metrics."""
    try:
        portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        stats = portfolio_manager.get_portfolio_stats(
            portfolio.allocation,
            portfolio.total_value
        )
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 