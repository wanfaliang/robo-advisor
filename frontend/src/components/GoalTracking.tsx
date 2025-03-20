import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Chip,
} from '@mui/material';

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  type: 'retirement' | 'house' | 'education' | 'other';
}

interface GoalTrackingProps {
  goals: Goal[];
}

const GoalTracking: React.FC<GoalTrackingProps> = ({ goals }) => {
  const getGoalColor = (type: Goal['type']) => {
    switch (type) {
      case 'retirement':
        return 'primary';
      case 'house':
        return 'secondary';
      case 'education':
        return 'success';
      case 'other':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Investment Goals
        </Typography>
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} key={goal.id}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1">{goal.name}</Typography>
                  <Chip
                    label={goal.type.toUpperCase()}
                    color={getGoalColor(goal.type)}
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Target: {formatCurrency(goal.target_amount)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Current: {formatCurrency(goal.current_amount)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(goal.current_amount, goal.target_amount)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Target Date: {new Date(goal.target_date).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GoalTracking; 