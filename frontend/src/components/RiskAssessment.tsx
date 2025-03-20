import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { RiskAssessmentResult } from '../types/index';

interface RiskAssessmentProps {
  onComplete: (result: RiskAssessmentResult) => void;
}

interface FormData {
  age: string;
  income: string;
  investment_horizon: string;
  risk_tolerance: number;
  investment_goals: string[];
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<FormData>({
    age: '30',
    income: '100000',  // $100,000 annual income
    investment_horizon: '20',  // 20 years
    risk_tolerance: 5,
    investment_goals: ['growth', 'income'],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus('Submitting risk assessment...');

    try {
      setStatus('Connecting to backend server...');
      const response = await fetch('http://localhost:8000/api/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          income: parseFloat(formData.income),
          investment_horizon: parseInt(formData.investment_horizon),
          risk_tolerance: formData.risk_tolerance,
          investment_goals: formData.investment_goals,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to submit risk assessment: ${errorData.detail || response.statusText}`);
      }

      setStatus('Processing response...');
      const result = await response.json() as RiskAssessmentResult;
      setStatus('Risk assessment completed successfully!');
      onComplete(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setStatus(`Error: ${errorMessage}`);
      console.error('Risk assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRiskToleranceChange = (_: Event, value: number | number[]) => {
    setFormData({
      ...formData,
      risk_tolerance: Array.isArray(value) ? value[0] : value,
    });
  };

  const handleGoalsChange = (e: any) => {
    setFormData({
      ...formData,
      investment_goals: e.target.value,
    });
  };

  return (
    <Box maxWidth={600} mx="auto">
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Risk Assessment
          </Typography>
          
          {status && (
            <Alert 
              severity={error ? "error" : loading ? "info" : "success"} 
              sx={{ mb: 2 }}
            >
              {status}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Annual Income"
              name="income"
              type="number"
              value={formData.income}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Investment Horizon (years)"
              name="investment_horizon"
              type="number"
              value={formData.investment_horizon}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Typography gutterBottom sx={{ mt: 2 }}>
              Risk Tolerance (1-10)
            </Typography>
            <Slider
              value={formData.risk_tolerance}
              onChange={handleRiskToleranceChange}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Investment Goals</InputLabel>
              <Select
                multiple
                value={formData.investment_goals}
                onChange={handleGoalsChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="retirement">Retirement</MenuItem>
                <MenuItem value="wealth_growth">Wealth Growth</MenuItem>
                <MenuItem value="income_generation">Income Generation</MenuItem>
                <MenuItem value="tax_efficiency">Tax Efficiency</MenuItem>
                <MenuItem value="preservation">Capital Preservation</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Assessment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RiskAssessment; 