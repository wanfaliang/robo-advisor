from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class SelfDefinedPortfolioAssetBase(BaseModel):
    symbol: str
    allocation: float
    shares: float
    value: float

class SelfDefinedPortfolioAssetCreate(SelfDefinedPortfolioAssetBase):
    pass

class SelfDefinedPortfolioAsset(SelfDefinedPortfolioAssetBase):
    id: int
    portfolio_id: int

    class Config:
        orm_mode = True

class SelfDefinedPortfolioBase(BaseModel):
    name: str
    total_investment: float

class SelfDefinedPortfolioCreate(SelfDefinedPortfolioBase):
    assets: List[SelfDefinedPortfolioAssetCreate]

class SelfDefinedPortfolioUpdate(BaseModel):
    name: Optional[str] = None
    total_investment: Optional[float] = None
    assets: Optional[List[SelfDefinedPortfolioAssetCreate]] = None

class SelfDefinedPortfolio(SelfDefinedPortfolioBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    assets: List[SelfDefinedPortfolioAsset]

    class Config:
        orm_mode = True

class PortfolioSimulationBase(BaseModel):
    name: str
    time_horizon: int
    initial_investment: float
    monthly_contribution: float

class PortfolioSimulationCreate(PortfolioSimulationBase):
    pass

class PortfolioSimulation(PortfolioSimulationBase):
    id: int
    portfolio_id: int
    created_at: datetime
    results: str

    class Config:
        orm_mode = True

class PortfolioComparison(BaseModel):
    portfolio_ids: List[int]
    time_horizon: int
    initial_investment: float
    monthly_contribution: float 