import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';

function Sidebar({
  modelType,
  setModelType,
  device,
  setDevice,
  eloSelf,
  setEloSelf,
  eloOpponent,
  setEloOpponent,
  topK,
  setTopK,
  fen,
  modelInitialized,
  onInitialize,
  onPredict,
  onReset,
  onLoadFen
}) {
  const [fenInput, setFenInput] = useState(fen);

  const handleLoadFen = () => {
    onLoadFen(fenInput);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 90 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <SettingsIcon color="primary" />
        <Typography variant="h6" component="h2">
          Configuration
        </Typography>
      </Box>

      {/* Model Type */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Modèle
        </Typography>
        <ToggleButtonGroup
          value={modelType}
          exclusive
          onChange={(e, value) => value && setModelType(value)}
          fullWidth
          size="small"
        >
          <ToggleButton value="rapid">Rapid</ToggleButton>
          <ToggleButton value="blitz">Blitz</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Device */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Dispositif
        </Typography>
        <ToggleButtonGroup
          value={device}
          exclusive
          onChange={(e, value) => value && setDevice(value)}
          fullWidth
          size="small"
        >
          <ToggleButton value="cpu">CPU</ToggleButton>
          <ToggleButton value="gpu">GPU</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ELO Self */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Joueur Actif
        </Typography>
        <TextField
          type="number"
          label="ELO du joueur actif"
          value={eloSelf}
          onChange={(e) => setEloSelf(Number(e.target.value))}
          fullWidth
          size="small"
          inputProps={{ min: 800, max: 2800, step: 50 }}
          helperText="800 - 2800"
        />
      </Box>

      {/* ELO Opponent */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Adversaire
        </Typography>
        <TextField
          type="number"
          label="ELO de l'adversaire"
          value={eloOpponent}
          onChange={(e) => setEloOpponent(Number(e.target.value))}
          fullWidth
          size="small"
          inputProps={{ min: 800, max: 2800, step: 50 }}
          helperText="800 - 2800"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* FEN Input */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Position (FEN)
        </Typography>
        <TextField
          multiline
          rows={3}
          value={fenInput}
          onChange={(e) => setFenInput(e.target.value)}
          fullWidth
          size="small"
          placeholder="Entrez une position FEN..."
          sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
        />
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={handleLoadFen}
          fullWidth
          sx={{ mt: 1 }}
        >
          Charger Position
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Top K */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Suggestions
        </Typography>
        <TextField
          type="number"
          label="Nombre de coups suggérés"
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          fullWidth
          size="small"
          inputProps={{ min: 1, max: 10, step: 1 }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onInitialize}
          fullWidth
        >
          Initialiser le Modèle
        </Button>
        <Button
          variant="contained"
          startIcon={<PsychologyIcon />}
          onClick={onPredict}
          disabled={!modelInitialized}
          fullWidth
        >
          Prédire
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onReset}
          fullWidth
        >
          Réinitialiser
        </Button>
      </Box>

      {/* Status */}
      <Box sx={{ mt: 3, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: modelInitialized ? '#34a853' : '#dadce0',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 }
              }
            }}
          />
          <Typography variant="body2">
            {modelInitialized ? 'Modèle prêt' : 'Non initialisé'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default Sidebar;

