from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class SelfDefinedPortfolio(Base):
    __tablename__ = "self_defined_portfolios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    total_investment = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assets = relationship("SelfDefinedPortfolioAsset", back_populates="portfolio", cascade="all, delete-orphan")
    simulations = relationship("PortfolioSimulation", back_populates="portfolio", cascade="all, delete-orphan")

class SelfDefinedPortfolioAsset(Base):
    __tablename__ = "self_defined_portfolio_assets"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("self_defined_portfolios.id"))
    symbol = Column(String)
    allocation = Column(Float)
    shares = Column(Float)
    value = Column(Float)

    # Relationship
    portfolio = relationship("SelfDefinedPortfolio", back_populates="assets")

class PortfolioSimulation(Base):
    __tablename__ = "portfolio_simulations"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("self_defined_portfolios.id"))
    name = Column(String)
    time_horizon = Column(Integer)
    initial_investment = Column(Float)
    monthly_contribution = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Store simulation results as JSON
    results = Column(String)  # Will store JSON string of simulation results
    
    # Relationship
    portfolio = relationship("SelfDefinedPortfolio", back_populates="simulations") 