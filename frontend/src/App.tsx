import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  useMediaQuery,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';

import RiskAssessment from './components/RiskAssessment';
import Portfolio from './components/Portfolio';
import Performance from './components/Performance';
import News from './components/News';
import SelfDefinedPortfolios from './components/SelfDefinedPortfolios';
import { RiskAssessmentResult } from './types/index';

// Create a separate component for the app content that uses useNavigate
const AppContent: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [portfolioId, setPortfolioId] = useState<number | null>(null);
  const [riskAssessmentComplete, setRiskAssessmentComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [darkMode]
  );

  const handleRiskAssessmentComplete = async (result: RiskAssessmentResult) => {
    try {
      setError(null);
      console.log('Starting portfolio creation...');
      const response = await fetch('http://localhost:8000/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          risk_level: result.risk_level,
          investment_goals: result.investment_goals,
          recommended_allocation: result.recommended_allocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create portfolio: ${errorData.detail || response.statusText}`);
      }

      console.log('Portfolio created successfully');
      const portfolioData = await response.json();
      console.log('Portfolio data:', portfolioData);
      
      setPortfolioId(portfolioData.id);
      setRiskAssessmentComplete(true);
      setCurrentStep(1);
      
      console.log('State updated:', {
        portfolioId: portfolioData.id,
        riskAssessmentComplete: true,
        currentStep: 1
      });
    } catch (error) {
      console.error('Error creating portfolio:', error);
      setError(error instanceof Error ? error.message : 'Failed to create portfolio');
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const drawerContent = (
    <List>
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/">
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Risk Assessment" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton 
          component={Link} 
          to="/portfolio"
          disabled={!portfolioId}
        >
          <ListItemIcon>
            <AccountBalanceIcon />
          </ListItemIcon>
          <ListItemText primary="Portfolio" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton 
          component={Link} 
          to="/performance"
          disabled={!portfolioId}
        >
          <ListItemIcon>
            <TrendingUpIcon />
          </ListItemIcon>
          <ListItemText primary="Performance" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/self-defined-portfolios">
          <ListItemIcon>
            <AccountBalanceIcon />
          </ListItemIcon>
          <ListItemText primary="Self-Defined Portfolios" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onClick={() => navigate('/news')}>
          <ListItemIcon>
            <TrendingUpIcon />
          </ListItemIcon>
          <ListItemText primary="News & Education" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onClick={toggleTheme}>
          <ListItemIcon>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              Robo Advisor
            </Typography>
            <IconButton color="inherit" onClick={toggleTheme}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
          }}
        >
          <Container maxWidth="lg">
            <Routes>
              <Route 
                path="/" 
                element={
                  !riskAssessmentComplete ? (
                    <RiskAssessment onComplete={handleRiskAssessmentComplete} />
                  ) : (
                    <Navigate to="/portfolio" replace />
                  )
                } 
              />
              <Route 
                path="/portfolio" 
                element={
                  portfolioId ? (
                    <Portfolio portfolioId={portfolioId} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
              <Route 
                path="/performance" 
                element={
                  portfolioId ? (
                    <Performance portfolioId={portfolioId} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
              <Route 
                path="/self-defined-portfolios" 
                element={<SelfDefinedPortfolios />} 
              />
              <Route 
                path="/news" 
                element={
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                    <AppBar position="static">
                      <Toolbar>
                        <IconButton
                          color="inherit"
                          edge="start"
                          onClick={() => setDrawerOpen(true)}
                          sx={{ mr: 2 }}
                        >
                          <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          News & Education
                        </Typography>
                        <IconButton color="inherit" onClick={toggleTheme}>
                          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                      </Toolbar>
                    </AppBar>
                    <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
                      {portfolioId && <News portfolioId={portfolioId} />}
                    </Box>
                  </Box>
                } 
              />
            </Routes>
          </Container>
        </Box>
      </Box>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

// Main App component that wraps everything in a Router
const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App; 