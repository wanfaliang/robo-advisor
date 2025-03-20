import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
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
import { RiskAssessmentResult } from './types/index';

const App: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [portfolioId, setPortfolioId] = useState<number | null>(null);
  const [riskAssessmentComplete, setRiskAssessmentComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

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
      <Router>
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
                      <Typography>
                        Performance tracking coming soon...
                      </Typography>
                    ) : (
                      <Navigate to="/" replace />
                    )
                  } 
                />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App; 