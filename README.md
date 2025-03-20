# Robo Advisor

[![Frontend CI](https://github.com/wanfaliang/robo-advisor/actions/workflows/frontend.yml/badge.svg)](https://github.com/wanfaliang/robo-advisor/actions/workflows/frontend.yml)
[![Backend CI](https://github.com/wanfaliang/robo-advisor/actions/workflows/backend.yml/badge.svg)](https://github.com/wanfaliang/robo-advisor/actions/workflows/backend.yml)
[![codecov](https://codecov.io/gh/wanfaliang/robo-advisor/branch/main/graph/badge.svg)](https://codecov.io/gh/wanfaliang/robo-advisor)

A modern robo-advisor application that provides automated portfolio management, risk assessment, and investment goal tracking.

## Features

- Portfolio Management
  - Asset allocation based on risk profile
  - Portfolio rebalancing
  - Transaction history
  - Performance tracking

- Risk Assessment
  - Personalized risk profiling
  - Investment horizon analysis
  - Goal-based recommendations

- Investment Goals
  - Goal tracking with progress indicators
  - Multiple goal types (retirement, house, education)
  - Goal-based portfolio recommendations

## Technology Stack

### Frontend
- React with TypeScript
- Material-UI for components
- Recharts for data visualization
- Jest and React Testing Library for testing

### Backend
- FastAPI (Python)
- SQLAlchemy for database management
- NumPy and Pandas for financial calculations
- Pytest for testing

## Development

### Prerequisites
- Node.js 18.x
- Python 3.9
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/wanfaliang/robo-advisor.git
cd robo-advisor
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```bash
cd backend/app
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest tests/
```

## Deployment

The application is automatically deployed on push to the main branch:
- Frontend: Deployed to GitHub Pages at https://wanfaliang.github.io/robo-advisor
- Backend: [Add your deployment URL]

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 