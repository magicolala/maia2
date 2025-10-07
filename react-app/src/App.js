import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Grid, Paper, Snackbar, Alert, Backdrop, CircularProgress } from '@mui/material';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChessBoard from './components/ChessBoard';
import Results from './components/Results';
import apiService from './services/api';

// Enable debug mode
const DEBUG = true;

const logDebug = (component, action, data = null) => {
  if (!DEBUG) return;
  console.log(`🟢 [${component}] ${action}`, data || '');
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8',
      dark: '#1557b0',
      light: '#4285f4',
    },
    secondary: {
      main: '#34a853',
    },
    error: {
      main: '#ea4335',
    },
    warning: {
      main: '#fbbc04',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function App() {
  // State
  const [fen, setFen] = useState(INITIAL_FEN);
  const [modelType, setModelType] = useState('rapid');
  const [device, setDevice] = useState('cpu');
  const [eloSelf, setEloSelf] = useState(1500);
  const [eloOpponent, setEloOpponent] = useState(1500);
  const [topK, setTopK] = useState(5);
  const [modelInitialized, setModelInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Chargement...');
  const [predictions, setPredictions] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Check server status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const data = await apiService.getStatus();
      if (data.success && data.initialized) {
        setModelInitialized(true);
        showSnackbar('Modèle déjà initialisé', 'success');
      }
    } catch (error) {
      console.log('Server not ready');
    }
  };

  const handleInitializeModel = async () => {
    setLoading(true);
    setLoadingText('Initialisation du modèle...');
    
    try {
      const data = await apiService.initializeModel(modelType, device);
      if (data.success) {
        setModelInitialized(true);
        showSnackbar(data.message, 'success');
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!modelInitialized) {
      showSnackbar('Veuillez d\'abord initialiser le modèle', 'warning');
      return;
    }

    setLoading(true);
    setLoadingText('Prédiction en cours...');
    
    try {
      const data = await apiService.predict(fen, eloSelf, eloOpponent, topK);
      if (data.success) {
        setPredictions(data);
        showSnackbar('Prédiction réussie', 'success');
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetBoard = () => {
    setFen(INITIAL_FEN);
    setPredictions(null);
    showSnackbar('Échiquier réinitialisé', 'info');
  };

  const handleLoadFen = async (newFen) => {
    setLoading(true);
    setLoadingText('Validation de la position...');
    
    try {
      const data = await apiService.validateFen(newFen);
      if (data.valid) {
        setFen(newFen);
        showSnackbar('Position chargée avec succès', 'success');
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <Header />
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Grid container spacing={3}>
            {/* Sidebar */}
            <Grid item xs={12} md={3}>
              <Sidebar
                modelType={modelType}
                setModelType={setModelType}
                device={device}
                setDevice={setDevice}
                eloSelf={eloSelf}
                setEloSelf={setEloSelf}
                eloOpponent={eloOpponent}
                setEloOpponent={setEloOpponent}
                topK={topK}
                setTopK={setTopK}
                fen={fen}
                modelInitialized={modelInitialized}
                onInitialize={handleInitializeModel}
                onPredict={handlePredict}
                onReset={handleResetBoard}
                onLoadFen={handleLoadFen}
              />
            </Grid>

            {/* Main content */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                {/* Chess Board */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <ChessBoard fen={fen} setFen={setFen} />
                  </Paper>
                </Grid>

                {/* Results */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Results predictions={predictions} />
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} />
            <Box sx={{ mt: 2, fontSize: '1.2rem' }}>{loadingText}</Box>
          </Box>
        </Backdrop>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;

