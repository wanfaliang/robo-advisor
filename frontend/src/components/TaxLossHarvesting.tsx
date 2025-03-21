import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface TaxLossOpportunity {
  symbol: string;
  shares: number;
  potential_loss: number;
  current_price?: number;
  purchase_price?: number;
}

interface TaxLossHarvestingProps {
  portfolioId: number;
}

const TaxLossHarvesting: React.FC<TaxLossHarvestingProps> = ({ portfolioId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opportunities, setOpportunities] = useState<TaxLossOpportunity[]>([]);
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0);

  useEffect(() => {
    fetchTaxLossOpportunities();
  }, [portfolioId]);

  const fetchTaxLossOpportunities = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/portfolio/${portfolioId}/tax-loss-harvest`);
      if (!response.ok) {
        throw new Error('Failed to fetch tax loss harvesting opportunities');
      }
      const data = await response.json();
      setOpportunities(data.opportunities || []);
      
      // Calculate total potential tax savings (assuming 20% tax rate)
      const totalLoss = data.opportunities.reduce(
        (sum: number, opp: TaxLossOpportunity) => sum + Math.abs(opp.potential_loss),
        0
      );
      setTotalPotentialSavings(totalLoss * 0.20); // 20% tax rate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleHarvest = async (symbol: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/portfolio/${portfolioId}/tax-loss-harvest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute tax loss harvest');
      }

      // Refresh the opportunities
      fetchTaxLossOpportunities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute tax loss harvest');
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
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="h5">
            Tax Loss Harvesting
          </Typography>
          <Tooltip title="Tax loss harvesting involves selling investments at a loss to offset capital gains tax liability">
            <IconButton size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {opportunities.length > 0 ? (
          <>
            <Box mb={3}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Estimated Tax Savings Opportunity
              </Typography>
              <Typography variant="h4">
                ${totalPotentialSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Based on estimated 20% tax rate
              </Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">Shares</TableCell>
                    <TableCell align="right">Purchase Price</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Potential Loss</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opportunities.map((opportunity) => (
                    <TableRow key={opportunity.symbol}>
                      <TableCell>{opportunity.symbol}</TableCell>
                      <TableCell align="right">{opportunity.shares}</TableCell>
                      <TableCell align="right">
                        ${opportunity.purchase_price?.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${opportunity.current_price?.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        ${Math.abs(opportunity.potential_loss).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleHarvest(opportunity.symbol)}
                        >
                          Harvest
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Alert severity="info">
            No tax loss harvesting opportunities available at this time.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxLossHarvesting; 