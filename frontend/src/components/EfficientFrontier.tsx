import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid
} from '@mui/material';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface EfficientFrontierProps {
  portfolioId: number;
}

interface PortfolioPoint {
  volatility: number;
  expected_return: number;
  sharpe_ratio: number;
}

const EfficientFrontier: React.FC<EfficientFrontierProps> = ({ portfolioId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frontierData, setFrontierData] = useState<PortfolioPoint[]>([]);

  useEffect(() => {
    fetchEfficientFrontier();
  }, [portfolioId]);

  const fetchEfficientFrontier = async () => {
    try {
      console.log('Fetching efficient frontier data...');
      const response = await fetch(`http://localhost:8000/api/portfolio/${portfolioId}/efficient-frontier`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch efficient frontier data: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      if (!data.efficient_frontier || !Array.isArray(data.efficient_frontier)) {
        throw new Error('Invalid data format received from server');
      }

      const mappedData = data.efficient_frontier.map((portfolio: any) => ({
        volatility: portfolio.volatility * 100,
        expected_return: portfolio.expected_return * 100,
        sharpe_ratio: portfolio.sharpe_ratio
      }));
      
      console.log('Mapped data:', mappedData);
      setFrontierData(mappedData);
    } catch (err) {
      console.error('Error in fetchEfficientFrontier:', err);
      setError(err instanceof Error ? err.message : 'Failed to load efficient frontier');
    } finally {
      setLoading(false);
    }
  };

  const portfolioDescription = (
    <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.default' }}>
      <Typography variant="h6" gutterBottom>
        Understanding the Efficient Frontier
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>
            The Efficient Frontier represents the set of optimal portfolios that offer the highest expected return for a given level of risk (volatility). Each point on the curve represents a different portfolio allocation.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Portfolio Composition
          </Typography>
          <Typography variant="body2" component="div" sx={{ pl: 2 }}>
            <ul>
              <li><strong>US Stocks (VTI):</strong> 60% of stock allocation</li>
              <li><strong>International Stocks (VXUS):</strong> 40% of stock allocation</li>
              <li><strong>US Bonds (BND):</strong> 70% of bond allocation</li>
              <li><strong>International Bonds (BNDX):</strong> 30% of bond allocation</li>
              <li><strong>Real Estate (VNQ):</strong> 50% of alternatives</li>
              <li><strong>Commodities (GSG):</strong> 50% of alternatives</li>
            </ul>
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            How to Read the Chart
          </Typography>
          <Typography variant="body2" component="div" sx={{ pl: 2 }}>
            <ul>
              <li><strong>X-axis (Volatility):</strong> Measures portfolio risk</li>
              <li><strong>Y-axis (Expected Return):</strong> Shows potential returns</li>
              <li><strong>Points on the curve:</strong> Each represents an optimal portfolio allocation</li>
              <li><strong>Higher points:</strong> Better risk-adjusted returns</li>
            </ul>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (frontierData.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No efficient frontier data available
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        {portfolioDescription}
        <Typography variant="h6" gutterBottom>
          Efficient Frontier Visualization
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="volatility"
                name="Volatility"
                unit="%"
                label={{ value: 'Volatility (%)', position: 'bottom' }}
              />
              <YAxis
                type="number"
                dataKey="expected_return"
                name="Expected Return"
                unit="%"
                label={{ value: 'Expected Return (%)', angle: -90, position: 'left' }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}%`,
                  name === 'expected_return' ? 'Expected Return' : 'Volatility'
                ]}
              />
              <Scatter
                data={frontierData}
                fill="#1976d2"
                name="Efficient Frontier"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EfficientFrontier; 