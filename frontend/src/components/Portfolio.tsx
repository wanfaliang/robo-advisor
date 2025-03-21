import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import PortfolioCharts from './PortfolioCharts';
import TransactionHistory from './TransactionHistory';
import GoalTracking from './GoalTracking';
import InvestmentGoals from './InvestmentGoals';
import TaxLossHarvesting from './TaxLossHarvesting';
import EfficientFrontier from './EfficientFrontier';
import PortfolioSimulator from './PortfolioSimulator';
import { PortfolioStats, Asset, Transaction, Goal } from '../types/index';

interface PerformanceData {
  date: string;
  value: number;
  benchmark: number;
}

interface PortfolioProps {
  portfolioId: number;
}

const Portfolio: React.FC<PortfolioProps> = ({ portfolioId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rebalancing, setRebalancing] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    fetchPortfolioData();
  }, [portfolioId]);

  const fetchPortfolioData = async () => {
    try {
      const [statsResponse, portfolioResponse, performanceResponse, transactionsResponse] = await Promise.all([
        fetch(`http://localhost:8000/api/portfolio/${portfolioId}/stats`),
        fetch(`http://localhost:8000/api/portfolio/${portfolioId}`),
        fetch(`http://localhost:8000/api/portfolio/${portfolioId}/performance`),
        fetch(`http://localhost:8000/api/portfolio/${portfolioId}/transactions`),
      ]);

      if (!statsResponse.ok || !portfolioResponse.ok || !performanceResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const statsData = await statsResponse.json();
      const portfolioData = await portfolioResponse.json();
      const performanceData = await performanceResponse.json();
      const transactionsData = await transactionsResponse.json();

      setStats(statsData);
      setAssets(portfolioData.assets);
      setPerformanceData(performanceData);
      setTransactions(transactionsData || []);
      setGoals(portfolioData.goals || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setTransactions([]);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRebalance = async () => {
    setRebalancing(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/api/portfolio/rebalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          current_allocation: Object.fromEntries(
            assets.map(asset => [asset.symbol, asset.allocation])
          ),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to rebalance portfolio');
      }

      const result = await response.json();
      
      // Update the assets with the new allocation
      const updatedAssets = assets.map(asset => ({
        ...asset,
        allocation: result.new_allocation[asset.symbol] || asset.allocation,
        value: (stats?.investment_amount ?? 0) * (result.new_allocation[asset.symbol] || asset.allocation),
        shares: ((stats?.investment_amount ?? 0) * (result.new_allocation[asset.symbol] || asset.allocation)) / 100
      }));
      
      setAssets(updatedAssets);
      
      // Show success message
      setError('Portfolio rebalanced successfully');
      
      // Refresh portfolio data after a short delay
      setTimeout(() => {
        fetchPortfolioData();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setRebalancing(false);
    }
  };

  const handleAddGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const response = await fetch('http://localhost:8000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error('Failed to add goal');
      }

      const newGoal = await response.json();
      setGoals([...goals, newGoal]);
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const handleUpdateGoal = async (id: number, goal: Partial<Goal>) => {
    try {
      const response = await fetch(`http://localhost:8000/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      const updatedGoal = await response.json();
      setGoals(goals.map(g => g.id === id ? updatedGoal : g));
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/goals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Portfolio Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Portfolio Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Value
                  </Typography>
                  <Typography variant="h6">
                    ${stats?.investment_amount?.toLocaleString() ?? '0'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Expected Annual Return
                  </Typography>
                  <Typography variant="h6">
                    {((stats?.expected_annual_return ?? 0) * 100).toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Annual Income (Est.)
                  </Typography>
                  <Typography variant="h6">
                    ${(stats?.estimated_annual_income ?? 0).toFixed(1)}0K
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Charts */}
        <Grid item xs={12}>
          <PortfolioCharts assets={assets} performanceData={performanceData} />
        </Grid>

        {/* Asset Allocation */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Asset Allocation</Typography>
                <Button
                  variant="contained"
                  onClick={handleRebalance}
                  disabled={rebalancing}
                >
                  {rebalancing ? <CircularProgress size={24} /> : 'Rebalance'}
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset</TableCell>
                      <TableCell align="right">Allocation</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell align="right">Shares</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.symbol}>
                        <TableCell>{asset.symbol}</TableCell>
                        <TableCell align="right">
                          {(asset.allocation * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          ${asset.value.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {asset.shares.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Metrics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Metrics
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Volatility
                  </Typography>
                  <Typography>
                    {((stats?.annual_volatility ?? 0) * 100).toFixed(2)}%
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Sharpe Ratio
                  </Typography>
                  <Typography>
                    {stats?.sharpe_ratio?.toFixed(2) ?? '0.00'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Maximum Drawdown
                  </Typography>
                  <Typography>
                    {((stats?.max_drawdown ?? 0) * 100).toFixed(2)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Efficient Frontier */}
        <Grid item xs={12} md={8}>
          <EfficientFrontier portfolioId={portfolioId} />
        </Grid>

        {/* Portfolio Simulator */}
        <Grid item xs={12}>
          <PortfolioSimulator 
            portfolioId={portfolioId} 
            currentAllocation={Object.fromEntries(
              assets.map(asset => [asset.symbol, asset.allocation])
            )}
            open={true}
            onClose={() => {}}
            portfolio={{
              id: portfolioId,
              name: "Main Portfolio",
              total_investment: stats?.investment_amount ?? 0,
              assets: assets,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }}
          />
        </Grid>

        {/* Tax Loss Harvesting */}
        <Grid item xs={12}>
          <TaxLossHarvesting portfolioId={portfolioId} />
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12} md={6}>
          <TransactionHistory transactions={transactions} />
        </Grid>

        {/* Investment Goals */}
        <Grid item xs={12}>
          <InvestmentGoals
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Portfolio; 