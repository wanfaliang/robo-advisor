import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { SelfDefinedPortfolio, SelfDefinedPortfolioAsset } from '../types/index';

interface PortfolioEditorProps {
  open: boolean;
  onClose: () => void;
  portfolio: SelfDefinedPortfolio | null;
  onSubmit: (portfolio: Omit<SelfDefinedPortfolio, 'id'>) => void;
}

const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  open,
  onClose,
  portfolio,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [totalInvestment, setTotalInvestment] = useState('');
  const [assets, setAssets] = useState<SelfDefinedPortfolioAsset[]>([]);
  const [newAssetSymbol, setNewAssetSymbol] = useState('');
  const [newAssetAllocation, setNewAssetAllocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);

  useEffect(() => {
    if (portfolio) {
      setName(portfolio.name);
      setTotalInvestment(portfolio.total_investment.toString());
      setAssets(portfolio.assets);
    } else {
      setName('');
      setTotalInvestment('');
      setAssets([]);
    }
  }, [portfolio]);

  useEffect(() => {
    // Fetch available symbols from the backend
    fetch('http://localhost:8000/api/available-symbols')
      .then(response => response.json())
      .then(data => setAvailableSymbols(data))
      .catch(err => console.error('Error fetching symbols:', err));
  }, []);

  const handleAddAsset = () => {
    if (!newAssetSymbol || !newAssetAllocation) {
      setError('Please fill in both symbol and allocation');
      return;
    }

    const allocation = parseFloat(newAssetAllocation);
    if (isNaN(allocation) || allocation <= 0 || allocation > 100) {
      setError('Allocation must be between 0 and 100');
      return;
    }

    const totalAllocation = assets.reduce((sum, asset) => sum + asset.allocation, 0);
    if (totalAllocation + allocation > 100) {
      setError('Total allocation cannot exceed 100%');
      return;
    }

    const investment = parseFloat(totalInvestment) || 0;
    const value = (allocation / 100) * investment;

    setAssets([
      ...assets,
      {
        symbol: newAssetSymbol,
        allocation: allocation / 100,
        shares: value / 100, // Assuming $100 per share for simplicity
        value,
      },
    ]);

    setNewAssetSymbol('');
    setNewAssetAllocation('');
    setError(null);
  };

  const handleRemoveAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name || !totalInvestment) {
      setError('Please fill in all required fields');
      return;
    }

    const investment = parseFloat(totalInvestment);
    if (isNaN(investment) || investment <= 0) {
      setError('Total investment must be a positive number');
      return;
    }

    const totalAllocation = assets.reduce((sum, asset) => sum + asset.allocation, 0);
    if (totalAllocation !== 1) {
      setError('Total allocation must equal 100%');
      return;
    }

    onSubmit({
      name,
      total_investment: investment,
      assets: assets.map(asset => ({
        ...asset,
        value: (asset.allocation * investment),
      })),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {portfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Portfolio Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Total Investment"
            type="number"
            value={totalInvestment}
            onChange={(e) => setTotalInvestment(e.target.value)}
            fullWidth
            required
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Assets
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box display="flex" gap={2}>
            <Autocomplete
              options={availableSymbols}
              value={newAssetSymbol}
              onChange={(_, newValue) => setNewAssetSymbol(newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Symbol"
                  fullWidth
                />
              )}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Allocation (%)"
              type="number"
              value={newAssetAllocation}
              onChange={(e) => setNewAssetAllocation(e.target.value)}
              sx={{ width: 150 }}
            />
            <IconButton onClick={handleAddAsset} color="primary">
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        <List>
          {assets.map((asset, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={asset.symbol}
                secondary={`${(asset.allocation * 100).toFixed(2)}%`}
              />
              <ListItemSecondaryAction>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  ${asset.value.toLocaleString()}
                </Typography>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveAsset(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {portfolio ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortfolioEditor; 