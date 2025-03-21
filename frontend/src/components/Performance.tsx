import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PerformanceData {
  date: string;
  value: number;
  benchmark: number;
}

interface PerformanceProps {
  portfolioId: number;
}

const Performance: React.FC<PerformanceProps> = ({ portfolioId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [metrics, setMetrics] = useState({
    totalReturn: 0,
    annualizedReturn: 0,
    volatility: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [portfolioId]);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/portfolio/${portfolioId}/performance`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      const data = await response.json();
      setPerformanceData(data);
      
      // Calculate performance metrics
      calculateMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data: PerformanceData[]) => {
    if (data.length < 2) return;

    const initialValue = data[data.length - 1].value;
    const finalValue = data[0].value;
    const totalReturn = ((finalValue - initialValue) / initialValue) * 100;
    
    // Calculate daily returns
    const returns = data.slice(0, -1).map((d, i) => {
      return (data[i].value - data[i + 1].value) / data[i + 1].value;
    });

    // Calculate annualized metrics
    const annualizedReturn = totalReturn * (365 / data.length);
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * Math.sqrt(252) * 100;
    const sharpeRatio = (annualizedReturn - 2) / volatility; // Assuming 2% risk-free rate

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = data[0].value;
    data.forEach(d => {
      if (d.value > peak) peak = d.value;
      const drawdown = (peak - d.value) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    setMetrics({
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
    });
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
        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Return
                  </Typography>
                  <Typography variant="h6">
                    {metrics.totalReturn.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Annualized Return
                  </Typography>
                  <Typography variant="h6">
                    {metrics.annualizedReturn.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Volatility
                  </Typography>
                  <Typography variant="h6">
                    {metrics.volatility.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Sharpe Ratio
                  </Typography>
                  <Typography variant="h6">
                    {metrics.sharpeRatio.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Max Drawdown
                  </Typography>
                  <Typography variant="h6">
                    {metrics.maxDrawdown.toFixed(2)}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Portfolio Performance vs Benchmark
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Portfolio"
                      stroke="#1976d2"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      name="Benchmark"
                      stroke="#dc004e"
                      dot={false}
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
};

export default Performance; 