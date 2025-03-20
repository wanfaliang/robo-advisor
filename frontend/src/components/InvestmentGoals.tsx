import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  LinearProgress,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Goal } from '../types';

interface InvestmentGoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onUpdateGoal: (id: number, goal: Partial<Goal>) => Promise<void>;
  onDeleteGoal: (id: number) => Promise<void>;
}

const InvestmentGoals: React.FC<InvestmentGoalsProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    type: 'retirement',
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
      type: 'retirement',
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, goal: Goal) => {
    setAnchorEl(event.currentTarget);
    setSelectedGoal(goal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGoal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAddGoal({
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount),
        target_date: formData.target_date,
        type: formData.type as Goal['type'],
      });
      handleClose();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedGoal) {
      try {
        await onDeleteGoal(selectedGoal.id);
        handleMenuClose();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGoalColor = (type: Goal['type']) => {
    switch (type) {
      case 'retirement':
        return '#1976d2';
      case 'house':
        return '#2e7d32';
      case 'education':
        return '#ed6c02';
      case 'other':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Investment Goals</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Add Goal
          </Button>
        </Box>

        <Grid container spacing={2}>
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            return (
              <Grid item xs={12} key={goal.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="subtitle1" gutterBottom>
                          {goal.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Target: {formatCurrency(goal.target_amount)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Current: {formatCurrency(goal.current_amount)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Target Date: {new Date(goal.target_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton onClick={(e) => handleMenuOpen(e, goal)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box mt={2}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getGoalColor(goal.type),
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add New Investment Goal</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Goal Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target Amount"
                    type="number"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Amount"
                    type="number"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target Date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Goal Type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <MenuItem value="retirement">Retirement</MenuItem>
                    <MenuItem value="house">House</MenuItem>
                    <MenuItem value="education">Education</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                Add Goal
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default InvestmentGoals; 