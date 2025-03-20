from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

Base = declarative_base()

class RiskLevel(str, enum.Enum):
    CONSERVATIVE = "conservative"
    MODERATE_CONSERVATIVE = "moderate_conservative"
    MODERATE = "moderate"
    MODERATE_AGGRESSIVE = "moderate_aggressive"
    AGGRESSIVE = "aggressive"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    profile = relationship("RiskProfile", back_populates="user", uselist=False)
    portfolios = relationship("Portfolio", back_populates="user")
    goals = relationship("Goal", back_populates="user")

class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    risk_level = Column(Enum(RiskLevel))
    investment_horizon = Column(Integer)  # in years
    income = Column(Float)
    liquid_net_worth = Column(Float)
    investment_goals = Column(JSON)  # Store as JSON array
    risk_tolerance_score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    total_value = Column(Float)
    cash_balance = Column(Float)
    allocation = Column(JSON)  # Store asset allocation as JSON
    last_rebalanced = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="portfolios")
    transactions = relationship("Transaction", back_populates="portfolio")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    type = Column(String)  # buy, sell, dividend, deposit, withdrawal
    symbol = Column(String)
    shares = Column(Float)
    price = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    portfolio = relationship("Portfolio", back_populates="transactions")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    target_amount = Column(Float)
    current_amount = Column(Float)
    target_date = Column(DateTime)
    type = Column(String)  # retirement, house, education, other
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="goals") 