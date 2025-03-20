from typing import Dict, List
from ..models.models import RiskLevel

class RiskAssessor:
    def __init__(self):
        self.question_weights = {
            "age": 0.15,
            "income": 0.10,
            "savings": 0.10,
            "investment_horizon": 0.15,
            "risk_attitude": 0.20,
            "investment_knowledge": 0.15,
            "loss_tolerance": 0.15
        }

    def calculate_risk_score(self, answers: Dict) -> int:
        """
        Calculate risk score based on questionnaire answers.
        Returns a score between 0-100.
        """
        score = 0
        
        # Age score (younger = higher score)
        age = answers.get("age", 0)
        if age < 30:
            age_score = 100
        elif age < 40:
            age_score = 80
        elif age < 50:
            age_score = 60
        elif age < 60:
            age_score = 40
        else:
            age_score = 20
        score += age_score * self.question_weights["age"]

        # Income score
        annual_income = answers.get("income", 0)
        if annual_income > 200000:
            income_score = 100
        elif annual_income > 100000:
            income_score = 80
        elif annual_income > 50000:
            income_score = 60
        else:
            income_score = 40
        score += income_score * self.question_weights["income"]

        # Savings score
        savings = answers.get("savings", 0)
        if savings > 500000:
            savings_score = 100
        elif savings > 100000:
            savings_score = 80
        elif savings > 25000:
            savings_score = 60
        else:
            savings_score = 40
        score += savings_score * self.question_weights["savings"]

        # Investment horizon score
        horizon = answers.get("investment_horizon", 0)
        if horizon > 10:
            horizon_score = 100
        elif horizon > 5:
            horizon_score = 75
        elif horizon > 3:
            horizon_score = 50
        else:
            horizon_score = 25
        score += horizon_score * self.question_weights["investment_horizon"]

        # Risk attitude score (1-5, 5 being most aggressive)
        risk_attitude = answers.get("risk_attitude", 3)
        risk_attitude_score = risk_attitude * 20
        score += risk_attitude_score * self.question_weights["risk_attitude"]

        # Investment knowledge score (1-5, 5 being expert)
        knowledge = answers.get("investment_knowledge", 3)
        knowledge_score = knowledge * 20
        score += knowledge_score * self.question_weights["investment_knowledge"]

        # Loss tolerance score (1-5, 5 being highest tolerance)
        loss_tolerance = answers.get("loss_tolerance", 3)
        loss_tolerance_score = loss_tolerance * 20
        score += loss_tolerance_score * self.question_weights["loss_tolerance"]

        return round(score)

    def determine_risk_level(self, risk_score: int) -> RiskLevel:
        """
        Convert numerical risk score to risk level category.
        """
        if risk_score < 30:
            return RiskLevel.CONSERVATIVE
        elif risk_score < 45:
            return RiskLevel.MODERATE_CONSERVATIVE
        elif risk_score < 60:
            return RiskLevel.MODERATE
        elif risk_score < 75:
            return RiskLevel.MODERATE_AGGRESSIVE
        else:
            return RiskLevel.AGGRESSIVE

    def get_investment_goals(self, answers: Dict) -> List[str]:
        """
        Determine investment goals based on questionnaire answers.
        """
        goals = []
        
        if answers.get("retirement_planning"):
            goals.append("Retirement Planning")
        if answers.get("wealth_building"):
            goals.append("Wealth Building")
        if answers.get("income_generation"):
            goals.append("Income Generation")
        if answers.get("tax_efficiency"):
            goals.append("Tax Efficiency")
        if answers.get("capital_preservation"):
            goals.append("Capital Preservation")
        
        return goals

    def get_risk_profile_summary(self, risk_level: RiskLevel) -> Dict[str, str]:
        """
        Get detailed description of risk profile.
        """
        summaries = {
            RiskLevel.CONSERVATIVE: {
                "description": "Focus on preserving capital with modest growth potential",
                "suitable_for": "Investors close to retirement or with low risk tolerance",
                "expected_return": "4-6% annually",
                "volatility": "Low",
                "investment_horizon": "1-3 years"
            },
            RiskLevel.MODERATE_CONSERVATIVE: {
                "description": "Balanced approach with emphasis on stability",
                "suitable_for": "Investors seeking steady growth with limited volatility",
                "expected_return": "5-7% annually",
                "volatility": "Low to Medium",
                "investment_horizon": "3-5 years"
            },
            RiskLevel.MODERATE: {
                "description": "Balance between growth and stability",
                "suitable_for": "Investors comfortable with market fluctuations",
                "expected_return": "6-8% annually",
                "volatility": "Medium",
                "investment_horizon": "5-10 years"
            },
            RiskLevel.MODERATE_AGGRESSIVE: {
                "description": "Growth-oriented with higher risk tolerance",
                "suitable_for": "Long-term investors seeking capital appreciation",
                "expected_return": "7-9% annually",
                "volatility": "Medium to High",
                "investment_horizon": "10-15 years"
            },
            RiskLevel.AGGRESSIVE: {
                "description": "Maximum growth potential with high risk tolerance",
                "suitable_for": "Young investors with long time horizons",
                "expected_return": "8-10%+ annually",
                "volatility": "High",
                "investment_horizon": "15+ years"
            }
        }
        return summaries[risk_level] 