# Robo Advisor

A modern automated financial advisory platform that provides personalized investment recommendations and portfolio management services.

## Features

- **Investor Profile & Risk Assessment**: Personalized questionnaire to determine investment goals and risk tolerance
- **Portfolio Construction**: Smart asset allocation using Modern Portfolio Theory
- **Automated Portfolio Management**: Automatic rebalancing, tax-loss harvesting, and dividend reinvestment
- **Low Fees & Accessibility**: Competitive management fees and low minimum investment requirements

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Python, FastAPI
- **Database**: PostgreSQL
- **Data Analysis**: NumPy, Pandas, scikit-learn
- **Financial Data**: Yfinance API

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up the database:
```bash
python backend/scripts/init_db.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## Project Structure

```
robo_advisor/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## License

MIT License 