import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { SelfDefinedPortfolio } from '../types/index';
import PortfolioEditor from './PortfolioEditor';
import PortfolioSimulator from './PortfolioSimulator';
import PortfolioComparison from './PortfolioComparison';

const SelfDefinedPortfolios: React.FC = () => {
  const [portfolios, setPortfolios] = useState<SelfDefinedPortfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<SelfDefinedPortfolio | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/self-defined-portfolios/');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      const data = await response.json();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = async (portfolio: Omit<SelfDefinedPortfolio, 'id'>) => {
    try {
      const response = await fetch('http://localhost:8000/api/self-defined-portfolios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolio),
      });

      if (!response.ok) {
        throw new Error('Failed to create portfolio');
      }

      const newPortfolio = await response.json();
      setPortfolios([...portfolios, newPortfolio]);
      setIsEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdatePortfolio = async (portfolio: SelfDefinedPortfolio) => {
    try {
      const response = await fetch(`http://localhost:8000/api/self-defined-portfolios/${portfolio.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolio),
      });

      if (!response.ok) {
        throw new Error('Failed to update portfolio');
      }

      const updatedPortfolio = await response.json();
      setPortfolios(portfolios.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p));
      setIsEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/self-defined-portfolios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete portfolio');
      }

      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Self-Defined Portfolios</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedPortfolio(null);
              setIsEditorOpen(true);
            }}
            sx={{ mr: 2 }}
          >
            Create Portfolio
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsComparisonOpen(true)}
            disabled={portfolios.length < 2}
          >
            Compare Portfolios
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {portfolios.map((portfolio) => (
          <Grid item xs={12} md={6} key={portfolio.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{portfolio.name}</Typography>
                  <Box>
                    <IconButton
                      onClick={() => {
                        setSelectedPortfolio(portfolio);
                        setIsEditorOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedPortfolio(portfolio);
                        setIsSimulatorOpen(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeletePortfolio(portfolio.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="subtitle2" color="textSecondary">
                  Total Investment: ${portfolio.total_investment.toLocaleString()}
                </Typography>

                <List>
                  {portfolio.assets.map((asset) => (
                    <ListItem key={asset.symbol}>
                      <ListItemText
                        primary={asset.symbol}
                        secondary={`${(asset.allocation * 100).toFixed(2)}%`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2">
                          ${asset.value.toLocaleString()}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PortfolioEditor
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        portfolio={selectedPortfolio}
        onSubmit={(portfolio) => {
          if (selectedPortfolio) {
            handleUpdatePortfolio({ ...portfolio, id: selectedPortfolio.id });
          } else {
            handleCreatePortfolio(portfolio);
          }
        }}
      />

      {selectedPortfolio && (
        <PortfolioSimulator
          open={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          portfolio={selectedPortfolio}
          portfolioId={selectedPortfolio.id}
          currentAllocation={Object.fromEntries(
            selectedPortfolio.assets.map(asset => [asset.symbol, asset.allocation])
          )}
        />
      )}

      <PortfolioComparison
        open={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        portfolios={portfolios}
      />
    </Box>
  );
};

export default SelfDefinedPortfolios; 