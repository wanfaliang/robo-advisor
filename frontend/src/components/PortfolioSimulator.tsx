import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Slider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
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
import { SelfDefinedPortfolio } from '../types/index';

interface PortfolioSimulatorProps {
  portfolioId: number;
  currentAllocation: { [key: string]: number };
  open: boolean;
  onClose: () => void;
  portfolio: SelfDefinedPortfolio;
}

interface SimulationResult {
  date: string;
  portfolioValue: number;
  benchmarkValue: number;
}

interface WhatIfScenario {
  name: string;
  description: string;
  allocation: { [key: string]: number };
}

const PortfolioSimulator: React.FC<PortfolioSimulatorProps> = ({ portfolioId, currentAllocation, open, onClose, portfolio }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationResult[]>([]);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [selectedTab, setSelectedTab] = useState(0);
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([
    {
      name: 'Conservative',
      description: 'Shift towards bonds and reduce stock exposure',
      allocation: { ...currentAllocation, VTI: 0.2, VXUS: 0.1, BND: 0.4, BNDX: 0.2, VNQ: 0.05, GSG: 0.05 }
    },
    {
      name: 'Aggressive',
      description: 'Increase stock exposure and reduce bonds',
      allocation: { ...currentAllocation, VTI: 0.4, VXUS: 0.3, BND: 0.15, BNDX: 0.1, VNQ: 0.03, GSG: 0.02 }
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/portfolio/${portfolioId}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time_horizon: timeHorizon,
          initial_investment: initialInvestment,
          monthly_contribution: monthlyContribution,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run simulation');
      }

      const data = await response.json();
      setSimulationData(data.simulation_results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const runBacktest = async (allocation: { [key: string]: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/portfolio/${portfolioId}/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allocation,
          time_horizon: timeHorizon,
          initial_investment: initialInvestment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run backtest');
      }

      const data = await response.json();
      setSimulationData(data.backtest_results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderSimulationTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Simulation Parameters
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Time Horizon (Years)</Typography>
                <Slider
                  value={timeHorizon}
                  onChange={(_, value) => setTimeHorizon(value as number)}
                  min={1}
                  max={30}
                  marks
                />
                <Typography align="center">{timeHorizon} years</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Initial Investment"
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Monthly Contribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                />
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={runSimulation}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Run Simulation'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Simulation Results
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="portfolioValue"
                      name="Portfolio Value"
                      stroke="#1976d2"
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmarkValue"
                      name="Benchmark (S&P 500)"
                      stroke="#dc004e"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderBacktestTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Backtest Parameters
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Time Horizon (Years)</Typography>
                <Slider
                  value={timeHorizon}
                  onChange={(_, value) => setTimeHorizon(value as number)}
                  min={1}
                  max={30}
                  marks
                />
                <Typography align="center">{timeHorizon} years</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Initial Investment"
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                />
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={() => runBacktest(currentAllocation)}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Run Backtest'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Backtest Results
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="portfolioValue"
                      name="Portfolio Value"
                      stroke="#1976d2"
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmarkValue"
                      name="Benchmark (S&P 500)"
                      stroke="#dc004e"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderWhatIfTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What-If Scenarios
              </Typography>
              {scenarios.map((scenario, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1">{scenario.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {scenario.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => runBacktest(scenario.allocation)}
                    disabled={loading}
                    sx={{ mt: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Run Scenario'}
                  </Button>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scenario Results
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="portfolioValue"
                      name="Portfolio Value"
                      stroke="#1976d2"
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmarkValue"
                      name="Benchmark (S&P 500)"
                      stroke="#dc004e"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Simulation" />
            <Tab label="Backtesting" />
            <Tab label="What-If Analysis" />
          </Tabs>
        </CardContent>
      </Card>

      {selectedTab === 0 && renderSimulationTab()}
      {selectedTab === 1 && renderBacktestTab()}
      {selectedTab === 2 && renderWhatIfTab()}
    </Box>
  );
};

export default PortfolioSimulator; 