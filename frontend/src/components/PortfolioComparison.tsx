import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SelfDefinedPortfolio, PortfolioSimulationResult } from '../types/index';

interface PortfolioComparisonProps {
  open: boolean;
  onClose: () => void;
  portfolios: SelfDefinedPortfolio[];
}

const PortfolioComparison: React.FC<PortfolioComparisonProps> = ({
  open,
  onClose,
  portfolios,
}) => {
  const [timeHorizon, setTimeHorizon] = useState('5');
  const [initialInvestment, setInitialInvestment] = useState('100000');
  const [monthlyContribution, setMonthlyContribution] = useState('1000');
  const [selectedPortfolios, setSelectedPortfolios] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<Record<string, PortfolioSimulationResult[]>>({});

  const handleCompare = async () => {
    if (selectedPortfolios.length < 2) {
      setError('Please select at least 2 portfolios to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/self-defined-portfolios/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_ids: selectedPortfolios,
          time_horizon: parseInt(timeHorizon),
          initial_investment: parseFloat(initialInvestment),
          monthly_contribution: parseFloat(monthlyContribution),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compare portfolios');
      }

      const data = await response.json();
      setComparisonData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const chartData = Object.entries(comparisonData).map(([name, results]) => ({
    name,
    data: results.map(result => ({
      date: result.date,
      value: result.portfolioValue,
    })),
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Compare Portfolios</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Simulation Parameters
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              label="Time Horizon (years)"
              type="number"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              sx={{ width: 200 }}
            />
            <TextField
              label="Initial Investment"
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              sx={{ width: 200 }}
            />
            <TextField
              label="Monthly Contribution"
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              sx={{ width: 200 }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Portfolios to Compare
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Portfolios</InputLabel>
            <Select
              multiple
              value={selectedPortfolios}
              onChange={(e) => setSelectedPortfolios(typeof e.target.value === 'string' ? [] : e.target.value)}
              label="Portfolios"
            >
              {portfolios.map((portfolio) => (
                <MenuItem key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : Object.keys(comparisonData).length > 0 ? (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chartData.map((portfolio, index) => (
                  <Line
                    key={portfolio.name}
                    type="monotone"
                    dataKey="value"
                    data={portfolio.data}
                    name={portfolio.name}
                    stroke={`hsl(${(index * 360) / chartData.length}, 70%, 50%)`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleCompare} variant="contained" disabled={loading}>
          Compare
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortfolioComparison; 