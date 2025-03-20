import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import Portfolio from '../Portfolio';

// Mock the fetch function
global.fetch = jest.fn();

const mockTheme = createTheme();

describe('Portfolio Component', () => {
  const mockPortfolioId = 1;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful API responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            expected_annual_return: 0.08,
            annual_volatility: 0.15,
            sharpe_ratio: 0.53,
            max_drawdown: 0.12,
            investment_amount: 100000,
            estimated_annual_income: 2.5
          })
        });
      }
      if (url.includes('/portfolio/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            assets: [
              {
                symbol: 'VTI',
                allocation: 0.6,
                value: 60000,
                shares: 300
              }
            ],
            goals: []
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });
  });

  it('renders portfolio overview with correct data', async () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <Portfolio portfolioId={mockPortfolioId} />
      </ThemeProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    });

    // Check if portfolio stats are displayed
    expect(screen.getByText('$100,000')).toBeInTheDocument();
    expect(screen.getByText('8.00%')).toBeInTheDocument();
    expect(screen.getByText('$2.50K')).toBeInTheDocument();
  });

  it('handles rebalance button click', async () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <Portfolio portfolioId={mockPortfolioId} />
      </ThemeProvider>
    );

    // Wait for the rebalance button to be available
    const rebalanceButton = await screen.findByText('Rebalance');
    
    // Mock the rebalance API call
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          message: 'Portfolio rebalanced successfully'
        })
      })
    );

    // Click the rebalance button
    fireEvent.click(rebalanceButton);

    // Verify the success message appears
    await waitFor(() => {
      expect(screen.getByText('Portfolio rebalanced successfully')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    render(
      <ThemeProvider theme={mockTheme}>
        <Portfolio portfolioId={mockPortfolioId} />
      </ThemeProvider>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
    });
  });
}); 